"""Database session management.

The engine is created from ``settings.database_url`` so the same code runs
against SQLite locally and PostgreSQL later, driven purely by configuration.
"""

from collections.abc import Iterator
from typing import Any

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import settings
from app.database.base import Base


def _connect_args() -> dict[str, Any]:
    """SQLite needs ``check_same_thread``; other drivers reject it."""
    if settings.database_url.startswith("sqlite"):
        return {"check_same_thread": False}
    return {}


engine = create_engine(settings.database_url, connect_args=_connect_args())
SessionLocal = sessionmaker(autoflush=False, bind=engine)


def get_db() -> Iterator[Session]:
    """FastAPI dependency: yields a DB session and always closes it."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    """Create tables from models (development convenience).

    For real changes use alembic migrations (see ``alembic/``).
    """
    Base.metadata.create_all(bind=engine)
