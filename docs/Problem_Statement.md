# CubeMind — AI-Powered Rubik's Cube Intelligence Platform

**Project Type:** Full-Stack AI + Computer Vision + Algorithms + 3D + AR + Analytics Platform
**Primary Development Environment:** Antigravity IDE
**Primary Language:** Python + TypeScript
**Target:** Production-grade, modular, scalable portfolio project

---

# 1. Project Overview

CubeMind is an advanced Rubik's Cube intelligence platform designed to go far beyond a conventional Rubik's Cube solver.

The system shall allow users to scan, reconstruct, solve, visualize, learn, practice, analyze, and compete using Rubik's Cubes.

The application should combine:

* Advanced Rubik's Cube algorithms
* Computer vision
* 3D graphics
* Artificial intelligence
* Machine learning
* Personalized training
* Performance analytics
* Augmented reality
* Smart-cube integration
* Multiplayer functionality
* Gamification
* Developer APIs
* Plugin architecture
* Security engineering

The long-term objective is to create a complete digital ecosystem for Rubik's Cube enthusiasts ranging from absolute beginners to advanced speedcubers, while also demonstrating strong software engineering, algorithmic, AI, computer vision, cybersecurity, and system-design skills.

---

# 2. Core Vision

The core user experience should be:

```text
Physical Rubik's Cube
        ↓
Camera / Manual Input / Smart Cube
        ↓
Cube State Reconstruction
        ↓
Cube Validation
        ↓
Digital Cube Twin
        ↓
Solver Engine
        ↓
Solution Optimization
        ↓
Interactive 3D Solution
        ↓
Teaching / Training / Analytics
        ↓
AI Coach
        ↓
Long-Term Personalized Improvement
```

CubeMind should feel like a combination of:

* Rubik's Cube solver
* Digital cube simulator
* AI tutor
* Speedcubing coach
* Computer vision system
* Training platform
* Competitive platform
* Developer platform

---

# 3. Primary Objectives

The system must:

1. Solve valid Rubik's Cube configurations.
2. Detect and reconstruct cube states using a camera.
3. Validate whether a scanned/manual cube configuration is physically possible.
4. Display the cube as an interactive 3D model.
5. Provide step-by-step animated solutions.
6. Support multiple solving strategies.
7. Optimize generated solutions.
8. Explain solutions to users.
9. Analyze users' solving performance.
10. Provide personalized training.
11. Use AI to identify weaknesses and recommend improvements.
12. Support competitive solving.
13. Support future AR-based solving.
14. Support future Bluetooth/smart-cube integration.
15. Provide APIs for developers.
16. Support an extensible plugin system.
17. Maintain strong security and privacy.
18. Be highly modular, testable, maintainable, and scalable.

---

# 4. Target Users

## 4.1 Beginners

Users who have never solved a Rubik's Cube.

They should receive:

* Simple instructions
* Visual guidance
* Beginner algorithms
* Voice guidance
* Step-by-step explanations
* Error detection
* Practice exercises

## 4.2 Intermediate Cubers

Users who know basic solving methods.

They should receive:

* CFOP training
* F2L practice
* OLL practice
* PLL practice
* Performance analytics
* Personalized drills

## 4.3 Speedcubers

Advanced users should receive:

* Kociemba solutions
* Move optimization
* TPS analysis
* Lookahead analysis
* Recognition analysis
* Advanced statistics
* Competitive leaderboards

## 4.4 Developers / Researchers

They should receive:

* Solver APIs
* Plugin architecture
* Benchmarking tools
* Solver Lab
* Algorithm comparison
* Experimental AI solver support

---

# 5. Functional Requirements

# 5.1 Cube Core Engine

The system must have an independent cube engine.

It must support:

* Cube state representation
* Face representation
* Sticker representation
* Cubie representation where appropriate
* Cube initialization
* Cube reset
* Cube cloning
* Cube comparison
* Move execution
* Move reversal
* Algorithm execution
* Scramble generation
* Solved-state detection
* State serialization
* State deserialization
* Cube validation

Supported notation should include standard moves such as:

```text
U
D
L
R
F
B

U'
D'
L'
R'
F'
B'

U2
D2
L2
R2
F2
B2
```

The architecture should be extensible for:

