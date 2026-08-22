"""
Cube Engine — Pure-Python Foundational Rubik's Cube Engine (Phase 1).

Implements:
- Cube state representation (54-sticker canonical array)
- Face enumeration & color definitions
- Move execution (U, D, L, R, F, B, prime, double)
- Algorithm execution & inversion
- Cube reset, clone, equality comparison, and solved-state detection
- State serialization/deserialization (54-character string and dictionary)
- Scramble generator (pseudo-random WCA-style sequences)
- State validation
"""

from __future__ import annotations
import random
from enum import Enum
from typing import Any, Dict, List, Optional, Sequence, Union


class Face(str, Enum):
    U = "U"
    R = "R"
    F = "F"
    D = "D"
    L = "L"
    B = "B"


# Canonical ordering of faces
FACE_ORDER: List[Face] = [Face.U, Face.R, Face.F, Face.D, Face.L, Face.B]

# Standard solved facelet characters
SOLVED_STATE_STRING = (
    "UUUUUUUUU"  # Up (0..8)
    "RRRRRRRRR"  # Right (9..17)
    "FFFFFFFFF"  # Front (18..26)
    "DDDDDDDDD"  # Down (27..35)
    "LLLLLLLLL"  # Left (36..44)
    "BBBBBBBBB"  # Back (45..53)
)

VALID_MOVE_BASE = {"U", "D", "L", "R", "F", "B"}
VALID_MODIFIERS = {"", "'", "2"}
ALL_VALID_MOVES = {f"{base}{mod}" for base in VALID_MOVE_BASE for mod in VALID_MODIFIERS}


def validate_state(state: str) -> bool:
    """
    Validates a 54-character Rubik's cube state string.
    Checks:
    - Length is exactly 54.
    - Contains only characters from {'U', 'R', 'F', 'D', 'L', 'B'}.
    - Each face character appears exactly 9 times.
    """
    if not isinstance(state, str) or len(state) != 54:
        return False
    valid_chars = set("URFDLB")
    if not all(char in valid_chars for char in state):
        return False
    counts = {char: state.count(char) for char in valid_chars}
    return all(count == 9 for count in counts.values())


def parse_moves(algorithm_str: str) -> List[str]:
    """
    Parses a space-separated algorithm string into a list of valid move tokens.
    Raises ValueError if any token is an invalid move.
    """
    tokens = algorithm_str.strip().split()
    normalized: List[str] = []
    for token in tokens:
        clean = token.strip()
        if not clean:
            continue
        if clean not in ALL_VALID_MOVES:
            raise ValueError(f"Invalid move notation '{token}'. Valid moves: {sorted(ALL_VALID_MOVES)}")
        normalized.append(clean)
    return normalized


def invert_move(move: str) -> str:
    """
    Returns the inverse of a single standard move.
    Example: U -> U', U' -> U, U2 -> U2
    """
    clean = move.strip()
    if clean not in ALL_VALID_MOVES:
        raise ValueError(f"Cannot invert invalid move '{move}'.")
    base = clean[0]
    suffix = clean[1:]
    if suffix == "":
        return f"{base}'"
    elif suffix == "'":
        return base
    elif suffix == "2":
        return clean  # 180-degree move is its own inverse
    raise ValueError(f"Unknown modifier in move '{move}'.")


def invert_algorithm(algo: Union[str, Sequence[str]]) -> List[str]:
    """
    Inverts an entire sequence of moves by inverting each move and reversing the order.
    Example: ["R", "U", "R'", "U'"] -> ["U", "R", "U'", "R'"]
    """
    moves = parse_moves(algo) if isinstance(algo, str) else list(algo)
    return [invert_move(m) for m in reversed(moves)]


