"""
Solution Analysis, Move Optimization, and Analytics Engine (Phase 5A).

Provides:
- Move token parsing and canonical normalization.
- Redundant same-face move reduction via modular arithmetic (mod 4).
- Formal state-equivalence verification safety gate.
- Solution analytics (move counts, efficiency, face distribution, estimated duration).
"""

from __future__ import annotations
import time
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional, Sequence, Union

import cube_engine

# Speed presets in ms duration per move (matching Phase 3D frontend)
PLAYBACK_SPEED_PRESETS = {
    "0.5x": 760,
    "1.0x": 380,
    "1.5x": 250,
    "2.0x": 190,
}

# Move turn weights in quarter-turns mod 4
MOVE_TURN_WEIGHTS: Dict[str, int] = {
    "": 1,    # e.g., R -> 1
    "2": 2,   # e.g., R2 -> 2
    "'": 3,   # e.g., R' -> 3 (-1 mod 4)
}

# Inverse mapping from (face, quarter_turns % 4) to canonical move string
TURNS_TO_MOVE_SUFFIX: Dict[int, Optional[str]] = {
    0: None,  # Net 0 turns cancels
    1: "",    # 1 quarter turn clockwise
    2: "2",   # 2 quarter turns (half turn)
    3: "'",   # 3 quarter turns clockwise / 1 counter-clockwise
}


@dataclass
class OptimizationAnalytics:
    """
    Comprehensive analytical metrics for a solution sequence.
    """
    original_move_count: int
    optimized_move_count: int
    moves_saved: int
    optimization_percentage: float
    face_distribution: Dict[str, int]
    quarter_turn_count: int
    half_turn_count: int
    prime_move_count: int
    estimated_duration_ms: Dict[str, int]
    solve_time_ms: float = 0.0
    optimization_time_ms: float = 0.0

    def to_dict(self) -> Dict[str, Any]:
        return {
            "original_move_count": self.original_move_count,
            "optimized_move_count": self.optimized_move_count,
            "moves_saved": self.moves_saved,
            "optimization_percentage": self.optimization_percentage,
            "face_distribution": self.face_distribution,
            "quarter_turn_count": self.quarter_turn_count,
            "half_turn_count": self.half_turn_count,
            "prime_move_count": self.prime_move_count,
            "estimated_duration_ms": self.estimated_duration_ms,
            "solve_time_ms": round(self.solve_time_ms, 3),
            "optimization_time_ms": round(self.optimization_time_ms, 3),
        }


@dataclass
class OptimizationResult:
    """
    Result of the move optimization process.
    """
    is_optimized: bool
    is_verified: bool
    original_moves: List[str]
    optimized_moves: List[str]
    analytics: OptimizationAnalytics
    error_message: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        return {
            "is_optimized": self.is_optimized,
            "is_verified": self.is_verified,
            "original_moves": self.original_moves,
            "optimized_moves": self.optimized_moves,
            "analytics": self.analytics.to_dict(),
            "error_message": self.error_message,
        }


def normalize_move(move_str: str) -> str:
    """
    Validates and normalizes a single move token to canonical format.
    Raises ValueError for unsupported or malformed notation.
    """
    if not isinstance(move_str, str):
        raise TypeError(f"Move token must be a string, got {type(move_str).__name__}")

    cleaned = move_str.strip()
    if not cleaned:
        raise ValueError("Move token cannot be empty.")

    face = cleaned[0].upper()
    suffix = cleaned[1:] if len(cleaned) > 1 else ""

    canonical = f"{face}{suffix}"
    if canonical not in cube_engine.ALL_VALID_MOVES:
        raise ValueError(
            f"Invalid move notation '{move_str}'. Expected one of standard 18 moves (U, D, L, R, F, B with optional ' or 2)."
        )

    return canonical


def normalize_moves(moves_input: Union[str, Sequence[str]]) -> List[str]:
    """
    Parses and normalizes a sequence or string of move tokens.
    """
    if isinstance(moves_input, str):
        tokens = moves_input.strip().split() if moves_input.strip() else []
    elif isinstance(moves_input, Sequence):
        tokens = list(moves_input)
    else:
        raise TypeError(f"Expected string or sequence of moves, got {type(moves_input).__name__}")

    return [normalize_move(tok) for tok in tokens]


def _parse_move_components(move: str) -> tuple[str, int]:
    """
    Splits a canonical move into its face character and turn weight (1, 2, or 3).
    """
    face = move[0]
    suffix = move[1:] if len(move) > 1 else ""
    turns = MOVE_TURN_WEIGHTS.get(suffix, 1)
    return face, turns


def _format_move(face: str, turns: int) -> Optional[str]:
    """
    Constructs canonical move string from face and quarter turns mod 4.
    Returns None if turns % 4 == 0 (cancelled).
    """
    net_turns = turns % 4
    suffix = TURNS_TO_MOVE_SUFFIX[net_turns]
    if suffix is None:
        return None
    return f"{face}{suffix}"


