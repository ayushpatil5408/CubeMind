# Rubik's Cube Solver - Edge Cases and Corner Scenarios

This document outlines potential edge cases and corner scenarios that must be handled during the implementation of the Rubik's Cube Solver, mapped directly to the modules defined in the architecture and phase-wise implementation plan.

## 1. Input Module (Computer Vision)
*   **Lighting and Environment**: 
    *   **Glare and Shadows**: Reflections on the cube stickers (especially glossy ones) or harsh shadows causing colors like Red/Orange or White/Yellow to be misclassified.
    *   **Low Light**: Colors appearing too dark to distinguish properly (e.g., Blue vs. Green).
*   **Hardware and Physical Cube Variations**:
    *   **Non-Standard Colors**: Cubes with neon colors, stickerless cubes with different plastic shades, or custom color schemes.
    *   **Worn-Out Stickers**: Scratched or peeling stickers causing contour detection to fail.
    *   **Camera Quality**: Low-resolution webcams, auto-focus hunting, or motion blur if the user moves the cube too fast.
*   **User Error during Scanning**:
    *   **Incorrect Scanning Sequence**: User scans the faces in the wrong order or accidentally scans the same face twice, missing one entirely.
    *   **Orientation Errors**: User rotates the cube incorrectly between face scans (e.g., rotating around the Z-axis instead of X or Y, causing the relative orientation of faces to be scrambled).
    *   **Partial Faces**: Showing the cube at an angle where parts of adjacent faces are visible, confusing the 3x3 grid detector.

## 2. State Validation Engine
*   **Impossible Color Distribution**: The scanned input results in an invalid number of colored stickers (e.g., 10 White stickers and 8 Yellow stickers instead of exactly 9 of each).
*   **Unsolvable Piece Orientations**:
    *   **Twisted Corner**: A single corner is physically twisted (impossible to solve using normal moves).
    *   **Flipped Edge**: A single edge piece is flipped in place (impossible to solve).
*   **Permutation Parity Errors**: Two edge pieces or two corner pieces are swapped. This happens if a cube was physically disassembled and reassembled incorrectly.
*   **Already Solved State**: The user inputs a cube that is already completely solved. The system must recognize this and gracefully inform the user without trying to calculate a move sequence.

## 3. Core Solving Algorithm (Engine)
*   **Algorithm Timeouts**: While Kociemba's algorithm is typically very fast (milliseconds), edge cases in search depth configurations could theoretically cause long calculation times. The backend needs a timeout safeguard to prevent hanging requests.
*   **Invalid State Fallback**: If an invalid state somehow bypasses the Validator and hits the solver, the solver library might crash or throw an unhandled exception. The backend must wrap solver calls in try-catch blocks and return a user-friendly error.

## 4. UI/UX and 3D Visualization
*   **Permissions Denied**: The user denies camera access in the browser. The UI must gracefully fall back to the "Manual Input Interface" and provide instructions on how to enable the camera if desired.
*   **Animation Interruptions**: The user clicks "Next Move" or "Fast Forward" while a 3D rotation animation is still actively playing. The animation controller needs to handle sequence jumping (e.g., snapping the current animation to the end before starting the next).
*   **WebGL Support & Performance**: Running the Three.js 3D model on low-end mobile devices or browsers without WebGL hardware acceleration, resulting in extremely low framerates.
*   **Responsive Canvas Resizing**: The user resizes their browser window while the 3D cube is rendered. The Three.js camera aspect ratio and renderer size must update dynamically to prevent the cube from stretching or squishing.

## 5. Network and System (If using a Backend)
*   **Network Loss**: The user loses internet connection exactly after scanning but before the solution is returned by the API. The UI should show a "Network Error" rather than hanging indefinitely.
*   **Concurrent API Requests**: (If deployed publicly) Handling a surge of users uploading cube states simultaneously to the solver endpoint.
