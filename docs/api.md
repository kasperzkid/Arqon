# API Reference

All endpoints are prefixed with `/api/v1` (configurable via `API_V1_PREFIX`).

## `GET /api/v1/health`

Liveness probe.

- Response `200`:
  ```json
  { "status": "ok", "service": "Arqon", "version": "0.1.0", "environment": "development" }
  ```

## `GET /api/v1/system/info`

Static deployment information.

- Response `200`:
  ```json
  {
    "app_name": "Arqon",
    "app_version": "0.1.0",
    "environment": "development",
    "api_version": "/api/v1",
    "database_url": "sqlite:///./arqon_dev.db",
    "backend_host": "127.0.0.1",
    "backend_port": 8000
  }
  ```

## `POST /api/v1/wallet/validate`

Validate a Solana public address using Solders (`Pubkey.from_string`).
Private keys are never accepted or stored.

- Request body:
  ```json
  { "address": "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYinNyB" }
  ```
- Success `200`:
  ```json
  { "valid": true, "address": "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYinNyB", "is_public_address": true }
  ```
- Invalid address `400`:
  ```json
  { "detail": "Invalid Solana address" }
  ```
- Missing/invalid body `422`:
  ```json
  { "error": "validation_error", "detail": [...] }
  ```

## `GET /api/v1/wallet/activity`

Fetch recent wallet signatures and normalize the corresponding transaction
metadata. This endpoint is read-only and accepts public addresses only.

- Query parameters: `address` (required), `limit` (optional, 1–100; default 20).
- Success `200` includes the canonical address and an `items` array with each
  transaction's `signature`, `slot`, `block_time`, `status`, `fee_lamports`,
  and `sol_change_lamports`.
- Missing transaction data is returned as `status: "unavailable"` with null
  metadata. Provider failures return `502`; invalid addresses return `400`.
- `sol_change_lamports` is the queried wallet's post-minus-pre native SOL
  balance. Token transfers and rule findings are not included yet.

## Error envelope

Centralized exception handling returns:

- `422` for request validation failures (`error: "validation_error"`).
- `500` for unexpected server errors (`error: "internal_error"`).

## Coming later (not implemented in v0.1.0)

Wallet activity, transaction endpoints, security findings and report
endpoints will be added as the scanner and detection engine land
(see [architecture](architecture.md)).
