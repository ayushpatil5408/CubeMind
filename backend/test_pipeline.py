"""
Unit & Integration Tests for Solver Pipeline & Orchestration Service (Phase 2D).

Tests:
1. Solved cube returns ALREADY_SOLVED with 0 moves and verified state.
2. All 18 basic single-move scrambles are solved and verified.
3. Known multi-move scrambles (Sexy Move, Sune, T-Perm, Checkerboard) solved and verified.
4. Random WCA scrambles of various lengths (5, 10, 15, 20) solved and verified.
5. SolverRegistry dynamic registration, lookup, and list_available.
6. Unknown solver name returns SOLVER_UNAVAILABLE with registered list in message.
7. Structural invalid formats return INVALID_INPUT.
8. Physically impossible / unsolvable states return UNSOLVABLE_STATE.
9. Verification failure handling returns SOLVER_ERROR.
10. Solver timeout handling returns TIMEOUT.
11. Support for both Cube instances and 54-char string representations.
"""

import sys
import unittest.mock as mock
import pytest

import cube_engine
from cube_engine import Cube, ScrambleGenerator, SOLVED_STATE_STRING
from solver import (
    BaseSolver,
    SolverRegistry,
    SolverService,
    SolverStatus,
    SolutionResult,
    default_solver_service,
)


@pytest.fixture
def service() -> SolverService:
    return SolverService()


# ======================================================================
# 1. Solved State Pipeline Tests
# ======================================================================

def test_pipeline_solved_cube(service: SolverService):
    """Solved cube returns ALREADY_SOLVED immediately without calling solver engine."""
    cube = Cube()
    res = service.solve(cube)

    assert res.success is True
    assert res.status == SolverStatus.ALREADY_SOLVED
    assert res.moves == []
    assert res.move_count == 0
    assert res.verification_result.is_verified is True
    assert res.metadata["state_string"] == SOLVED_STATE_STRING


def test_pipeline_solved_string_input(service: SolverService):
    """String representation of solved cube is handled identically."""
    res = service.solve(SOLVED_STATE_STRING)
    assert res.success is True
    assert res.status == SolverStatus.ALREADY_SOLVED
    assert res.move_count == 0
    assert res.verification_result.is_verified is True


# ======================================================================
# 2. Single-Move & Algorithm Solving
# ======================================================================

@pytest.mark.parametrize("move", [
    "U", "U'", "U2",
    "D", "D'", "D2",
    "L", "L'", "L2",
    "R", "R'", "R2",
    "F", "F'", "F2",
    "B", "B'", "B2",
])
def test_pipeline_single_move_scrambles(service: SolverService, move: str):
    """Every single face move is solved and verified through the service pipeline."""
    cube = Cube().apply_move(move)
    res = service.solve(cube, solver_name="kociemba", verify=True)

    assert res.success is True
    assert res.status == SolverStatus.SOLVED
    assert res.move_count >= 1
    assert res.verification_result.is_verified is True
    assert res.verification_result.final_state == SOLVED_STATE_STRING


@pytest.mark.parametrize("name,algo", [
    ("Sexy Move", "R U R' U'"),
    ("Sune", "R U R' U R U2 R'"),
    ("Checkerboard", "U2 D2 F2 B2 L2 R2"),
    ("T-Permutation", "R U R' U' R' F R2 U' R' U' R U R' F'"),
])
def test_pipeline_known_algorithms(service: SolverService, name: str, algo: str):
    """Known algorithms are solved and verified."""
    cube = Cube().apply_algorithm(algo)
    res = service.solve(cube)

    assert res.success is True, f"Failed for {name}: {res.error_message}"
    assert res.status == SolverStatus.SOLVED
    assert res.verification_result.is_verified is True
    assert res.verification_result.final_state == SOLVED_STATE_STRING


# ======================================================================
# 3. Random Scrambles
# ======================================================================

