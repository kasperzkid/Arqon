"""Public Solana JSON-RPC provider.

Read-only, and requires no API key by default: the default URL is the
public mainnet-beta endpoint, configurable via the environment
(``SOLANA_RPC_URL``).
"""

from typing import Any

import httpx

from app.blockchain.providers.base import (
    SolanaProvider,
    SolanaProviderError,
    SolanaProviderRateLimitError,
    SolanaProviderTimeoutError,
)
from app.core.config import settings


class SolanaRPCProvider(SolanaProvider):
    """Implementation of :class:`SolanaProvider` over the Solana JSON-RPC API."""

    def __init__(self, rpc_url: str | None = None, timeout: float | None = None):
        self.rpc_url = (rpc_url or settings.solana_rpc_url).rstrip("/")
        self._timeout = timeout if timeout is not None else settings.solana_request_timeout

    async def _request(self, method: str, params: list[Any]) -> Any:
        payload = {"jsonrpc": "2.0", "id": 1, "method": method, "params": params}
        try:
            async with httpx.AsyncClient(timeout=self._timeout) as client:
                response = await client.post(self.rpc_url, json=payload)
        except httpx.TimeoutException as exc:
            raise SolanaProviderTimeoutError(f"timeout calling {method}") from exc
        except httpx.HTTPError as exc:
            raise SolanaProviderError(f"network error calling {method}: {exc}") from exc

        if response.status_code == 429:
            raise SolanaProviderRateLimitError("provider rate limited the request")
        try:
            response.raise_for_status()
        except httpx.HTTPStatusError as exc:
            raise SolanaProviderError(f"provider error calling {method}: {exc}") from exc

        try:
            data = response.json()
        except ValueError as exc:
            raise SolanaProviderError(f"invalid JSON response from {method}") from exc
        if "error" in data:
            raise SolanaProviderError(f"rpc error calling {method}: {data['error']}")
        return data.get("result")

    async def get_account_info(self, address: str) -> dict[str, Any]:
        return await self._request("getAccountInfo", [address]) or {}

    async def get_signatures_for_address(
        self, address: str, limit: int = 10, before: str | None = None
    ) -> list[dict[str, Any]]:
        params: list[Any] = [address, {"limit": limit}]
        if before:
            params[1]["before"] = before
        return await self._request("getSignaturesForAddress", params) or []

    async def get_transaction(self, signature: str) -> dict[str, Any] | None:
        return await self._request(
            "getTransaction",
            [
                signature,
                {
                    "encoding": "jsonParsed",
                    "maxSupportedTransactionVersion": 0,
                    "commitment": "confirmed",
                },
            ],
        )

    async def get_balance(self, address: str) -> int | None:
        """Return the SOL balance in lamports for the given address, or None on error."""
        result = await self._request("getBalance", [address])
        if isinstance(result, dict):
            return result.get("value")
        return None

    async def get_token_accounts_by_owner(self, owner: str, mint: str) -> list[dict[str, Any]]:
        return await self._request("getTokenAccountsByOwner", [owner, {"mint": mint}]) or []

    async def get_latest_blockhash(self) -> dict[str, Any]:
        return await self._request("getLatestBlockhash", []) or {}
