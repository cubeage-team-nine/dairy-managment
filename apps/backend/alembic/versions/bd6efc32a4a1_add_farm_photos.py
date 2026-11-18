"""add farm photos

Revision ID: bd6efc32a4a1
Revises: a6c92f8d41b7
Create Date: 2026-11-16

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = "bd6efc32a4a1"
down_revision: Union[str, None] = "a6c92f8d41b7"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    if not sa.inspect(bind).has_table("farm_photos"):
        op.create_table(
            "farm_photos",
            sa.Column("farm_id", postgresql.UUID(as_uuid=True), nullable=False),
            sa.Column("filename", sa.String(length=100), nullable=False),
            sa.Column("original_filename", sa.String(length=255), nullable=False),
            sa.Column("content_type", sa.String(length=100), nullable=False),
            sa.Column("file_size", sa.Integer(), nullable=False),
            sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
            sa.Column(
                "created_at",
                sa.DateTime(timezone=True),
                server_default=sa.text("now()"),
                nullable=False,
            ),
            sa.Column(
                "updated_at",
                sa.DateTime(timezone=True),
                server_default=sa.text("now()"),
                nullable=False,
            ),
            sa.ForeignKeyConstraint(
                ["farm_id"],
                ["farms.id"],
                name="farm_photos_farm_id_fkey",
                ondelete="CASCADE",
            ),
            sa.PrimaryKeyConstraint("id", name="farm_photos_pkey"),
            sa.UniqueConstraint("filename", name="farm_photos_filename_key"),
        )
        op.create_index(
            "ix_farm_photos_farm_id",
            "farm_photos",
            ["farm_id"],
            unique=False,
        )


def downgrade() -> None:
    pass
