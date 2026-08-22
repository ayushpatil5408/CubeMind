"""
Unit Test Suite for Phase 2B Solver Architecture & Abstraction.

Tests:
1. BaseSolver ABC contract enforcement.
2. Mock concrete solver execution.
3. SolutionResult structure & serialization.
4. Solved cube handling (ALREADY_SOLVED).
5. Invalid/unsolvable cube state rejection (INVALID_INPUT / UNSOLVABLE_STATE).
6. Solution verification with correct, incomplete, and malformed moves.
7. Solver timeout and error handling.
8. Solver unavailability handling (NotImplementedError).
9. Architectural independence checks (no reverse imports from Cube Core or Validator).
"""

from typing import List
import pytest
import cube_engine
from cube_engine import Cube, ScrambleGenerator, SOLVED_STATE_STRING
from solver import (
    BaseSolver,
    SolutionResult,
    SolverStatus,
    SolutionVerifier,
    VerificationResult,
)


class MockSimpleSolver(BaseSolver):
    """
    A concrete mock solver for testing the abstraction.
    Solves 1-move or known algorithm scrambles by inverting them.
    """
    def __init__(self, target_moves: List[str] = None):
        super().__init__(name="MockSimpleSolver")
        self.target_moves = target_moves

    def _solve_impl(self, cube: Cube) -> List[str]:
        if self.target_moves is not None:
            return list(self.target_moves)
        return []


class MockFailingSolver(BaseSolver):
    """Mock solver that raises an unexpected exception."""
    def _solve_impl(self, cube: Cube) -> List[str]:
        raise RuntimeError("Simulated internal solver crash.")


class MockTimeoutSolver(BaseSolver):
    """Mock solver that raises a TimeoutError."""
    def _solve_impl(self, cube: Cube) -> List[str]:
        raise TimeoutError("Algorithm exceeded search time limit.")


class MockUnimplementedSolver(BaseSolver):
    """Mock solver that raises NotImplementedError."""
    def _solve_impl(self, cube: Cube) -> List[str]:
        raise NotImplementedError("Kociemba Phase 2 not yet wired.")


def test_base_solver_abc_cannot_be_instantiated():
    """Requirement 1: BaseSolver cannot be instantiated without _solve_impl."""
    with pytest.raises(TypeError):
        BaseSolver()


def test_mock_solver_success_and_verification():
    """Requirement 2, 3, 4: Successful solve with verification."""
    cube = Cube()
    scramble = ["R", "U", "R'", "U'"]
    cube.apply_algorithm(scramble)

    # The exact inverse sequence
    inverse_moves = cube_engine.invert_algorithm(scramble)
    solver = MockSimpleSolver(target_moves=inverse_moves)

    result = solver.solve(cube, verify=True)

    assert result.success is True
    assert result.status == SolverStatus.SOLVED
    assert result.solver_name == "MockSimpleSolver"
    assert result.moves == inverse_moves
    assert result.move_count == 4
    assert result.solve_time_ms >= 0.0
    assert result.validation_result is not None
    assert result.validation_result.is_valid is True
    assert result.verification_result is not None
    assert result.verification_result.is_verified is True
    assert result.error_message is None

    # Test dictionary serialization
    dict_res = result.to_dict()
    assert dict_res["success"] is True
    assert dict_res["status"] == "SOLVED"
    assert dict_res["moves"] == inverse_moves
    assert dict_res["verification_result"]["is_verified"] is True


def test_solved_cube_handling():
    """Requirement 6: Solved cube returns ALREADY_SOLVED without executing _solve_impl."""
    # Custom solver that would error if _solve_impl were called
    solver = MockFailingSolver(name="FailingIfCalled")

    result = solver.solve(SOLVED_STATE_STRING)

    assert result.success is True
    assert result.status == SolverStatus.ALREADY_SOLVED
    assert result.moves == []
    assert result.move_count == 0
    assert result.verification_result is not None
    assert result.verification_result.is_verified is True


def test_invalid_input_rejection():
    """Requirement 7: Malformed string length or character rejects early as INVALID_INPUT."""
    solver = MockSimpleSolver(target_moves=["U"])

    # Invalid length
    res_short = solver.solve("SHORT_STRING")
    assert res_short.success is False
    assert res_short.status == SolverStatus.INVALID_INPUT
    assert "validation failed" in res_short.error_message.lower()

    # Invalid sticker counts
    imbalanced = "U" + SOLVED_STATE_STRING[1:9] + "U" + SOLVED_STATE_STRING[10:]
    res_imbalanced = solver.solve(imbalanced)
    assert res_imbalanced.success is False
    assert res_imbalanced.status == SolverStatus.INVALID_INPUT


