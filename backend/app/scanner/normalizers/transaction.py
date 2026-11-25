"""Normalize Solana JSON-RPC transactions into API-friendly records."""

from typing import Any

from solders.pubkey import Pubkey


def normalize_transaction(
    signature: str,
    wallet_address: str,
    transaction: dict[str, Any] | None,
) -> dict[str, Any]:
    """Extract stable transaction metadata and the wallet's SOL balance change."""
    if transaction is None:
        return {
            "signature": signature,
            "slot": None,
            "block_time": None,
            "status": "unavailable",
            "fee_lamports": None,
            "sol_change_lamports": None,
        }

    meta = transaction.get("meta") or {}
    message = (transaction.get("transaction") or {}).get("message") or {}
    account_keys = message.get("accountKeys") or []
    wallet_key = str(Pubkey.from_string(wallet_address))
    key_strings = [
        str(key.get("pubkey")) if isinstance(key, dict) else str(key)
        for key in account_keys
    ]

    sol_change = None
    if wallet_key in key_strings:
        index = key_strings.index(wallet_key)
        pre = meta.get("preBalances") or []
        post = meta.get("postBalances") or []
        if index < len(pre) and index < len(post):
            sol_change = int(post[index]) - int(pre[index])

    err = meta.get("err")
    status = "failed" if err is not None else "confirmed"

    return {
        "signature": signature,
        "slot": transaction.get("slot"),
        "block_time": transaction.get("blockTime"),
        "status": status,
        "fee_lamports": meta.get("fee"),
        "sol_change_lamports": sol_change,
    }
