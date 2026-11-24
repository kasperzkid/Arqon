"""Shared FastAPI dependencies."""

from app.blockchain.providers.solana_rpc import SolanaRPCProvider
from app.database.session import get_db


def get_solana_provider() -> SolanaRPCProvider:
    """Provide the configured read-only Solana RPC client."""
    return SolanaRPCProvider()

__all__ = ["get_db", "get_solana_provider"]
