"""
Unit Tests for Phase 1 FastAPI Endpoints.
"""

from fastapi.testclient import TestClient
from main import app
from cube_engine import SOLVED_STATE_STRING

client = TestClient(app)


def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert data["phase"] == 1


def test_validate_endpoint_valid():
    response = client.post("/validate", json={"state_string": SOLVED_STATE_STRING})
    assert response.status_code == 200
    data = response.json()
    assert data["is_valid"] is True


def test_validate_endpoint_invalid():
    response = client.post("/validate", json={"state_string": "INVALID"})
    assert response.status_code == 200
    data = response.json()
    assert data["is_valid"] is False


def test_scramble_endpoint():
    response = client.get("/scramble?length=15&seed=123")
    assert response.status_code == 200
    data = response.json()
    assert data["length"] == 15
    assert len(data["scramble"]) == 15
    assert data["seed"] == 123


def test_solve_endpoint_solved_cube():
    response = client.post("/solve", json={"state_string": SOLVED_STATE_STRING})
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["message"] == "Cube is already solved."


def test_solve_endpoint_scrambled_valid():
    # Valid scrambled state
    scrambled = "UUUUUURUBFRRRRRDRRFFFFFFLFUFDUDDDDDDLLLLLLLLRBBBBBBBBD"
    response = client.post("/solve", json={"state_string": scrambled})
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"


def test_solve_endpoint_invalid_format():
    response = client.post("/solve", json={"state_string": "SHORT"})
    assert response.status_code == 400
