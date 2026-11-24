# Arqon

**Analyze. Investigate. Verify.**

Arqon is an open-source, rule-based Solana security analysis platform. It
examines wallet activity, transactions, token transfers, and program
interactions to identify suspicious patterns and produce transparent,
evidence-backed security reports.

> **Status:** this is the v0.1.0 foundation — the API, provider abstraction
> and dashboard scaffold are in place, while the analysis engine itself is
> under development. Frontend sections use clearly labeled placeholder data.

## Core principles

- **No AI or machine learning** — every finding needs an identifiable rule and evidence.
- **Read-only blockchain analysis.**
- **Never requests or stores private keys; never signs or executes transactions.**
- Modular architecture supporting future blockchain data providers.

## Stack

- **Frontend:** React, TypeScript, Vite, Tailwind CSS, shadcn/ui, React Router, TanStack Query, Recharts, Lucide React
- **Backend:** Python 3.11+, FastAPI, Pydantic, SQLAlchemy, Alembic, HTTPX, Solders
- **Database:** SQLite (local) / PostgreSQL-compatible (future)
- **Infrastructure:** Docker, Docker Compose, GitHub Actions
- **Blockchain:** Solana JSON-RPC (public mainnet-beta endpoint)

## Quick start

```bash
# Backend
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
alembic upgrade head        # apply migrations
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000

# Frontend (second terminal)
cd frontend
npm install
npm run dev                 # http://localhost:5174 (5173 may be taken by another app)
```

Verify the API:

```bash
curl http://127.0.0.1:8000/api/v1/health
curl http://127.0.0.1:8000/api/v1/system/info
curl -X POST http://127.0.0.1:8000/api/v1/wallet/validate \
  -H 'Content-Type: application/json' \
  -d '{"address":"9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYinNyB"}'
```

## Documentation

- [Architecture](docs/architecture.md)
- [API reference](docs/api.md)
- [Development guide](docs/development.md)
- [Detection rules](docs/detection-rules.md)

## License

MIT — see [LICENSE](LICENSE).
