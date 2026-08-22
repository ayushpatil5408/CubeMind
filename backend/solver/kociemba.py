"""
Kociemba Two-Phase Solver Implementation (Phase 2C).

Integrates Herbert Kociemba's Two-Phase Algorithm behind the BaseSolver abstraction.
Uses pure-Python solver engine (rubik-solver) for guaranteed cross-platform
compatibility without requiring native C/C++ build toolchains.
"""

from __future__ import annotations
import sys
from typing import List, Optional

import cube_engine
from solver.base import BaseSolver
from solver.kociemba_mapping import (
    cubemind_to_kociemba_state,
    kociemba_to_cubemind_solution,
)


class KociembaSolver(BaseSolver):
    """
    Concrete solver implementation utilizing Kociemba's Two-Phase Algorithm.
    
    Finds near-optimal solutions (typically <= 21 moves) in sub-second time.
    """

    def __init__(
        self,
        name: Optional[str] = None,
        max_depth: int = 24,
        timeout_sec: float = 20.0,
    ):
        super().__init__(name=name or "KociembaTwoPhaseSolver")
        self.max_depth: int = max_depth
        self.timeout_sec: float = timeout_sec

    def _solve_impl(self, cube: cube_engine.Cube) -> List[str]:
        """
        Executes the Kociemba Two-Phase algorithm on a validated, unsolved Cube state.
        
        Steps:
        1. Dynamically imports the Kociemba search engine (rubik_solver.Solver.Kociemba.Search).
        2. Converts the CubeMind canonical state to Kociemba standard facelet representation.
        3. Invokes the IDA* search algorithm with configured depth and timeout parameters.
        4. Maps the raw Kociemba move sequence to canonical CubeMind move notation.
        5. Returns the move token list.
        """
        try:
            from rubik_solver.Solver.Kociemba import Search
            from rubik_solver.Solver.Kociemba.Search import SolverTimeoutError, NoSolution
            from rubik_solver.CubieCube import DupedEdge, DupedCorner
        except ImportError as e:
            raise NotImplementedError(
                f"Kociemba solver backend dependency is unavailable: {str(e)}"
            ) from e

        # 1. State Conversion
        canonical_state = cube.to_state_string()
        koc_state = cubemind_to_kociemba_state(canonical_state)

        # 2. Run Kociemba Two-Phase Search
        try:
            raw_solution = Search.Search.solution(
                koc_state,
                self.max_depth,
                int(self.timeout_sec),
                0,
            )
        except SolverTimeoutError as e:
            raise TimeoutError(f"Kociemba solver timed out after {self.timeout_sec}s: {str(e)}") from e
        except (DupedEdge, DupedCorner, NoSolution) as e:
            raise ValueError(f"Kociemba solver detected impossible cube state: {str(e)}") from e
        except Exception as e:
            # Check for timeout string in message if generic exception raised
            if "timeout" in str(e).lower():
                raise TimeoutError(f"Kociemba solver timeout: {str(e)}") from e
            raise RuntimeError(f"Kociemba search failed: {str(e)}") from e

        if raw_solution is None:
            raise RuntimeError("Kociemba solver returned no solution.")

        # 3. Map Move Notation to Canonical CubeMind Moves
        cubemind_moves = kociemba_to_cubemind_solution(raw_solution)

        return cubemind_moves
