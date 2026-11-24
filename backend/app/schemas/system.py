"""Pydantic schemas for the system info endpoint."""

from pydantic import BaseModel


class SystemInfoResponse(BaseModel):
    """Static deployment information about the running service."""

    app_name: str
    app_version: str
    environment: str
    api_version: str
    database_url: str
    backend_host: str
    backend_port: int