@pytest.mark.parametrize("length,seed", [
    (5, 501),
    (10, 502),
    (15, 503),
    (20, 504),
])
def test_pipeline_random_scrambles(service: SolverService, length: int, seed: int):
    """Random WCA scrambles are solved and verified."""
    cube = Cube()
    scramble = ScrambleGenerator.generate(length, seed=seed)
    cube.apply_algorithm(scramble)

    res = service.solve(cube.to_state_string(), verify=True)

    assert res.success is True
    assert res.status == SolverStatus.SOLVED
    assert res.move_count <= 22
    assert res.verification_result.is_verified is True
    assert res.verification_result.final_state == SOLVED_STATE_STRING


# ======================================================================
# 4. Solver Registry Tests
# ======================================================================

def test_registry_default_solvers(service: SolverService):
    """Default solvers are present in the registry."""
    available = service.registry.list_available()
    assert "kociemba" in available
    assert "kociemba_two_phase" in available
    assert "two_phase" in available
    assert "default" in available


def test_registry_custom_solver_registration():
    """Custom solver implementations can be dynamically registered and used."""
    class CustomMockSolver(BaseSolver):
        def _solve_impl(self, cube: Cube):
            return ["U", "U'"]

    registry = SolverRegistry()
    registry.register("mock", lambda **kw: CustomMockSolver(name="MockSolver"))

    assert registry.is_registered("mock") is True
    service = SolverService(registry=registry)

    cube = Cube().apply_move("U")
    # Custom mock solver returns U U' which doesn't solve it, verification fails
    res = service.solve(cube, solver_name="mock", verify=True)
    assert res.status == SolverStatus.SOLVER_ERROR


def test_pipeline_unknown_solver_name(service: SolverService):
    """Requesting an unregistered solver returns SOLVER_UNAVAILABLE gracefully."""
    cube = Cube().apply_move("R")
    res = service.solve(cube, solver_name="non_existent_solver")

    assert res.success is False
    assert res.status == SolverStatus.SOLVER_UNAVAILABLE
    assert "not available" in (res.error_message or "").lower()


# ======================================================================
# 5. Validation and Error Handling
# ======================================================================

def test_pipeline_invalid_format(service: SolverService):
    """Malformed state string returns INVALID_INPUT."""
    res = service.solve("SHORT_INVALID")
    assert res.success is False
    assert res.status == SolverStatus.INVALID_INPUT
    assert res.validation_result is not None
    assert res.validation_result.is_valid is False


def test_pipeline_unsolvable_state(service: SolverService):
    """Single twisted corner returns UNSOLVABLE_STATE."""
    cube = Cube()
    stickers = list(cube.to_state_string())
    # Twist UFR corner (U[8], R[9], F[20])
    stickers[8], stickers[9], stickers[20] = stickers[20], stickers[8], stickers[9]
    twisted = "".join(stickers)

    res = service.solve(twisted)
    assert res.success is False
    assert res.status == SolverStatus.UNSOLVABLE_STATE


def test_pipeline_timeout_handling(service: SolverService):
    """Timeout returns TIMEOUT status gracefully."""
    cube = Cube().apply_move("R")
    with mock.patch("rubik_solver.Solver.Kociemba.Search.Search.solution", side_effect=TimeoutError("Search exceeded timeout")):
        res = service.solve(cube)
        assert res.success is False
        assert res.status == SolverStatus.TIMEOUT


def test_pipeline_factory_error_handling():
    """If solver factory fails to initialize, returns SOLVER_ERROR."""
    registry = SolverRegistry()
    registry.register("broken", mock.Mock(side_effect=RuntimeError("Init error")))
    service = SolverService(registry=registry)

    res = service.solve(Cube().apply_move("R"), solver_name="broken")
    assert res.success is False
    assert res.status == SolverStatus.SOLVER_ERROR
    assert "Failed to initialize solver" in (res.error_message or "")


def test_default_solver_service_singleton():
    """Global default_solver_service is instantiated and functional."""
    assert default_solver_service is not None
    res = default_solver_service.solve(SOLVED_STATE_STRING)
    assert res.status == SolverStatus.ALREADY_SOLVED
