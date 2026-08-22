"""
Solution Verifier — Validates whether a move sequence successfully solves a cube (Phase 2B).
"""

from __future__ import annotations
from typing import List, Optional, Sequence, Union
import cube_engine
from solver.models import VerificationResult


class SolutionVerifier:
    """
    Independent verifier that tests whether an algorithm solves a given cube state.
    """

    @classmethod
    def verify(
        cls,
        initial_state: Union[str, cube_engine.Cube],
        moves: Union[str, Sequence[str]],
    ) -> VerificationResult:
        """
        Clones or initializes the cube from initial_state, applies the moves,
        and verifies whether the final state is solved.
        """
        # Safely instantiate / clone cube without mutating the original
        if isinstance(initial_state, cube_engine.Cube):
            cube_copy = initial_state.clone()
        elif isinstance(initial_state, str):
            try:
                cube_copy = cube_engine.Cube(initial_state)
            except Exception as e:
                return VerificationResult(
                    is_verified=False,
                    final_state=initial_state,
                    message=f"Failed to initialize cube state for verification: {str(e)}",
                    applied_moves=[],
                    error=str(e),
                )
        else:
            return VerificationResult(
                is_verified=False,
                final_state="",
                message=f"Invalid state input type: {type(initial_state).__name__}",
                applied_moves=[],
                error="InvalidInputType",
            )

        # Parse move tokens
        try:
            parsed_moves: List[str] = (
                cube_engine.parse_moves(moves) if isinstance(moves, str) else list(moves)
            )
            # Re-verify each token is in standard valid move set
            for m in parsed_moves:
                if m not in cube_engine.ALL_VALID_MOVES:
                    raise ValueError(f"Invalid move notation '{m}'.")
        except Exception as e:
            return VerificationResult(
                is_verified=False,
                final_state=cube_copy.to_state_string(),
                message=f"Malformed move sequence during verification: {str(e)}",
                applied_moves=[],
                error=str(e),
            )

        # Apply moves to the isolated clone
        try:
            cube_copy.apply_algorithm(parsed_moves)
        except Exception as e:
            return VerificationResult(
                is_verified=False,
                final_state=cube_copy.to_state_string(),
                message=f"Error executing move sequence: {str(e)}",
                applied_moves=parsed_moves,
                error=str(e),
            )

        # Check solved state
        final_state_str = cube_copy.to_state_string()
        is_solved = cube_copy.is_solved()

        if is_solved:
            return VerificationResult(
                is_verified=True,
                final_state=final_state_str,
                message="Solution verified successfully: cube reached canonical solved state.",
                applied_moves=parsed_moves,
            )
        else:
            return VerificationResult(
                is_verified=False,
                final_state=final_state_str,
                message="Solution verification failed: cube is not solved after applying moves.",
                applied_moves=parsed_moves,
            )
