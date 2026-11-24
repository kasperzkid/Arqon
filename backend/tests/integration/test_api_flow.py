"""Integration-style API flow tests (FastAPI TestClient, in-process)."""

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


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
