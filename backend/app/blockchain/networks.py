"""Supported Solana networks and their public JSON-RPC endpoints."""

NETWORK_RPC_URLS: dict[str, str] = {
    "mainnet": "https://api.mainnet-beta.solana.com",
    "devnet": "https://api.devnet.solana.com",
    "testnet": "https://api.testnet.solana.com",
}

DEFAULT_NETWORK = "mainnet"


def resolve_network_rpc_url(network: str) -> str | None:
    """Return the RPC URL for ``network``, or ``None`` when unsupported."""
    return NETWORK_RPC_URLS.get(network.strip().lower())
