"""
Base Solver Abstract Class — Foundation for all Rubik's Cube Solvers (Phase 2B).
"""

from __future__ import annotations
import abc
import time
from typing import Any, Dict, List, Optional, Sequence, Union
import cube_engine
from validator import CubeValidator, ValidationStatus
from solver.models import SolutionResult, SolverStatus, VerificationResult
from solver.verifier import SolutionVerifier


class BaseSolver(abc.ABC):
    """
    Abstract Base Class defining the contract for all Rubik's Cube solving engines.
    
    Subclasses must implement `_solve_impl(cube: Cube) -> List[str]`.
    The template method `solve()` handles input normalization, validation,
    timing, error handling, and optional post-solve verification.
    """

    def __init__(self, name: Optional[str] = None):
        self.name: str = name or self.__class__.__name__

    @abc.abstractmethod
    def _solve_impl(self, cube: cube_engine.Cube) -> List[str]:
        """
        Subclass-specific solving algorithm.
        Must take a validated, unsolved Cube instance and return a sequence of standard move tokens.
        """
        raise NotImplementedError

    def solve(
        self,
        state_input: Union[str, cube_engine.Cube],
        verify: bool = True,
    ) -> SolutionResult:
        """
        Standard solving workflow:
        1. Validates input state using CubeValidator.
        2. Handles already-solved cubes immediately.
        3. Invokes `_solve_impl` and measures execution time.
        4. Validates and normalizes move tokens.
        5. Optionally verifies that applying the solution results in a solved cube.
        6. Returns a structured SolutionResult.
        """
        start_time = time.perf_counter()

        # 1. State Validation Gate
        val_res = CubeValidator.validate(state_input)
        if not val_res.is_valid:
            elapsed_ms = (time.perf_counter() - start_time) * 1000.0
            status = (
                SolverStatus.INVALID_INPUT
                if val_res.status in (ValidationStatus.INVALID_FORMAT, ValidationStatus.INVALID_STICKER_COUNT)
                else SolverStatus.UNSOLVABLE_STATE
            )
            return SolutionResult(
                success=False,
                status=status,
                solver_name=self.name,
                moves=[],
                move_count=0,
                solve_time_ms=elapsed_ms,
                validation_result=val_res,
                verification_result=None,
                error_message=f"Validation failed: {val_res.message}",
            )

        # 2. Normalize to Cube instance
        cube = state_input if isinstance(state_input, cube_engine.Cube) else cube_engine.Cube(state_input)

        # 3. Already Solved Gate
        if cube.is_solved():
            elapsed_ms = (time.perf_counter() - start_time) * 1000.0
            return SolutionResult(
                success=True,
                status=SolverStatus.ALREADY_SOLVED,
                solver_name=self.name,
                moves=[],
                move_count=0,
                solve_time_ms=elapsed_ms,
                validation_result=val_res,
                verification_result=VerificationResult(
                    is_verified=True,
                    final_state=cube.to_state_string(),
                    message="Cube was already in a solved state.",
                    applied_moves=[],
                ),
                error_message=None,
                metadata={"info": "No moves required; cube is already solved."},
            )

        # 4. Invoke Concrete Solver Implementation with timing & error handling
        try:
            # Clone cube to guarantee solver cannot mutate caller's state
            raw_moves = self._solve_impl(cube.clone())
        except TimeoutError as e:
            elapsed_ms = (time.perf_counter() - start_time) * 1000.0
            return SolutionResult(
                success=False,
                status=SolverStatus.TIMEOUT,
                solver_name=self.name,
                moves=[],
                move_count=0,
                solve_time_ms=elapsed_ms,
                validation_result=val_res,
                error_message=f"Solver timed out: {str(e)}",
            )
        except NotImplementedError as e:
            elapsed_ms = (time.perf_counter() - start_time) * 1000.0
            return SolutionResult(
                success=False,
                status=SolverStatus.SOLVER_UNAVAILABLE,
                solver_name=self.name,
                moves=[],
                move_count=0,
                solve_time_ms=elapsed_ms,
                validation_result=val_res,
                error_message=f"Solver algorithm not yet implemented: {str(e)}",
            )
        except Exception as e:
            elapsed_ms = (time.perf_counter() - start_time) * 1000.0
            return SolutionResult(
                success=False,
                status=SolverStatus.SOLVER_ERROR,
                solver_name=self.name,
                moves=[],
                move_count=0,
                solve_time_ms=elapsed_ms,
                validation_result=val_res,
                error_message=f"Internal solver error: {str(e)}",
            )

        # 5. Parse and normalize move notation
        try:
            if isinstance(raw_moves, str):
                solution_moves = cube_engine.parse_moves(raw_moves)
            elif isinstance(raw_moves, Sequence):
                solution_moves = list(raw_moves)
                for m in solution_moves:
                    if m not in cube_engine.ALL_VALID_MOVES:
                        raise ValueError(f"Invalid move notation '{m}' returned by solver.")
            else:
                raise TypeError(f"Expected moves sequence, got {type(raw_moves).__name__}")
        except Exception as e:
            elapsed_ms = (time.perf_counter() - start_time) * 1000.0
            return SolutionResult(
                success=False,
                status=SolverStatus.SOLVER_ERROR,
                solver_name=self.name,
                moves=[],
                move_count=0,
                solve_time_ms=elapsed_ms,
                validation_result=val_res,
                error_message=f"Solver produced invalid move sequence: {str(e)}",
            )

        elapsed_ms = (time.perf_counter() - start_time) * 1000.0

        # 6. Solution Optimization & Redundant Move Cancellation (Phase 5A)
        from solver.optimizer import SolutionOptimizer

        opt_result = SolutionOptimizer.optimize(
            initial_state=cube,
            raw_moves=solution_moves,
            solve_time_ms=elapsed_ms,
        )

        active_moves = opt_result.optimized_moves if opt_result.is_verified else solution_moves

        # 7. Solution Verification Gate (Optional)
        ver_res: Optional[VerificationResult] = None
        if verify:
            ver_res = SolutionVerifier.verify(cube, active_moves)
            if not ver_res.is_verified:
                return SolutionResult(
                    success=False,
                    status=SolverStatus.SOLVER_ERROR,
                    solver_name=self.name,
                    moves=active_moves,
                    move_count=len(active_moves),
                    solve_time_ms=elapsed_ms,
                    validation_result=val_res,
                    verification_result=ver_res,
                    error_message="Solution verification failed: applying generated moves did not solve the cube.",
                    original_moves=solution_moves,
                    is_optimized=opt_result.is_optimized,
                    optimization_analytics=opt_result.analytics.to_dict(),
                )

        return SolutionResult(
            success=True,
            status=SolverStatus.SOLVED,
            solver_name=self.name,
            moves=active_moves,
            move_count=len(active_moves),
            solve_time_ms=elapsed_ms,
            validation_result=val_res,
            verification_result=ver_res,
            error_message=None,
            original_moves=solution_moves,
            is_optimized=opt_result.is_optimized,
            optimization_analytics=opt_result.analytics.to_dict(),
        )

