"""Add roles (JSON) and is_readonly to user

Revision ID: a1b2c3d4e5f6
Revises: b9f1749f1e3b
Create Date: 2025-10-18 06:10:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'a1b2c3d4e5f6'
down_revision = 'b9f1749f1e3b'
branch_labels = None
depends_on = None


def upgrade():
    bind = op.get_bind()
    insp = sa.inspect(bind)
    cols = [c['name'] for c in insp.get_columns('user')]
    if 'is_readonly' not in cols:
        op.add_column('user', sa.Column('is_readonly', sa.Boolean(), nullable=False, server_default=sa.text('false')))
    if 'roles' not in cols:
        op.add_column('user', sa.Column('roles', sa.JSON(), nullable=False, server_default='[]'))


def downgrade():
    op.drop_column('user', 'roles')
