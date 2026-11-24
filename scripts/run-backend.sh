#!/usr/bin/env sh
# Start the Arqon backend. Usage: ./scripts/run-backend.sh
set -e
cd "$(dirname "$0")/../backend"

if [ ! -d ".venv" ]; then
  echo "Virtualenv not found. Create it first:"
  echo "  python3 -m venv backend/.venv && backend/.venv/bin/pip install -r backend/requirements.txt"
  exit 1
fi

.venv/bin/python -m uvicorn app.main:app --host "${ARQON_BACKEND_HOST:-127.0.0.1}" --port "${ARQON_BACKEND_PORT:-8000}"
