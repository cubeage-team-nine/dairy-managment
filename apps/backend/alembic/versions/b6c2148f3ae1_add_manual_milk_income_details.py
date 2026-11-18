"""add manual milk income details to existing milk records

Revision ID: b6c2148f3ae1
Revises: a84cc439f28e
Create Date: 2026-11-17

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "b6c2148f3ae1"
down_revision: Union[str, Sequence[str], None] = "a84cc439f28e"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    columns = {column["name"] for column in sa.inspect(op.get_bind()).get_columns("milk_records")}
    for name, column in (
        ("milk_session", sa.Column("milk_session", sa.String(length=20), nullable=True)),
        ("customer_name", sa.Column("customer_name", sa.String(length=150), nullable=True)),
        ("description", sa.Column("description", sa.Text(), nullable=True)),
    ):
        if name not in columns:
            op.add_column("milk_records", column)


def downgrade() -> None:
    columns = {column["name"] for column in sa.inspect(op.get_bind()).get_columns("milk_records")}
    for name in ("description", "customer_name", "milk_session"):
        if name in columns:
            op.drop_column("milk_records", name)
