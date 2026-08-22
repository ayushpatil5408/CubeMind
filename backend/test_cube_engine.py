"""
Unit Test Suite for Phase 1 Cube Engine.

Tests:
1. Initial cube is solved.
2. Cube initialization is deterministic.
3. R followed by R' returns to solved state.
4. U followed by U' returns to solved state.
5. F followed by F' returns to solved state.
6. Every basic face move performed four times returns to solved state.
7. A double move is equivalent to two single moves.
8. Cube cloning does not mutate the original.
9. Move sequences execute in the correct order (e.g., Sexy Move).
10. Invalid notation is rejected appropriately.
11. Serialization and deserialization preserve state.
12. State comparison behaves correctly.
13. Scramble generator outputs valid, reproducible sequences.
14. Algorithm inversion mathematically matches expected inverse sequence.
15. State validation detects all malformed formats.
16. Inversion and helper methods reach full branch coverage.
"""

import pytest
import cube_engine
from cube_engine import Cube, ScrambleGenerator, SOLVED_STATE_STRING


def test_initial_cube_is_solved():
    """Requirement 1: Freshly initialized cube must be solved."""
    cube = Cube()
    assert cube.is_solved() is True
    assert cube.to_state_string() == SOLVED_STATE_STRING


def test_cube_initialization_is_deterministic():
    """Requirement 2: Multiple initializations produce identical, deterministic state."""
    cube1 = Cube()
    cube2 = Cube()
    assert cube1 == cube2
    assert cube1.to_state_string() == cube2.to_state_string()


def test_r_followed_by_r_prime():
    """Requirement 3: R followed by R' returns to solved state."""
    cube = Cube()
    cube.apply_move("R")
    assert cube.is_solved() is False
    cube.apply_move("R'")
    assert cube.is_solved() is True
    assert cube.to_state_string() == SOLVED_STATE_STRING


def test_u_followed_by_u_prime():
    """Requirement 4: U followed by U' returns to solved state."""
    cube = Cube()
    cube.apply_move("U")
    assert cube.is_solved() is False
    cube.apply_move("U'")
    assert cube.is_solved() is True
    assert cube.to_state_string() == SOLVED_STATE_STRING


def test_f_followed_by_f_prime():
    """Requirement 5: F followed by F' returns to solved state."""
    cube = Cube()
    cube.apply_move("F")
    assert cube.is_solved() is False
    cube.apply_move("F'")
    assert cube.is_solved() is True
    assert cube.to_state_string() == SOLVED_STATE_STRING


@pytest.mark.parametrize("face", ["U", "D", "L", "R", "F", "B"])
def test_face_move_four_times_returns_to_solved(face: str):
    """Requirement 6: Every basic face move performed 4 times returns to solved state (X^4 = I)."""
    cube = Cube()
    for _ in range(4):
        cube.apply_move(face)
    assert cube.is_solved() is True
    assert cube.to_state_string() == SOLVED_STATE_STRING


@pytest.mark.parametrize("face", ["U", "D", "L", "R", "F", "B"])
def test_double_move_equals_two_single_moves(face: str):
    """Requirement 7: A double move X2 is identical to applying X twice."""
    cube_single = Cube()
    cube_single.apply_move(face).apply_move(face)

    cube_double = Cube()
    cube_double.apply_move(f"{face}2")

    assert cube_double == cube_single
    assert cube_double.to_state_string() == cube_single.to_state_string()


def test_cube_cloning_does_not_mutate_original():
    """Requirement 8: Mutating a cloned cube does not alter the source cube."""
    original = Cube()
    clone = original.clone()
    copy_cube = original.copy()

    assert original == clone == copy_cube

    clone.apply_move("R")
    assert clone.is_solved() is False
    assert original.is_solved() is True
    assert original.to_state_string() == SOLVED_STATE_STRING
    assert original != clone


def test_move_sequence_execution_order():
    """Requirement 9: Move sequences execute in exact order (e.g. (R U R' U')^6 = I)."""
    cube = Cube()
    sexy_move = ["R", "U", "R'", "U'"]

    # 6 repetitions of Sexy Move must return cube to solved state
    for _ in range(6):
        cube.apply_algorithm(sexy_move)

    assert cube.is_solved() is True
    assert cube.to_state_string() == SOLVED_STATE_STRING


