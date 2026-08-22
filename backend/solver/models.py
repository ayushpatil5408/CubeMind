"""
Solver Models & Data Structures — Solution Result & Status Enums (Phase 2B).
"""

from __future__ import annotations
from dataclasses import dataclass, field
from enum import Enum
from typing import Any, Dict, List, Optional
from validator import ValidationResult


class SolverStatus(str, Enum):
    SOLVED = "SOLVED"
    ALREADY_SOLVED = "ALREADY_SOLVED"
    INVALID_INPUT = "INVALID_INPUT"
    UNSOLVABLE_STATE = "UNSOLVABLE_STATE"
    TIMEOUT = "TIMEOUT"
    SOLVER_UNAVAILABLE = "SOLVER_UNAVAILABLE"
    SOLVER_ERROR = "SOLVER_ERROR"


@dataclass
class VerificationResult:
    """
    Result of verifying a solution by applying moves to a copy of the initial state.
    """
    is_verified: bool
    final_state: str
    message: str
    applied_moves: List[str] = field(default_factory=list)
    error: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        return {
            "is_verified": self.is_verified,
            "final_state": self.final_state,
            "message": self.message,
            "applied_moves": self.applied_moves,
            "error": self.error,
        }


@dataclass
class SolutionResult:
    """
    Standardized, structured result returned by all CubeMind solver implementations.
    """
    success: bool
    status: SolverStatus
    solver_name: str
    moves: List[str] = field(default_factory=list)
    move_count: int = 0
    solve_time_ms: float = 0.0
    validation_result: Optional[ValidationResult] = None
    verification_result: Optional[VerificationResult] = None
    error_message: Optional[str] = None
    metadata: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "success": self.success,
            "status": self.status.value,
            "solver_name": self.solver_name,
            "moves": self.moves,
            "move_count": self.move_count,
            "solve_time_ms": round(self.solve_time_ms, 3),
            "validation_result": self.validation_result.to_dict() if self.validation_result else None,
            "verification_result": self.verification_result.to_dict() if self.verification_result else None,
            "error_message": self.error_message,
            "metadata": self.metadata,
        }
