"""Arqon application settings.

All configuration is environment-based (see ``.env.example``). Values are
read through :func:`get_settings`, which returns a cached process-wide
instance.
"""

from functools import lru_cache

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Pydantic settings model for the Arqon API."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    # Application
    app_name: str = "Arqon"
    app_version: str = "0.1.0"
    environment: str = "development"
    debug: bool = False
    api_v1_prefix: str = "/api/v1"

    # Server
    backend_host: str = "127.0.0.1"
    backend_port: int = 8000

    # Logging
    log_level: str = "INFO"
    log_format: str = "text"  # or "json"

    # CORS (allows the local frontend during development)
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"

    # Database (SQLite for local development)
    database_url: str = "sqlite:///./arqon_dev.db"

    # Blockchain (public mainnet-beta endpoint by default, no key required)
    solana_rpc_url: str = "https://api.mainnet-beta.solana.com"
    solana_request_timeout: float = 10.0

    @field_validator("environment")
    @classmethod
    def _validate_environment(cls, value: str) -> str:
        allowed = ("development", "test", "staging", "production")
        normalized = value.strip().lower()
        if normalized not in allowed:
            raise ValueError(f"environment must be one of: {', '.join(allowed)}")
        return normalized

    @property
    def cors_allow_origins(self) -> list[str]:
        """Parsed CORS origins as a list."""
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """Return the process-wide settings instance."""
    return Settings()


settings = get_settings()
