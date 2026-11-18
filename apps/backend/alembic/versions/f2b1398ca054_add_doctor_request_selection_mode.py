"""persist manual or automatic doctor selection on requests

Revision ID: f2b1398ca054
Revises: d4a91c70b2ef
Create Date: 2026-11-17

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "f2b1398ca054"
down_revision: Union[str, Sequence[str], None] = "d4a91c70b2ef"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    columns = {column["name"] for column in sa.inspect(op.get_bind()).get_columns("doctor_requests")}
    if "selection_mode" not in columns:
        op.add_column(
            "doctor_requests",
            sa.Column("selection_mode", sa.String(length=20), nullable=False, server_default="MANUAL"),
        )
    # Older requests without a doctor are treated as auto-selection requests.
    op.execute("UPDATE doctor_requests SET selection_mode = 'AUTO' WHERE doctor_id IS NULL")


def downgrade() -> None:
    columns = {column["name"] for column in sa.inspect(op.get_bind()).get_columns("doctor_requests")}
    if "selection_mode" in columns:
        op.drop_column("doctor_requests", "selection_mode")
