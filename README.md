# CubeMind — Next-Generation Rubik's Cube Intelligence Platform

CubeMind is a high-performance, full-stack Rubik's Cube solving and intelligence suite powered by the Kociemba Two-Phase IDA* algorithm, client-side computer vision scanning, an AI solution coach, move optimization engine, and a 3D animated playback visualizer.

---

## 🌟 Key Features

- **Optimal Solving Engine**: Kociemba Two-Phase algorithm solving any valid cube state in $< 20\text{ moves}$ and $< 20\text{ ms}$.
- **Mathematical Validation Gate**: Deep physical parity, edge/corner orbit, and sticker distribution validation before search.
- **Move Optimization & Reduction**: Modular arithmetic ($\pmod 4$) redundant turn cancellation and formal state-equivalence verification.
- **AI Solution Coach**: Real-time explainable step-by-step guidance, ergonomic finger-trick hints, and trigger recognition (*Sexy Move*, *Sune*, *Anti-Sune*, *T-Perm*).
- **Interactive 3D Visualizer**: Real-time Three.js cube simulation with animated layer rotations, speed presets ($0.5\times$ to $2.0\times$), and step-by-step playback.
- **Computer Vision Scanning**: Camera reticle face capture, 3×3 grid estimation, center-calibrated color classification, and 9-count global balancing.
- **Tactile Practice Mode**: Step-by-step manual physical drill mode with stopwatch timing, pace analytics, and keyboard shortcuts.
- **Privacy-First Session History**: Local storage of recent 50 solves and practice sessions with corrupted data recovery.

---

## 🚀 Quick Start with Docker

Run the entire full-stack application with a single command:

```bash
docker compose up --build
```

- **Frontend Application**: `http://localhost`
- **Backend API**: `http://localhost:8000`
- **API Interactive Docs**: `http://localhost:8000/docs`

---

## 🛠️ Local Development Setup

### 1. Backend Service (Python 3.11+ / FastAPI)

```bash
cd backend
python -m venv venv
.\venv\Scripts\activate   # On Windows (or source venv/bin/activate on Unix)
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 2. Frontend Application (React 18 / Three.js / Vite)

```bash
cd frontend
npm install
npm run dev
```

---

## 🧪 Testing Suite

### Backend Automated Tests (211 Tests)
```bash
cd backend
python -m pytest
```

### Frontend Automated Tests (126 Tests)
```bash
cd frontend
npm test -- --run
```

---

## 🏛️ Architecture & Verification Contracts

- **Cube State Format Specification**: [docs/cube_state_contract.md](docs/cube_state_contract.md)
- **Computer Vision Pipeline**: [docs/cv_face_grid_and_color_extraction.md](docs/cv_face_grid_and_color_extraction.md)
- **6-Face Color Classification**: [docs/six_face_color_classification_and_reconstruction.md](docs/six_face_color_classification_and_reconstruction.md)
- **Solution Optimization**: [docs/solution_intelligence_and_optimization.md](docs/solution_intelligence_and_optimization.md)
- **AI Coach & Explanations**: [docs/ai_coach_and_explainable_steps.md](docs/ai_coach_and_explainable_steps.md)
- **Production Hardening & Deployment**: [docs/production_hardening_and_deployment.md](docs/production_hardening_and_deployment.md)
