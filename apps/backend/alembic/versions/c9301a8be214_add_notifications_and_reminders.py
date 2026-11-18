"""add farmer notifications and reminders

Revision ID: c9301a8be214
Revises: b6c2148f3ae1
Create Date: 2026-11-17
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "c9301a8be214"
down_revision: Union[str, Sequence[str], None] = "b6c2148f3ae1"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    inspector = sa.inspect(op.get_bind())
    if "notifications" not in inspector.get_table_names():
        op.create_table(
            "notifications",
            sa.Column("user_id", sa.UUID(), nullable=False),
            sa.Column("animal_id", sa.UUID(), nullable=True),
            sa.Column("title", sa.String(length=150), nullable=False),
            sa.Column("description", sa.Text(), nullable=True),
            sa.Column("category", sa.String(length=50), nullable=False, server_default="OTHER"),
            sa.Column("reminder_date", sa.Date(), nullable=False),
            sa.Column("status", sa.String(length=20), nullable=False, server_default="PENDING"),
            sa.Column("is_read", sa.Boolean(), nullable=False, server_default=sa.false()),
            sa.Column("id", sa.UUID(), nullable=False),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
            sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
            sa.ForeignKeyConstraint(["animal_id"], ["animals.id"], ondelete="SET NULL"),
            sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
            sa.PrimaryKeyConstraint("id"),
        )
        op.create_index("ix_notifications_user_date", "notifications", ["user_id", "reminder_date"])


def downgrade() -> None:
    if "notifications" in sa.inspect(op.get_bind()).get_table_names():
        op.drop_index("ix_notifications_user_date", table_name="notifications")
        op.drop_table("notifications")