* Wide moves
* Slice moves
* Cube rotations
* 2x2
* 4x4
* Future cube sizes

The Cube Engine must remain independent from the frontend.

---

# 5.2 Cube Validation Engine

The application must never blindly attempt to solve an invalid cube.

Validation should detect:

* Incorrect color count
* Missing colors
* Duplicate colors
* Invalid center configuration
* Invalid edge configuration
* Invalid corner configuration
* Impossible parity where applicable
* Impossible permutation
* Impossible orientation
* Invalid cube state

The user should receive meaningful explanations.

Example:

```text
Invalid Cube

Reason:
Blue stickers detected: 10
Expected: 9

Please rescan the blue face.
```

---

# 5.3 Scramble Generator

Implement a reliable scramble generator.

It should support:

* Random scrambles
* Configurable scramble length
* Competition-style 3x3 scrambles
* Training scrambles
* Personalized AI-generated scrambles
* Future support for other cube sizes

The scramble generator must avoid unnecessary redundant moves.

---

# 5.4 Solver Engine

The architecture must support multiple independent solvers.

Initial solver modules:

### Beginner Solver

Focus:

* Layer-by-layer solving
* Easy-to-understand instructions

### CFOP

Support conceptual and algorithmic stages:

* Cross
* F2L
* OLL
* PLL

### Kociemba Two-Phase Solver

Implement or integrate a reliable two-phase solver capable of generating highly efficient solutions.

### Experimental Solver

Provide an isolated interface for:

* IDA*
* Pattern databases
* Genetic algorithms
* Reinforcement learning
* Other experimental approaches

All solvers must expose a common interface.

Example conceptual interface:

```text
solve(cube_state) -> solution
```

The frontend must not depend directly on the internal implementation of a solver.

---

# 5.5 Solution Optimization

The system must be able to optimize solutions.

Optimization objectives should include:

* Minimum move count
* Human-friendly solution
* Fast execution
* Algorithm simplicity
* Reduced rotations
* Reduced unnecessary moves

The system should allow comparison:

```text
Shortest Solution
Fastest Solution
Easiest Solution
AI Recommended Solution
```

---

# 5.6 Solver Benchmarking

Create a Solver Lab.

It should compare:

* Solver name
* Move count
* Execution time
* Memory usage where practical
* Solution quality
* Number of cube states explored
* Average performance over multiple scrambles

Example:

```text
Solver              Moves      Time

Kociemba             22        3.4 ms
CFOP                 27        2.1 ms
Beginner             68        0.9 ms
Experimental AI      24        8.7 ms
```

Benchmark results should be reproducible.

---

# 5.7 What-If Cube Simulator

Users should be able to branch from the current cube state.

Example:

```text
Current State
      |
      +---- Branch A
      |       R U R'
      |
      +---- Branch B
      |       F R U
      |
      +---- Branch C
              Custom Algorithm
```

Users must be able to:

* Create branches
* Compare states
* Return to previous states
* Replay moves
* Delete branches

---

# 6. Computer Vision System

The computer vision subsystem is one of the primary differentiating features.

# 6.1 Camera Scanner

Users should be able to scan their physical cube using:

* Webcam
* Laptop camera
* Mobile camera where supported

The scanner should guide the user through the six faces.

---

# 6.2 Sticker Detection

The system should detect:

* Cube boundaries
* Individual stickers
* Sticker centers
* Face orientation

Computer vision should be robust against reasonable variations in:

* Lighting
* Camera angle
* Reflections
* Shadows
* Backgrounds

---

# 6.3 Color Classification

Detect:

* White
* Yellow
* Red
* Orange
* Blue
* Green

The architecture should allow different color calibration profiles.

---

# 6.4 Scan Quality Detection

The scanner should detect problems such as:

```text
Lighting too low
Camera too close
Face partially hidden
Motion blur detected
Sticker confidence too low
Red/Orange classification uncertain
```

The user should receive actionable instructions.

---

# 6.5 Automatic Cube Reconstruction

After scanning all faces, construct the complete cube state.

The system must:

1. Detect all stickers.
2. Classify colors.
3. Determine face orientation.
4. Map stickers to cube positions.
5. Construct cube state.
6. Validate the state.
7. Request rescans if necessary.

---

