"""Pydantic schemas for the wallet validation endpoint."""

from pydantic import BaseModel, Field


class WalletValidateRequest(BaseModel):
    """Body of ``POST /api/v1/wallet/validate``."""

    address: str = Field(min_length=1, max_length=128)


class WalletValidateResponse(BaseModel):
    """Response of ``POST /api/v1/wallet/validate``."""

    valid: bool
    address: str | None = None
    is_public_address: bool = True
