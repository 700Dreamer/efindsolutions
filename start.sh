#!/bin/bash
set -e

echo "=================================================="
echo " Starting E-Find & Soft Solutions on Railway"
echo "=================================================="

# 1. Environment & Directories
export PYTHONUNBUFFERED=1
export NODE_ENV=production
UPLOAD_PATH="${UPLOAD_DIR:-/app/backend/uploads}"
mkdir -p "$UPLOAD_PATH"

# If a persistent storage path is set (e.g. /data/efind.db) and empty, copy initial database
if [[ "${DATABASE_URL:-}" == *"sqlite+aiosqlite:///"* ]]; then
  DB_FILE="${DATABASE_URL#sqlite+aiosqlite:///}"
  DB_DIR="$(dirname "$DB_FILE")"
  mkdir -p "$DB_DIR"
  if [ ! -f "$DB_FILE" ] && [ -f "/app/backend/efind.db" ]; then
    echo "==> Initializing persistent database at $DB_FILE from packaged efind.db..."
    cp /app/backend/efind.db "$DB_FILE"
  fi
fi

# If a persistent upload path is set (e.g. /data/uploads) and empty, copy initial uploads
if [ "$UPLOAD_PATH" != "/app/backend/uploads" ] && [ -d "/app/backend/uploads" ]; then
  if [ -z "$(ls -A "$UPLOAD_PATH" 2>/dev/null)" ]; then
    echo "==> Initializing persistent uploads at $UPLOAD_PATH..."
    cp -r /app/backend/uploads/* "$UPLOAD_PATH"/ 2>/dev/null || true
  fi
fi

# 2. Start FastAPI Backend on internal loopback (127.0.0.1:8000)
echo "==> Starting FastAPI backend on http://127.0.0.1:8000..."
cd /app/backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 &
BACKEND_PID=$!

# 3. Wait for FastAPI Backend to be healthy
echo "==> Waiting for backend to initialize and seed database..."
for i in {1..30}; do
  if ! kill -0 "$BACKEND_PID" 2>/dev/null; then
    echo "==> ERROR: FastAPI backend process died during startup! Exiting..."
    exit 1
  fi
  if curl -s http://127.0.0.1:8000/health > /dev/null 2>&1; then
    echo "==> Backend is healthy and ready!"
    break
  fi
  sleep 1
done

# 4. Start Next.js Frontend on Railway public PORT
PORT="${PORT:-3000}"
echo "==> Starting Next.js frontend on 0.0.0.0:${PORT}..."
cd /app/frontend
pnpm start -H 0.0.0.0 -p "${PORT}" &
FRONTEND_PID=$!

# 5. Signal trapping for graceful shutdown
term_handler() {
  echo "==> Received shutdown signal, gracefully stopping services..."
  kill -TERM "$FRONTEND_PID" 2>/dev/null || true
  kill -TERM "$BACKEND_PID" 2>/dev/null || true
  wait "$FRONTEND_PID" 2>/dev/null || true
  wait "$BACKEND_PID" 2>/dev/null || true
  exit 0
}

trap term_handler SIGTERM SIGINT

# 6. Monitor processes
wait -n "$BACKEND_PID" "$FRONTEND_PID"
EXIT_CODE=$?

echo "==> Service exited with code ${EXIT_CODE}. Terminating container..."
kill -TERM "$FRONTEND_PID" 2>/dev/null || true
kill -TERM "$BACKEND_PID" 2>/dev/null || true
exit $EXIT_CODE
