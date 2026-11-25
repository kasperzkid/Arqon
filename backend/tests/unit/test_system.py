"""Unit tests for the system info endpoint."""

from app.main import app
from tests.conftest import SyncASGIClient

client = SyncASGIClient(app)


def test_system_info_returns_static_deployment_info():
    response = client.get("/api/v1/system/info")
    assert response.status_code == 200
    body = response.json()
    assert body["app_name"]
    assert body["api_version"] == "/api/v1"
    assert isinstance(body["database_url"], str)
    assert isinstance(body["backend_port"], int)
