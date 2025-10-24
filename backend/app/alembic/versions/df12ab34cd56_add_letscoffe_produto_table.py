"""Add Let's Coffe produtos table

Revision ID: df12ab34cd56
Revises: c7e8f9a0b1c2
Create Date: 2025-10-19 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision = 'df12ab34cd56'
down_revision = 'c7e8f9a0b1c2'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'produto',
        sa.Column('nome', sa.String(length=255), nullable=False),
        sa.Column('quantidade', sa.Integer(), nullable=False, server_default=sa.text('1')),
        sa.Column('preco', sa.Float(), nullable=False),
        sa.Column('descricao', sa.String(length=2000), nullable=True),
        sa.Column('foto', sa.Text(), nullable=True),
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('NOW()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('NOW()'), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_produto_nome', 'produto', ['nome'], unique=False)


def downgrade():
    op.drop_index('ix_produto_nome', table_name='produto')
    op.drop_table('produto')

