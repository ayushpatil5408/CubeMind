"""
FastAPI Backend Application — Rubik's Cube Solver API (Phase 2D).

Provides production REST API endpoints for CubeMind:
- GET /: Service health & status
- POST /validate: Deep mathematical validation of a 54-character cube state string
- GET /scramble: Standard WCA-style scramble generator
- POST /solve: End-to-end solving pipeline (Validation -> Solver Selection -> Execution -> Verification -> Result)
"""

from typing import Any, Dict, List, Optional
from fastapi import FastAPI, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

import cube_engine
from validator import CubeValidator, ValidationStatus
from solver import (
    default_solver_service,
    SolutionResult,
    SolverStatus,
)

app = FastAPI(
    title="CubeMind Solver API",
    description="End-to-End Rubik's Cube intelligence and solving service (Phase 2D).",
    version="2.0.0",
)

# Configure CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class CubeStateRequest(BaseModel):
    """Request payload containing a 54-character URFDLB state string."""
    state_string: str = Field(
        ...,
        description="54-character state string in canonical URFDLB facelet order.",
        json_schema_extra={"example": cube_engine.SOLVED_STATE_STRING},
    )


class SolveRequest(BaseModel):
    """Full solve request payload with optional configuration parameters."""
    state_string: str = Field(
        ...,
        description="54-character state string in canonical URFDLB facelet order.",
        json_schema_extra={"example": cube_engine.SOLVED_STATE_STRING},
    )
    solver: Optional[str] = Field(
        default="kociemba",
        description="Algorithm engine identifier ('kociemba', 'two_phase', 'default').",
    )
    verify: Optional[bool] = Field(
        default=True,
        description="Whether to independently verify the solution moves against an isolated cube state.",
    )
    max_depth: Optional[int] = Field(
        default=24,
        ge=1,
        le=30,
        description="Max search depth for IDA* phase 1 search.",
    )
    timeout_sec: Optional[float] = Field(
        default=20.0,
        ge=0.1,
        le=120.0,
        description="Timeout limit in seconds.",
    )


@app.get("/")
def read_root():
    """Health check endpoint."""
    return {
        "status": "online",
        "service": "CubeMind Solver API",
        "phase": 2,
        "phase_status": "Phase 2D End-to-End Solver Pipeline",
        "available_solvers": default_solver_service.registry.list_available(),
    }


@app.post("/validate")
def validate_cube(cube_req: CubeStateRequest):
    """
    Comprehensive physical and mathematical validation of a cube state.
    Evaluates format, sticker counts, center colors, edge & corner orbits, orientations, and parity.
    """
    val_res = CubeValidator.validate(cube_req.state_string)
    return {
        "state_string": cube_req.state_string,
        "is_valid": val_res.is_valid,
        "status": val_res.status.value,
        "message": val_res.message,
        "details": val_res.details,
    }


@app.get("/scramble")
def get_scramble(
    length: int = Query(default=20, ge=1, le=100, description="Number of moves in scramble"),
    seed: Optional[int] = Query(default=None, description="Optional random seed for reproducibility"),
):
    """Generates a standard WCA-style scramble sequence."""
    scramble_moves = cube_engine.ScrambleGenerator.generate(length=length, seed=seed)
    cube = cube_engine.Cube()
    cube.apply_algorithm(scramble_moves)
    return {
        "length": length,
        "seed": seed,
        "scramble": scramble_moves,
        "scramble_str": " ".join(scramble_moves),
        "resulting_state": cube.to_state_string(),
    }


@app.post("/solve")
def solve_cube(req: SolveRequest):
    """
    End-to-end Rubik's Cube solving endpoint (Phase 2D).
    
    Orchestrates:
    1. Structural format check
    2. Deep physical state validation
    3. Already-solved check
    4. Solver selection and execution
    5. Move normalization
    6. Mathematical verification
    7. Structured response
    """
    # 1. Structural Format Gate: return 400 on malformed input strings
    if not cube_engine.validate_state(req.state_string):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid state string: must be exactly 54 characters containing 9 of each face color (U, R, F, D, L, B).",
        )

    # 2. Run Pipeline through SolverService
    result: SolutionResult = default_solver_service.solve(
        state_input=req.state_string,
        solver_name=req.solver or "kociemba",
        verify=req.verify if req.verify is not None else True,
        max_depth=req.max_depth or 24,
        timeout_sec=req.timeout_sec or 20.0,
    )

    # 3. Handle Unsolvable States (e.g. impossible parity, twisted corner)
    if result.status == SolverStatus.UNSOLVABLE_STATE:
        raise HTTPException(
            status_code=422,
            detail={
                "status": result.status.value,
                "error_message": result.error_message,
                "validation_result": result.validation_result.to_dict() if result.validation_result else None,
            },
        )

    # 4. Handle Solver Failure / Unavailable
    if result.status == SolverStatus.SOLVER_UNAVAILABLE:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=result.error_message,
        )

    # 5. Format Successful / Solved Response (with backward-compatible fields)
    res_dict = result.to_dict()
    res_dict["status_name"] = result.status.value
    # Compatibility alias fields
    res_dict["status"] = "success" if result.success else result.status.value
    res_dict["solution"] = result.moves
    res_dict["solution_str"] = " ".join(result.moves)
    res_dict["is_solved"] = result.success
    res_dict["state_string"] = req.state_string
    if result.status == SolverStatus.ALREADY_SOLVED:
        res_dict["message"] = "Cube is already solved."
    else:
        res_dict["message"] = result.error_message or "Solution computed and verified successfully."

    return res_dict