# 7. Real-Time Solve Tracking

A future advanced subsystem should use computer vision to track the user's physical solve.

It should attempt to estimate:

* Face turns
* Cube rotations
* Pause duration
* Move sequence
* Solve duration
* Recognition delay
* Execution delay

This information should feed the analytics system.

---

# 8. 3D Cube Visualization

The application must contain a high-quality interactive 3D Rubik's Cube.

Technology:

* React
* TypeScript
* Three.js

The 3D cube must support:

* Rotation
* Zoom
* Pan
* Face highlighting
* Move animations
* Solution playback
* Previous/next move
* Pause
* Resume
* Speed control
* Reset
* Scramble visualization

The visual cube must always remain synchronized with the canonical Cube Engine state.

The 3D renderer must never become the source of truth for cube state.

---

# 9. Digital Twin

Create a persistent digital representation of the user's physical cube.

The Digital Twin should store:

* Current state
* Initial state
* Scramble
* Move history
* Orientation
* Solution
* Scan information
* Timestamp

The Digital Twin should be usable by:

* Solver
* 3D renderer
* AI
* Training engine
* Analytics
* AR
* Smart-cube integration

---

# 10. Interactive Teaching Mode

Create a guided solving mode.

Each step should display:

```text
Step 7 / 42

Move:
R'

Instruction:
Rotate the right face counter-clockwise.

[Previous] [Next] [Pause]
```

The system should highlight the appropriate face on the 3D cube.

Teaching modes:

### Beginner

Detailed explanations.

### Intermediate

Short explanations and hints.

### Advanced

Algorithm-focused.

### Speed Cuber

Focus on:

* Recognition
* Execution
* Lookahead
* TPS
* Efficiency

---

# 11. Voice Guidance

Support optional voice instructions.

Examples:

```text
"Rotate the right face clockwise."

"Good. Now perform U."

"Your cube orientation appears incorrect."
```

Voice functionality must be optional and privacy-conscious.

---

# 12. Solve Replay

Every tracked or manually recorded solve should optionally have a replay.

Support:

* Play
* Pause
* Previous
* Next
* 0.25x
* 0.5x
* 1x
* 2x
* 4x

Replay should synchronize:

* 3D cube
* Move list
* Timer
* Analytics markers

---

# 13. AI Cube Coach

The AI Coach is a major feature.

It should analyze solve data and provide recommendations.

Example:

```text
Your average F2L time is 17.8 seconds.

Your recognition delay contributes approximately 2.8 seconds.

Recommendation:
Practice F2L lookahead and reduce pauses between pair recognition and execution.
```

The AI must provide explanations for recommendations.

It must not invent statistics.

Recommendations should be grounded in actual recorded user data.

---

# 14. Explainable AI

AI recommendations should expose the reasoning behind them.

For example:

```text
Recommendation:
Practice PLL recognition.

Why?

- PLL recognition average: 3.2 sec
- Target benchmark: 1.5 sec
- Recognition accounts for 14% of your average solve time.
```

The system should distinguish:

* Observed data
* Calculated metrics
* AI-generated recommendations

---

# 15. Personalized Learning

The system should build a user performance profile.

Possible dimensions:

* Speed
* Efficiency
* Recognition
* Execution
* Consistency
* Accuracy
* Cross
* F2L
* OLL
* PLL

The profile should dynamically update after solves.

---

# 16. Adaptive Training

Training should not rely only on random scrambles.

The system should identify weaknesses and generate targeted practice.

Example:

```text
Weakness:
OLL recognition

Training recommendation:
10 OLL recognition exercises
5 timed solves
```

Training difficulty should adapt over time.

---

# 17. Daily Training System

Provide:

* Daily challenges
* Daily drills
* Timed solves
* Technique exercises
* Personalized practice
* Training streaks

Example:

```text
TODAY'S TRAINING

5 Cross drills
10 F2L cases
10 OLL cases
10 PLL cases
5 timed solves
```

---

# 18. Blind Solve Mode

Support training for:

* Blind solving
* Memory
* Recall
* Recognition

The application should support configurable blind-solving exercises.

---

# 19. Performance Analytics

Track:

* Solve time
* Average of 5
* Average of 12
* Best solve
* Move count
* TPS
* Pause duration
* Recognition time
* Execution time
* Cross time
* F2L time
* OLL time
* PLL time
* Consistency
* Improvement rate