def reduce_same_face_moves(moves: Sequence[str]) -> List[str]:
    """
    Reduces redundant consecutive same-face moves using modular arithmetic (mod 4).
    Iteratively runs passes until no further adjacent same-face cancellations occur.
    
    Examples:
    - R R' -> []
    - R R -> R2
    - R2 R2 -> []
    - R R R -> R'
    - R' R' R' -> R
    - F R U U' R' F' -> []
    """
    current = list(moves)
    changed = True

    while changed:
        changed = False
        reduced: List[str] = []
        i = 0
        n = len(current)

        while i < n:
            if i + 1 < n and current[i][0] == current[i + 1][0]:
                face = current[i][0]
                _, turns1 = _parse_move_components(current[i])
                _, turns2 = _parse_move_components(current[i + 1])
                combined = _format_move(face, turns1 + turns2)

                if combined is not None:
                    reduced.append(combined)

                changed = True
                i += 2
            else:
                reduced.append(current[i])
                i += 1

        current = reduced

    return current


def compute_solution_analytics(
    original_moves: List[str],
    optimized_moves: List[str],
    solve_time_ms: float = 0.0,
    opt_time_ms: float = 0.0,
) -> OptimizationAnalytics:
    """
    Computes comprehensive analytics across original and optimized solution sequences.
    """
    orig_count = len(original_moves)
    opt_count = len(optimized_moves)
    moves_saved = orig_count - opt_count
    opt_pct = round((moves_saved / orig_count) * 100.0, 1) if orig_count > 0 else 0.0

    # Face distribution and turn type breakdown
    face_dist: Dict[str, int] = {"U": 0, "R": 0, "F": 0, "D": 0, "L": 0, "B": 0}
    quarter_turns = 0
    half_turns = 0
    prime_turns = 0

    for m in optimized_moves:
        f = m[0]
        if f in face_dist:
            face_dist[f] += 1

        if "2" in m:
            half_turns += 1
        elif "'" in m:
            prime_turns += 1
            quarter_turns += 1
        else:
            quarter_turns += 1

    # Playback durations for speed presets
    estimated_durations = {
        speed_label: opt_count * speed_ms
        for speed_label, speed_ms in PLAYBACK_SPEED_PRESETS.items()
    }

    return OptimizationAnalytics(
        original_move_count=orig_count,
        optimized_move_count=opt_count,
        moves_saved=moves_saved,
        optimization_percentage=opt_pct,
        face_distribution=face_dist,
        quarter_turn_count=quarter_turns,
        half_turn_count=half_turns,
        prime_move_count=prime_turns,
        estimated_duration_ms=estimated_durations,
        solve_time_ms=solve_time_ms,
        optimization_time_ms=opt_time_ms,
    )


class SolutionOptimizer:
    """
    Solution Optimizer & Verification Engine.
    Executes same-face move reduction, state-equivalence verification, and analytics.
    """

    @classmethod
    def optimize(
        cls,
        initial_state: Union[str, cube_engine.Cube],
        raw_moves: Union[str, Sequence[str]],
        solve_time_ms: float = 0.0,
    ) -> OptimizationResult:
        """
        Normalizes and optimizes a solution sequence with safety verification.
        
        1. Normalizes raw move tokens.
        2. Applies same-face modular turn reduction.
        3. Verifies that applying candidate moves to initial_state matches applying original_moves.
        4. If verified, returns optimized solution with analytics.
        5. If verification fails, falls back safely to original solution.
        """
        start_opt = time.perf_counter()

        # Step 1: Normalize moves
        try:
            original_moves = normalize_moves(raw_moves)
        except Exception as e:
            opt_time_ms = (time.perf_counter() - start_opt) * 1000.0
            analytics = compute_solution_analytics([], [], solve_time_ms, opt_time_ms)
            return OptimizationResult(
                is_optimized=False,
                is_verified=False,
                original_moves=[],
                optimized_moves=[],
                analytics=analytics,
                error_message=f"Move normalization error: {str(e)}",
            )

        # Empty / trivial sequence handling
        if not original_moves:
            opt_time_ms = (time.perf_counter() - start_opt) * 1000.0
            analytics = compute_solution_analytics([], [], solve_time_ms, opt_time_ms)
            return OptimizationResult(
                is_optimized=False,
                is_verified=True,
                original_moves=[],
                optimized_moves=[],
                analytics=analytics,
                error_message=None,
            )

        # Step 2: Redundant move cancellation
        candidate_moves = reduce_same_face_moves(original_moves)

        # Step 3: Formal state-equivalence verification gate
        cube_base = initial_state if isinstance(initial_state, cube_engine.Cube) else cube_engine.Cube(initial_state)

        # Apply original moves on clone A
        cube_a = cube_base.clone()
        cube_a.apply_algorithm(original_moves)

        # Apply optimized moves on clone B
        cube_b = cube_base.clone()
        cube_b.apply_algorithm(candidate_moves)

        is_verified = (cube_a.to_state_string() == cube_b.to_state_string())

        opt_time_ms = (time.perf_counter() - start_opt) * 1000.0

        if not is_verified:
            # Fallback to original solution upon verification discrepancy
            analytics = compute_solution_analytics(original_moves, original_moves, solve_time_ms, opt_time_ms)
            return OptimizationResult(
                is_optimized=False,
                is_verified=False,
                original_moves=original_moves,
                optimized_moves=original_moves,
                analytics=analytics,
                error_message="Optimization safety verification failed: resulting state does not match original solution.",
            )

        is_reduced = len(candidate_moves) < len(original_moves)
        analytics = compute_solution_analytics(original_moves, candidate_moves, solve_time_ms, opt_time_ms)

        return OptimizationResult(
            is_optimized=is_reduced,
            is_verified=True,
            original_moves=original_moves,
            optimized_moves=candidate_moves,
            analytics=analytics,
            error_message=None,
        )
