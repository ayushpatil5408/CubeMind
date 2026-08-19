from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="Rubik's Cube Solver API")

# Configure CORS so the frontend can communicate with the backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For development purposes
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class CubeState(BaseModel):
    """
    State representation string format (UDFBLR format string of 54 characters).
    U = Up, R = Right, F = Front, D = Down, L = Left, B = Back
    Example: UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB
    """
    state_string: str

@app.get("/")
def read_root():
    return {"message": "Welcome to the Rubik's Cube Solver API"}

@app.post("/solve")
def solve_cube(cube: CubeState):
    """
    Dummy endpoint for Phase 1 to verify connectivity.
    In Phase 2, this will pass the state_string to the Kociemba solver.
    """
    # For now, just return a dummy move sequence
    return {
        "status": "success",
        "solution": ["U", "R2", "F'", "D", "L2", "B'"],
        "received_state": cube.state_string
    }
