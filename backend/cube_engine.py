import kociemba

def validate_state(state: str) -> bool:
    """
    Validates a Rubik's cube state string.
    Checks:
    - Length is exactly 54.
    - Contains only valid characters: U, R, F, D, L, B.
    - Each character appears exactly 9 times.
    """
    if len(state) != 54:
        return False
        
    valid_chars = set('URFDLB')
    if not all(char in valid_chars for char in state):
        return False
        
    counts = {char: state.count(char) for char in valid_chars}
    if not all(count == 9 for count in counts.values()):
        return False
        
    return True

def solve_cube(state: str) -> list[str]:
    """
    Solves the Rubik's Cube state using Kociemba's Two-Phase algorithm.
    Returns a list of moves, e.g., ["U", "R2", "F'"].
    Raises ValueError if the state is unsolveable (e.g., flipped edge, parity).
    """
    if not validate_state(state):
        raise ValueError("Invalid state string: Must be 54 characters with 9 of each color URFDLB.")
        
    try:
        # kociemba.solve returns a string like "U R2 F' D L2 B'"
        solution_str = kociemba.solve(state)
        # Split into a list of strings
        return solution_str.split() if solution_str else []
    except Exception as e:
        # kociemba throws an exception for unsolveable states
        raise ValueError(f"Cube is unsolveable: {str(e)}")
