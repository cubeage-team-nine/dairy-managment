"""add persisted doctor panel fields

Revision ID: d4a91c70b2ef
Revises: c52ea0f8712d, e781c2a4519d
Create Date: 2026-11-16

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = "d4a91c70b2ef"
down_revision: Union[str, Sequence[str], None] = ("c52ea0f8712d", "e781c2a4519d")
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("ALTER TABLE doctor_requests ADD COLUMN IF NOT EXISTS priority VARCHAR(20) NOT NULL DEFAULT 'MEDIUM'")
    op.execute("ALTER TABLE health_records ADD COLUMN IF NOT EXISTS symptoms TEXT")
    op.execute("ALTER TABLE health_records ADD COLUMN IF NOT EXISTS doctor_notes TEXT")
    op.execute("ALTER TABLE health_records ADD COLUMN IF NOT EXISTS follow_up_date DATE")
    op.execute("ALTER TABLE health_records ADD COLUMN IF NOT EXISTS health_status VARCHAR(50)")

    op.execute("ALTER TABLE mastitis_records ADD COLUMN IF NOT EXISTS doctor_id UUID REFERENCES doctor_profiles(id)")
    op.execute("ALTER TABLE mastitis_records ADD COLUMN IF NOT EXISTS symptoms TEXT")
    op.execute("ALTER TABLE mastitis_records ADD COLUMN IF NOT EXISTS affected_quarter VARCHAR(50)")
    op.execute("ALTER TABLE mastitis_records ADD COLUMN IF NOT EXISTS severity VARCHAR(30)")
    op.execute("ALTER TABLE mastitis_records ADD COLUMN IF NOT EXISTS diagnosis TEXT")
    op.execute("ALTER TABLE mastitis_records ADD COLUMN IF NOT EXISTS medicine VARCHAR(255)")
    op.execute("ALTER TABLE mastitis_records ADD COLUMN IF NOT EXISTS dose VARCHAR(100)")
    op.execute("ALTER TABLE mastitis_records ADD COLUMN IF NOT EXISTS status VARCHAR(30) NOT NULL DEFAULT 'PENDING'")
    op.execute("ALTER TABLE mastitis_records ADD COLUMN IF NOT EXISTS doctor_notes TEXT")

    op.execute("ALTER TABLE doctor_profiles ADD COLUMN IF NOT EXISTS address VARCHAR(500)")
    op.execute("ALTER TABLE doctor_profiles ADD COLUMN IF NOT EXISTS village VARCHAR(150)")
    op.execute("ALTER TABLE doctor_profiles ADD COLUMN IF NOT EXISTS district VARCHAR(150)")
    op.execute("ALTER TABLE doctor_profiles ADD COLUMN IF NOT EXISTS state VARCHAR(150)")
    op.execute("ALTER TABLE doctor_profiles ADD COLUMN IF NOT EXISTS profile_photo VARCHAR(255)")
    op.execute("ALTER TABLE doctor_profiles ADD COLUMN IF NOT EXISTS is_available BOOLEAN NOT NULL DEFAULT TRUE")

    if not sa.inspect(op.get_bind()).has_table("mastitis_case_history"):
        op.create_table(
            "mastitis_case_history",
            sa.Column("case_id", postgresql.UUID(as_uuid=True), nullable=False),
            sa.Column("doctor_id", postgresql.UUID(as_uuid=True), nullable=False),
            sa.Column("changed_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
            sa.Column("snapshot", sa.JSON(), nullable=False),
            sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
            sa.ForeignKeyConstraint(["case_id"], ["mastitis_records.id"], ondelete="CASCADE"),
            sa.ForeignKeyConstraint(["doctor_id"], ["doctor_profiles.id"]),
            sa.PrimaryKeyConstraint("id"),
        )
    if not sa.inspect(op.get_bind()).has_index("mastitis_case_history", "ix_mastitis_case_history_case_id"):
        op.create_index("ix_mastitis_case_history_case_id", "mastitis_case_history", ["case_id"], unique=False)


def downgrade() -> None:
    if sa.inspect(op.get_bind()).has_table("mastitis_case_history"):
        if sa.inspect(op.get_bind()).has_index("mastitis_case_history", "ix_mastitis_case_history_case_id"):
            op.drop_index("ix_mastitis_case_history_case_id", table_name="mastitis_case_history")
        op.drop_table("mastitis_case_history")
    for table, columns in {
        "doctor_requests": ("priority",),
        "health_records": ("symptoms", "doctor_notes", "follow_up_date", "health_status"),
        "mastitis_records": ("doctor_id", "symptoms", "affected_quarter", "severity", "diagnosis", "medicine", "dose", "status", "doctor_notes"),
        "doctor_profiles": ("address", "village", "district", "state", "profile_photo", "is_available"),
    }.items():
        for column in columns:
            op.execute(sa.text(f'ALTER TABLE {table} DROP COLUMN IF EXISTS {column}'))
