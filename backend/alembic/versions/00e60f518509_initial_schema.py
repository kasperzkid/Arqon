"""initial_schema

Revision ID: 00e60f518509
Revises:
Create Date: 2026-11-24 15:01:29.320107

"""

from collections.abc import Sequence

# revision identifiers, used by Alembic.
revision: str = "00e60f518509"
down_revision: str | Sequence[str] | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
