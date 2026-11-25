"""Integration-style API flow tests (in-process ASGI transport)."""

from solders.keypair import Keypair

from app.api.dependencies import get_solana_provider
from app.blockchain.providers.base import SolanaProvider
from app.main import app
from tests.conftest import SyncASGIClient

client = SyncASGIClient(app)


def test_api_flow_health_system_wallet():
    health = client.get("/api/v1/health")
    assert health.status_code == 200

    info = client.get("/api/v1/system/info")
    assert info.status_code == 200

    validation = client.post(
        "/api/v1/wallet/validate",
        json={"address": "11111111111111111111111111111111"},  # sol.solana.com delegate
    )
    # This address is valid (it is the well-known SOL sender address).
    assert validation.status_code == 200
    assert validation.json()["valid"] is True


class ActivityProvider(SolanaProvider):
    async def get_account_info(self, address):
        return {}

    async def get_signatures_for_address(self, address, limit=10, before=None):
        return [{"signature": "signature-1"}]

    async def get_transaction(self, signature):
        return {
            "slot": 42,
            "blockTime": 1_700_000_000,
            "transaction": {"message": {"accountKeys": [self.address]}},
            "meta": {"err": None, "fee": 5000, "preBalances": [10000], "postBalances": [5000]},
        }

    async def get_token_accounts_by_owner(self, owner, mint):
        return []

    async def get_latest_blockhash(self):
        return {}


def test_wallet_activity_returns_normalized_transactions_and_findings():
    provider = ActivityProvider()
    provider.address = str(Keypair.from_seed(b"\x03" * 32).pubkey())

    async def override_provider():
        return provider

    app.dependency_overrides[get_solana_provider] = override_provider
    try:
        response = client.get(
            "/api/v1/wallet/activity", params={"address": provider.address, "limit": 5}
        )
    finally:
        app.dependency_overrides.clear()

    assert response.status_code == 200
    body = response.json()
    assert body["items"][0]["sol_change_lamports"] == -5000
    assert body["items"][0]["status"] == "confirmed"
    assert body["findings"] == []
