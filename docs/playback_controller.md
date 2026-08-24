# Solver Move Animation Playback Controller Specification

**Status**: IMPLEMENTED (Phase 3D)  
**Scope**: 3D Move Animation Engine, Canonical Move Engine, Playback State Machine, and Interactive Solution Timeline

---

## 1. Overview & Objectives

Phase 3D establishes a high-performance, deterministic move animation and playback controller for CubeMind. The system allows users to animate solver-generated solutions or custom move algorithms on the 3D WebGL cube with mathematical precision and fluid layer rotations.

### Core Capabilities
* **Full Standard Move Set**: Supports all 18 standard moves ($U, D, L, R, F, B$, prime `'`, double `2`).
* **Deterministic Move Engine**: Pure JavaScript canonical move transformation (`cubeMoveEngine.js`) identical to the backend Python engine.
* **Timeline Precomputation**: Calculates state snapshots $[S_0, S_1, \dots, S_N]$ ahead of time, ensuring $O(1)$ state lookups, jump-to-step, and drift-free step backward.
* **Smooth R3F 3D Layer Rotations**: Segregates affected 9 cubies into an active rotation group pivoting around $(0, 0, 0)$ with cubic ease-in-out interpolation.
* **Atomic State Commitment**: Resets layer rotation to 0 upon animation completion and simultaneously commits the canonical state string.
* **Playback State Machine**: Tracks `IDLE`, `READY`, `PLAYING`, `PAUSED`, `COMPLETED`, and `ERROR` states.
* **Multi-Speed Presets**: Configurable animation durations: `0.5x` (650ms), `1.0x` (380ms), `1.5x` (240ms), `2.0x` (140ms).

---

## 2. Architecture & Data Flow

```
                     ┌───────────────────────────┐
                     │   Solver API Response     │
                     │  (moves: ["R", "U", ...]) │
                     └─────────────┬─────────────┘
                                   │
                                   ▼
                     ┌───────────────────────────┐
                     │   computeStateTimeline    │
                     │    [S0, S1, S2, ..., SN]  │
                     └─────────────┬─────────────┘
                                   │
                                   ▼
         ┌───────────────────────────────────────────────────┐
         │       Playback Controller (CubeContext)           │
         │  - playbackStatus: READY | PLAYING | PAUSED | ... │
         │  - currentStepIndex: -1 (S0) .. N-1 (SN)          │
         │  - activeAnimation: { move, axis, angle, ... }    │
         └─────────────┬───────────────────────┬─────────────┘
                       │                       │
                       ▼                       ▼
         ┌────────────────────────┐  ┌───────────────────────┐
         │    3D Canvas (R3F)     │  │ 2D Net & Inspector    │
         │ - useFrame smooth rot  │  │ - Synchronized state  │
         │ - Layer group rotation │  │ - Interactive timeline│
         │ - onComplete() commit  │  │ - Step-by-step audit  │
         └────────────────────────┘  └───────────────────────┘
```

---

## 3. Move-to-3D Geometric Mapping

