"""Add contato and rifa tables

Revision ID: 5a4b1c2d3e4f
Revises: 0f9c2d9a7abc
Create Date: 2025-10-18 06:20:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision = '5a4b1c2d3e4f'
down_revision = 'a1b2c3d4e5f6'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'contato',
        sa.Column('nome', sa.String(length=255), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('mensagem', sa.String(length=2000), nullable=False),
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('NOW()'), nullable=False),
        sa.Column('respondido', sa.Boolean(), server_default=sa.text('false'), nullable=False),
        sa.Column('resposta', sa.String(length=4000), nullable=True),
        sa.Column('respondido_em', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_contato_email', 'contato', ['email'], unique=False)

    op.create_table(
        'rifapedido',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('NOW()'), nullable=False),
        sa.Column('nome', sa.String(length=255), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('valor', sa.Float(), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='pending'),
        sa.Column('mp_payment_id', sa.String(length=100), nullable=True),
        sa.Column('qr_code', sa.Text(), nullable=True),
        sa.Column('qr_code_base64', sa.Text(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_rifapedido_email', 'rifapedido', ['email'], unique=False)


def downgrade():
    op.drop_index('ix_rifapedido_email', table_name='rifapedido')
    op.drop_table('rifapedido')
    op.drop_index('ix_contato_email', table_name='contato')
    op.drop_table('contato')