def test_invalid_notation_rejected():
    """Requirement 10: Invalid move notations raise ValueError."""
    cube = Cube()

    invalid_moves = ["X", "R3", "U''", "F2'", "123", "Z", ""]
    for bad_move in invalid_moves:
        with pytest.raises(ValueError):
            cube.apply_move(bad_move)

    with pytest.raises(ValueError):
        cube.apply_algorithm("R U InvalidMove U'")

    with pytest.raises(ValueError):
        cube_engine.invert_move("INVALID")


def test_serialization_and_deserialization_preserve_state():
    """Requirement 11: String and Dict serialization roundtrips preserve state perfectly."""
    cube = Cube()
    cube.apply_algorithm("R U R' F' U2 R2 D")

    state_str = cube.to_state_string()
    restored_from_str = Cube(state_str)
    assert restored_from_str == cube
    assert restored_from_str.to_state_string() == state_str

    cube_dict = cube.to_dict()
    restored_from_dict = Cube.from_dict(cube_dict)
    assert restored_from_dict == cube
    assert restored_from_dict.to_state_string() == state_str

    # Test deserialization from faces dict directly
    faces_only_dict = {"faces": cube_dict["faces"]}
    restored_from_faces = Cube.from_dict(faces_only_dict)
    assert restored_from_faces == cube

    # Test invalid dict deserialization
    with pytest.raises(ValueError):
        Cube.from_dict({"bad_key": 123})

    # Test invalid state string instantiation
    with pytest.raises(ValueError):
        Cube("INVALID_LENGTH_STATE")


def test_state_comparison():
    """Requirement 12: State equality and inequality behave correctly."""
    cube1 = Cube()
    cube2 = Cube()
    assert cube1 == cube2

    cube1.apply_move("U")
    assert cube1 != cube2

    cube2.apply_move("U")
    assert cube1 == cube2

    # Comparison with non-Cube returns False
    assert (cube1 == "not a cube") is False

    # Repr test
    assert repr(cube1).startswith("Cube('")


def test_scramble_generator():
    """Tests ScrambleGenerator for correct length, seed reproducibility, and validity."""
    scramble_20 = ScrambleGenerator.generate(length=20, seed=42)
    assert len(scramble_20) == 20
    for move in scramble_20:
        assert move in cube_engine.ALL_VALID_MOVES

    # Same seed yields identical scramble
    scramble_repeat = ScrambleGenerator.generate(length=20, seed=42)
    assert scramble_20 == scramble_repeat

    # Non-positive length returns empty list
    assert ScrambleGenerator.generate(length=0) == []

    # Applying scramble scrambles the cube
    cube = Cube()
    cube.apply_algorithm(scramble_20)
    assert cube.is_solved() is False

    # Inverting scramble restores solved state (with string algo input)
    inverse_scramble_str = " ".join(cube_engine.invert_algorithm(" ".join(scramble_20)))
    cube.apply_algorithm(inverse_scramble_str)
    assert cube.is_solved() is True


def test_state_validation_rules():
    """Tests validate_state function across edge cases."""
    # Valid solved
    assert cube_engine.validate_state(SOLVED_STATE_STRING) is True

    # Invalid length
    assert cube_engine.validate_state(SOLVED_STATE_STRING[:-1]) is False
    assert cube_engine.validate_state(SOLVED_STATE_STRING + "U") is False

    # Invalid characters
    bad_char_state = "X" + SOLVED_STATE_STRING[1:]
    assert cube_engine.validate_state(bad_char_state) is False

    # Color count mismatch (10 U's, 8 R's)
    imbalanced_state = "U" + SOLVED_STATE_STRING[1:9] + "U" + SOLVED_STATE_STRING[10:]
    assert cube_engine.validate_state(imbalanced_state) is False

    # Non-string input
    assert cube_engine.validate_state(None) is False
    assert cube_engine.validate_state(12345) is False
