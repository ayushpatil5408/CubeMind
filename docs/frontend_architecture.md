# CubeMind Frontend Architecture Specification

**Status**: IMPLEMENTED (Phase 3A)  
**Framework**: React 19 + Vite 8 + Tailwind CSS v4 + Lucide Icons  
**Testing**: Vitest + React Testing Library + JSDOM

---

## 1. Overview & Architectural Goals

The CubeMind frontend is designed as a high-performance, modular Single-Page Application (SPA) providing an interactive workspace for Rubik's Cube solving, mathematical state visualization, algorithm benchmarking, and speedsolving education.

The Phase 3A architecture creates clean modular boundaries so future phases (Phase 3B Three.js 3D Canvas, Phase 3C Manual Painting, Phase 4 Computer Vision, and Phase 5 AI Coaching) can plug in seamlessly without architectural refactoring.

```text
                                  React 19 Application (App.jsx)
                                                │
                                       ┌────────┴────────┐
                                       │   CubeProvider  │ (Global State Context)
                                       └────────┬────────┘
                                                │
                       ┌────────────────────────┼────────────────────────┐
                       ▼                        ▼                        ▼
                Header / Navigation        App Layout                 Footer
                       │                        │
       ┌───────────────┼────────────────────────┼───────────────┐
       ▼               ▼                        ▼               ▼
SolverWorkspace   BenchmarkView       AlgorithmLibrary   DiagnosticsView
   ├── CubeWorkspacePlaceholder (Phase 3B 3D WebGL Hook)
   ├── ControlsPanel
   ├── SolutionPanel
   └── StateInspector
```

---

## 2. Directory Structure

```text
frontend/
├── src/
│   ├── types/
│   │   └── cube.js                   # Canonical constants, colors, face orders, status enums
│   ├── utils/
│   │   └── cubeUtils.js              # Color mapping, 54-facelet slicing, format validation, presets
│   ├── services/
│   │   └── api.js                    # Robust REST API client (getHealth, getScramble, validateState, solveCube)
│   ├── context/
│   │   └── CubeContext.jsx           # Global state manager (cube state, solution, playback, active tab)
│   ├── hooks/
│   │   └── useCubeSolver.js          # Custom hook exposing CubeContext state & actions
│   ├── components/
│   │   ├── common/                   # Reusable atomic UI elements
│   │   │   ├── Button.jsx            # Multi-variant, loading-state button
│   │   │   ├── Badge.jsx             # Status indicator pills (success, warning, error, info)
│   │   │   ├── Card.jsx              # Glassmorphic card container
│   │   │   ├── LoadingSpinner.jsx    # Glowing pulse spinner
│   │   │   ├── EmptyState.jsx        # Actionable placeholder view
│   │   │   └── ErrorState.jsx        # Structured error alert with details
│   │   ├── layout/                   # Structural page elements
│   │   │   ├── Header.jsx            # Sticky navbar with live backend connection badge
│   │   │   ├── Footer.jsx            # Status bar with architectural metadata
│   │   │   └── AppLayout.jsx         # Ambient background glow container
│   │   └── workspace/                # Domain-specific workspace components
│   │       ├── CubeWorkspacePlaceholder.jsx # Interactive 2D/isometric state visualizer
│   │       ├── ControlsPanel.jsx     # Scramble, Solve, Preset algorithm triggers
│   │       ├── SolutionPanel.jsx     # Move timeline, step playback, speed selector, copy
│   │       └── StateInspector.jsx    # 54-char inspector, color counts, format audit
│   ├── pages/
│   │   ├── SolverWorkspace.jsx       # Primary dual-column solver workspace
│   │   ├── BenchmarkView.jsx         # Frontend latency & throughput benchmark lab
│   │   ├── AlgorithmLibraryView.jsx  # Algorithm preset catalog & cheat sheet
│   │   └── DiagnosticsView.jsx       # Real-time backend health & module audit
│   ├── __tests__/                    # Automated Vitest test suites
│   │   ├── api.test.js               # API service error handling and requests
│   │   ├── cubeUtils.test.js         # Facelet slicing and format validation
│   │   ├── CubeContext.test.jsx      # Context state transitions
│   │   └── App.test.jsx              # Root render and navigation
│   ├── App.jsx                       # Root application component
│   ├── main.jsx                      # DOM mount entry point
│   ├── index.css                     # Tailwind v4 theme, glassmorphism, scrollbars
│   └── setupTests.js                 # Vitest matchers setup
├── vite.config.js                    # Vite plugins (@tailwindcss/vite, react, vitest)
└── package.json                      # Dependencies and scripts
```

---

## 3. Design System & Tokens

The application employs a curated cyberpunk / deep slate dark theme with glassmorphism panels:
- **Background**: `#080c14` (Deep obsidian slate)
- **Panels**: `rgba(15, 23, 42, 0.75)` with `backdrop-filter: blur(16px)` and `border: 1px solid rgba(255, 255, 255, 0.08)`
- **Vibrant Accents**: Cyan (`#06b6d4`), Indigo (`#6366f1`), Emerald (`#10b981`), Amber (`#eab308`), Rose (`#ef4444`)
- **Canonical Western Cube Colors**:
  - `U` (Up): `#f8fafc` (Pure White)
  - `R` (Right): `#ef4444` (Ruby Red)
  - `F` (Front): `#22c55e` (Emerald Green)
  - `D` (Down): `#eab308` (Solar Yellow)
  - `L` (Left): `#f97316` (Vibrant Orange)
  - `B` (Back): `#3b82f6` (Cobalt Blue)

---

## 4. API Communication Layer

Configured in `src/services/api.js`:
- **Base URL**: Configurable via `VITE_API_URL` (defaults to `http://localhost:8000`).
- **Error Handling**: Custom `ApiError` class capturing HTTP status codes and structured detail payloads (e.g. 400 bad format, 422 unsolvable parity error, 408 timeout).
- **Supported Endpoints**:
  - `GET /`: Health check & solver discovery
  - `GET /scramble?length=20`: WCA random scramble generation
  - `POST /validate`: Deep mathematical validation
  - `POST /solve`: Complete Kociemba Two-Phase solve & verification

---

## 5. State Management Model (`CubeContext`)

The `CubeProvider` manages:
1. `stateString`: 54-facelet canonical string tracking cube configuration.
2. `solutionResult`: Structured backend response containing moves, timing, and verification.
3. `currentStepIndex`: Active move pointer for step-by-step playback.
4. `isPlaying` & `playbackSpeed`: Auto-advancing playback timer (500ms–2000ms).
5. `activeTab`: Multi-view routing (`workspace`, `benchmark`, `algorithms`, `diagnostics`).
6. `backendHealth`: Live connection status to FastAPI.

---

## 6. Planned Phase 3B Integration

In Phase 3B, `CubeWorkspacePlaceholder` will be complemented/replaced by the **Three.js 3D WebGL Cube Component**:
- React Three Fiber / Three.js canvas rendering 27 sub-cubies.
- Real-time sticker mapping from `stateString`.
- Move rotation animations mapped directly to `currentStepIndex` transitions driven by `CubeContext`.
