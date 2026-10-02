# ========================================================
# Production Multi-Stage Dockerfile for E-Find Solutions
# Built for Unified Single-Container Deployment on Railway
# Frontend (Next.js) & Backend (FastAPI) communicate internally
# ========================================================

# --------------------------------------------------------
# Stage 1: Build Frontend (Next.js with pnpm)
# --------------------------------------------------------
FROM node:20-bookworm-slim AS frontend-builder
WORKDIR /app/frontend

# Install pnpm
RUN npm install -g pnpm@latest

# Copy package configurations first for caching
COPY frontend/package.json frontend/pnpm-lock.yaml* frontend/pnpm-workspace.yaml* ./

# Install dependencies (respecting pnpm approval rules)
RUN pnpm install --frozen-lockfile || pnpm install

# Copy entire frontend source
COPY frontend/ ./

# Build arguments & production environment
ENV NEXT_PUBLIC_API_URL=/api/v1
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Compile optimized production Next.js build
RUN pnpm run build

# --------------------------------------------------------
# Stage 2: Final Production Runner (Python 3.12 + Node 20)
# --------------------------------------------------------
FROM python:3.12-slim-bookworm AS runner
WORKDIR /app

# Install system dependencies, Node.js 20, and pnpm
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    ca-certificates \
    bash \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y --no-install-recommends nodejs \
    && npm install -g pnpm@latest \
    && rm -rf /var/lib/apt/lists/*

# Install Python backend dependencies
WORKDIR /app/backend
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source code
COPY backend/ ./

# Copy built frontend application from builder stage
WORKDIR /app/frontend
COPY --from=frontend-builder /app/frontend ./

# Copy and setup start script
WORKDIR /app
COPY start.sh ./
RUN chmod +x ./start.sh

# Environment settings for internal networking & Railway
ENV PORT=3000
ENV PYTHONUNBUFFERED=1
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV INTERNAL_BACKEND_URL=http://127.0.0.1:8000

# Railway will route incoming web traffic to $PORT
EXPOSE 3000

# Start both services via production supervisor script
CMD ["/app/start.sh"]
