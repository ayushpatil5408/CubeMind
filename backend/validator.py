"""
Cube State Validator — Comprehensive 3x3 Rubik's Cube Validator (Phase 2A).

Implements:
1. Structural format validation (string length, character set, input type)
2. Color / sticker count validation (9 of each U, R, F, D, L, B)
3. Center configuration validation (fixed centers matching canonical orientation)
4. Edge piece validation (12 unique physical edge cubies, no impossible pairs)
5. Corner piece validation (8 unique physical corner cubies, no impossible triplets)
6. Edge orientation validation (sum of edge flips ≡ 0 mod 2)
7. Corner orientation validation (sum of corner twists ≡ 0 mod 3)
8. Permutation parity validation (sign(corner_perm) == sign(edge_perm))
"""

from __future__ import annotations
from dataclasses import dataclass, field
from enum import Enum
from typing import Any, Dict, List, Optional, Set, Tuple, Union
import cube_engine


class ValidationStatus(str, Enum):
    VALID = "VALID"
    INVALID_FORMAT = "INVALID_FORMAT"
    INVALID_STICKER_COUNT = "INVALID_STICKER_COUNT"
    INVALID_CENTER_CONFIGURATION = "INVALID_CENTER_CONFIGURATION"
    INVALID_EDGE_CONFIGURATION = "INVALID_EDGE_CONFIGURATION"
    INVALID_CORNER_CONFIGURATION = "INVALID_CORNER_CONFIGURATION"
    INVALID_EDGE_ORIENTATION = "INVALID_EDGE_ORIENTATION"
    INVALID_CORNER_ORIENTATION = "INVALID_CORNER_ORIENTATION"
    INVALID_PERMUTATION_PARITY = "INVALID_PERMUTATION_PARITY"
    UNSOLVABLE_STATE = "UNSOLVABLE_STATE"


@dataclass
class ValidationResult:
    """
    Structured validation outcome containing boolean validity,
    status enumeration code, human-readable message, and diagnostic details.
    """
    is_valid: bool
    status: ValidationStatus
    message: str
    details: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "is_valid": self.is_valid,
            "status": self.status.value,
            "message": self.message,
            "details": self.details,
        }


# Canonical Center Facelet Indices (Face Order: U, R, F, D, L, B)
CANONICAL_CENTERS: Dict[int, str] = {
    4: "U",
    13: "R",
    22: "F",
    31: "D",
    40: "L",
    49: "B",
}

# 12 Canonical Edge Positions: Tuple of (Primary_Facelet_Index, Secondary_Facelet_Index)
# For U/D edges, Primary is on U/D face. For Middle layer edges, Primary is on F/B face.
EDGE_POSITIONS: List[Tuple[int, int]] = [
    (1, 46),   # 0: UB (U[1], B[46])
    (3, 37),   # 1: UL (U[3], L[37])
    (5, 10),   # 2: UR (U[5], R[10])
    (7, 19),   # 3: UF (U[7], F[19])
    (48, 39),  # 4: BL (B[48], L[39])
    (50, 14),  # 5: BR (B[50], R[14])
    (21, 41),  # 6: FL (F[21], L[41])
    (23, 12),  # 7: FR (F[23], R[12])
    (34, 52),  # 8: DB (D[34], B[52])
    (30, 43),  # 9: DL (D[30], L[43])
    (32, 16),  # 10: DR (D[32], R[16])
    (28, 25),  # 11: DF (D[28], F[25])
]

# Canonical 12 Physical Edge Pieces (Set of 2 Face Colors)
CANONICAL_EDGES: List[frozenset[str]] = [
    frozenset({"U", "B"}),  # 0: UB
    frozenset({"U", "L"}),  # 1: UL
    frozenset({"U", "R"}),  # 2: UR
    frozenset({"U", "F"}),  # 3: UF
    frozenset({"B", "L"}),  # 4: BL
    frozenset({"B", "R"}),  # 5: BR
    frozenset({"F", "L"}),  # 6: FL
    frozenset({"F", "R"}),  # 7: FR
    frozenset({"D", "B"}),  # 8: DB
    frozenset({"D", "L"}),  # 9: DL
    frozenset({"D", "R"}),  # 10: DR
    frozenset({"D", "F"}),  # 11: DF
]

