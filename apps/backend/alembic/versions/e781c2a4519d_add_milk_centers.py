"""add milk centers

Revision ID: e781c2a4519d
Revises: bd6efc32a4a1
Create Date: 2026-11-16

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = "e781c2a4519d"
down_revision: Union[str, None] = "bd6efc32a4a1"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    if not sa.inspect(bind).has_table("milk_centers"):
        op.create_table(
            "milk_centers",
            sa.Column("name", sa.String(length=200), nullable=False),
            sa.Column("code", sa.String(length=50), nullable=True),
            sa.Column("location", sa.String(length=200), nullable=True),
            sa.Column("manager_name", sa.String(length=150), nullable=True),
            sa.Column("contact_number", sa.String(length=20), nullable=True),
            sa.Column("email", sa.String(length=255), nullable=True),
            sa.Column("daily_capacity_litres", sa.Numeric(10, 2), nullable=True),
            sa.Column("is_active", sa.Boolean(), nullable=False, server_default=sa.true()),
            sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
            sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
            sa.PrimaryKeyConstraint("id", name="milk_centers_pkey"),
            sa.UniqueConstraint("code", name="milk_centers_code_key"),
        )
        op.create_index("ix_milk_centers_is_active", "milk_centers", ["is_active"], unique=False)


def downgrade() -> None:
    bind = op.get_bind()
    if sa.inspect(bind).has_table("milk_centers"):
        op.drop_index("ix_milk_centers_is_active", table_name="milk_centers")
        op.drop_table("milk_centers")