Provide visual dashboards.

---

# 20. Solve Prediction

After sufficient historical data, estimate likely future performance.

Example:

```text
Current average: 31.2 seconds

Projected:
30 seconds → approximately 2 weeks
25 seconds → approximately 2 months
20 seconds → longer-term target
```

Predictions must clearly be labeled as estimates.

---

# 21. CubeMind Intelligence Score

Create a proprietary performance score.

Example:

```text
CUBEMIND SCORE

Speed          82
Efficiency     76
Recognition    91
Execution      84
Consistency    73
Accuracy       98

Overall        84 / 100
```

The scoring methodology must be documented.

---

# 22. Gamification

Implement:

* XP
* Levels
* Achievements
* Badges
* Streaks
* Milestones
* Personal records

Example achievements:

```text
First Solve
Under 60 Seconds
Under 45 Seconds
Under 30 Seconds
100 Solves
7-Day Streak
100-Day Streak
```

---

# 23. User Profiles

Profiles should contain:

* Username
* Avatar
* Statistics
* Personal records
* Achievements
* Training history
* Solve history
* CubeMind score

Privacy settings must be provided.

---

# 24. Competitive Platform

Create:

* Leaderboards
* Friends
* 1v1 battles
* Best-of-3
* Best-of-5
* Tournaments
* College rankings
* Country rankings
* Global rankings

Competitive features should be introduced only after the core solving system is reliable.

---

# 25. Solve Verification

For competitive solves, provide an optional verification system.

Possible verification signals:

* Camera recording
* Continuous session
* Correct scramble
* Valid initial cube state
* Valid final cube state
* Move consistency
* No unexplained cube replacement

The system should classify results as:

```text
Verified
Unverified
Review Required
```

No verification system should claim perfect cheating detection.

---

# 26. Anti-Cheat

Design an anti-abuse system using:

* Server-side validation
* Timestamp validation
* Session integrity
* Rate limiting
* Suspicious solve detection
* Duplicate submission detection
* Camera evidence where enabled

False positives must be handled carefully.

---

# 27. Multiplayer

Future functionality:

* Real-time 1v1
* Matchmaking
* Private rooms
* Friends
* Spectator mode
* Rematches

Use a scalable real-time communication architecture.

---

# 28. Tournament System

Support:

* Tournament creation
* Registration
* Brackets
* Seeding
* Match results
* Leaderboards
* Verification
* Tournament history

---

# 29. AR Assistance

Future mobile/AR functionality should allow users to point a camera at a physical cube and receive visual guidance.

Example:

```text
Physical Cube
     ↓
Camera
     ↓
AR Overlay

       ↻
     TURN R
```

AR must remain a separate module so it does not complicate the core system.

---

# 30. Smart Cube Integration

Future support for Bluetooth-enabled cubes.

The system should be capable of receiving:

* Move events
* Timestamps
* Cube state
* Orientation
* Solve duration

Smart cube integration must communicate with the Cube Engine through a well-defined adapter interface.

---

# 31. Natural Language Assistant

Users should be able to ask questions such as:

```text
"Why was this solve slow?"

"Show me the shortest solution."

"What does R U R' U' do?"

"Give me a beginner solution."

"Create a training session for my F2L weakness."
```

The assistant must use actual CubeMind data when answering user-specific questions.

---

# 32. Solver Research Lab

Create an advanced research environment for developers and researchers.

Allow experimentation with:

* Kociemba
* IDA*
* Pattern databases
* Heuristics
* Genetic algorithms
* Reinforcement learning
* Experimental AI solvers

Provide benchmarking and reproducibility.

---

# 33. Cube Knowledge Graph

Create an extensible knowledge representation connecting:

```text
Cube State
    ↓
Case
    ↓
Algorithm
    ↓
Moves
    ↓
Training Exercise
    ↓
Performance Issue
    ↓
Recommendation
```

This should be implemented only after the core system is stable.

---

# 34. Developer API

Provide a documented API.

Example conceptual endpoint:

```text
POST /api/v1/solve
```

Request:

```json
{
  "cube_state": "..."
}
```

Response:

