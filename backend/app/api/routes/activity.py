"""Wallet activity API."""

import logging

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.api.dependencies import get_solana_provider
from app.blockchain.providers.base import SolanaProvider, SolanaProviderError
from app.scanner.collectors.wallet_activity import (
    canonical_wallet_address,
    collect_wallet_activity,
)
from app.schemas.activity import WalletActivityItem, WalletActivityResponse

router = APIRouter(tags=["wallets"])
logger = logging.getLogger(__name__)


@router.get("/wallet/activity", response_model=WalletActivityResponse)
async def wallet_activity(
    address: str = Query(min_length=1, max_length=128),
    limit: int = Query(default=20, ge=1, le=100),
    provider: SolanaProvider = Depends(get_solana_provider),
) -> WalletActivityResponse:
    """Return recent normalized transactions for a public wallet address."""
    try:
        canonical_address = canonical_wallet_address(address)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid Solana address",
        ) from exc

    try:
        items = await collect_wallet_activity(provider, canonical_address, limit)
    except SolanaProviderError as exc:
        logger.warning("wallet_activity_provider_error: %s", exc)
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Unable to fetch wallet activity",
        ) from exc

    return WalletActivityResponse(
        address=canonical_address,
        items=[WalletActivityItem(**item) for item in items],
    )
