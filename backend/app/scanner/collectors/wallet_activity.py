"""Collect and normalize recent activity for a Solana wallet."""

from solders.pubkey import Pubkey

from app.blockchain.providers.base import SolanaProvider
from app.scanner.normalizers.transaction import normalize_transaction


async def collect_wallet_activity(
    provider: SolanaProvider, address: str, limit: int
) -> list[dict[str, object]]:
    """Fetch the most recent signatures and normalize their transactions."""
    signatures = await provider.get_signatures_for_address(address, limit=limit)
    items = []
    for record in signatures:
        signature = record.get("signature")
        if not isinstance(signature, str) or not signature:
            continue
        transaction = await provider.get_transaction(signature)
        items.append(normalize_transaction(signature, address, transaction))
    return items


def canonical_wallet_address(address: str) -> str:
    """Validate and canonicalize a Solana public address."""
    return str(Pubkey.from_string(address.strip()))
