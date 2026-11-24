"""Logging configuration for Arqon.

Uses the standard library ``logging`` so the whole application shares one
configuration. A JSON formatter is available via ``ARQON_LOG_FORMAT=json``
for structured output.
"""

import json
import logging
import sys

from app.core.config import settings


class _JSONFormatter(logging.Formatter):
    """One JSON object per log line, suitable for collectors/CLIs."""

    def format(self, record: logging.LogRecord) -> str:
        payload = {
            "timestamp": self.formatTime(record, "%Y-%m-%dT%H:%M:%SZ"),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }
        if record.exc_info:
            payload["exception"] = self.formatException(record.exc_info)
        return json.dumps(payload, default=str)


def configure_logging() -> None:
    """Attach a root handler. Idempotent; call once at startup."""
    root = logging.getLogger()
    if root.handlers:
        return
    root.setLevel(getattr(logging, settings.log_level.upper(), logging.INFO))
    handler = logging.StreamHandler(sys.stdout)
    if settings.log_format.lower() == "json":
        handler.setFormatter(_JSONFormatter())
    else:
        handler.setFormatter(logging.Formatter("%(asctime)s %(levelname)s %(name)s - %(message)s"))
    root.addHandler(handler)
