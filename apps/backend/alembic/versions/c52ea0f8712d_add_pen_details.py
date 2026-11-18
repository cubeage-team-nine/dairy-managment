"""add details to existing pans

Revision ID: c52ea0f8712d
Revises: bd6efc32a4a1
Create Date: 2026-11-16

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "c52ea0f8712d"
down_revision: Union[str, None] = "bd6efc32a4a1"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    existing_columns = {
        column["name"] for column in sa.inspect(bind).get_columns("pans")
    }
    new_columns = (
        ("pen_number", sa.String(length=100)),
        ("pen_type", sa.String(length=100)),
        ("max_animal_capacity", sa.Integer()),
        ("location", sa.Text()),
    )
    for name, column_type in new_columns:
        if name not in existing_columns:
            op.add_column("pans", sa.Column(name, column_type, nullable=True))


def downgrade() -> None:
    bind = op.get_bind()
    existing_columns = {
        column["name"] for column in sa.inspect(bind).get_columns("pans")
    }
    for name in ("location", "max_animal_capacity", "pen_type", "pen_number"):
        if name in existing_columns:
            op.drop_column("pans", name)
