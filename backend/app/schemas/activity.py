"""Schemas for normalized wallet activity."""

from pydantic import BaseModel, Field


class WalletActivityRequest(BaseModel):
    """Query parameters for recent wallet activity."""

    address: str = Field(min_length=1, max_length=128)
    limit: int = Field(default=20, ge=1, le=100)


class WalletActivityItem(BaseModel):
    """One normalized on-chain transaction."""

    signature: str
    slot: int | None
    block_time: int | None
    status: str
    fee_lamports: int | None
    sol_change_lamports: int | None


class WalletActivityResponse(BaseModel):
    """Recent activity for a public wallet address."""

    address: str
    items: list[WalletActivityItem]
