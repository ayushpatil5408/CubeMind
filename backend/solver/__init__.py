"""
Solver Architecture Package — CubeMind (Phase 2B, 2C, 2D, 2E).
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
from solver.benchmark import (
    MetricStats,
    BenchmarkCaseResult,
    BenchmarkSummary,
    SolverBenchmarkRunner,
)
from solver.optimizer import (
    SolutionOptimizer,
    OptimizationResult,
    OptimizationAnalytics,
    normalize_move,
    normalize_moves,
    reduce_same_face_moves,
    compute_solution_analytics,
)
from solver.coach import (
    CoachMode,
    CoachingStep,
    CoachExplainer,
    RuleBasedExplainer,
    default_coach_explainer,
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
    "MetricStats",
    "BenchmarkCaseResult",
    "BenchmarkSummary",
    "SolverBenchmarkRunner",
    "SolutionOptimizer",
    "OptimizationResult",
    "OptimizationAnalytics",
    "normalize_move",
    "normalize_moves",
    "reduce_same_face_moves",
    "compute_solution_analytics",
    "CoachMode",
    "CoachingStep",
    "CoachExplainer",
    "RuleBasedExplainer",
    "default_coach_explainer",
]


