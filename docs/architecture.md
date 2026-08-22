# Rubik's Cube Solver - System Architecture

Since the `Problem_Statement.md` was empty, I have generated a comprehensive architecture for a standard Rubik's Cube Solver application. This architecture supports both automated camera-based scanning and manual input, alongside a 3D visualization of the solution.

## 1. High-Level Overview
The system is designed to take the current state of a scrambled Rubik's Cube as input, validate the physical and mathematical state, compute the near-optimal sequence of moves to solve it, mathematically verify the solution, and expose it via structured REST API endpoints.

## 2. Core Modules & Phase Status

### A. Cube Core Engine (`backend/cube_engine.py`) — Phase 1 (IMPLEMENTED)
- Deterministic 54-facelet representation.
- 18 standard WCA moves ($U, D, L, R, F, B$, primes, double turns).
- State serialization (canonical string & dictionary) and scramble generator.

### B. Mathematical State Validator (`backend/validator.py`) — Phase 2A (IMPLEMENTED)
- Format & sticker count validation.
- Fixed center piece verification.
- 12 physical edge piece pairings & orientation orbit checks ($\sum \text{flips} \equiv 0 \pmod 2$).
- 8 physical corner piece triplets & twist orbit checks ($\sum \text{twists} \equiv 0 \pmod 3$).
- Permutation parity validation ($\text{sign}(\text{edges}) == \text{sign}(\text{corners})$).

### C. Solver Abstraction & Verification (`backend/solver/`) — Phase 2B (IMPLEMENTED)
- `BaseSolver` abstract base class with template lifecycle method.
- Standardized `SolutionResult`, `SolverStatus`, and `VerificationResult` models.
- Independent `SolutionVerifier` proving move sequence execution on cloned states.

### D. Kociemba Two-Phase Solver (`backend/solver/kociemba.py`) — Phase 2C (IMPLEMENTED)
- Pure-Python Herbert Kociemba Two-Phase Algorithm solver.
- Bidirectional state and move mapping (`kociemba_mapping.py`).
- Sub-second solves ($\le 21$ moves) for full 20-move scrambles.

### E. End-to-End Solver Pipeline & REST API (`backend/main.py`, `backend/solver/pipeline.py`) — Phase 2D (IMPLEMENTED)
- `SolverRegistry`: Dynamic algorithm registration and lookup.
- `SolverService`: Orchestration pipeline managing validation, execution, and verification.
- FastAPI endpoints: `POST /solve`, `POST /validate`, `GET /scramble`, `GET /`.

### F. Interactive 3D Visualization & Frontend — Phase 3 (PLANNED)
- Three.js / React 3D cube model.
- Step-by-step playback and move animation controller.

### G. Computer Vision Scanner — Phase 4 (PLANNED)
- OpenCV color recognition and camera feed facelet mapping.

## 3. Recommended Technology Stack

### Frontend (User Interface & 3D Visualization)
- **Framework**: React.js or Vue.js
- **3D Graphics**: Three.js (or React Three Fiber) for rendering the interactive Rubik's Cube model.
- **Styling**: Tailwind CSS for a modern, responsive layout.

### Backend (Logic & Computer Vision)
- **Framework**: Python with FastAPI or Flask.
- **Computer Vision**: OpenCV (cv2) for processing webcam feeds and color recognition.
- **Solving Library**: `kociemba` (Python package) for rapid move generation.

### Alternative (Fully Client-Side Web App)
If you want to avoid a backend, the entire application can be built in the browser:
- **CV**: TensorFlow.js or simple Canvas API color sampling.
- **Solver**: A JavaScript port of Kociemba's algorithm.

## 4. System Flow Diagram
1. **User Action** -> Presents scrambled cube to camera OR inputs colors manually.
2. **Input Module** -> Translates visual data into a 54-character state string.
3. **Validator** -> Checks if the string represents a valid solvable state. (If invalid, prompts user to correct it).
4. **Solving Engine** -> Takes the valid string and calculates the move sequence array (e.g., `["U", "R2", "F'", ...]`).
5. **UI / Visualization** -> Takes the move sequence and animates the 3D cube model step-by-step for the user to follow.
