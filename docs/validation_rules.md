# Rubik's Cube State Validation Specification & Architecture

**Status**: IMPLEMENTED (Phase 2A)
**Module**: `backend/validator.py`

---

## 1. Validation Architecture Overview

The `CubeValidator` determines whether a given 3x3 Rubik's Cube state representation is structurally valid, physically sound, and reachable from a legal solved state without physical disassembly.

The validation pipeline operates as a sequence of deterministic verification gates:

```text
[54-Char State String / Cube Object]
                 ↓
1. Format & Structure Check (Length = 54, Characters ∈ {U, R, F, D, L, B})
                 ↓
2. Color / Sticker Count Check (Exactly 9 stickers per color)
                 ↓
3. Fixed Center Alignment Check (U=White, R=Red, F=Green, D=Yellow, L=Orange, B=Blue)
                 ↓
4. Physical Edge Verification (12 unique physical edge cubies, no duplicates/opposing pairs)
                 ↓
5. Physical Corner Verification (8 unique physical corner cubies, no duplicates/opposing triplets)
                 ↓
6. Edge Orientation Parity Check (∑ flip_i ≡ 0 mod 2)
                 ↓
7. Corner Orientation Twist Check (∑ twist_i ≡ 0 mod 3)
                 ↓
8. Permutation Parity Synchronization Check (sign(corner_perm) == sign(edge_perm))
                 ↓
[ValidationResult(is_valid=True, status=VALID)]
```

---

## 2. Mathematical Validity Rules

A physical 3x3 Rubik's Cube belongs to a specific subgroup of the symmetrical group $S_{48}$ of sticker permutations, with order $|G| = 43,252,003,274,489,856,000 \approx 4.33 \times 10^{19}$.

A cube configuration is legally solvable if and only if all the following mathematical conditions hold:

### 1. Structural & Color Invariant
* Total stickers: $N = 54$.
* Number of stickers of each face color $c \in \{U, R, F, D, L, B\}$: $N_c = 9$.
* Centers at face indices $(4, 13, 22, 31, 40, 49)$ must match the canonical reference orientation.

### 2. Edge Orbit & Orientation Rule
* There are 12 physical edge pieces, each consisting of 2 non-opposite colors.
* All 12 canonical edge pieces must be present without duplicates.
* **Edge Orientation Definition**:
  * For an edge piece containing $U$ or $D$: Orientation is `0` if the $U/D$ sticker is on the $U$ or $D$ facelet; `1` otherwise.
  * For a middle layer edge (no $U/D$): Orientation is `0` if the $F/B$ sticker is on the $F$ or $B$ facelet; `1` otherwise.
* **Invariant**: The sum of all edge orientations modulo 2 must equal 0:
  $$\sum_{i=0}^{11} \text{edge\_orientations}[i] \equiv 0 \pmod 2$$
  *(A single flipped edge in place is physically impossible).*

### 3. Corner Orbit & Orientation Rule
* There are 8 physical corner pieces, each consisting of 3 mutually adjacent colors.
* All 8 canonical corner pieces must be present without duplicates.
* **Corner Orientation Definition**:
  * Every corner contains exactly one $U$ or $D$ sticker.
  * Twist is `0` if the $U/D$ sticker is on the $U$ or $D$ facelet.
  * Twist is `1` if the $U/D$ sticker is on the clockwise facelet from $U/D$.
  * Twist is `2` if the $U/D$ sticker is on the counter-clockwise facelet from $U/D$.
* **Invariant**: The sum of all corner twists modulo 3 must equal 0:
  $$\sum_{i=0}^7 \text{corner\_orientations}[i] \equiv 0 \pmod 3$$
  *(A single twisted corner in place is physically impossible).*

### 4. Permutation Parity Invariant
* Let $\pi_c \in S_8$ be the corner permutation and $\pi_e \in S_{12}$ be the edge permutation.
* The sign (parity) of a permutation is determined by the number of transpositions modulo 2.
* **Invariant**: The corner permutation and edge permutation must share identical parity:
  $$\text{sgn}(\pi_c) = \text{sgn}(\pi_e) \iff \text{parity}(\pi_c) \equiv \text{parity}(\pi_e) \pmod 2$$
  *(Swapping exactly two edges without swapping two corners is physically impossible).*

---

## 3. Status Codes & Meanings

| Status Code | Description | Solvable |
| :--- | :--- | :--- |
| `VALID` | Cube state is structurally valid, physically consistent, and solvable. | **Yes** |
| `INVALID_FORMAT` | String length is not 54, input is non-string/non-Cube, or invalid characters detected. | **No** |
| `INVALID_STICKER_COUNT` | One or more face colors do not appear exactly 9 times. | **No** |
| `INVALID_CENTER_CONFIGURATION` | Center facelets do not match canonical reference orientation (`URFDLB`). | **No** |
| `INVALID_EDGE_CONFIGURATION` | Duplicate edge pieces, same-color stickers on an edge, or impossible opposing color pairs. | **No** |
| `INVALID_CORNER_CONFIGURATION` | Duplicate corner pieces, duplicate colors on a corner, or impossible opposing color triplets. | **No** |
| `INVALID_EDGE_ORIENTATION` | Sum of edge flips is odd ($\sum \text{flip} \not\equiv 0 \pmod 2$). | **No** |
| `INVALID_CORNER_ORIENTATION` | Sum of corner twists is not divisible by 3 ($\sum \text{twist} \not\equiv 0 \pmod 3$). | **No** |
| `INVALID_PERMUTATION_PARITY` | Corner parity does not match edge parity ($\text{parity}(\pi_c) \neq \text{parity}(\pi_e)$). | **No** |
| `UNSOLVABLE_STATE` | Generic unrecoverable physical anomaly. | **No** |

---

## 4. Diagnostic Result Structure

`CubeValidator.validate()` returns a `ValidationResult` object:

```python
@dataclass
class ValidationResult:
    is_valid: bool
    status: ValidationStatus
    message: str
    details: Dict[str, Any]
```

### Example Valid Response
```json
{
  "is_valid": true,
  "status": "VALID",
  "message": "Cube state is structurally valid, physically sound, and solvable.",
  "details": {
    "edge_orientations": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    "corner_orientations": [0, 0, 0, 0, 0, 0, 0, 0],
    "edge_parity": 0,
    "corner_parity": 0
  }
}
```

### Example Invalid Response (Twisted Corner)
```json
{
  "is_valid": false,
  "status": "INVALID_CORNER_ORIENTATION",
  "message": "Invalid corner orientation: impossible single twisted corner detected (total twist sum must be a multiple of 3).",
  "details": {
    "corner_orientations": [1, 0, 0, 0, 0, 0, 0, 0],
    "twist_sum_mod_3": 1
  }
}
```

---

## 5. Development Status

* **IMPLEMENTED (Phase 1 & 2A)**:
  * Pure-Python Cube Core (`backend/cube_engine.py`)
  * Canonical Cube State Contract (`docs/cube_state_contract.md`)
  * Full State Validator (`backend/validator.py`)
  * Unit test suites for Cube Core & State Validator (`backend/test_cube_engine.py`, `backend/test_validator.py`)
* **PLANNED (Phase 2B)**:
  * Abstract Solver Engine Interface (`BaseSolver`)
  * Two-Phase Algorithm Solver integration
  * Human-readable Beginner / CFOP solver module
* **PLANNED (Phase 3 & Beyond)**:
  * 3D Three.js visualization
  * Computer Vision scanning & sticker color recognition
