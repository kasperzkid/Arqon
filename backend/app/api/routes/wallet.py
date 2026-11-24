"""Wallet address validation endpoint."""

import logging

from fastapi import APIRouter, HTTPException, status
from solders.pubkey import Pubkey

from app.schemas.wallet import WalletValidateRequest, WalletValidateResponse

router = APIRouter(tags=["wallets"])
logger = logging.getLogger(__name__)


@router.post("/wallet/validate", response_model=WalletValidateResponse)
def validate_wallet(payload: WalletValidateRequest) -> WalletValidateResponse:
    """Validate a Solana public address.

    Uses ``solders.Pubkey.from_string``, which only accepts a 32-byte public
    key; private keys are never parsed or accepted here.
    """
    address = payload.address.strip()
    try:
        pubkey = Pubkey.from_string(address)
    except ValueError as exc:
        logger.info("invalid_address_rejected")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid Solana address",
        ) from exc
    return WalletValidateResponse(
        valid=True,
        address=str(pubkey),
        is_public_address=True,
    )
