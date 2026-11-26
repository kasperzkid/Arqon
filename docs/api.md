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

## `GET /api/v1/wallet/probe`

Check whether a public address has a balance or recent activity on each
supported Solana cluster. The frontend uses this endpoint to pick the network
for a scan and to render the "network presence" panel.

- Query parameters: `address` (required).
- Success `200`:
  ```json
  {
    "address": "9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYinNyB",
    "networks": [
      {
        "network": "mainnet",
        "rpc_url": "https://api.mainnet-beta.solana.com",
        "balance_lamports": 1248000000,
        "balance_sol": 1.248,
        "recent_tx_count": 10,
        "active": true,
        "error": null
      }
    ],
    "primary_network": "mainnet"
  }
  ```
- All three networks (`mainnet`, `devnet`, `testnet`) are queried in parallel.
  A per-network RPC failure sets that network's `error` field without failing
  the whole request.
- `primary_network` prefers a cluster with transaction history, then the
  highest transaction count, then a non-zero balance.
- A missing or blank `address` returns `422`.

## `GET /api/v1/wallet/activity`

Fetch recent wallet signatures and normalize the corresponding transaction
metadata. This endpoint is read-only and accepts public addresses only.

- Query parameters: `address` (required), `limit` (optional, 1–100; default 20),
  `network` (optional; `mainnet` (default), `devnet` or `testnet`).
- Success `200` includes the canonical address, the queried `network`, the
  `sol_balance_lamports` and an `items` array with each transaction's
  `signature`, `slot`, `block_time`, `status`, `fee_lamports`, and
  `sol_change_lamports`, plus a `findings` array.
- `PFX-001` reports more than five transactions in a ten-minute window. The
  finding includes the observed count, time bounds, and supporting signatures.
  It signals a pattern for review and does not establish malicious intent.
- Missing transaction data is returned as `status: "unavailable"` with null
  metadata. Provider failures return `502`; invalid addresses return `400`;
  an unknown `network` returns `422`.
- Which cluster is queried is resolved per request through
  `app/blockchain/networks.py`; the default network is `mainnet`.
- `sol_change_lamports` is the queried wallet's post-minus-pre native SOL
  balance. Token transfer details are not included yet.

## Error envelope

Centralized exception handling returns:

- `422` for request validation failures (`error: "validation_error"`).
- `500` for unexpected server errors (`error: "internal_error"`).

The frontend's Reports page generates reports from live activity responses and
stores them in browser local storage. There is no server-side report endpoint
or shared report archive yet.
