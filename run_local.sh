#!/usr/bin/env bash
# ==============================================================================
# CubeMind Local Development Runner
# Starts both the FastAPI Backend (port 8000) and the Vite Frontend (port 5173).
# ==============================================================================

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_ROOT"

# Determine Python binary
if [ -f "$PROJECT_ROOT/.venv/bin/python" ]; then
    PYTHON_BIN="$PROJECT_ROOT/.venv/bin/python"
    UVICORN_BIN="$PROJECT_ROOT/.venv/bin/uvicorn"
elif [ -f "$PROJECT_ROOT/backend/venv/bin/python" ]; then
    PYTHON_BIN="$PROJECT_ROOT/backend/venv/bin/python"
    UVICORN_BIN="$PROJECT_ROOT/backend/venv/bin/uvicorn"
else
    PYTHON_BIN="python3"
    UVICORN_BIN="uvicorn"
fi

echo "========================================================"
echo "🧊 CubeMind — Starting Local Full-Stack Environment"
echo "========================================================"
echo "Python binary: $PYTHON_BIN"
echo "Backend URL:   http://localhost:8000"
echo "Frontend URL:  http://localhost:5173"
echo "========================================================"

# Cleanup handler on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down CubeMind servers..."
    if [ -n "$BACKEND_PID" ]; then
        kill "$BACKEND_PID" 2>/dev/null || true
    fi
    if [ -n "$FRONTEND_PID" ]; then
        kill "$FRONTEND_PID" 2>/dev/null || true
    fi
    echo "✅ All servers stopped."
    exit 0
}

trap cleanup INT TERM EXIT

# Start backend
echo "▶ Starting FastAPI backend..."
(cd "$PROJECT_ROOT/backend" && "$UVICORN_BIN" main:app --host 127.0.0.1 --port 8000 --reload) &
BACKEND_PID=$!

# Wait briefly for backend to initialize
sleep 1

# Start frontend
echo "▶ Starting Vite frontend..."
(cd "$PROJECT_ROOT/frontend" && npm run dev) &
FRONTEND_PID=$!

echo ""
echo "✨ CubeMind is live!"
echo "   👉 Open in your browser: http://localhost:5173"
echo "   👉 API Docs (Swagger):   http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop all servers."

wait
