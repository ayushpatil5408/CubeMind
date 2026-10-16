# Root Dockerfile for CubeMind FastAPI Backend (Render & Container Hosting)
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Pre-install future 1.0.0 and rubik-solver to ensure compatibility
RUN pip install --no-cache-dir "future>=1.0.0" && \
    pip install --no-cache-dir --no-deps "rubik-solver>=0.2.0"

# Copy backend requirements and install
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend application source
COPY backend/ .

# Render exposes PORT dynamically at runtime (defaults to 8000 locally)
ENV PORT=8000
EXPOSE 8000

CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT}"]
