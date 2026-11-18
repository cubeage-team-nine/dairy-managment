"""add rejected account status

Revision ID: a6c92f8d41b7
Revises: f433819cd60d
Create Date: 2026-11-16

"""
from typing import Sequence, Union

from alembic import op


revision: str = "a6c92f8d41b7"
down_revision: Union[str, None] = "f433819cd60d"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("ALTER TYPE account_status ADD VALUE 'REJECTED'")


def downgrade() -> None:
    op.execute(
        "UPDATE users SET status = 'INACTIVE' "
        "WHERE status::text = 'REJECTED'"
    )
    op.execute("ALTER TYPE account_status RENAME TO account_status_old")
    op.execute(
        "CREATE TYPE account_status AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED')"
    )
    op.execute(
        "ALTER TABLE users ALTER COLUMN status TYPE account_status "
        "USING status::text::account_status"
    )
    op.execute("DROP TYPE account_status_old")
