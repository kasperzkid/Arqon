"""Arqon FastAPI application entrypoint."""

import logging

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.routes.activity import router as activity_router
from app.api.routes.health import router as health_router
from app.api.routes.system import router as system_router
from app.api.routes.wallet import router as wallet_router
from app.core.config import settings
from app.core.logging import configure_logging

configure_logging()
logger = logging.getLogger(__name__)


def register_exception_handlers(app: FastAPI) -> None:
    """Centralized exception handling.

    - ``RequestValidationError`` -> JSON with ``validation_error`` + details
    - any other exception -> 500 with the service name (no internals leaked)
    """

    @app.exception_handler(RequestValidationError)
    async def validation_handler(_: Request, exc: RequestValidationError) -> JSONResponse:
        return JSONResponse(
            status_code=422,
            content={"error": "validation_error", "detail": exc.errors()},
        )

    @app.exception_handler(Exception)
    async def generic_handler(_: Request, exc: Exception) -> JSONResponse:
        logger.exception("unhandled_exception")
        return JSONResponse(
            status_code=500,
            content={"error": "internal_error", "service": settings.app_name},
        )


def create_app() -> FastAPI:
    """Build the FastAPI app with CORS, exception handlers and routers."""
    app = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
        description="Arqon — rule-based Solana security analysis platform (API).",
        openapi_url=f"{settings.api_v1_prefix}/openapi.json",
        docs_url=f"{settings.api_v1_prefix}/docs",
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_allow_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    register_exception_handlers(app)

    for router in (health_router, system_router, wallet_router, activity_router):
        app.include_router(router, prefix=settings.api_v1_prefix)

    return app


app = create_app()


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host=settings.backend_host,
        port=settings.backend_port,
        reload=settings.environment == "development",
    )
