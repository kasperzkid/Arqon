"""Unit tests for the health endpoint."""

from app.main import app
from tests.conftest import SyncASGIClient

client = SyncASGIClient(app)


def test_health_returns_200_and_service_info():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "ok"
    assert body["service"]
    assert body["version"]
    assert body["environment"]
