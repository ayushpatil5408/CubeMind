"""
Comprehensive Integration & End-to-End Tests for FastAPI Endpoints (Phase 2D).

Tests:
1. GET /: Health check, service info, and available solver list.
2. POST /validate: Valid solved cube, valid scrambled cube, invalid format, impossible physical state.
3. GET /scramble: Scramble generation, move count, seed reproducibility, resulting state validity.
4. POST /solve:
   - Solved cube returns ALREADY_SOLVED / success with 0 moves.
   - 1-move scramble returns verified inverse move.
   - Multi-move scramble returns verified complete solution.
   - Explicit solver selection ("kociemba", "default").
   - Invalid format returns HTTP 400.
   - Physically impossible / unsolvable states return HTTP 422.
   - Unregistered solver name returns HTTP 503.
"""

from fastapi.testclient import TestClient
import pytest
from main import app
import cube_engine
from cube_engine import Cube, ScrambleGenerator, SOLVED_STATE_STRING

client = TestClient(app)


# ======================================================================
# 1. Health & Root Endpoint Tests
# ======================================================================

def test_root_endpoint():
    """GET / returns online health status and Phase 2 metadata."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert data["phase"] == 2
    assert "available_solvers" in data
    assert "kociemba" in data["available_solvers"]


# ======================================================================
# 2. Validation Endpoint Tests
# ======================================================================

def test_validate_endpoint_valid_solved():
    """POST /validate confirms solved cube is valid."""
    response = client.post("/validate", json={"state_string": SOLVED_STATE_STRING})
    assert response.status_code == 200
    data = response.json()
    assert data["is_valid"] is True
    assert data["status"] == "VALID"


def test_validate_endpoint_valid_scrambled():
    """POST /validate confirms legal scrambled cube is valid."""
    cube = Cube().apply_algorithm("R U R' U' F2 B2 D2")
    response = client.post("/validate", json={"state_string": cube.to_state_string()})
    assert response.status_code == 200
    data = response.json()
    assert data["is_valid"] is True
    assert data["status"] == "VALID"


def test_validate_endpoint_invalid_format():
    """POST /validate detects invalid format and returns diagnostic status."""
    response = client.post("/validate", json={"state_string": "INVALID_SHORT"})
    assert response.status_code == 200
    data = response.json()
    assert data["is_valid"] is False
    assert data["status"] == "INVALID_FORMAT"


def test_validate_endpoint_unsolvable_twisted_corner():
    """POST /validate detects physical impossibility (twisted corner)."""
    stickers = list(SOLVED_STATE_STRING)
    # Twist UFR corner (8, 9, 20)
    stickers[8], stickers[9], stickers[20] = stickers[20], stickers[8], stickers[9]
    response = client.post("/validate", json={"state_string": "".join(stickers)})
    assert response.status_code == 200
    data = response.json()
    assert data["is_valid"] is False
    assert data["status"] == "INVALID_CORNER_ORIENTATION"


# ======================================================================
# 3. Scramble Generator Tests
# ======================================================================

def test_scramble_endpoint():
    """GET /scramble produces valid WCA scrambles with resulting state."""
    response = client.get("/scramble?length=15&seed=123")
    assert response.status_code == 200
    data = response.json()
    assert data["length"] == 15
    assert len(data["scramble"]) == 15
    assert data["seed"] == 123
    assert "resulting_state" in data

    # Verify the resulting state is a legal cube
    cube = Cube(data["resulting_state"])
    val = client.post("/validate", json={"state_string": cube.to_state_string()})
    assert val.json()["is_valid"] is True


# ======================================================================
# 4. Solve Endpoint Tests (Phase 2D)
# ======================================================================

def test_solve_endpoint_solved_cube():
    """POST /solve on solved cube returns ALREADY_SOLVED / success with 0 moves."""
    response = client.post("/solve", json={"state_string": SOLVED_STATE_STRING})
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["moves"] == []
    assert data["move_count"] == 0
    assert data["is_solved"] is True
    assert "already solved" in data["message"].lower()


def test_solve_endpoint_single_move():
    """POST /solve on 1-move scramble returns verified single-move solution."""
    cube = Cube().apply_move("R")
    response = client.post("/solve", json={"state_string": cube.to_state_string()})
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["moves"] == ["R'"]
    assert data["move_count"] == 1
    assert data["verification_result"]["is_verified"] is True


def test_solve_endpoint_scrambled_valid():
    """POST /solve on multi-move scramble returns verified solution."""
    cube = Cube().apply_algorithm("R U R' U' F2")
    response = client.post("/solve", json={"state_string": cube.to_state_string()})
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert len(data["moves"]) >= 1
    assert data["verification_result"]["is_verified"] is True

    # Confirm applying moves to original state solves it
    cube_check = Cube(cube.to_state_string())
    cube_check.apply_algorithm(data["moves"])
    assert cube_check.is_solved() is True


def test_solve_endpoint_solver_selection():
    """POST /solve supports explicit solver selection."""
    cube = Cube().apply_algorithm("R U R'")
    response = client.post(
        "/solve",
        json={"state_string": cube.to_state_string(), "solver": "kociemba", "verify": True},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["solver_name"] == "KociembaTwoPhaseSolver"
    assert data["verification_result"]["is_verified"] is True


def test_solve_endpoint_invalid_format():
    """POST /solve rejects malformed strings with HTTP 400."""
    response = client.post("/solve", json={"state_string": "SHORT"})
    assert response.status_code == 400
    assert "Invalid state string" in response.json()["detail"]


def test_solve_endpoint_unsolvable_state():
    """POST /solve rejects physically impossible states with HTTP 422 and diagnostic payload."""
    stickers = list(SOLVED_STATE_STRING)
    # Single flipped edge (7, 19)
    stickers[7], stickers[19] = stickers[19], stickers[7]
    response = client.post("/solve", json={"state_string": "".join(stickers)})
    assert response.status_code == 422
    data = response.json()
    assert data["detail"]["status"] == "UNSOLVABLE_STATE"


def test_solve_endpoint_unregistered_solver():
    """POST /solve with unregistered solver name returns HTTP 503."""
    cube = Cube().apply_move("R")
    response = client.post(
        "/solve",
        json={"state_string": cube.to_state_string(), "solver": "nonexistent_solver"},
    )
    assert response.status_code == 503
    assert "not available" in response.json()["detail"].lower()
