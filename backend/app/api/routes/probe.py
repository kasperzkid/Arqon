"""Multi-network wallet probe endpoint.

Checks mainnet-beta, devnet, and testnet in parallel and returns the
balance + recent transaction count for each network, so the frontend can
display where a wallet actually has activity.
"""

import asyncio
import logging

from fastapi import APIRouter, HTTPException, status

from app.blockchain.networks import NETWORK_RPC_URLS
from app.blockchain.providers.solana_rpc import SolanaRPCProvider

router = APIRouter(tags=["wallets"])
logger = logging.getLogger(__name__)


async def _probe_network(name: str, url: str, address: str) -> dict:
    """Query a single Solana network for balance + recent tx count."""
    provider = SolanaRPCProvider(rpc_url=url, timeout=8.0)
    result: dict = {
        "network": name,
        "rpc_url": url,
        "balance_lamports": None,
        "balance_sol": None,
        "recent_tx_count": 0,
        "active": False,
        "error": None,
    }
    try:
        balance = await provider.get_balance(address)
        sigs = await provider.get_signatures_for_address(address, limit=10)
        result["balance_lamports"] = balance
        result["balance_sol"] = round(balance / 1e9, 9) if balance is not None else None
        result["recent_tx_count"] = len(sigs) if sigs else 0
        result["active"] = (balance is not None and balance > 0) or result["recent_tx_count"] > 0
    except Exception as exc:  # noqa: BLE001
        logger.warning("probe_network_error network=%s error=%s", name, exc)
        result["error"] = str(exc)
    return result


@router.get("/wallet/probe")
async def probe_wallet(address: str) -> dict:
    """Probe all Solana networks for a given wallet address.

    Returns balance and recent transaction count for mainnet, devnet and
    testnet so the client can determine where the wallet is active.
    """
    address = address.strip()
    if not address:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="address query param is required",
        )

    tasks = [_probe_network(name, url, address) for name, url in NETWORK_RPC_URLS.items()]
    results = await asyncio.gather(*tasks, return_exceptions=False)

    networks = list(results)
    # Prefer transaction history over a balance-only hit so the follow-up
    # activity request does not choose a quiet cluster when another has data.
    healthy_networks = [network for network in networks if not network["error"]] or networks
    primary = max(
        healthy_networks,
        key=lambda n: (
            n["recent_tx_count"] > 0,
            n["recent_tx_count"],
            n["balance_lamports"] is not None and n["balance_lamports"] > 0,
        ),
    )

    return {
        "address": address,
        "networks": networks,
        "primary_network": primary["network"],
    }
