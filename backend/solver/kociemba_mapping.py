"""
Kociemba Canonical State & Move Mapping (Phase 2C).

Provides bidirectional mapping between CubeMind canonical representation
and Kociemba standard Two-Phase solver notation.

Mapping Details:
- Face order in both systems: U (Up), R (Right), F (Front), D (Down), L (Left), B (Back).
- Face indexing: 9 stickers per face (0..8 per face, 54 total).
- Back Face (B) Mapping:
  CubeMind canonical coordinate system views the B face from front-through-cube perspective
  (where left column touches L and right column touches R), whereas Kociemba views B from
  the rear outside (where left column touches R and right column touches L).
  To map CubeMind state to Kociemba, the 3 columns of the Back face 3x3 grid are horizontally mirrored:
    Kociemba B[row, col] = CubeMind B[row, 2 - col]
- Move Notation Mapping:
  Because of the viewpoint difference on the Back face rotation direction:
  - Standard move 'B' (CW in Kociemba) corresponds to "B'" in CubeMind.
  - Standard move "B'" (CCW in Kociemba) corresponds to "B" in CubeMind.
  - Standard move 'B2' is self-inverse and remains 'B2'.
  - All other face moves (U, D, L, R, F, primes, double turns) map directly 1:1.
"""

from __future__ import annotations
from typing import List, Sequence, Union


def cubemind_to_kociemba_state(state_str: str) -> str:
    """
    Converts a 54-character CubeMind canonical state string to a Kociemba-compatible facelet string.
    
    Face slices:
    - U: 0..8   (unchanged)
    - R: 9..17  (unchanged)
    - F: 18..26 (unchanged)
    - D: 27..35 (unchanged)
    - L: 36..44 (unchanged)
    - B: 45..53 (columns mirrored per 3x3 row)
    """
    if not isinstance(state_str, str) or len(state_str) != 54:
        raise ValueError(f"State string must be exactly 54 characters, got {len(state_str) if isinstance(state_str, str) else type(state_str)}")

    u = state_str[0:9]
    r = state_str[9:18]
    f = state_str[18:27]
    d = state_str[27:36]
    l = state_str[36:45]
    b = state_str[45:54]

    # Mirror columns for row 0 (0,1,2 -> 2,1,0), row 1 (3,4,5 -> 5,4,3), row 2 (6,7,8 -> 8,7,6)
    b_kociemba = (
        b[2] + b[1] + b[0] +
        b[5] + b[4] + b[3] +
        b[8] + b[7] + b[6]
    )

    return u + r + f + d + l + b_kociemba


def kociemba_to_cubemind_state(koc_str: str) -> str:
    """
    Converts a 54-character Kociemba facelet string back to a CubeMind canonical state string.
    Since column mirroring is an involution (self-inverse), applying the same transformation restores the original.
    """
    return cubemind_to_kociemba_state(koc_str)


def kociemba_to_cubemind_move(move: str) -> str:
    """
    Maps a single Kociemba solver move token to standard CubeMind move notation.
    Handles B <-> B' direction inversion while preserving all other face moves.
    """
    clean = move.strip()
    if clean == "B":
        return "B'"
    elif clean == "B'":
        return "B"
    return clean


def kociemba_to_cubemind_solution(moves: Union[str, Sequence[str]]) -> List[str]:
    """
    Maps a sequence of Kociemba move tokens to canonical CubeMind move tokens.
    """
    if isinstance(moves, str):
        move_list = moves.strip().split()
    else:
        move_list = list(moves)

    return [kociemba_to_cubemind_move(m) for m in move_list if m.strip()]
