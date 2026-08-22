# End-to-End Solver Pipeline & API Specification

**Status**: IMPLEMENTED (Phase 2D)  
**Modules**: `backend/solver/pipeline.py`, `backend/main.py`  
**Endpoints**: `POST /solve`, `POST /validate`, `GET /scramble`, `GET /`

---

## 1. Pipeline Architecture

The End-to-End Solver Pipeline coordinates the complete solving lifecycle from raw client input to mathematically verified solution output:

```text
┌─────────────────────────────────────────────────────────────┐
│                 Client Request: POST /solve                 │
│      {"state_string": "...", "solver": "kociemba"}          │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 1. Structural Format Gate (Length 54, URFDLB characters)    │
│    -> Returns HTTP 400 if malformed                         │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Deep State Validation Gate (CubeValidator)               │
│    - Center orientation & canonical positions               │
│    - 12 physical edge piece pairings & orientation sum = 0  │
│    - 8 physical corner piece triplets & twist sum = 0       │
│    - Permutation parity consistency (sign(edge) == sign(crn))│
│    -> Returns HTTP 422 with diagnostic payload if unsolvable│
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Already-Solved Gate                                      │
│    - Checks cube.is_solved()                                │
│    -> Returns HTTP 200 with 0 moves & ALREADY_SOLVED status │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. Solver Selection & Resolution (SolverRegistry)           │
│    - Dynamic registry lookup ("kociemba", "default", etc.)  │
│    -> Returns HTTP 503 if solver not registered             │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. Solving Engine Execution                                 │
│    - State conversion (cubemind_to_kociemba_state)          │
│    - IDA* two-phase search execution                        │
│    - Move normalization (kociemba_to_cubemind_solution)     │
│    - Solve time captured via high-resolution perf_counter   │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. Mathematical Verification Gate (SolutionVerifier)        │
│    - Clones original state                                  │
│    - Applies generated moves in order                       │
│    - Proves cube is 100% solved                             │
│    -> Traps verification failures as SOLVER_ERROR           │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 7. Structured Response Packaging                            │
│    - Success status, move list, move count, timing          │
│    - Full validation & verification details                 │
│    - Original state string & metadata                       │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. API Endpoints

### `POST /solve`
Solves a 3x3 Rubik's Cube given its 54-character state string.

#### Request Schema
```json
{
  "state_string": "string (54 chars, required)",
  "solver": "string (optional, default: 'kociemba')",
  "verify": "boolean (optional, default: true)",
  "max_depth": "integer (optional, default: 24, range: 1..30)",
  "timeout_sec": "number (optional, default: 20.0, range: 0.1..120.0)"
}
```

#### Successful Response (HTTP 200) — Scrambled Cube
```json
{
  "success": true,
  "status": "success",
  "status_name": "SOLVED",
  "solver_name": "KociembaTwoPhaseSolver",
  "moves": ["U", "R", "U'", "R'"],
  "solution": ["U", "R", "U'", "R'"],
  "solution_str": "U R U' R'",
  "move_count": 4,
  "solve_time_ms": 1.25,
  "is_solved": true,
  "state_string": "UULUUFUUFRRUBRRURRFFDFFUFFFDDRDDDDDDBLLLLLLLLBRRBBBBBB",
  "validation_result": {
    "is_valid": true,
    "status": "VALID",
    "message": "Cube state is structurally valid, physically sound, and solvable.",
    "details": { ... }
  },
  "verification_result": {
    "is_verified": true,
    "final_state": "UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB",
    "message": "Cube successfully solved in 4 moves.",
    "applied_moves": ["U", "R", "U'", "R'"],
    "error": null
  },
  "message": "Solution computed and verified successfully.",
  "metadata": {
    "state_string": "UULUUFUUFRRUBRRURRFFDFFUFFFDDRDDDDDDBLLLLLLLLBRRBBBBBB",
    "solver_key": "kociemba",
    "is_verified": true
  }
}
```

#### Successful Response (HTTP 200) — Already Solved Cube
```json
{
  "success": true,
  "status": "success",
  "status_name": "ALREADY_SOLVED",
  "solver_name": "KociembaTwoPhaseSolver",
  "moves": [],
  "solution": [],
  "solution_str": "",
  "move_count": 0,
  "solve_time_ms": 0.05,
  "is_solved": true,
  "state_string": "UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB",
  "validation_result": {
    "is_valid": true,
    "status": "VALID",
    "message": "Cube state is structurally valid, physically sound, and solvable."
  },
  "verification_result": {
    "is_verified": true,
    "final_state": "UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB",
    "message": "Cube was already in a solved state.",
    "applied_moves": []
  },
  "message": "Cube is already solved."
}
```

#### Error Response (HTTP 400) — Malformed Input Format
```json
{
  "detail": "Invalid state string: must be exactly 54 characters containing 9 of each face color (U, R, F, D, L, B)."
}
```

#### Error Response (HTTP 422) — Physically Unsolvable State
```json
{
  "detail": {
    "status": "UNSOLVABLE_STATE",
    "error_message": "Validation failed: Corner orientation sum is invalid (sum = 1 ≢ 0 mod 3). Single corner is twisted.",
    "validation_result": {
      "is_valid": false,
      "status": "INVALID_CORNER_ORIENTATION",
      "message": "Corner orientation sum is invalid (sum = 1 ≢ 0 mod 3). Single corner is twisted.",
      "details": { ... }
    }
  }
}
```

#### Error Response (HTTP 503) — Unregistered Solver
```json
{
  "detail": "Solver 'unknown_solver' is not available. Registered solvers: ['default', 'kociemba', 'kociemba_two_phase', 'two_phase']"
}
```

---

### `POST /validate`
Performs comprehensive structural, physical, orientation, and parity validation of a cube state.

#### Response (HTTP 200)
```json
{
  "state_string": "UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB",
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

---

### `GET /scramble`
Generates a standard WCA-style scramble sequence and computes the resulting cube state.

#### Query Parameters
- `length` (int, default: 20): Number of moves.
- `seed` (int, optional): Random seed for deterministic reproducibility.

#### Response (HTTP 200)
```json
{
  "length": 20,
  "seed": 123,
  "scramble": ["R", "U'", "F2", "D", "L", ...],
  "scramble_str": "R U' F2 D L ...",
  "resulting_state": "..."
}
```

---

### `GET /`
Service health check and capabilities endpoint.

#### Response (HTTP 200)
```json
{
  "status": "online",
  "service": "CubeMind Solver API",
  "phase": 2,
  "phase_status": "Phase 2D End-to-End Solver Pipeline",
  "available_solvers": ["default", "kociemba", "kociemba_two_phase", "two_phase"]
}
```

---

## 3. Implementation Status

- [x] **IMPLEMENTED (Phase 2D)**: High-level `SolverService` and dynamic `SolverRegistry`.
- [x] **IMPLEMENTED (Phase 2D)**: End-to-end `POST /solve` API endpoint with full verification.
- [x] **IMPLEMENTED (Phase 2D)**: Health, scramble, and deep validation endpoints.
- [x] **IMPLEMENTED (Phase 2D)**: Automated end-to-end test suite (`test_pipeline.py`, `test_api.py`).
- [ ] **PLANNED (Phase 3+)**: 3D interactive animated visualization frontend.
- [ ] **PLANNED (Phase 4+)**: Computer vision camera scanner.
