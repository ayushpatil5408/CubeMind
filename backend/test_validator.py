"""
Unit Test Suite for Phase 2A Cube State Validator.

Tests cover:
1. Solved cube state is VALID
2. Valid scrambled cube states are VALID
3. Format validation (length != 54, invalid characters, bad types)
4. Sticker counts validation (imbalanced colors)
5. Center configuration validation (swapped / incorrect centers)
6. Edge configuration validation (duplicate edges, impossible color pairs, same-color edges)
7. Corner configuration validation (duplicate corners, impossible color triplets, same-color corners)
8. Edge orientation validation (single flipped edge)
9. Corner orientation validation (single twisted corner)
10. Permutation parity validation (single edge swap / corner swap)
11. Scrambled cubes with seeded random sequences
12. Comprehensive branch coverage across all error branches
"""

import pytest
from cube_engine import Cube, ScrambleGenerator, SOLVED_STATE_STRING
from validator import CubeValidator, ValidationStatus


def test_solved_cube_is_valid():
    """Requirement 1: Solved cube must be valid."""
    result = CubeValidator.validate(SOLVED_STATE_STRING)
    assert result.is_valid is True
    assert result.status == ValidationStatus.VALID
    assert "solvable" in result.message.lower()

    # Also test passing Cube object directly
    cube = Cube()
    result_cube = CubeValidator.validate(cube)
    assert result_cube.is_valid is True
    assert result_cube.status == ValidationStatus.VALID


def test_valid_scrambled_cubes():
    """Requirement 2: Any legal scramble sequence must produce a VALID state."""
    for seed in [1, 42, 99, 2026, 777]:
        scramble = ScrambleGenerator.generate(length=25, seed=seed)
        cube = Cube()
        cube.apply_algorithm(scramble)

        result = CubeValidator.validate(cube)
        assert result.is_valid is True
        assert result.status == ValidationStatus.VALID
        assert result.details["edge_parity"] == result.details["corner_parity"]


def test_invalid_format_and_types():
    """Requirement 3 & 11: Invalid string length, non-string, and invalid characters."""
    # Bad type
    res_none = CubeValidator.validate(None)
    assert res_none.is_valid is False
    assert res_none.status == ValidationStatus.INVALID_FORMAT

    res_int = CubeValidator.validate(123456)
    assert res_int.is_valid is False
    assert res_int.status == ValidationStatus.INVALID_FORMAT

    # Wrong length
    res_short = CubeValidator.validate(SOLVED_STATE_STRING[:-1])
    assert res_short.is_valid is False
    assert res_short.status == ValidationStatus.INVALID_FORMAT
    assert res_short.details["received_length"] == 53

    res_long = CubeValidator.validate(SOLVED_STATE_STRING + "U")
    assert res_long.is_valid is False
    assert res_long.status == ValidationStatus.INVALID_FORMAT

    # Invalid characters
    res_chars = CubeValidator.validate("X" + SOLVED_STATE_STRING[1:])
    assert res_chars.is_valid is False
    assert res_chars.status == ValidationStatus.INVALID_FORMAT
    assert "X" in res_chars.details["invalid_characters"]


def test_invalid_sticker_counts():
    """Requirement 4: 10 U's and 8 R's (count mismatch)."""
    # Replace one 'R' at index 9 with 'U'
    imbalanced = "U" + SOLVED_STATE_STRING[1:9] + "U" + SOLVED_STATE_STRING[10:]
    result = CubeValidator.validate(imbalanced)
    assert result.is_valid is False
    assert result.status == ValidationStatus.INVALID_STICKER_COUNT
    assert result.details["discrepancies"]["U"] == 10
    assert result.details["discrepancies"]["R"] == 8


def test_invalid_center_configuration():
    """Requirement 5: Centers that do not match canonical orientation."""
    # Center of U is at index 4, center of D is at index 31.
    # Swap U center and D center while keeping overall sticker count 9 of each.
    state_list = list(SOLVED_STATE_STRING)
    state_list[4] = "D"
    state_list[31] = "U"
    swapped_centers = "".join(state_list)

    result = CubeValidator.validate(swapped_centers)
    assert result.is_valid is False
    assert result.status == ValidationStatus.INVALID_CENTER_CONFIGURATION
    assert 4 in result.details["center_mismatches"]
    assert 31 in result.details["center_mismatches"]