```json
{
  "solution": "R U R' U'",
  "move_count": 4,
  "solver": "kociemba"
}
```

API versions must be explicitly versioned.

---

# 35. Plugin Architecture

The architecture should allow future plugins such as:

```text
Solver Plugins
Training Plugins
Visualization Plugins
AI Plugins
Cube Plugins
Analytics Plugins
```

Plugins must not be able to arbitrarily modify protected core state.

---

# 36. Security Requirements

Security must be designed from the beginning.

Implement where applicable:

* Secure password hashing
* Authentication
* Authorization
* Session management
* Input validation
* API validation
* Rate limiting
* CORS configuration
* Security headers
* Secure database access
* SQL injection prevention
* XSS protection
* CSRF protection where applicable
* Audit logging
* Abuse detection
* Secret management
* Environment variables
* No hardcoded credentials
* Privacy controls

Do not store sensitive information unnecessarily.

---

# 37. Privacy Requirements

Users must be informed about:

* Camera usage
* Data collection
* Solve history
* Analytics
* AI processing
* Public profile information
* Competitive verification

Camera processing should preferably occur locally where technically practical.

Users should be able to delete their account and associated personal data.

---

# 38. Technology Stack

## Frontend

* React
* TypeScript
* Three.js
* Modern CSS/UI framework as appropriate

## Backend

* Python
* FastAPI
* Pydantic

## Database

* PostgreSQL

## Computer Vision

* OpenCV
* Python

## Machine Learning

* scikit-learn initially
* architecture should allow future PyTorch/deep-learning integration

## Real-Time

* WebSockets where appropriate

## Authentication

* Secure token/session architecture

## Testing

* pytest
* frontend unit/integration testing

## DevOps

* Docker
* Docker Compose
* Git
* GitHub Actions

## Deployment

Architecture should support deployment of frontend, backend, database, and optional AI/CV services independently.

---

# 39. Recommended Repository Structure

The project should evolve toward:

```text
CubeMind/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── cube/
│   │   ├── scanner/
│   │   ├── dashboard/
│   │   ├── training/
│   │   └── services/
│   └── tests/
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── services/
│   │   ├── auth/
│   │   └── core/
│   └── tests/
│
├── core/
│   ├── cube/
│   ├── notation/
│   ├── validation/
│   └── serialization/
│
├── solvers/
│   ├── beginner/
│   ├── cfop/
│   ├── kociemba/
│   ├── experimental/
│   ├── optimizer/
│   └── benchmark/
│
├── computer_vision/
│   ├── scanner/
│   ├── color_detection/
│   ├── reconstruction/
│   └── tracking/
│
├── ai/
│   ├── coach/
│   ├── analytics/
│   ├── prediction/
│   └── recommendations/
│
├── training/
│   ├── drills/
│   ├── adaptive/
│   ├── blind/
│   └── challenges/
│
├── multiplayer/
│
├── ar/
│
├── smart_cube/
│
├── api/
│
├── plugins/
│
├── tests/
│
├── docs/
│
├── scripts/
│
├── docker/
│
├── .github/
│   └── workflows/
│
├── .env.example
├── .gitignore
├── README.md
├── CONTRIBUTING.md
├── LICENSE
└── problemstatement.md
```

The exact structure may evolve after architecture review.

Do not create empty modules merely to match this structure. Create modules when they become necessary.

---

# 40. Architectural Principles

The following rules are mandatory.

## Principle 1 — Single Source of Truth

The Cube Engine owns the canonical cube state.

The 3D renderer, AI, scanner, solver, and other systems must not maintain conflicting authoritative cube states.

## Principle 2 — Separation of Concerns

Keep:

* UI
* Cube mathematics
* Solvers
* Computer vision
* AI
* Database
* Authentication

as separate concerns.

## Principle 3 — Testability

Every major component must be testable independently.

## Principle 4 — Extensibility

Future functionality must be addable without rewriting the entire application.

## Principle 5 — Security by Design

Security must not be postponed until the final phase.

## Principle 6 — No Fake Features

Do not create mock AI, fake computer vision, fake solver results, or simulated competitive verification and present them as production functionality.

If a feature is not implemented, label it clearly as:

```text
Planned
Prototype
Experimental
```

## Principle 7 — Real Data

