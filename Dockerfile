# Root Dockerfile for CubeMind FastAPI Backend (Render & Container Hosting)
FROM python:3.11-slim

WORKDIR /app

# Install system build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy backend requirements and install dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt && \
    pip install --no-cache-dir --no-deps "rubik-solver>=0.2.0"

# Copy backend application source
COPY backend/ .

# Render dynamically injects PORT at runtime (defaulting to 10000 on Render, 8000 for local dev)
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PORT=10000

EXPOSE 10000
EXPOSE 8000

CMD ["python", "main.py"]