EDGE_MAP: Dict[frozenset[str], int] = {edge: idx for idx, edge in enumerate(CANONICAL_EDGES)}

# 8 Canonical Corner Positions: Tuple of (UD_Facelet_Index, CW_Facelet_Index, CCW_Facelet_Index)
# - UD_Facelet_Index: The facelet on the U or D face (twist = 0)
# - CW_Facelet_Index: The facelet reached by going clockwise from U/D around this corner (twist = 1)
# - CCW_Facelet_Index: The facelet reached by going counter-clockwise from U/D around this corner (twist = 2)
CORNER_POSITIONS: List[Tuple[int, int, int]] = [
    (0, 36, 45),  # 0: UBL (U[0], L[36], B[45])
    (2, 47, 11),  # 1: UBR (U[2], B[47], R[11])
    (6, 18, 38),  # 2: UFL (U[6], F[18], L[38])
    (8, 9, 20),   # 3: UFR (U[8], R[9], F[20])
    (33, 51, 42), # 4: DBL (D[33], B[51], L[42])
    (35, 17, 53), # 5: DBR (D[35], R[17], B[53])
    (27, 44, 24), # 6: DFL (D[27], L[44], F[24])
    (29, 26, 15), # 7: DFR (D[29], F[26], R[15])
]

# Canonical 8 Physical Corner Pieces (Set of 3 Face Colors)
CANONICAL_CORNERS: List[frozenset[str]] = [
    frozenset({"U", "B", "L"}),  # 0: UBL
    frozenset({"U", "B", "R"}),  # 1: UBR
    frozenset({"U", "F", "L"}),  # 2: UFL
    frozenset({"U", "F", "R"}),  # 3: UFR
    frozenset({"D", "B", "L"}),  # 4: DBL
    frozenset({"D", "B", "R"}),  # 5: DBR
    frozenset({"D", "F", "L"}),  # 6: DFL
    frozenset({"D", "F", "R"}),  # 7: DFR
]

CORNER_MAP: Dict[frozenset[str], int] = {corner: idx for idx, corner in enumerate(CANONICAL_CORNERS)}


def _permutation_parity(perm: List[int]) -> int:
    """
    Computes the permutation parity (signature) of a permutation of 0..N-1.
    Returns 0 for even permutation, 1 for odd permutation.
    """
    inversions = 0
    n = len(perm)
    for i in range(n):
        for j in range(i + 1, n):
            if perm[i] > perm[j]:
                inversions += 1
    return inversions % 2


