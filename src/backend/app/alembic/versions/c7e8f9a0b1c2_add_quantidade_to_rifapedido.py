"""Add quantidade to rifapedido

Revision ID: c7e8f9a0b1c2
Revises: 5a4b1c2d3e4f
Create Date: 2025-10-19 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'c7e8f9a0b1c2'
down_revision = '5a4b1c2d3e4f'
branch_labels = None
depends_on = None


def upgrade():
    bind = op.get_bind()
    insp = sa.inspect(bind)
    cols = [c['name'] for c in insp.get_columns('rifapedido')]
    if 'quantidade' not in cols:
        op.add_column(
            'rifapedido',
            sa.Column('quantidade', sa.Integer(), nullable=False, server_default=sa.text('1')),
        )


def downgrade():
    op.drop_column('rifapedido', 'quantidade')

