"""Shared conftest for the backend test suite."""

import asyncio
import logging

from httpx import ASGITransport, AsyncClient

# Keep logs quiet during tests.
logging.disable(logging.CRITICAL)


class SyncASGIClient:
    """Synchronous wrapper around HTTPX's async in-process ASGI transport."""

    def __init__(self, app):
        self._app = app

    def request(self, method, url, **kwargs):
        async def send():
            async with AsyncClient(
                transport=ASGITransport(app=self._app), base_url="http://testserver"
            ) as client:
                return await client.request(method, url, **kwargs)

        return asyncio.run(send())

    def get(self, url, **kwargs):
        return self.request("GET", url, **kwargs)

    def post(self, url, **kwargs):
        return self.request("POST", url, **kwargs)
