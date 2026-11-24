#!/usr/bin/env sh
# Run backend tests + frontend typecheck/build. Usage: ./scripts/test.sh
set -e
cd "$(dirname "$0")/../backend"
if [ -d ".venv" ]; then
  .venv/bin/python -m pytest tests/ -q
else
  echo "backend .venv missing — skipping backend tests"
fi
cd ../frontend
npm run typecheck
npm run build