| Move | Rotation Axis | Layer Coordinate | Target Angle (rad) | Description |
| :--- | :--- | :--- | :--- | :--- |
| **R** | $+X$ | $x = +1$ | $-\pi/2$ ($-90^\circ$) | Right face clockwise |
| **R'** | $+X$ | $x = +1$ | $+\pi/2$ ($+90^\circ$) | Right face counter-clockwise |
| **R2** | $+X$ | $x = +1$ | $-\pi$ ($-180^\circ$) | Right face 180° |
| **L** | $+X$ | $x = -1$ | $+\pi/2$ ($+90^\circ$) | Left face clockwise |
| **L'** | $+X$ | $x = -1$ | $-\pi/2$ ($-90^\circ$) | Left face counter-clockwise |
| **L2** | $+X$ | $x = -1$ | $+\pi$ ($+180^\circ$) | Left face 180° |
| **U** | $+Y$ | $y = +1$ | $-\pi/2$ ($-90^\circ$) | Up face clockwise |
| **U'** | $+Y$ | $y = +1$ | $+\pi/2$ ($+90^\circ$) | Up face counter-clockwise |
| **U2** | $+Y$ | $y = +1$ | $-\pi$ ($-180^\circ$) | Up face 180° |
| **D** | $+Y$ | $y = -1$ | $+\pi/2$ ($+90^\circ$) | Down face clockwise |
| **D'** | $+Y$ | $y = -1$ | $-\pi/2$ ($-90^\circ$) | Down face counter-clockwise |
| **D2** | $+Y$ | $y = -1$ | $+\pi$ ($+180^\circ$) | Down face 180° |
| **F** | $+Z$ | $z = +1$ | $-\pi/2$ ($-90^\circ$) | Front face clockwise |
| **F'** | $+Z$ | $z = +1$ | $+\pi/2$ ($+90^\circ$) | Front face counter-clockwise |
| **F2** | $+Z$ | $z = +1$ | $-\pi$ ($-180^\circ$) | Front face 180° |
| **B** | $+Z$ | $z = -1$ | $+\pi/2$ ($+90^\circ$) | Back face clockwise |
| **B'** | $+Z$ | $z = -1$ | $-\pi/2$ ($-90^\circ$) | Back face counter-clockwise |
| **B2** | $+Z$ | $z = -1$ | $+\pi$ ($+180^\circ$) | Back face 180° |

---

## 4. Playback State Machine

```
              ┌────────────────┐
              │      IDLE      │
              └───────┬────────┘
                      │ (Solution Loaded)
                      ▼
              ┌────────────────┐ ◄──────────┐
   ┌─────────►│     READY      │            │
   │          └───────┬────────┘            │
   │ (Reset)          │ (Play / Next)       │ (Reset)
   │                  ▼                     │
   │          ┌────────────────┐            │
   ├──────────┤    PLAYING     │────────────┤
   │          └───────┬────────┘            │
   │ (Reset)          │ (Pause / Step)      │
   │                  ▼                     │
   │          ┌────────────────┐            │
   ├──────────┤     PAUSED     │            │
   │          └───────┬────────┘            │
   │                  │ (All moves done)    │
   │                  ▼                     │
   │          ┌────────────────┐            │
   └──────────┤   COMPLETED    │────────────┘
              └────────────────┘
```

### State Definitions
* **`IDLE`**: No active solution loaded. Workspace ready for editing or scrambling.
* **`READY`**: Solution computed, timeline initialized at initial state $S_0$ (step index $-1$).
* **`PLAYING`**: Solution moves are actively playing with smooth animated layer turns.
* **`PAUSED`**: Playback paused at intermediate step $i$; user can inspect, step forward, or step backward.
* **`COMPLETED`**: Final move finished; cube is confirmed canonical solved.
* **`ERROR`**: Solve or parsing error occurred.

---

## 5. Safe Step Backward Strategy

Rather than computing floating-point inverse rotations on 3D meshes, the controller employs **Timeline Snapshotting**:
1. When a solution of length $N$ is loaded, `computeStateTimeline` generates the exact canonical states $[S_0, S_1, \dots, S_N]$.
2. For step backward from step index $i$:
   - Target index becomes $i - 1$.
   - The canonical state string is restored to $S_{i}$ (which equals $S_0$ when stepping back from step 0).
   - This eliminates cumulative numerical rounding errors and guarantees exact reversibility.

---

## 6. Speed Control Presets

| Speed Preset | Move Duration | Real-World Feel |
| :--- | :--- | :--- |
| **0.5x (Slow)** | 650 ms | Educational & detailed visual inspection |
| **1.0x (Normal)** | 380 ms | Natural human speed |
| **1.5x (Fast)** | 240 ms | Speedcubing fluid animation |
| **2.0x (Turbo)** | 140 ms | Rapid verification |

---

## 7. Known Limitations & Next Steps

1. **Computer Vision Scanning**: Camera feed capture and color recognition will be implemented in Phase 4.
