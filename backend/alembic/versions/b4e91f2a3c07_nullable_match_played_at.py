"""make match played_at nullable for planned matches

Revision ID: b4e91f2a3c07
Revises: 20f78600bf3a
Create Date: 2026-05-31

"""
from alembic import op
import sqlalchemy as sa

revision = 'b4e91f2a3c07'
down_revision = '20f78600bf3a'
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table('matches') as batch_op:
        batch_op.alter_column(
            'played_at',
            existing_type=sa.DateTime(),
            nullable=True,
            server_default=None,
        )


def downgrade():
    with op.batch_alter_table('matches') as batch_op:
        batch_op.alter_column(
            'played_at',
            existing_type=sa.DateTime(),
            nullable=False,
            server_default=sa.text('(CURRENT_TIMESTAMP)'),
        )
