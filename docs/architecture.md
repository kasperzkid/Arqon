# Architecture

Arqon is an open-source, rule-based Solana security analysis platform
(v0.1.0). This document documents every part of the project: backend modules,
frontend parts, and how they connect today and as the engine develops.

## Stack

| Area | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite 8, Tailwind CSS 4, shadcn/ui-style components, React Router 7, TanStack Query, Recharts, Lucide React |
| Backend | Python 3.11+, FastAPI, Pydantic, SQLAlchemy, Alembic, HTTPX, Solders |
| Database | SQLite (local) — PostgreSQL-compatible later |
| Infra | Docker, Docker Compose, GitHub Actions |
| Blockchain | Solana JSON-RPC (public mainnet-beta endpoint) |

## Data flow (current)

```
frontend/ (React + Vite)
    │  HTTP same-origin (Vite dev server proxies /api → backend)
    ▼
backend/app/main.py ─▶ routers: /api/v1/health, /api/v1/system/info,
                        /api/v1/wallet/validate, /api/v1/wallet/activity
```

The frontend dashboard reads `/api/v1/health` and `/api/v1/system/info` via
TanStack Query and renders clearly labeled placeholder data while the
analysis engine lands.

```
wallet/validate ─▶ Solders Pubkey validation (public address only)
```

## Backend parts

### `app/main.py` — app factory

Builds the FastAPI app: CORS middleware, centralized exception handlers, and
routers mounted under the `/api/v1` prefix. Served with uvicorn.

### `app/api/` — HTTP layer

- `routes/health.py` — `GET /api/v1/health`: service name, version, environment.
- `routes/system.py` — `GET /api/v1/system/info`: deployment info.
- `routes/wallet.py` — `POST /api/v1/wallet/validate`: validates via Solders;
  private keys are never accepted or stored.
- `routes/activity.py` — `GET /api/v1/wallet/activity`: fetches recent
  signatures through the provider and returns normalized transaction metadata
  plus findings from the deterministic detection engine.
- `dependencies.py` — shared FastAPI dependencies (DB session).

### `app/core/`

- `config.py` — `Settings` via pydantic-settings, all values environment
  driven (see `.env.example`), `get_settings()` cached.
- `logging.py` — `configure_logging()`: structured text or JSON logging.

### `app/database/`

- `base.py` — declarative `Base` shared with alembic autogenerate.
- `session.py` — engine + `SessionLocal` + `get_db()` + `init_db()`.
  Connect args are SQLite-specific (`check_same_thread=False`); other drivers
  (PostgreSQL later) reject it, so it is conditional.

### `app/models/` — ORM models

Placeholder package today. Alembic autogenerate compares against `Base`
(`alembic/env.py` imports `app.models`).

### `app/schemas/` — request/response models

- `wallet.py` — `WalletValidateRequest`, `WalletValidateResponse`.
- `system.py` — `SystemInfoResponse`.

### `app/services/` — business services

Placeholder package. Rules, scanners and reports services will live here.

### `app/blockchain/` — blockchain data access

- `providers/base.py` — the read-only `SolanaProvider` interface:
  `get_account_info`, `get_signatures_for_address`, `get_transaction`,
  `get_token_accounts_by_owner`, `get_latest_blockhash`. Plus error types
  (`SolanaProviderError`, `SolanaProviderTimeoutError`,
  `SolanaProviderRateLimitError`).
- `providers/solana_rpc.py` — `SolanaRPCProvider` over the public Solana
  JSON-RPC endpoint (configurable via `SOLANA_RPC_URL`, timeout via
  `SOLANA_REQUEST_TIMEOUT`). Handles timeouts, network errors, invalid JSON,
  RPC error payloads, HTTP 429 rate limits; missing data returns empty
  structures (`[]`/`{}`).
- `rpc/`, `solana/` — placeholder packages (RPC primitives, Solana parsing).

Future: a paid/private provider (e.g. Helius) implements the same interface
and is swapped in via configuration — no production code reads its own URLs.

