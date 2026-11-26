"""Shared FastAPI dependencies."""

from fastapi import HTTPException, Query, status

from app.blockchain.networks import DEFAULT_NETWORK, resolve_network_rpc_url
from app.blockchain.providers.solana_rpc import SolanaRPCProvider
from app.database.session import get_db


async def get_solana_provider(
    network: str = Query(default=DEFAULT_NETWORK, description="mainnet | devnet | testnet"),
) -> SolanaRPCProvider:
    """Provide a read-only Solana RPC client for the requested network."""
    rpc_url = resolve_network_rpc_url(network)
    if rpc_url is None:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Unknown network '{network}'. Use mainnet, devnet or testnet.",
        )
    return SolanaRPCProvider(rpc_url=rpc_url)


__all__ = ["get_db", "get_solana_provider"]
