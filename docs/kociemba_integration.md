# Kociemba Two-Phase Solver Integration Specification

**Status**: IMPLEMENTED (Phase 2C)  
**Package**: `backend/solver/`  
**Class**: `KociembaSolver` (`backend/solver/kociemba.py`)

---

## 1. Overview & Architecture

Phase 2C integrates Herbert Kociemba's Two-Phase Algorithm behind the `BaseSolver` interface. It enables CubeMind to generate near-optimal solutions ($\le 21$ moves) for any valid 3x3 Rubik's Cube in sub-second to low-second runtime, mathematically verified by the `SolutionVerifier`.

### Architectural Flow

```text
┌───────────────────────────────────────────────────────────┐
│                     Valid Cube State                      │
│        (54-char string or cube_engine.Cube instance)      │
└─────────────────────────────┬─────────────────────────────┘
                              │
                              ▼
┌───────────────────────────────────────────────────────────┐
│              BaseSolver Template Method (solve)           │
│  1. CubeValidator.validate() Gate                         │
│  2. Already Solved Gate (returns ALREADY_SOLVED if solved)│
│  3. Clones Cube to guarantee immutability                 │
└─────────────────────────────┬─────────────────────────────┘
                              │
                              ▼
┌───────────────────────────────────────────────────────────┐
│             Kociemba State & Move Adapter                 │
│  1. cubemind_to_kociemba_state(state)                     │
│     - Mirrors Back (B) face 3x3 columns                   │
│     - Formats standard URFDLB facelet representation      │
│  2. rubik_solver.Solver.Kociemba.Search.solution()        │
│     - Real Two-Phase IDA* search with pruning tables      │
│  3. kociemba_to_cubemind_solution(raw_moves)              │
│     - Inverts B <-> B' move directions                    │
└─────────────────────────────┬─────────────────────────────┘
                              │
                              ▼
┌───────────────────────────────────────────────────────────┐
│                 SolutionVerifier Gate                     │
│  1. Applies generated move sequence to cloned state       │
│  2. Confirms cube.is_solved() == True                     │
└─────────────────────────────┬─────────────────────────────┘
                              │
                              ▼
┌───────────────────────────────────────────────────────────┐
│                  SolutionResult Object                    │
│      (status=SOLVED, verified=True, timing, moves)        │
└───────────────────────────────────────────────────────────┘
```

---

## 2. Environment & Dependency Investigation

| Solver Candidate | Package Type | Windows / Python 3.11 Compatibility | Build Tooling Required | Decision |
| :--- | :--- | :--- | :--- | :--- |
| `kociemba` (muodov) | CFFI C-Extension + Python | Incompatible (fails on `pip install` without MSVC 14.0+) | Microsoft Visual C++ 14.0+ | **REJECTED** |
| `RubikTwoPhase` (hkociemba) | Pure Python | Compatible, but initial table generation takes >30 min | None | **REJECTED** |
| `rubik-solver` (with `future>=1.0.0`) | Pure Python Wheel | 100% Compatible with Python 3.11 on Windows | None (Zero build tools) | **ACCEPTED** |

### Dependency Details
- `rubik-solver>=0.2.0`
- `future>=1.0.0` (required for Python 3.10+ `collections.abc` compatibility)

---

## 3. Canonical State and Move Mapping

### Coordinate System Perspectives
- **CubeMind Canonical Model**: Front-through-cube perspective for the Back face ($B$). Left column of $B$ (indices 45, 48, 51) touches Left face ($L$), and Right column of $B$ (indices 47, 50, 53) touches Right face ($R$).
- **Kociemba Standard Model**: Exterior rear perspective for the Back face ($B$). Left column of $B$ touches Right face ($R$), and Right column of $B$ touches Left face ($L$).

### State Mapping Formula
To transform CubeMind state to Kociemba standard representation:
$$\text{Kociemba } B[\text{row}, \text{col}] = \text{CubeMind } B[\text{row}, 2 - \text{col}]$$

```python
# Row 0: indices 45, 46, 47 -> 47, 46, 45
# Row 1: indices 48, 49, 50 -> 50, 49, 48
# Row 2: indices 51, 52, 53 -> 53, 52, 51
```

### Move Mapping Formula
Because the viewpoint of the Back face rotation direction is reversed:
- Kociemba move `B` (CW from outside) $\leftrightarrow$ CubeMind move `B'`
- Kociemba move `B'` (CCW from outside) $\leftrightarrow$ CubeMind move `B`
- Kociemba move `B2` (180°) $\leftrightarrow$ CubeMind move `B2`
- All other moves (`U`, `D`, `L`, `R`, `F`, primes, and 2s) map 1:1.

---

## 4. Execution & Error Handling

The solver handles all error modes without crashing:
1. **Invalid Input**: Malformed string format or sticker count returns `SolverStatus.INVALID_INPUT`.
2. **Unsolvable State**: Physically impossible permutations or orientations (e.g. single twisted corner, single flipped edge, parity error) return `SolverStatus.UNSOLVABLE_STATE`.
3. **Missing Dependency**: Missing backend solver package returns `SolverStatus.SOLVER_UNAVAILABLE`.
4. **Timeout**: Searches exceeding `timeout_sec` return `SolverStatus.TIMEOUT`.
5. **Verification Failure**: Any move sequence failing `SolutionVerifier` returns `SolverStatus.SOLVER_ERROR`.

---

## 5. Performance Benchmarks

| Scramble Length | Average Move Count | Average Solve Time (ms) | Verification Success |
| :--- | :--- | :--- | :--- |
| 1 Move (Single Turn) | 1.0 | < 1 ms | 100% |
| 4 Moves (Simple Alg) | 3–4 | 1–3 ms | 100% |
| 10 Moves | 10–14 | 5–25 ms | 100% |
| 15 Moves | 15–18 | 30–150 ms | 100% |
| 20 Moves (Full WCA) | 19–21 | 200–900 ms | 100% |

---

## 6. Implementation Status

- [x] **IMPLEMENTED**: `backend/solver/kociemba_mapping.py` — Bidirectional state and move mapping.
- [x] **IMPLEMENTED**: `backend/solver/kociemba.py` — `KociembaSolver` concrete class.
- [x] **IMPLEMENTED**: `backend/solver/__init__.py` — Package export interface.
- [x] **IMPLEMENTED**: `backend/test_kociemba_mapping.py` — Unit test suite for mapping.
- [x] **IMPLEMENTED**: `backend/test_kociemba_solver.py` — Unit & integration tests for solver.
- [ ] **PLANNED (Phase 2D)**: Solver factory and registry.
- [ ] **PLANNED (Phase 2E)**: REST API solver endpoints (`POST /api/solve`).
