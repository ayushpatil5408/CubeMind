# CubeMind Solver Architecture & Abstraction Specification

**Status**: IMPLEMENTED (Phase 2B)  
**Package**: `backend/solver/`

---

## 1. Architectural Overview

The Solver Architecture provides a modular, extensible foundation that allows multiple Rubik's Cube solving algorithms to be seamlessly integrated into CubeMind without coupling solver logic to the Cube Core or Validation Engine.

### Unidirectional Dependency Flow

```text
┌──────────────────────────────────────┐
│       Cube Core (cube_engine.py)     │  Phase 1 (IMPLEMENTED)
└──────────────────┬───────────────────┘
                   │ imports types & models
                   ▼
┌──────────────────────────────────────┐
│     State Validator (validator.py)   │  Phase 2A (IMPLEMENTED)
└──────────────────┬───────────────────┘
                   │ imports validation gates
                   ▼
┌──────────────────────────────────────┐
│    Solver Abstraction (solver/)      │  Phase 2B (IMPLEMENTED)
│  - BaseSolver (ABC)                  │
│  - SolutionResult & Models           │
│  - SolutionVerifier                  │
└──────────────────┬───────────────────┘
                   │ inherited by
                   ▼
┌──────────────────────────────────────┐
│   Concrete Solvers (solver/*.py)     │  Phase 2C (PLANNED)
│  - KociembaTwoPhaseSolver            │
│  - LayerByLayerBeginnerSolver        │
│  - CFOPSolver                        │
│  - ExperimentalIDAStarSolver         │
└──────────────────────────────────────┘
```

> [!IMPORTANT]
> **Zero Coupling Rule**: The foundational Cube Engine (`backend/cube_engine.py`) and Validator (`backend/validator.py`) NEVER import or depend on `solver` or any concrete solver library.

---

## 2. Solver Contract: `BaseSolver`

All solving engines must inherit from the abstract base class `BaseSolver` and implement the `_solve_impl(cube: Cube) -> List[str]` method.

```python
class BaseSolver(abc.ABC):
    def __init__(self, name: Optional[str] = None):
        self.name = name or self.__class__.__name__

    @abc.abstractmethod
    def _solve_impl(self, cube: cube_engine.Cube) -> List[str]:
        """Concrete algorithm implementation."""
        raise NotImplementedError

    def solve(
        self,
        state_input: Union[str, cube_engine.Cube],
        verify: bool = True,
    ) -> SolutionResult:
        """Standard template method managing lifecycle, validation, timing, and verification."""
```

### Solve Lifecycle

When `solver.solve(state, verify=True)` is called:
1. **Validation Gate**: Runs `CubeValidator.validate()`. If state is structurally invalid or physically impossible, returns early with `INVALID_INPUT` or `UNSOLVABLE_STATE` without calling the solver.
2. **Solved State Gate**: Checks `cube.is_solved()`. If already solved, immediately returns `ALREADY_SOLVED` with 0 moves.
3. **Cloned Execution**: Clones the cube to prevent solver side-effects, starts execution timer, and calls `_solve_impl(cube_clone)`.
4. **Move Normalization**: Parses and validates all returned move tokens against standard WCA notation.
5. **Solution Verification**: If `verify=True`, runs `SolutionVerifier.verify(cube, moves)` on an isolated cube copy to mathematically prove that the moves reach the solved state.
6. **Error Wrapping**: Traps timeouts, unimplemented features, and internal crashes, formatting them into structured error responses.

---

## 3. Data Models

### `SolverStatus`
```python
class SolverStatus(str, Enum):
    SOLVED = "SOLVED"
    ALREADY_SOLVED = "ALREADY_SOLVED"
    INVALID_INPUT = "INVALID_INPUT"
    UNSOLVABLE_STATE = "UNSOLVABLE_STATE"
    TIMEOUT = "TIMEOUT"
    SOLVER_UNAVAILABLE = "SOLVER_UNAVAILABLE"
    SOLVER_ERROR = "SOLVER_ERROR"
```

### `SolutionResult` Structure
```python
@dataclass
class SolutionResult:
    success: bool
    status: SolverStatus
    solver_name: str
    moves: List[str]
    move_count: int
    solve_time_ms: float
    validation_result: Optional[ValidationResult]
    verification_result: Optional[VerificationResult]
    error_message: Optional[str]
    metadata: Dict[str, Any]
```

### `VerificationResult` Structure
```python
@dataclass
class VerificationResult:
    is_verified: bool
    final_state: str
    message: str
    applied_moves: List[str]
    error: Optional[str]
```

---

## 4. Solution Verification Architecture

The `SolutionVerifier` class provides independent, automated verification of any solution sequence:

```python
class SolutionVerifier:
    @classmethod
    def verify(
        cls,
        initial_state: Union[str, cube_engine.Cube],
        moves: Union[str, Sequence[str]],
    ) -> VerificationResult:
        # 1. Isolates initial state by cloning
        # 2. Parses and validates move tokens
        # 3. Applies moves in sequence
        # 4. Asserts final cube.is_solved() == True
```

---

## 5. Development Roadmap

### IMPLEMENTED (Phases 1, 2A, 2B, 2C)
* **Cube Core**: Deterministic state, 18 standard moves, notation parser, scrambler (`backend/cube_engine.py`).
* **State Validation**: Strict structural, physical, orientation orbit, and parity validation (`backend/validator.py`).
* **Solver Abstraction**: Base solver interface, standardized solution models, and solution verification (`backend/solver/`).
* **`KociembaSolver`**: Real Two-Phase Algorithm solver producing verified solutions $\le 21$ moves (`backend/solver/kociemba.py`).

### PLANNED (Future Solver Algorithms)
* **`BeginnerSolver` / `CFOPSolver`**: Human-readable step-by-step layer solving (Cross, F2L, OLL, PLL) for interactive teaching and coaching modes.
* **`ExperimentalIDAStarSolver`**: Pure-Python heuristic IDA* search solver for educational and benchmarking purposes.

### PLANNED (Phases 3+)
* **Interactive 3D UI**: Three.js rendering and animated playback controller.
* **Computer Vision**: Camera feed facelet capture and color reconstruction.
