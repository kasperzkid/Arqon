"""Abstract interface for Solana blockchain data providers.

The platform starts with the public Solana JSON-RPC provider
(``providers/solana_rpc.py``). Future providers (Helius, etc.) implement the
same methods so they can be swapped in via configuration.
"""

from abc import ABC, abstractmethod
from typing import Any


class SolanaProviderError(Exception):
    """Base error for provider failures."""


class SolanaProviderTimeoutError(SolanaProviderError):
    """The provider request timed out."""


class SolanaProviderRateLimitError(SolanaProviderError):
    """The provider responded with a rate limit."""


class SolanaProvider(ABC):
    """Minimal read-only Solana provider interface."""

    @abstractmethod
    async def get_account_info(self, address: str) -> dict[str, Any]:
        """Fetch account info for ``address``.

        Returns the ``result`` of the RPC ``getAccountInfo`` call.
        """

    @abstractmethod
    async def get_signatures_for_address(
        self, address: str, limit: int = 10, before: str | None = None
    ) -> list[dict[str, Any]]:
        """Return transaction signatures that involve ``address``."""

    @abstractmethod
    async def get_transaction(self, signature: str) -> dict[str, Any] | None:
        """Fetch transaction details by signature; ``None`` when absent."""

    @abstractmethod
    async def get_token_accounts_by_owner(self, owner: str, mint: str) -> list[dict[str, Any]]:
        """Return token accounts owned by ``owner`` for mint ``mint``."""

    @abstractmethod
    async def get_latest_blockhash(self) -> dict[str, Any]:
        """Return the latest confirmed blockhash."""