AI recommendations and analytics must be based on actual recorded data.

## Principle 8 — No Premature Complexity

Do not implement AR, multiplayer, smart-cube integration, or advanced AI before the core system is stable.

---

# 41. Development Methodology

CubeMind must be developed incrementally.

Each phase follows:

```text
Plan
 ↓
Implement
 ↓
Unit Tests
 ↓
Integration Tests
 ↓
Manual Testing
 ↓
Performance Testing
 ↓
Documentation
 ↓
Git Commit
 ↓
Next Phase
```

Never implement the entire platform in one operation.

---

# 42. Development Phases

## Phase 0 — Architecture

Create:

* Technical architecture
* Requirements
* Module boundaries
* Data flow
* API contracts
* Development standards

No major application implementation yet.

## Phase 1 — Cube Core

Build:

* Cube state
* Move engine
* Notation parser
* Scramble generator
* Validation
* Serialization
* Tests

## Phase 2 — Solver Engine

Build:

* Solver interface
* Beginner solver
* Kociemba
* Solver tests

## Phase 3 — Optimization

Build:

* Move optimizer
* Solver comparison
* Benchmarking
* Solver Lab foundation

## Phase 4 — 3D Application

Build:

* React
* Three.js
* Interactive cube
* Animations
* Solution playback

## Phase 5 — Computer Vision

Build:

* Camera scanner
* Sticker detection
* Color classification
* Cube reconstruction
* Scan validation

## Phase 6 — Backend

Build:

* FastAPI
* PostgreSQL
* API layer
* User accounts
* Solve history

## Phase 7 — Security

Build:

* Authentication
* Authorization
* Rate limiting
* Validation
* Security headers
* Audit logging
* Privacy controls

## Phase 8 — Training & Analytics

Build:

* Dashboards
* Solve statistics
* Training
* Daily challenges
* Adaptive training

## Phase 9 — AI

Build:

* AI Coach
* Explainable recommendations
* Weakness detection
* Prediction
* Natural-language assistant

## Phase 10 — Community

Build:

* Profiles
* XP
* Achievements
* Leaderboards
* Battles
* Tournaments

## Phase 11 — Advanced Hardware/AR

Build:

* AR
* Smart cube
* Real-time tracking

## Phase 12 — Developer Platform

Build:

* Public API
* Plugin system
* Knowledge graph
* Research Lab

## Phase 13 — Production

Build:

* Docker
* CI/CD
* Monitoring
* Logging
* Performance optimization
* Security audit
* Deployment

---

# 43. Testing Strategy

Testing must exist at multiple levels.

## Unit Tests

Test:

* Cube operations
* Move parsing
* Validation
* Solver components
* Algorithms
* Analytics calculations

## Integration Tests

Test:

```text
Scanner → Cube Engine
Cube Engine → Solver
Solver → Backend
Backend → Database
Backend → Frontend
```

## End-to-End Tests

Test complete workflows:

```text
Scan cube
 ↓
Validate
 ↓
Solve
 ↓
Visualize
 ↓
Record solve
 ↓
Analyze
```

## Security Tests

Test:

* Authentication
* Authorization
* Invalid input
* Rate limits
* API abuse
* Injection attempts
* Session security

---

# 44. Performance Requirements

The core cube engine should be lightweight and fast.

Solver performance must be benchmarked.

Computer vision should provide useful feedback without unnecessary latency.

The frontend should maintain smooth 3D rendering.

Do not optimize prematurely.

Measure before optimizing.

---

# 45. Documentation Requirements

Maintain documentation throughout development.

At minimum:

```text
docs/
├── architecture.md
├── cube-engine.md
├── solver-engine.md
├── computer-vision.md
├── ai-system.md
├── api.md
├── security.md
├── database.md
├── testing.md
├── deployment.md
└── contributing.md
```

Documentation should describe actual implemented behavior.

---

# 46. Git & Version Control

Use Git from the beginning.

Commit examples:

```text
chore: initialize project
docs: add system architecture
feat: implement cube state engine
feat: implement move notation
test: add cube engine tests
feat: add cube validation
feat: implement solver interface
feat: integrate kociemba solver
feat: add 3d cube renderer
```

Avoid huge commits containing unrelated changes.

---

# 47. Antigravity Development Rules

