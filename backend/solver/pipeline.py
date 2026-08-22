"""
Solver Pipeline & Orchestration Service (Phase 2D).

Coordinates the end-to-end solving workflow:
1. Input normalization
2. Pre-solve physical & mathematical validation (CubeValidator)
3. Solved state detection (is_solved)
4. Dynamic solver selection (SolverRegistry)
5. Solver execution with error handling & timing
6. Solution move sequence normalization
7. Post-solve mathematical verification (SolutionVerifier)
8. Structured result packaging
"""

from __future__ import annotations
from typing import Any, Callable, Dict, List, Optional, Type, Union

import cube_engine
from validator import CubeValidator, ValidationStatus
from solver.base import BaseSolver
from solver.models import SolutionResult, SolverStatus, VerificationResult
from solver.verifier import SolutionVerifier
from solver.kociemba import KociembaSolver


class SolverRegistry:
    """
    Registry for managing available Rubik's Cube solving algorithm implementations.
    Allows dynamic registration and instantiation of solvers by name.
    """

    def __init__(self):
        self._registry: Dict[str, Callable[..., BaseSolver]] = {}
        self._register_defaults()

    def _register_defaults(self):
        """Registers built-in default solvers."""
        self.register("kociemba", lambda **kw: KociembaSolver(**kw))
        self.register("kociemba_two_phase", lambda **kw: KociembaSolver(**kw))
        self.register("two_phase", lambda **kw: KociembaSolver(**kw))
        self.register("default", lambda **kw: KociembaSolver(**kw))

    def register(self, name: str, factory: Callable[..., BaseSolver]) -> None:
        """Registers a solver factory function under a given identifier."""
        self._registry[name.strip().lower()] = factory

    def get(self, name: str = "kociemba", **kwargs) -> BaseSolver:
        """
        Instantiates and returns a solver by identifier.
        Raises KeyError if solver is not registered.
        """
        key = name.strip().lower()
        if key not in self._registry:
            available = sorted(list(self._registry.keys()))
            raise KeyError(f"Solver '{name}' is not registered. Available solvers: {available}")
        return self._registry[key](**kwargs)

    def list_available(self) -> List[str]:
        """Returns a list of all registered solver names."""
        return sorted(list(self._registry.keys()))

    def is_registered(self, name: str) -> bool:
        """Returns True if the solver name is registered."""
        return name.strip().lower() in self._registry


class SolverService:
    """
    High-level orchestration service executing the end-to-end solve pipeline.
    """

    def __init__(self, registry: Optional[SolverRegistry] = None):
        self.registry: SolverRegistry = registry or SolverRegistry()

    def solve(
        self,
        state_input: Union[str, cube_engine.Cube],
        solver_name: str = "kociemba",
        verify: bool = True,
        **solver_kwargs,
    ) -> SolutionResult:
        """
        Executes the full end-to-end solving pipeline:
        1. Validates solver availability.
        2. Resolves solver from registry.
        3. Invokes solver.solve() which runs validation gate, solved check, execution, and verification gate.
        4. Enriches metadata with original input representation.
        """
        solver_key = solver_name.strip().lower()
        if not self.registry.is_registered(solver_key):
            # Extract state string if possible for response
            orig_str = state_input if isinstance(state_input, str) else state_input.to_state_string()
            available = self.registry.list_available()
            return SolutionResult(
                success=False,
                status=SolverStatus.SOLVER_UNAVAILABLE,
                solver_name=solver_name,
                moves=[],
                move_count=0,
                solve_time_ms=0.0,
                validation_result=None,
                verification_result=None,
                error_message=f"Solver '{solver_name}' is not available. Registered solvers: {available}",
                metadata={"state_string": orig_str, "requested_solver": solver_name},
            )

        try:
            solver_instance = self.registry.get(solver_key, **solver_kwargs)
        except Exception as e:
            orig_str = state_input if isinstance(state_input, str) else state_input.to_state_string()
            return SolutionResult(
                success=False,
                status=SolverStatus.SOLVER_ERROR,
                solver_name=solver_name,
                moves=[],
                move_count=0,
                solve_time_ms=0.0,
                validation_result=None,
                verification_result=None,
                error_message=f"Failed to initialize solver '{solver_name}': {str(e)}",
                metadata={"state_string": orig_str, "requested_solver": solver_name},
            )

        # Run standard solver workflow
        result = solver_instance.solve(state_input, verify=verify)

        # Attach original state and solver metadata
        orig_str = state_input if isinstance(state_input, str) else state_input.to_state_string()
        result.metadata["state_string"] = orig_str
        result.metadata["solver_key"] = solver_key
        result.metadata["is_verified"] = bool(result.verification_result and result.verification_result.is_verified)

        return result


# Global default service instance for easy access
default_solver_service = SolverService()