def test_duplicate_and_impossible_edges():
    """Requirement 6: Edge piece containing duplicate colors or impossible pairs."""
    # Impossible edge: 'U' and 'D' on one edge (UB position: indices 1 and 46)
    state_list = list(SOLVED_STATE_STRING)
    state_list[46] = "D"  # was B
    state_list[34] = "B"  # was D
    impossible_edge = "".join(state_list)

    result = CubeValidator.validate(impossible_edge)
    assert result.is_valid is False
    assert result.status == ValidationStatus.INVALID_EDGE_CONFIGURATION

    # Same-color edge stickers: e.g. U and U on UB edge
    state_list = list(SOLVED_STATE_STRING)
    state_list[46] = "U"  # UB has U and U
    state_list[0] = "B"   # keep counts 9 each
    same_color_edge = "".join(state_list)
    res_same = CubeValidator.validate(same_color_edge)
    assert res_same.is_valid is False
    assert res_same.status == ValidationStatus.INVALID_EDGE_CONFIGURATION

    # Duplicate legal edge piece: two UF edges
    state_list = list(SOLVED_STATE_STRING)
    # UR edge is (5, 10). Change it to (U, F) -> duplicate UF edge
    state_list[10] = "F"  # was R
    state_list[18] = "R"  # UFL corner: swap F with R to keep counts
    duplicate_edge = "".join(state_list)
    res_dup = CubeValidator.validate(duplicate_edge)
    assert res_dup.is_valid is False
    assert res_dup.status == ValidationStatus.INVALID_EDGE_CONFIGURATION
    assert "duplicate" in res_dup.message.lower()


def test_duplicate_and_impossible_corners():
    """Requirement 7: Corner piece containing impossible triplets or duplicate corners."""
    # Impossible corner: 'U', 'D', 'R' (opposite colors U and D on one corner)
    state_list = list(SOLVED_STATE_STRING)
    state_list[47] = "D"
    state_list[35] = "B"
    impossible_corner = "".join(state_list)

    result = CubeValidator.validate(impossible_corner)
    assert result.is_valid is False
    assert result.status == ValidationStatus.INVALID_CORNER_CONFIGURATION

    # Same-color corner stickers: e.g. U, U, R on UBR corner (2, 47, 11)
    state_list = list(SOLVED_STATE_STRING)
    state_list[47] = "U"
    state_list[0] = "B"
    same_color_corner = "".join(state_list)
    res_same = CubeValidator.validate(same_color_corner)
    assert res_same.is_valid is False
    assert res_same.status == ValidationStatus.INVALID_CORNER_CONFIGURATION

    # Duplicate legal corner piece: replace UBR with UFL, and DFL with DBR (preserving 9-counts)
    state_list = list(SOLVED_STATE_STRING)
    state_list[2] = "U"
    state_list[47] = "F"
    state_list[11] = "L"
    state_list[27] = "D"
    state_list[44] = "B"
    state_list[24] = "R"
    duplicate_corner = "".join(state_list)
    res_dup = CubeValidator.validate(duplicate_corner)
    assert res_dup.is_valid is False
    assert res_dup.status == ValidationStatus.INVALID_CORNER_CONFIGURATION
    assert "duplicate" in res_dup.message.lower()


def test_impossible_edge_orientation_single_flip():
    """Requirement 8: A single flipped edge in place violates sum(flip) % 2 == 0."""
    # UF edge is at index 7 (U) and index 19 (F).
    # Flip only this edge: swap U[7] and F[19]
    state_list = list(SOLVED_STATE_STRING)
    state_list[7], state_list[19] = state_list[19], state_list[7]
    single_flipped_edge = "".join(state_list)

    result = CubeValidator.validate(single_flipped_edge)
    assert result.is_valid is False
    assert result.status == ValidationStatus.INVALID_EDGE_ORIENTATION
    assert result.details["flip_sum_mod_2"] == 1


def test_impossible_corner_orientation_single_twist():
    """Requirement 9: A single twisted corner in place violates sum(twist) % 3 == 0."""
    # UFR corner is at indices: U[8], R[9], F[20] (values currently U, R, F)
    # Twist clockwise: U[8] -> F, R[9] -> U, F[20] -> R
    state_list = list(SOLVED_STATE_STRING)
    state_list[8] = "F"
    state_list[9] = "U"
    state_list[20] = "R"
    single_twisted_corner = "".join(state_list)

    result = CubeValidator.validate(single_twisted_corner)
    assert result.is_valid is False
    assert result.status == ValidationStatus.INVALID_CORNER_ORIENTATION
    assert result.details["twist_sum_mod_3"] != 0


def test_invalid_permutation_parity():
    """Requirement 10: Swapping two edges while corners are solved violates parity."""
    # Swap UB edge (indices 1, 46) and UL edge (indices 3, 37)
    state_list = list(SOLVED_STATE_STRING)
    state_list[46], state_list[37] = state_list[37], state_list[46]
    edge_swap_parity = "".join(state_list)

    result = CubeValidator.validate(edge_swap_parity)
    assert result.is_valid is False
    assert result.status == ValidationStatus.INVALID_PERMUTATION_PARITY
    assert result.details["corner_parity"] != result.details["edge_parity"]


def test_result_to_dict():
    """Verifies that ValidationResult serializes properly to a dict."""
    result = CubeValidator.validate(SOLVED_STATE_STRING)
    dict_res = result.to_dict()
    assert dict_res["is_valid"] is True
    assert dict_res["status"] == "VALID"
    assert "details" in dict_res
