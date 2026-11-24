"""Unit tests for POST /api/v1/wallet/validate."""

from fastapi.testclient import TestClient
from solders.keypair import Keypair

from app.main import app

client = TestClient(app)


def test_validate_accepts_a_valid_public_address():
    address = str(Keypair.from_seed(b"\x01" * 32).pubkey())
    response = client.post("/api/v1/wallet/validate", json={"address": address})
    assert response.status_code == 200
    body = response.json()
    assert body["valid"] is True
    assert body["address"] == address
    assert body["is_public_address"] is True


def test_validate_rejects_invalid_address():
    response = client.post("/api/v1/wallet/validate", json={"address": "not-a-solana-address!"})
    assert response.status_code == 400
    assert "Invalid Solana address" in response.json()["detail"]


def test_validate_rejects_missing_address():
    response = client.post("/api/v1/wallet/validate", json={})
    assert response.status_code == 422
