"""Add inscricao table for event registrations

Revision ID: b9f1749f1e3b
Revises: 1a31ce608336
Create Date: 2025-10-18 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision = 'b9f1749f1e3b'
down_revision = '1a31ce608336'
branch_labels = None
depends_on = None


def upgrade():
    # Ensure uuid extension exists
    op.execute('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')

    op.create_table(
        'inscricao',
        sa.Column('nome', sa.String(length=255), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('origem', sa.String(length=255), nullable=False),
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('uuid_generate_v4()'), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('NOW()'), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_inscricao_email_unique', 'inscricao', ['email'], unique=True)


def downgrade():
    op.drop_index('ix_inscricao_email_unique', table_name='inscricao')
    op.drop_table('inscricao')
