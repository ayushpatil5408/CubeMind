"""
Unit Test Suite for Kociemba Canonical State and Move Mapping (Phase 2C).

Tests:
1. Solved state mapping preserves canonical facelet characters.
2. State mapping is an involution (self-inverse roundtrip).
3. Back face (B) columns are correctly mirrored across all 3 rows.
4. U, R, F, D, L facelets remain at exact 1:1 offsets.
5. Invalid state inputs (non-string, length != 54) raise ValueError.
6. Single move token mapping handles B <-> B' and preserves all other standard moves.
7. Solution list mapping converts full algorithm sequences correctly.
8. Solution string space-separated parsing converts properly.
9. Bijective mapping holds across random scrambles.
"""

import pytest
import cube_engine
from solver.kociemba_mapping import (
    cubemind_to_kociemba_state,
    kociemba_to_cubemind_state,
    kociemba_to_cubemind_move,
    kociemba_to_cubemind_solution,
)


def test_solved_state_mapping():
    """Solved CubeMind state produces standard solved Kociemba state string."""
    solved_cm = cube_engine.SOLVED_STATE_STRING
    koc_state = cubemind_to_kociemba_state(solved_cm)
    assert koc_state == solved_cm
    assert len(koc_state) == 54


def test_state_mapping_roundtrip_involution():
    """Converting CubeMind -> Kociemba -> CubeMind is completely lossless."""
    for seed in range(20):
        cube = cube_engine.Cube()
        scramble = cube_engine.ScrambleGenerator.generate(15, seed=seed)
        cube.apply_algorithm(scramble)
        orig_state = cube.to_state_string()

        koc_state = cubemind_to_kociemba_state(orig_state)
        restored_state = kociemba_to_cubemind_state(koc_state)

        assert restored_state == orig_state


def test_back_face_columns_mirrored_specifically():
    """Verify exact column index swapping on the B face (indices 45..53)."""
    # Create a state string where B face has unique characters 0..8
    prefix = "U" * 9 + "R" * 9 + "F" * 9 + "D" * 9 + "L" * 9
    b_face = "012345678"
    state = prefix + b_face

    koc_state = cubemind_to_kociemba_state(state)
    koc_b = koc_state[45:54]

    # Row 0: 0,1,2 -> 2,1,0
    # Row 1: 3,4,5 -> 5,4,3
    # Row 2: 6,7,8 -> 8,7,6
    assert koc_b == "210543876"


def test_urfdl_faces_unmodified():
    """Verify that U, R, F, D, L faces (indices 0..44) are completely untouched."""
    prefix = "U" * 9 + "R" * 9 + "F" * 9 + "D" * 9 + "L" * 9
    b_face = "B" * 9
    state = prefix + b_face

    koc_state = cubemind_to_kociemba_state(state)
    assert koc_state[:45] == prefix


@pytest.mark.parametrize("invalid_state", [
    "",
    "UUU",
    "U" * 53,
    "U" * 55,
    12345,
    None,
    ["U"] * 54,
])
def test_invalid_state_input_raises_value_error(invalid_state):
    """Invalid string lengths or non-string types raise ValueError."""
    with pytest.raises(ValueError):
        cubemind_to_kociemba_state(invalid_state)


def test_move_mapping_b_moves():
    """Kociemba move mapping inverts B and B', keeping B2 self-inverse."""
    assert kociemba_to_cubemind_move("B") == "B'"
    assert kociemba_to_cubemind_move("B'") == "B"
    assert kociemba_to_cubemind_move("B2") == "B2"


@pytest.mark.parametrize("move", [
    "U", "U'", "U2",
    "D", "D'", "D2",
    "L", "L'", "L2",
    "R", "R'", "R2",
    "F", "F'", "F2",
])
def test_move_mapping_non_b_moves_preserved(move):
    """All moves on U, D, L, R, F faces map 1:1 without modification."""
    assert kociemba_to_cubemind_move(move) == move


def test_solution_sequence_mapping():
    """Full list of moves is mapped token by token."""
    raw_moves = ["R", "U", "B", "R'", "B'", "F2", "B2", "D'"]
    expected = ["R", "U", "B'", "R'", "B", "F2", "B2", "D'"]
    mapped = kociemba_to_cubemind_solution(raw_moves)
    assert mapped == expected


def test_solution_string_mapping():
    """Space-separated string of moves is parsed and mapped."""
    raw_str = "R U B R' B' F2 B2 D'"
    expected = ["R", "U", "B'", "R'", "B", "F2", "B2", "D'"]
    mapped = kociemba_to_cubemind_solution(raw_str)
    assert mapped == expected
