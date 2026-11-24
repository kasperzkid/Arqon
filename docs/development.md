# Development Guide

## Prerequisites

- Python 3.11+ (tested on 3.14.8)
- Node.js 20+
- Docker + Docker Compose

## Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Apply migrations
alembic upgrade head

# Start (then verify: curl http://127.0.0.1:8000/api/v1/health)
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

## Frontend

```bash
cd frontend
npm install
npm run dev      # Vite dev server (http://localhost:5174 when 5173 is taken)
```

The dev server proxies `/api/*` to `VITE_PROXY_TARGET` (default
`http://127.0.0.1:8000`).

## Testing and linting

```bash
# Backend unit + integration tests
cd backend && python -m pytest tests/ -q

# TypeScript check and production build
cd frontend && npm run typecheck && npm run build

# Lint (Ruff: import sort, pyupgrade, line length 100)
cd backend && ruff check .
```

## Docker

```bash
docker compose up -d --build
curl http://localhost:8000/api/v1/health
docker compose logs backend
```

## Scripts

- `scripts/run-backend.sh` — start the backend
- `scripts/run-frontend.sh` — start the frontend dev server
- `scripts/test.sh` — run backend tests + frontend typecheck/build