def test_unsolvable_state_rejection():
    """Requirement 7: Physical defects (twisted corner / flipped edge) reject as UNSOLVABLE_STATE."""
    solver = MockSimpleSolver(target_moves=["U"])

    # Single flipped edge (swap U[7] and F[19])
    state_list = list(SOLVED_STATE_STRING)
    state_list[7], state_list[19] = state_list[19], state_list[7]
    flipped_edge_state = "".join(state_list)

    result = solver.solve(flipped_edge_state)
    assert result.success is False
    assert result.status == SolverStatus.UNSOLVABLE_STATE
    assert result.validation_result.status.value == "INVALID_EDGE_ORIENTATION"


def test_solution_verification_success_and_failure():
    """Requirement 8 & 9: SolutionVerifier accurately verifies correct vs incorrect moves."""
    scramble = ["R", "U", "R'"]
    cube = Cube().apply_algorithm(scramble)

    # 1. Correct inverse
    correct_solution = ["R", "U'", "R'"]
    ver_ok = SolutionVerifier.verify(cube, correct_solution)
    assert ver_ok.is_verified is True
    assert ver_ok.applied_moves == correct_solution

    # 2. Incorrect / incomplete solution
    wrong_solution = ["R", "U"]
    ver_fail = SolutionVerifier.verify(cube, wrong_solution)
    assert ver_fail.is_verified is False
    assert "not solved" in ver_fail.message

    # 3. Malformed move tokens
    ver_bad_moves = SolutionVerifier.verify(cube, ["R", "INVALID_TOKEN"])
    assert ver_bad_moves.is_verified is False
    assert "malformed" in ver_bad_moves.message.lower()

    # 4. Invalid initial state input type
    ver_bad_type = SolutionVerifier.verify(12345, ["R"])
    assert ver_bad_type.is_verified is False

    # 5. Invalid string state
    ver_bad_str = SolutionVerifier.verify("INVALID_LENGTH", ["R"])
    assert ver_bad_str.is_verified is False


def test_solver_returns_incorrect_moves_caught_by_verifier():
    """Requirement 9: If a solver returns moves that don't solve the cube, verify fails."""
    cube = Cube().apply_algorithm("R U R'")
    # Mock solver returns wrong move "U"
    solver = MockSimpleSolver(target_moves=["U"])

    result = solver.solve(cube, verify=True)

    assert result.success is False
    assert result.status == SolverStatus.SOLVER_ERROR
    assert result.verification_result is not None
    assert result.verification_result.is_verified is False
    assert "verification failed" in result.error_message.lower()


def test_solver_returns_invalid_move_notation():
    """Tests handling of solver returning invalid move token or bad type."""
    cube = Cube().apply_algorithm("R")
    solver = MockSimpleSolver(target_moves=["ILLEGAL_MOVE"])

    result = solver.solve(cube)
    assert result.success is False
    assert result.status == SolverStatus.SOLVER_ERROR
    assert "invalid move sequence" in result.error_message.lower()

    # Test non-sequence return
    class BadTypeSolver(BaseSolver):
        def _solve_impl(self, cube: Cube) -> List[str]:
            return 12345

    res_type = BadTypeSolver().solve(cube)
    assert res_type.success is False
    assert res_type.status == SolverStatus.SOLVER_ERROR


def test_solver_timeout_handling():
    """Tests TimeoutError handling."""
    cube = Cube().apply_algorithm("R")
    solver = MockTimeoutSolver()

    result = solver.solve(cube)
    assert result.success is False
    assert result.status == SolverStatus.TIMEOUT
    assert "timed out" in result.error_message.lower()


def test_solver_unimplemented_handling():
    """Tests NotImplementedError handling."""
    cube = Cube().apply_algorithm("R")
    solver = MockUnimplementedSolver()

    result = solver.solve(cube)
    assert result.success is False
    assert result.status == SolverStatus.SOLVER_UNAVAILABLE
    assert "not yet implemented" in result.error_message.lower()


def test_solver_unexpected_error_handling():
    """Tests unexpected runtime exception handling."""
    cube = Cube().apply_algorithm("R")
    solver = MockFailingSolver()

    result = solver.solve(cube)
    assert result.success is False
    assert result.status == SolverStatus.SOLVER_ERROR
    assert "Simulated internal solver crash" in result.error_message


def test_architecture_independence():
    """Requirement 10 & 11: Cube Core and Validator do not import Solver."""
    import sys

    # Verify cube_engine does not reference solver
    assert not hasattr(cube_engine, "BaseSolver")
    assert not hasattr(cube_engine, "SolutionResult")

    # Verify validator does not reference solver
    import validator
    assert not hasattr(validator, "BaseSolver")
    assert not hasattr(validator, "SolutionResult")

    # Verify no kociemba module is imported in sys.modules
    assert "kociemba" not in sys.modules
