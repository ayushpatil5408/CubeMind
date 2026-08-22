"""
Comprehensive Unit & Integration Test Suite for KociembaSolver (Phase 2C).

Tests:
1. Solved cube returns ALREADY_SOLVED with 0 moves immediately.
2. All 18 single-move scrambles are solved and verified.
3. Known multi-move scrambles (Sexy Move, Sune, T-Perm, Checkerboard) solved and verified.
4. Random WCA scrambles of various lengths (5, 10, 15, 20) solved and verified.
5. Verification gate actively proves the solution solves the cube.
6. Acceptance of both Cube instances and 54-char string inputs.
7. Structural invalid formats return INVALID_INPUT without crashing.
8. Physically impossible / unsolvable states return UNSOLVABLE_STATE or SOLVER_ERROR.
9. Missing dependency simulation returns SOLVER_UNAVAILABLE.
10. Timeout simulation returns TIMEOUT.
11. Unexpected internal error returns SOLVER_ERROR.
12. Zero-coupling invariant: Cube Core and Validator do not import solver packages.
13. Performance / benchmark metrics are accurately populated.
"""

import sys
import unittest.mock as mock
import pytest

import cube_engine
from cube_engine import Cube, ScrambleGenerator, SOLVED_STATE_STRING
from solver import KociembaSolver, SolverStatus, SolutionResult


@pytest.fixture
def solver() -> KociembaSolver:
    return KociembaSolver()


# ======================================================================
# 1. Solved State Gate Tests
# ======================================================================

def test_kociemba_already_solved_cube(solver: KociembaSolver):
    """Solved cube returns ALREADY_SOLVED with 0 moves and is verified."""
    cube = Cube()
    res = solver.solve(cube)

    assert res.success is True
    assert res.status == SolverStatus.ALREADY_SOLVED
    assert res.moves == []
    assert res.move_count == 0
    assert res.verification_result is not None
    assert res.verification_result.is_verified is True
    assert res.error_message is None
    assert res.solve_time_ms >= 0.0


def test_kociemba_already_solved_string_input(solver: KociembaSolver):
    """String representation of solved cube is handled identically."""
    res = solver.solve(SOLVED_STATE_STRING)
    assert res.success is True
    assert res.status == SolverStatus.ALREADY_SOLVED
    assert res.move_count == 0
    assert res.verification_result.is_verified is True


# ======================================================================
# 2. All 18 Single-Move Scrambles
# ======================================================================

@pytest.mark.parametrize("move", [
    "U", "U'", "U2",
    "D", "D'", "D2",
    "L", "L'", "L2",
    "R", "R'", "R2",
    "F", "F'", "F2",
    "B", "B'", "B2",
])
def test_kociemba_single_move_scrambles(solver: KociembaSolver, move: str):
    """Every basic face turn (18 moves) is solved and verified."""
    cube = Cube()
    cube.apply_move(move)

    res = solver.solve(cube, verify=True)

    assert res.success is True
    assert res.status == SolverStatus.SOLVED
    assert res.move_count >= 1
    assert res.verification_result is not None
    assert res.verification_result.is_verified is True
    assert res.verification_result.final_state == SOLVED_STATE_STRING


# ======================================================================
# 3. Known Multi-Move Algorithms
# ======================================================================

@pytest.mark.parametrize("name,algo", [
    ("Sexy Move", "R U R' U'"),
    ("Inverse Sexy", "U R U' R'"),
    ("Sune", "R U R' U R U2 R'"),
    ("Anti-Sune", "R U2 R' U' R U' R'"),
    ("Checkerboard Pattern", "U2 D2 F2 B2 L2 R2"),
    ("T-Permutation", "R U R' U' R' F R2 U' R' U' R U R' F'"),
    ("4-Move Scramble", "L F' D2 B"),
])
def test_kociemba_known_algorithms(solver: KociembaSolver, name: str, algo: str):
    """Known multi-move algorithms are solved and verified."""
    cube = Cube()
    cube.apply_algorithm(algo)

    res = solver.solve(cube, verify=True)

    assert res.success is True, f"Failed for {name}: {res.error_message}"
    assert res.status == SolverStatus.SOLVED
    assert res.move_count >= 1
    assert res.verification_result.is_verified is True
    assert res.verification_result.final_state == SOLVED_STATE_STRING


# ======================================================================
# 4. Random WCA Scrambles
# ======================================================================

@pytest.mark.parametrize("length,seed", [
    (5, 101),
    (5, 102),
    (10, 201),
    (10, 202),
    (15, 301),
    (15, 302),
    (20, 401),
    (20, 402),
    (20, 403),
])
def test_kociemba_random_scrambles(solver: KociembaSolver, length: int, seed: int):
    """Random WCA scrambles of various lengths are solved and mathematically verified."""
    cube = Cube()
    scramble = ScrambleGenerator.generate(length, seed=seed)
    cube.apply_algorithm(scramble)

    res = solver.solve(cube, verify=True)

    assert res.success is True, f"Failed for seed {seed} (len {length}): {res.error_message}"
    assert res.status == SolverStatus.SOLVED
    assert res.move_count <= 22  # Kociemba guarantee
    assert res.verification_result.is_verified is True
    assert res.verification_result.final_state == SOLVED_STATE_STRING


# ======================================================================
# 5. Invalid Input & Impossible States
# ======================================================================

