"""
FastAPI Backend Application — Rubik's Cube Solver API (Phase 1).

Provides Phase 1 foundational API endpoints:
- GET /: Service health & status
- POST /validate: Validates a 54-character cube state string
- GET /scramble: Generates a random or seeded scramble sequence
- POST /solve: Phase 1 connectivity & validation endpoint (Phase 2 solver engine planned)
"""

from typing import Optional
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import cube_engine

app = FastAPI(
    title="CubeMind Core API",
    description="Phase 1 foundational Rubik's Cube intelligence and engine service.",
    version="1.0.0",
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
    """
    Request payload containing a 54-character URFDLB state string.
    """
    state_string: str = Field(
        ...,
        description="54-character state string in canonical URFDLB facelet order.",
        json_schema_extra={"example": cube_engine.SOLVED_STATE_STRING},
    )


@app.get("/")
def read_root():
    """Health check endpoint."""
    return {
        "status": "online",
        "service": "CubeMind Core API",
        "phase": 1,
        "phase_status": "Cube Core Engine Foundation",
    }


@app.post("/validate")
def validate_cube(cube_req: CubeStateRequest):
    """Validates if the provided 54-char string conforms to standard format and color distribution."""
    is_valid = cube_engine.validate_state(cube_req.state_string)
    return {
        "state_string": cube_req.state_string,
        "is_valid": is_valid,
    }


@app.get("/scramble")
def get_scramble(
    length: int = Query(default=20, ge=1, le=100, description="Number of moves in scramble"),
    seed: Optional[int] = Query(default=None, description="Optional random seed for reproducibility"),
):
    """Generates a standard WCA-style scramble sequence."""
    scramble_moves = cube_engine.ScrambleGenerator.generate(length=length, seed=seed)
    # Apply scramble to a fresh cube to get resulting state string
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
def solve_cube(cube_req: CubeStateRequest):
    """
    Phase 1 Connectivity & Validation endpoint.
    Solves immediately if cube is already solved, or validates state in preparation for Phase 2 Solver Engine.
    """
    if not cube_engine.validate_state(cube_req.state_string):
        raise HTTPException(
            status_code=400,
            detail="Invalid state string: must be exactly 54 characters with 9 of each face color (U, R, F, D, L, B).",
        )

    cube = cube_engine.Cube(cube_req.state_string)
    if cube.is_solved():
        return {
            "status": "success",
            "message": "Cube is already solved.",
            "solution": [],
            "state_string": cube_req.state_string,
        }

    return {
        "status": "success",
        "message": "Phase 1 connectivity and state validation confirmed. Core solving engine scheduled for Phase 2.",
        "solution": [],
        "state_string": cube_req.state_string,
        "is_solved": False,
    }