Antigravity is the primary development environment.

However, Antigravity must NOT attempt to build the entire platform at once.

For every development task:

1. Read `problemstatement.md`.
2. Read relevant architecture documentation.
3. Identify affected modules.
4. Explain the implementation plan.
5. Implement only the requested scope.
6. Avoid modifying unrelated modules.
7. Write/update tests.
8. Run tests.
9. Report failures honestly.
10. Update documentation when necessary.
11. Summarize files changed.
12. Wait for approval before moving to the next major module.

Do not silently rewrite working architecture.

Do not remove tests simply to make them pass.

Do not disable validation.

Do not introduce dependencies without justification.

Do not hardcode secrets.

Do not create fake implementations for planned functionality.

---

# 48. AI Coding Agent Rules

AI-generated code must be treated as code requiring review.

For every substantial implementation:

```text
Understand
Plan
Implement
Test
Review
Benchmark
Document
Commit
```

AI must clearly identify:

* assumptions
* limitations
* TODOs
* experimental features
* unverified behavior

---

# 49. MVP Definition

The first usable version of CubeMind should contain:

1. Manual cube input
2. Cube validation
3. Scramble generator
4. Reliable solver
5. Move notation
6. Solution optimizer
7. Interactive 3D cube
8. Step-by-step solution
9. Solution playback
10. Basic solve statistics

Only after this MVP is stable should advanced features be introduced.

---

# 50. Long-Term Definition of Done

CubeMind will be considered a mature platform when it provides:

```text
Manual Input
       +
Camera Scanning
       +
Cube Validation
       +
Multiple Solvers
       +
Optimization
       +
3D Visualization
       +
Digital Twin
       +
AI Coaching
       +
Adaptive Training
       +
Analytics
       +
Gamification
       +
Competition
       +
AR
       +
Smart Cube
       +
Developer API
       +
Plugin System
       +
Security
       +
Testing
       +
CI/CD
       +
Production Deployment
```

---

# 51. Initial Task for Antigravity

IMPORTANT:

Do NOT begin implementing the complete application after reading this document.

The first task is to perform a technical architecture review.

Create:

```text
docs/architecture.md
```

The architecture document must contain:

1. System architecture
2. Module boundaries
3. Data flow
4. Technology decisions
5. Repository structure
6. Cube state representation strategy
7. Solver interface
8. Computer vision interface
9. AI interface
10. Database strategy
11. API strategy
12. Authentication strategy
13. Security architecture
14. Testing architecture
15. Deployment architecture
16. Phase-by-phase implementation strategy
17. Technical risks
18. Recommended mitigation strategies

Before implementing Phase 1, verify that the architecture does not create circular dependencies and that the Cube Engine remains independent from the frontend.

The Cube Engine must be treated as the foundational component of the entire platform.

---

# 52. Success Criteria

CubeMind should ultimately demonstrate strong capability in:

* Data structures
* Algorithms
* Search algorithms
* Optimization
* Computer vision
* AI/ML
* 3D graphics
* Full-stack development
* API design
* Database design
* Security
* Testing
* DevOps
* System architecture
* Product design

The project should be suitable for:

* GitHub portfolio
* Resume
* Internship applications
* Hackathons
* Technical demonstrations
* College projects
* Software engineering interviews
* AI/ML demonstrations
* Cybersecurity-oriented portfolio discussions

---

# 53. Final Product Philosophy

CubeMind should not be built merely to demonstrate that a computer can solve a Rubik's Cube.

It should demonstrate how multiple areas of modern software engineering can work together to create an intelligent product.

The fundamental philosophy is:

> **Scan it. Understand it. Solve it. Explain it. Teach it. Analyze it. Improve it. Compete with it. Extend it.**

The application should be ambitious, technically rigorous, visually impressive, secure, modular, explainable, and continuously extensible.

---

# 54. First Development Milestone

The immediate milestone is NOT to build all features.

The immediate milestone is:

```text
problemstatement.md
        ↓
architecture.md
        ↓
repository initialization
        ↓
development standards
        ↓
Cube Core Engine
        ↓
tests
        ↓
solver
```

Every subsequent feature must build on a stable foundation.

**Start with architecture. Build with discipline. Test everything. Never sacrifice correctness for feature count.**
