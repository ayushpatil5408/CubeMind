# Rubik's Cube Solver - System Architecture

Since the `Problem_Statement.md` was empty, I have generated a comprehensive architecture for a standard Rubik's Cube Solver application. This architecture supports both automated camera-based scanning and manual input, alongside a 3D visualization of the solution.

## 1. High-Level Overview
The system is designed to take the current state of a scrambled Rubik's Cube as input, process the state to ensure it's valid, compute the optimal sequence of moves to solve it, and present the solution to the user in an interactive format.

## 2. Core Modules

### A. Input & State Capture
1. **Computer Vision (CV) Module**: 
   - Uses a camera feed to detect the colors of the Rubik's Cube faces.
   - Applies image processing (color thresholding, contour detection) to map the 9 stickers on each of the 6 faces.
2. **Manual Input Interface**: 
   - A fallback UI where users can manually click and paint the colors onto a 2D net of the cube.

### B. State Representation & Validation
- **State Model**: Maps the detected colors to a standard notation (e.g., UDFBLR format string of 54 characters).
- **Validation Engine**: Ensures the captured state is physically possible:
  - Correct number of colors (9 of each).
  - Valid corner and edge piece orientations (checks for flipped edges/twisted corners).
  - Permutation parity check to ensure the cube can be solved without disassembling it.

### C. Solving Engine (Algorithmic Core)
- **Primary Algorithm (Kociemba's Two-Phase Algorithm)**: Finds an optimal or near-optimal solution, typically in 20 moves or less.
- **Secondary Algorithm (CFOP / Layer-by-Layer)**: Optional module that provides a human-readable, step-by-step solution for beginners who want to learn how to solve it themselves rather than just getting the fastest solution.

### D. Output & Visualization
- **3D Render Engine**: Displays an interactive 3D model of the Rubik's Cube.
- **Animation Controller**: Animates the sequence of moves (e.g., U, R', F2) required to solve the cube, allowing the user to play, pause, and step through the solution at their own pace.

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