class CubeValidator:
    """
    Comprehensive validator for 3x3 Rubik's Cube states.
    Validates structural integrity, physical configuration, orientation orbits, and permutation parity.
    """

    @classmethod
    def validate(cls, state_input: Union[str, cube_engine.Cube]) -> ValidationResult:
        """
        Validates the given cube state (either 54-char string or Cube instance).
        Returns a structured ValidationResult.
        """
        if isinstance(state_input, cube_engine.Cube):
            state = state_input.to_state_string()
        elif isinstance(state_input, str):
            state = state_input
        else:
            return ValidationResult(
                is_valid=False,
                status=ValidationStatus.INVALID_FORMAT,
                message=f"State must be a 54-character string or Cube instance, got {type(state_input).__name__}.",
                details={"received_type": str(type(state_input))},
            )

        # 1. Structural & Format Validation
        if len(state) != 54:
            return ValidationResult(
                is_valid=False,
                status=ValidationStatus.INVALID_FORMAT,
                message=f"Cube state string must be exactly 54 characters, received length {len(state)}.",
                details={"expected_length": 54, "received_length": len(state)},
            )

        valid_chars = set("URFDLB")
        invalid_chars = set(state) - valid_chars
        if invalid_chars:
            return ValidationResult(
                is_valid=False,
                status=ValidationStatus.INVALID_FORMAT,
                message=f"State contains invalid sticker characters: {sorted(invalid_chars)}. Allowed: {sorted(valid_chars)}.",
                details={"invalid_characters": sorted(list(invalid_chars))},
            )

        # 2. Sticker Counts Validation
        counts = {char: state.count(char) for char in valid_chars}
        mismatched_counts = {char: count for char, count in counts.items() if count != 9}
        if mismatched_counts:
            return ValidationResult(
                is_valid=False,
                status=ValidationStatus.INVALID_STICKER_COUNT,
                message=f"Each face color must appear exactly 9 times. Discrepancies: {mismatched_counts}.",
                details={"sticker_counts": counts, "discrepancies": mismatched_counts},
            )

        # 3. Center Configuration Validation
        center_mismatches = {}
        for index, expected_color in CANONICAL_CENTERS.items():
            actual_color = state[index]
            if actual_color != expected_color:
                center_mismatches[index] = {"expected": expected_color, "actual": actual_color}

        if center_mismatches:
            return ValidationResult(
                is_valid=False,
                status=ValidationStatus.INVALID_CENTER_CONFIGURATION,
                message="Cube centers do not match the standard canonical orientation (U=White, R=Red, F=Green, D=Yellow, L=Orange, B=Blue).",
                details={"center_mismatches": center_mismatches},
            )

        # 4. Edge Piece Validation & Orientation
        edge_perm: List[int] = []
        edge_orientations: List[int] = []
        seen_edges: Set[frozenset[str]] = set()

        for pos_idx, (idx1, idx2) in enumerate(EDGE_POSITIONS):
            c1, c2 = state[idx1], state[idx2]
            piece_set = frozenset({c1, c2})

            if len(piece_set) != 2:
                return ValidationResult(
                    is_valid=False,
                    status=ValidationStatus.INVALID_EDGE_CONFIGURATION,
                    message=f"Edge at position {pos_idx} has identical stickers ({c1}, {c2}).",
                    details={"position_index": pos_idx, "stickers": (c1, c2)},
                )

            if piece_set not in EDGE_MAP:
                return ValidationResult(
                    is_valid=False,
                    status=ValidationStatus.INVALID_EDGE_CONFIGURATION,
                    message=f"Edge at position {pos_idx} ({c1}, {c2}) is not a physically possible edge piece (e.g. opposing colors on one piece).",
                    details={"position_index": pos_idx, "stickers": (c1, c2)},
                )

            if piece_set in seen_edges:
                return ValidationResult(
                    is_valid=False,
                    status=ValidationStatus.INVALID_EDGE_CONFIGURATION,
                    message=f"Duplicate edge piece detected: {sorted(piece_set)}.",
                    details={"duplicate_piece": sorted(list(piece_set))},
                )
            seen_edges.add(piece_set)

            piece_id = EDGE_MAP[piece_set]
            edge_perm.append(piece_id)

            # Edge Orientation Rule:
            # - If piece contains 'U' or 'D': primary color is 'U'/'D'. Orientation 0 if on U/D facelet (idx1), else 1.
            # - If piece contains no 'U'/'D': primary color is 'F'/'B'. Orientation 0 if on F/B facelet (idx1), else 1.
            if "U" in piece_set or "D" in piece_set:
                target_primary = "U" if "U" in piece_set else "D"
                orientation = 0 if c1 == target_primary else 1
            else:
                target_primary = "F" if "F" in piece_set else "B"
                orientation = 0 if c1 == target_primary else 1

            edge_orientations.append(orientation)

        # Edge Flip Sum Check
        edge_flip_sum = sum(edge_orientations) % 2
        if edge_flip_sum != 0:
            return ValidationResult(
                is_valid=False,
                status=ValidationStatus.INVALID_EDGE_ORIENTATION,
                message="Invalid edge orientation: impossible single flipped edge detected (total flip sum must be even).",
                details={"edge_orientations": edge_orientations, "flip_sum_mod_2": edge_flip_sum},
            )

        # 5. Corner Piece Validation & Orientation
        corner_perm: List[int] = []
        corner_orientations: List[int] = []
        seen_corners: Set[frozenset[str]] = set()

        for pos_idx, (idx_ud, idx_cw, idx_ccw) in enumerate(CORNER_POSITIONS):
            c_ud, c_cw, c_ccw = state[idx_ud], state[idx_cw], state[idx_ccw]
            piece_set = frozenset({c_ud, c_cw, c_ccw})

            if len(piece_set) != 3:
                return ValidationResult(
                    is_valid=False,
                    status=ValidationStatus.INVALID_CORNER_CONFIGURATION,
                    message=f"Corner at position {pos_idx} has duplicate colors ({c_ud}, {c_cw}, {c_ccw}).",
                    details={"position_index": pos_idx, "stickers": (c_ud, c_cw, c_ccw)},
                )

            if piece_set not in CORNER_MAP:
                return ValidationResult(
                    is_valid=False,
                    status=ValidationStatus.INVALID_CORNER_CONFIGURATION,
                    message=f"Corner at position {pos_idx} ({c_ud}, {c_cw}, {c_ccw}) is not a physically possible corner piece.",
                    details={"position_index": pos_idx, "stickers": (c_ud, c_cw, c_ccw)},
                )

            if piece_set in seen_corners:
                return ValidationResult(
                    is_valid=False,
                    status=ValidationStatus.INVALID_CORNER_CONFIGURATION,
                    message=f"Duplicate corner piece detected: {sorted(piece_set)}.",
                    details={"duplicate_piece": sorted(list(piece_set))},
                )
            seen_corners.add(piece_set)

            piece_id = CORNER_MAP[piece_set]
            corner_perm.append(piece_id)

            # Corner Orientation Rule:
            # Primary color is 'U' (if U corner) or 'D' (if D corner).
            # - Twist 0: U/D sticker is on U/D facelet (idx_ud).
            # - Twist 1: U/D sticker is on CW facelet (idx_cw).
            # - Twist 2: U/D sticker is on CCW facelet (idx_ccw).
            primary = "U" if "U" in piece_set else "D"
            if c_ud == primary:
                twist = 0
            elif c_cw == primary:
                twist = 1
            elif c_ccw == primary:
                twist = 2
            else:
                return ValidationResult(
                    is_valid=False,
                    status=ValidationStatus.INVALID_CORNER_ORIENTATION,
                    message=f"Corner piece at position {pos_idx} is missing its expected primary color {primary}.",
                    details={"position_index": pos_idx, "expected_primary": primary},
                )

            corner_orientations.append(twist)

        # Corner Twist Sum Check
        corner_twist_sum = sum(corner_orientations) % 3
        if corner_twist_sum != 0:
            return ValidationResult(
                is_valid=False,
                status=ValidationStatus.INVALID_CORNER_ORIENTATION,
                message="Invalid corner orientation: impossible single twisted corner detected (total twist sum must be a multiple of 3).",
                details={"corner_orientations": corner_orientations, "twist_sum_mod_3": corner_twist_sum},
            )

        # 6. Permutation Parity Validation
        edge_parity = _permutation_parity(edge_perm)
        corner_parity = _permutation_parity(corner_perm)

        if edge_parity != corner_parity:
            return ValidationResult(
                is_valid=False,
                status=ValidationStatus.INVALID_PERMUTATION_PARITY,
                message="Invalid permutation parity: corner and edge permutation parities do not match (impossible swap error).",
                details={
                    "corner_parity": corner_parity,
                    "edge_parity": edge_parity,
                    "corner_permutation": corner_perm,
                    "edge_permutation": edge_perm,
                },
            )

        # If all checks pass, state is physically legal and solvable
        return ValidationResult(
            is_valid=True,
            status=ValidationStatus.VALID,
            message="Cube state is structurally valid, physically sound, and solvable.",
            details={
                "edge_orientations": edge_orientations,
                "corner_orientations": corner_orientations,
                "edge_parity": edge_parity,
                "corner_parity": corner_parity,
            },
        )
