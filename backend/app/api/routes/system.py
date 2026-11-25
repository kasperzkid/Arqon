"""System information endpoint."""

from fastapi import APIRouter

from app.core.config import settings
from app.schemas.system import SystemInfoResponse

router = APIRouter(tags=["system"])


@router.get("/system/info", response_model=SystemInfoResponse)
async def system_info() -> SystemInfoResponse:
    """Return static deployment information about the running service."""
    return SystemInfoResponse(
        app_name=settings.app_name,
        app_version=settings.app_version,
        environment=settings.environment,
        api_version=settings.api_v1_prefix,
        database_url=settings.database_url,
        backend_host=settings.backend_host,
        backend_port=settings.backend_port,
    )
