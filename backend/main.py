from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import cube_engine

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
    Endpoint that accepts a 54-char string and returns the shortest solution.
    """
    try:
        solution = cube_engine.solve_cube(cube.state_string)
        return {
            "status": "success",
            "solution": solution,
            "received_state": cube.state_string
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