class Cube:
    """
    Deterministic representation of a 3x3 Rubik's Cube with 54 facelets.
    
    Face Index Ranges (0-indexed):
    - U (0..8)   Center: 4
    - R (9..17)  Center: 13
    - F (18..26) Center: 22
    - D (27..35) Center: 31
    - L (36..44) Center: 40
    - B (45..53) Center: 49
    """

    def __init__(self, state_string: Optional[str] = None):
        """
        Initializes the Cube. If state_string is provided, deserializes it;
        otherwise initializes to the canonical solved state.
        """
        if state_string is not None:
            self.from_state_string(state_string)
        else:
            self.reset()

    def reset(self) -> None:
        """Resets the cube to the canonical solved state."""
        self._stickers: List[str] = list(SOLVED_STATE_STRING)

    def is_solved(self) -> bool:
        """Returns True if every face contains 9 identical stickers matching its center."""
        for face_idx, face in enumerate(FACE_ORDER):
            offset = face_idx * 9
            face_stickers = self._stickers[offset : offset + 9]
            center = face_stickers[4]
            if not all(s == center for s in face_stickers):
                return False
        return True

    def clone(self) -> Cube:
        """Returns an independent deep copy of this Cube."""
        new_cube = Cube()
        new_cube._stickers = list(self._stickers)
        return new_cube

    def copy(self) -> Cube:
        """Alias for clone()."""
        return self.clone()

    def to_state_string(self) -> str:
        """Returns the canonical 54-character state string."""
        return "".join(self._stickers)

    def from_state_string(self, state: str) -> None:
        """Sets cube state from a 54-character string."""
        if not validate_state(state):
            raise ValueError(
                f"Invalid state string: must be 54 characters with 9 of each URFDLB. Received: '{state}'"
            )
        self._stickers = list(state)

    def to_dict(self) -> Dict[str, Any]:
        """Serializes cube state to a dictionary format."""
        faces = {}
        for face_idx, face in enumerate(FACE_ORDER):
            offset = face_idx * 9
            faces[face.value] = self._stickers[offset : offset + 9]
        return {
            "state_string": self.to_state_string(),
            "faces": faces,
            "is_solved": self.is_solved(),
        }

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> Cube:
        """Deserializes a cube from a dictionary representation."""
        if "state_string" in data:
            return cls(data["state_string"])
        elif "faces" in data:
            faces = data["faces"]
            combined = "".join("".join(faces[face.value]) for face in FACE_ORDER)
            return cls(combined)
        raise ValueError("Dictionary must contain 'state_string' or 'faces'.")

    def __eq__(self, other: object) -> bool:
        if not isinstance(other, Cube):
            return False
        return self._stickers == other._stickers

    def __repr__(self) -> str:
        return f"Cube('{self.to_state_string()}')"

    # ------------------------------------------------------------------
    # Move Execution Logic
    # ------------------------------------------------------------------

    def _rotate_face_cw(self, offset: int) -> None:
        """Rotates a single 3x3 face (9 stickers starting at offset) 90° clockwise in-place."""
        s = self._stickers
        (
            s[offset + 0],
            s[offset + 1],
            s[offset + 2],
            s[offset + 3],
            s[offset + 4],
            s[offset + 5],
            s[offset + 6],
            s[offset + 7],
            s[offset + 8],
        ) = (
            s[offset + 6],
            s[offset + 3],
            s[offset + 0],
            s[offset + 7],
            s[offset + 4],
            s[offset + 1],
            s[offset + 8],
            s[offset + 5],
            s[offset + 2],
        )

    def _apply_u(self) -> None:
        self._rotate_face_cw(0)
        s = self._stickers
        (
            s[36], s[37], s[38],  # L top
            s[45], s[46], s[47],  # B top
            s[9], s[10], s[11],   # R top
            s[18], s[19], s[20],  # F top
        ) = (
            s[18], s[19], s[20],  # old F top
            s[38], s[37], s[36],  # old L top (reversed)
            s[47], s[46], s[45],  # old B top (reversed)
            s[9], s[10], s[11],   # old R top
        )

    def _apply_d(self) -> None:
        self._rotate_face_cw(27)
        s = self._stickers
        (
            s[15], s[16], s[17],  # R bot
            s[51], s[52], s[53],  # B bot
            s[42], s[43], s[44],  # L bot
            s[24], s[25], s[26],  # F bot
        ) = (
            s[24], s[25], s[26],  # old F bot
            s[17], s[16], s[15],  # old R bot (reversed)
            s[53], s[52], s[51],  # old B bot (reversed)
            s[42], s[43], s[44],  # old L bot
        )

    def _apply_f(self) -> None:
        self._rotate_face_cw(18)
        s = self._stickers
        (
            s[9], s[12], s[15],   # R left col
            s[29], s[28], s[27],  # D top row (reversed)
            s[44], s[41], s[38],  # L right col (reversed)
            s[6], s[7], s[8],     # U bot row
        ) = (
            s[6], s[7], s[8],     # old U bot
            s[9], s[12], s[15],   # old R left col
            s[29], s[28], s[27],  # old D top row
            s[44], s[41], s[38],  # old L right col
        )

    def _apply_b(self) -> None:
        self._rotate_face_cw(45)
        s = self._stickers
        (
            s[11], s[14], s[17],  # R right col
            s[35], s[34], s[33],  # D bot row (reversed)
            s[42], s[39], s[36],  # L left col (reversed)
            s[0], s[1], s[2],     # U top row
        ) = (
            s[0], s[1], s[2],     # old U top row
            s[11], s[14], s[17],  # old R right col
            s[35], s[34], s[33],  # old D bot row
            s[42], s[39], s[36],  # old L left col
        )

    def _apply_r(self) -> None:
        self._rotate_face_cw(9)
        s = self._stickers
        (
            s[2], s[5], s[8],     # U right col
            s[53], s[50], s[47],  # B right col (inverted)
            s[29], s[32], s[35],  # D right col
            s[20], s[23], s[26],  # F right col
        ) = (
            s[20], s[23], s[26],  # old F right col
            s[2], s[5], s[8],     # old U right col
            s[53], s[50], s[47],  # old B right col
            s[29], s[32], s[35],  # old D right col
        )

    def _apply_l(self) -> None:
        self._rotate_face_cw(36)
        s = self._stickers
        (
            s[18], s[21], s[24],  # F left col
            s[27], s[30], s[33],  # D left col
            s[45], s[48], s[51],  # B left col
            s[0], s[3], s[6],     # U left col
        ) = (
            s[0], s[3], s[6],     # old U left col
            s[18], s[21], s[24],  # old F left col
            s[33], s[30], s[27],  # old D left col (reversed)
            s[51], s[48], s[45],  # old B left col (reversed)
        )

    def apply_move(self, move: str) -> Cube:
        """
        Applies a single standard move to the cube in-place and returns self for chaining.
        Supported: U, D, L, R, F, B, and their ' and 2 variations.
        """
        clean = move.strip()
        if clean not in ALL_VALID_MOVES:
            raise ValueError(f"Invalid move '{move}'. Supported moves: {sorted(ALL_VALID_MOVES)}")

        base = clean[0]
        modifier = clean[1:] if len(clean) > 1 else ""

        base_ops = {
            "U": self._apply_u,
            "D": self._apply_d,
            "L": self._apply_l,
            "R": self._apply_r,
            "F": self._apply_f,
            "B": self._apply_b,
        }
        op = base_ops[base]

        if modifier == "":
            op()
        elif modifier == "'":
            # 3 CW turns = 1 CCW turn
            op()
            op()
            op()
        elif modifier == "2":
            # 2 CW turns = 180 turn
            op()
            op()

        return self

    def apply_algorithm(self, algorithm: Union[str, Sequence[str]]) -> Cube:
        """
        Executes a sequence of moves in order on the cube in-place.
        Returns self for chaining.
        """
        moves = parse_moves(algorithm) if isinstance(algorithm, str) else algorithm
        for move in moves:
            self.apply_move(move)
        return self


class ScrambleGenerator:
    """
    Generates standard, deterministic, or randomized Rubik's Cube scrambles.
    Guarantees no consecutive turns of the same face.
    """

    FACES = ["U", "D", "L", "R", "F", "B"]
    MODIFIERS = ["", "'", "2"]

    @classmethod
    def generate(cls, length: int = 20, seed: Optional[int] = None) -> List[str]:
        """
        Generates a WCA-style scramble sequence of the specified length.
        If seed is provided, results are deterministic and reproducible.
        """
        if length <= 0:
            return []

        rng = random.Random(seed) if seed is not None else random.Random()
        scramble: List[str] = []
        last_face: Optional[str] = None

        for _ in range(length):
            available_faces = [f for f in cls.FACES if f != last_face]
            face = rng.choice(available_faces)
            modifier = rng.choice(cls.MODIFIERS)
            scramble.append(f"{face}{modifier}")
            last_face = face

        return scramble