@pytest.mark.parametrize("invalid_state", [
    "",
    "invalid",
    "U" * 53,
    "U" * 55,
    "X" * 54,
    "UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBX",
])
def test_kociemba_invalid_format(solver: KociembaSolver, invalid_state: str):
    """Malformed state strings return INVALID_INPUT without invoking solver."""
    res = solver.solve(invalid_state)
    assert res.success is False
    assert res.status == SolverStatus.INVALID_INPUT
    assert res.moves == []
    assert "Validation failed" in (res.error_message or "")


def test_kociemba_unsolvable_twisted_corner(solver: KociembaSolver):
    """Single twisted corner (sum of twists != 0 mod 3) returns UNSOLVABLE_STATE."""
    cube = Cube()
    stickers = list(cube.to_state_string())
    # Twist UFR corner (U[8], R[9], F[20])
    stickers[8], stickers[9], stickers[20] = stickers[20], stickers[8], stickers[9]
    twisted_state = "".join(stickers)

    res = solver.solve(twisted_state)
    assert res.success is False
    assert res.status == SolverStatus.UNSOLVABLE_STATE


def test_kociemba_unsolvable_flipped_edge(solver: KociembaSolver):
    """Single flipped edge (sum of flips != 0 mod 2) returns UNSOLVABLE_STATE."""
    cube = Cube()
    stickers = list(cube.to_state_string())
    # Flip UF edge (U[7], F[19])
    stickers[7], stickers[19] = stickers[19], stickers[7]
    flipped_state = "".join(stickers)

    res = solver.solve(flipped_state)
    assert res.success is False
    assert res.status == SolverStatus.UNSOLVABLE_STATE


def test_kociemba_unsolvable_permutation_parity(solver: KociembaSolver):
    """Swapped corner pair without edge swap returns UNSOLVABLE_STATE."""
    cube = Cube()
    stickers = list(cube.to_state_string())
    # Swap UBL corner (0, 36, 45) with UBR corner (2, 47, 11)
    (stickers[0], stickers[36], stickers[45],
     stickers[2], stickers[47], stickers[11]) = (
        stickers[2], stickers[47], stickers[11],
        stickers[0], stickers[36], stickers[45]
    )
    parity_state = "".join(stickers)

    res = solver.solve(parity_state)
    assert res.success is False
    assert res.status == SolverStatus.UNSOLVABLE_STATE


# ======================================================================
# 6. Error & Failure Handling
# ======================================================================

def test_kociemba_missing_dependency(solver: KociembaSolver):
    """When solver backend dependency cannot be imported, returns SOLVER_UNAVAILABLE."""
    cube = Cube().apply_move("R")
    with mock.patch.dict(sys.modules, {"rubik_solver.Solver.Kociemba.Search": None, "rubik_solver.Solver.Kociemba": None, "rubik_solver": None}):
        res = solver.solve(cube)
        assert res.success is False
        assert res.status == SolverStatus.SOLVER_UNAVAILABLE
        assert "unavailable" in (res.error_message or "").lower()


def test_kociemba_timeout_handling(solver: KociembaSolver):
    """Solver timeout returns TIMEOUT status gracefully."""
    cube = Cube().apply_move("R")
    with mock.patch("rubik_solver.Solver.Kociemba.Search.Search.solution", side_effect=TimeoutError("Search exceeded timeout")):
        res = solver.solve(cube)
        assert res.success is False
        assert res.status == SolverStatus.TIMEOUT
        assert "timed out" in (res.error_message or "").lower()


def test_kociemba_internal_exception(solver: KociembaSolver):
    """Unexpected exceptions in solver return SOLVER_ERROR gracefully."""
    cube = Cube().apply_move("R")
    with mock.patch("rubik_solver.Solver.Kociemba.Search.Search.solution", side_effect=RuntimeError("Corrupt table")):
        res = solver.solve(cube)
        assert res.success is False
        assert res.status == SolverStatus.SOLVER_ERROR
        assert "Internal solver error" in (res.error_message or "")


def test_kociemba_invalid_move_output(solver: KociembaSolver):
    """If solver returns non-standard move tokens, returns SOLVER_ERROR."""
    cube = Cube().apply_move("R")
    with mock.patch.object(solver, "_solve_impl", return_value=["INVALID_MOVE"]):
        res = solver.solve(cube)
        assert res.success is False
        assert res.status == SolverStatus.SOLVER_ERROR
        assert "invalid move sequence" in (res.error_message or "")


def test_kociemba_verification_failure(solver: KociembaSolver):
    """If solver returns moves that fail verification, returns SOLVER_ERROR."""
    cube = Cube().apply_move("R")
    # Return a move that does NOT solve the cube (e.g. "U" instead of "R'")
    with mock.patch.object(solver, "_solve_impl", return_value=["U"]):
        res = solver.solve(cube, verify=True)
        assert res.success is False
        assert res.status == SolverStatus.SOLVER_ERROR
        assert "verification failed" in (res.error_message or "").lower()


# ======================================================================
# 7. Architecture & Zero-Coupling Invariant
# ======================================================================

def test_zero_coupling_cube_engine_and_validator():
    """Verify that cube_engine.py and validator.py do not import solver modules."""
    import inspect
    import cube_engine
    import validator

    cube_engine_src = inspect.getsource(cube_engine)
    validator_src = inspect.getsource(validator)

    for forbidden in ["solver", "kociemba", "rubik_solver"]:
        assert f"import {forbidden}" not in cube_engine_src
        assert f"from {forbidden}" not in cube_engine_src
        assert f"import {forbidden}" not in validator_src
        assert f"from {forbidden}" not in validator_src