### `app/scanner/` — collection and normalization

- `collectors/` — pull raw on-chain data via `SolanaProvider`.
- `parsers/` — raw response → domain objects.
- `normalizers/` — domain objects → canonical `app.models`/`schemas` shape.

`collectors/wallet_activity.py` fetches recent signatures and transaction
details through `SolanaProvider`. `normalizers/transaction.py` extracts
signature, slot, timestamp, status, fee, and native SOL balance change.
Token transfer normalization and persistence remain future work.

### `app/detection/` — rule-based detection

- `registry.py` — typed definitions for registered rules.
- `engine.py` — evaluates registered activity rules against normalized
  transactions.
- `rules/` — future individual rule modules (see `docs/detection-rules.md`).

`PFX-001` detects more than five timestamped transactions within ten minutes.
Findings carry the rule ID, severity, observed count, time bounds, and the
supporting signatures. This is a review signal, not a maliciousness verdict.

### `app/risk/` — risk scoring

- `scoring.py`, `severity.py` — scoring/severity helpers (placeholder).

### `app/intelligence/` — intelligence sources

- `sources/`, `indicators/` — external intelligence (placeholder).

### `app/reports/` — report generation

Placeholder package. Reports are built on findings once they exist.

### `alembic/` — migrations

`alembic.ini` + `alembic/env.py` (settings-driven) + `versions/` (initial
schema revision, applied with `alembic upgrade head`).

## Frontend parts

### `src/layout/`

- `AppShell.tsx` — page layout: sidebar + top bar + `<Outlet />`.
- `Sidebar.tsx` — navigation (Dashboard, Wallet Analysis, Transactions,
  Security Findings, Reports) with active state.
- `TopBar.tsx` — top bar with backend status pill and version.

### `src/features/` — pages

- `dashboard/DashboardPage.tsx` — stat cards, activity chart, placeholder.
- `wallet-analysis/WalletAnalysisPage.tsx` — live address validation call,
  result display, labeled placeholder.
- `transactions/TransactionsPage.tsx` — placeholder transaction table.
- `security-findings/SecurityFindingsPage.tsx` + `BadgeRow.tsx` — placeholder
  findings list with severity badges.
- `reports/ReportsPage.tsx` — placeholder reports list.

Every section renders labeled placeholder data (`PLACEHOLDER_MARKER`), never
fabricated findings.

### `src/components/`

- `ui/Button.tsx`, `ui/Card.tsx` (+ `CardHeader/Title/Description/Content/Footer`),
  `ui/Input.tsx`, `ui/Badge.tsx` — shadcn/ui-style primitives on Tailwind tokens.
- `common/Placeholder.tsx` — clearly labeled placeholder banner.

### `src/lib/` — utilities

- `utils.ts` — `cn()` helper (clsx + tailwind-merge).
- `placeholder.ts` — mock data for the placeholder sections.

### `src/services/api.ts` — real API client

`fetchSystemInfo`, `fetchHealth`, `validateWalletAddress` → `/api/v1/*`
(same-origin, proxied to the backend in dev).

### `src/hooks/useHealth.ts`

TanStack Query hooks: `useHealth()`, `useSystemInfo()`.

### `src/types/index.ts`

Mirrors the backend Pydantic schemas (SystemInfo, HealthInfo,
WalletAddressValidation, placeholder types).

### `src/routes/index.tsx` + `src/App.tsx` + `src/main.tsx`

Route definitions and app bootstrap.

### `src/styles/globals.css`

Tailwind tokens + design system: background, foreground, card, border,
primary/secondary/accent, severity colors (info/low/medium/high/critical),
monospace font, ambient glow.

## Operational guarantees (initial)

- Centralized error handling: `RequestValidationError` → 422 JSON, unexpected
  errors → 500 JSON (no internals leaked).
- Structured logging via `app/core/logging.py`.
- CORS enabled for the local frontend (`CORS_ORIGINS`).
- Read-only provider; nothing in the blockchain layer writes to-chain.
