"""add treatment duration and farmer farm expenses

Revision ID: a84cc439f28e
Revises: f2b1398ca054
Create Date: 2026-11-17

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = "a84cc439f28e"
down_revision: Union[str, Sequence[str], None] = "f2b1398ca054"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    if "treatment_duration" not in {
        column["name"] for column in sa.inspect(bind).get_columns("health_records")
    }:
        op.add_column("health_records", sa.Column("treatment_duration", sa.String(length=100), nullable=True))

    if not sa.inspect(bind).has_table("farm_expenses"):
        op.create_table(
            "farm_expenses",
            sa.Column("farmer_id", postgresql.UUID(as_uuid=True), nullable=False),
            sa.Column("animal_id", postgresql.UUID(as_uuid=True), nullable=True),
            sa.Column("title", sa.String(length=150), nullable=False),
            sa.Column("category", sa.String(length=50), nullable=False),
            sa.Column("amount", sa.Numeric(12, 2), nullable=False),
            sa.Column("expense_date", sa.Date(), nullable=False),
            sa.Column("description", sa.Text(), nullable=True),
            sa.Column("payment_method", sa.String(length=50), nullable=True),
            sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
            sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
            sa.ForeignKeyConstraint(["animal_id"], ["animals.id"]),
            sa.ForeignKeyConstraint(["farmer_id"], ["farmer_profiles.id"]),
            sa.PrimaryKeyConstraint("id"),
        )
    inspector = sa.inspect(bind)
    for name, columns in (
        ("ix_farm_expenses_farmer_id", ["farmer_id"]),
        ("ix_farm_expenses_expense_date", ["expense_date"]),
        ("ix_farm_expenses_category", ["category"]),
    ):
        if not inspector.has_index("farm_expenses", name):
            op.create_index(name, "farm_expenses", columns, unique=False)


def downgrade() -> None:
    bind = op.get_bind()
    if sa.inspect(bind).has_table("farm_expenses"):
        for name in ("ix_farm_expenses_category", "ix_farm_expenses_expense_date", "ix_farm_expenses_farmer_id"):
            if sa.inspect(bind).has_index("farm_expenses", name):
                op.drop_index(name, table_name="farm_expenses")
        op.drop_table("farm_expenses")
    if "treatment_duration" in {
        column["name"] for column in sa.inspect(bind).get_columns("health_records")
    }:
        op.drop_column("health_records", "treatment_duration")
