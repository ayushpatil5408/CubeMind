# Cube State Contract & Specification

**Status**: IMPLEMENTED (Phase 1)
**Scope**: Foundation Cube Core

---

## 1. Cube Orientation & Perspective Conventions

* **Primary Reference Orientation**:
  * **Up (U)**: White (Top face)
  * **Front (F)**: Green (Facing user)
  * **Right (R)**: Red (Right of Front)
  * **Down (D)**: Yellow (Bottom face)
  * **Left (L)**: Orange (Left of Front)
  * **Back (B)**: Blue (Opposite Front)

* **Opposite Faces**:
  * U (White) $\leftrightarrow$ D (Yellow)
  * F (Green) $\leftrightarrow$ B (Blue)
  * L (Orange) $\leftrightarrow$ R (Red)

---

## 2. Canonical Face Ordering & Sticker Indexing

The cube state is represented as a 54-element array (or 54-character string).

### Face Ordering
The 6 faces are ordered as follows:
`[U, R, F, D, L, B]`

### Face Index Ranges
| Face | Name | Color Default | Index Range (0-indexed) | Center Index |
| :--- | :--- | :--- | :--- | :--- |
| **U** | Up | White (`U`) | `0` – `8` | `4` |
| **R** | Right | Red (`R`) | `9` – `17` | `13` |
| **F** | Front | Green (`F`) | `18` – `26` | `22` |
| **D** | Down | Yellow (`D`) | `27` – `35` | `31` |
| **L** | Left | Orange (`L`) | `36` – `44` | `40` |
| **B** | Back | Blue (`B`) | `45` – `53` | `49` |

### 3x3 Grid Layout per Face
When looking directly at any face with its standard top edge pointing up:
```text
[ 0,  1,  2 ]  -> Top row (left to right)
[ 3,  4,  5 ]  -> Middle row (left, center, right)
[ 6,  7,  8 ]  -> Bottom row (left to right)
```

For absolute indices across all 54 stickers:
```text
               +------------+
               |  0   1   2 |
               |  3   4   5 |  (U - Up)
               |  6   7   8 |
+------------+------------+------------+------------+
| 36  37  38 | 18  19  20 |  9  10  11 | 45  46  47 |
| 39  40  41 | 21  22  23 | 12  13  14 | 48  49  50 |  (L, F, R, B)
| 42  43  44 | 24  25  26 | 15  16  17 | 51  52  53 |
+------------+------------+------------+------------+
               | 27  28  29 |
               | 30  31  32 |  (D - Down)
               | 33  34  35 |
               +------------+
```

---

## 3. Serialization Formats

### 1. 54-Character String Notation (Canonical)
- Exactly 54 characters from the set `{'U', 'R', 'F', 'D', 'L', 'B'}`.
- Exactly 9 of each character.
- Solved state representation:
  `"UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB"`

### 2. JSON Dictionary Representation
```json
{
  "state_string": "UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB",
  "faces": {
    "U": ["U", "U", "U", "U", "U", "U", "U", "U", "U"],
    "R": ["R", "R", "R", "R", "R", "R", "R", "R", "R"],
    "F": ["F", "F", "F", "F", "F", "F", "F", "F", "F"],
    "D": ["D", "D", "D", "D", "D", "D", "D", "D", "D"],
    "L": ["L", "L", "L", "L", "L", "L", "L", "L", "L"],
    "B": ["B", "B", "B", "B", "B", "B", "B", "B", "B"]
  },
  "is_solved": true
}
```

---

## 4. Move Notation & Transformation Rules

All standard moves rotate a face 90° clockwise when viewed looking directly at that face.

* **Single Moves (Clockwise 90°)**: `U`, `D`, `L`, `R`, `F`, `B`
* **Inverse Moves (Counter-Clockwise 90° / Prime)**: `U'`, `D'`, `L'`, `R'`, `F'`, `B'`
* **Double Moves (180°)**: `U2`, `D2`, `L2`, `R2`, `F2`, `B2`

### Mathematical Invariants
1. $X \cdot X' = I$ (Move followed by its inverse is Identity)
2. $X \cdot X \cdot X \cdot X = X^4 = I$ (4 quarter turns return to original state)
3. $X2 = X \cdot X = X' \cdot X'$ (Double turn is equal to two quarter turns)
4. $(X2)' = X2$ (Double turn is self-inverse)
5. Algorithm Inversion: $(M_1 M_2 \dots M_k)' = M_k' \dots M_2' M_1'$
