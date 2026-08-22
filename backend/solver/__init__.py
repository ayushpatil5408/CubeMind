"""
Solver Architecture Package — CubeMind (Phase 2B, 2C, 2D).
"""

from solver.base import BaseSolver
from solver.models import SolutionResult, SolverStatus, VerificationResult
from solver.verifier import SolutionVerifier
from solver.kociemba import KociembaSolver
from solver.kociemba_mapping import (
    cubemind_to_kociemba_state,
    kociemba_to_cubemind_state,
    kociemba_to_cubemind_move,
    kociemba_to_cubemind_solution,
)
from solver.pipeline import (
    SolverRegistry,
    SolverService,
    default_solver_service,
)

# Alias SolverPipeline to SolverService for flexible naming
SolverPipeline = SolverService

__all__ = [
    "BaseSolver",
    "SolutionResult",
    "SolverStatus",
    "SolutionVerifier",
    "VerificationResult",
    "KociembaSolver",
    "cubemind_to_kociemba_state",
    "kociemba_to_cubemind_state",
    "kociemba_to_cubemind_move",
    "kociemba_to_cubemind_solution",
    "SolverRegistry",
    "SolverService",
    "SolverPipeline",
    "default_solver_service",
]
