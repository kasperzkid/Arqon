# Module index

One-line overview of every part of Arqon. File paths are relative to the repo root.

## Backend

| Part | Files | Notes |
|---|---|---|
| App factory | `backend/app/main.py` | CORS, exception handlers, routers, `/api/v1` prefix |
| HTTP layer | `backend/app/api/routes/{health,system,wallet,activity,probe}.py`, `backend/app/api/dependencies.py` | Health, system info, wallet validation, multi-network probe and activity endpoints |
| Core | `backend/app/core/{config,logging}.py` | Pydantic settings, structured logging |
| Database | `backend/app/database/{base,session}.py` | SQLAlchemy engine/session; `init_db()` |
| Models | `backend/app/models/__init__.py` | Placeholder ORM package |
| Schemas | `backend/app/schemas/{wallet,system,activity}.py` | Pydantic request/response models |
| Services | `backend/app/services/__init__.py` | Placeholder (business services) |
| Blockchain | `backend/app/blockchain/providers/{base,solana_rpc}.py`, `backend/app/blockchain/networks.py`, `rpc/`, `solana/` | `SolanaProvider` interface, public JSON-RPC provider, supported cluster URLs |
| Scanner | `backend/app/scanner/collectors/wallet_activity.py`, `backend/app/scanner/normalizers/transaction.py`, `parsers/` | Recent wallet activity collection and transaction normalization |
| Detection | `backend/app/detection/{engine,registry}.py`, `rules/` | Deterministic PFX-001 high-frequency activity rule |
| Risk | `backend/app/risk/{scoring,severity}.py` | Placeholder |
| Intelligence | `backend/app/intelligence/{sources,indicators}/` | Placeholder |
| Reports | `backend/app/reports/__init__.py` | Placeholder |
| Migrations | `backend/alembic.ini`, `backend/alembic/env.py`, `backend/alembic/versions/` | Settings-driven; `alembic upgrade head` |
| Tests | `backend/tests/unit/`, `backend/tests/integration/`, `backend/tests/fixtures/`, `backend/tests/conftest.py` | pytest |
| Config files | `backend/requirements.txt`, `backend/pyproject.toml`, `backend/Dockerfile` | Deps, packaging, container |
| Lint/type config | `backend/pyproject.toml` (`[tool.ruff]`, `[tool.pytest.ini_options]`) | Ruff + pytest settings |

## Frontend

| Part | Files | Notes |
|---|---|---|
| Bootstrap | `frontend/src/main.tsx`, `frontend/src/App.tsx` | App root and entry |
| Routes | `frontend/src/routes/index.tsx` | `createBrowserRouter` route table |
| Layout | `frontend/src/layout/{AppShell,Sidebar,TopBar}.tsx` | Page layout + navigation + top bar |
| Dashboard | `frontend/src/features/dashboard/DashboardPage.tsx` | Live KPI strip, quick scan, risk gauge, alerts and recent-scan history |
| Wallet analysis | `frontend/src/features/wallet-analysis/WalletAnalysisPage.tsx` | Address validation, network probe and live activity analysis |
| Analysis store | `frontend/src/features/wallet-analysis/WalletAnalysisProvider.tsx` | Shared, persisted state for the latest wallet analysis |
| Docs | `frontend/src/features/docs/DocsPage.tsx` | In-app documentation at `/docs` |
| Transactions | `frontend/src/features/transactions/TransactionsPage.tsx` | Live wallet activity search and normalized transaction table |
| Security findings | `frontend/src/features/security-findings/{SecurityFindingsPage,BadgeRow}.tsx` | Live rule findings and supporting evidence |
| Reports | `frontend/src/features/reports/ReportsPage.tsx` | Reports generated from live scans, stored in browser local storage and exportable |
| UI (shadcn/ui-style) | `frontend/src/components/ui/{Button,Card,Input,Badge}.tsx` | Primitives on Tailwind tokens |
| Common | `frontend/src/components/common/Placeholder.tsx` | Labeled placeholder banner |
| Lib | `frontend/src/lib/{utils,placeholder}.ts` | `cn()` helper + mock data |
| Services | `frontend/src/services/api.ts` | Real API client (`/api/v1/*`) |
| Hooks | `frontend/src/hooks/useHealth.ts` | TanStack Query hooks |
| Types | `frontend/src/types/index.ts` | Mirrors backend schemas |
| Styles | `frontend/src/styles/globals.css` | Design tokens + system styles |
| Vite | `frontend/vite.config.ts`, `frontend/index.html` | Dev server, dev proxy, base HTML |
| Packaging | `frontend/package.json`, `frontend/tsconfig*.json` | Scripts, strict TS, builds |

## Docs

| Part | Files |
|---|---|
| Architecture | `docs/architecture.md` (comprehensive per-part doc), `docs/module-index.md` (this table) |
| API | `docs/api.md` |
| Development | `docs/development.md` |
| Detection rules | `docs/detection-rules.md` |

## Scripts & CI

- `scripts/run-backend.sh`, `scripts/run-frontend.sh`, `scripts/test.sh`
- `.github/workflows/ci.yml` — backend (ruff + pytest) and frontend (tsc + build) jobs

## Repo root

`.env.example`, `.gitignore`, `Dockerfile`, `docker-compose.yml`, `LICENSE`, `README.md`
