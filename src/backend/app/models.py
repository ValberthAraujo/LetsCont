import uuid
from datetime import datetime, timezone
from enum import Enum

from pydantic import EmailStr
from sqlalchemy import Column
from sqlalchemy.types import JSON
from sqlmodel import Field, Relationship, SQLModel


# Shared properties
class UserBase(SQLModel):
    email: EmailStr = Field(unique=True, index=True, max_length=255)
    is_active: bool = True
    is_superuser: bool = False
    is_readonly: bool = False
    full_name: str | None = Field(default=None, max_length=255)


class UserRole(str, Enum):
    FINANCEIRO = "financeiro"
    DIVULGACAO = "divulgacao"
    INFRA = "infra"
    LETSCOFFE = "letscoffe"


# Properties to receive via API on creation
class UserCreate(UserBase):
    password: str = Field(min_length=8, max_length=40)
    roles: list[UserRole] = Field(default_factory=list)


class UserRegister(SQLModel):
    email: EmailStr = Field(max_length=255)
    password: str = Field(min_length=8, max_length=40)
    full_name: str | None = Field(default=None, max_length=255)


# Properties to receive via API on update, all are optional
class UserUpdate(UserBase):
    email: EmailStr | None = Field(default=None, max_length=255)  # type: ignore
    password: str | None = Field(default=None, min_length=8, max_length=40)
    roles: list[UserRole] | None = Field(default=None)


class UserUpdateMe(SQLModel):
    full_name: str | None = Field(default=None, max_length=255)
    email: EmailStr | None = Field(default=None, max_length=255)


class UpdatePassword(SQLModel):
    current_password: str = Field(min_length=8, max_length=40)
    new_password: str = Field(min_length=8, max_length=40)


# Database model, database table inferred from class name
class User(UserBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    hashed_password: str
    items: list["Item"] = Relationship(back_populates="owner")
    roles: list[UserRole] = Field(
        default_factory=list,
        sa_column=Column(JSON, nullable=False, server_default="[]"),
    )


# Properties to return via API, id is always required
class UserPublic(UserBase):
    id: uuid.UUID
    roles: list[UserRole] = []


class UsersPublic(SQLModel):
    data: list[UserPublic]
    count: int


# Shared properties
class ItemBase(SQLModel):
    title: str = Field(min_length=1, max_length=255)
    description: str | None = Field(default=None, max_length=255)


# Properties to receive on item creation
class ItemCreate(ItemBase):
    pass


# Properties to receive on item update
class ItemUpdate(ItemBase):
    title: str | None = Field(default=None, min_length=1, max_length=255)  # type: ignore


# Database model, database table inferred from class name
class Item(ItemBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    owner_id: uuid.UUID = Field(
        foreign_key="user.id", nullable=False, ondelete="CASCADE"
    )
    owner: User | None = Relationship(back_populates="items")


# Properties to return via API, id is always required
class ItemPublic(ItemBase):
    id: uuid.UUID
    owner_id: uuid.UUID


class ItemsPublic(SQLModel):
    data: list[ItemPublic]
    count: int


# Generic message
class Message(SQLModel):
    message: str


# JSON payload containing access token
class Token(SQLModel):
    access_token: str
    token_type: str = "bearer"


# Contents of JWT token
class TokenPayload(SQLModel):
    sub: str | None = None


class NewPassword(SQLModel):
    token: str
    new_password: str = Field(min_length=8, max_length=40)


# Inscrições de evento
class InscricaoBase(SQLModel):
    nome: str = Field(min_length=1, max_length=255)
    email: EmailStr = Field(max_length=255)
    origem: str = Field(min_length=1, max_length=255)


class InscricaoCreate(InscricaoBase):
    pass


class Inscricao(InscricaoBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# Retornos públicos de inscrições
class InscricaoPublic(InscricaoBase):
    id: uuid.UUID
    created_at: datetime


class InscricoesPublic(SQLModel):
    data: list[InscricaoPublic]
    count: int


# Contatos
class ContatoBase(SQLModel):
    nome: str = Field(min_length=1, max_length=255)
    email: EmailStr = Field(max_length=255)
    mensagem: str = Field(min_length=1, max_length=2000)


class ContatoCreate(ContatoBase):
    pass


class Contato(ContatoBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    respondido: bool = False
    resposta: str | None = Field(default=None, max_length=4000)
    respondido_em: datetime | None = None


class ContatoPublic(ContatoBase):
    id: uuid.UUID
    created_at: datetime
    respondido: bool
    resposta: str | None
    respondido_em: datetime | None


class ContatosPublic(SQLModel):
    data: list[ContatoPublic]
    count: int


# Rifas / Pagamentos PIX (Mercado Pago)
class RifaCheckout(SQLModel):
    nome: str = Field(min_length=1, max_length=255)
    email: EmailStr = Field(max_length=255)
    valor: float = Field(gt=0)
    quantidade: int = Field(default=1, ge=1)


class RifaPedido(SQLModel, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    nome: str = Field(min_length=1, max_length=255)
    email: EmailStr = Field(max_length=255)
    valor: float
    quantidade: int = Field(default=1)
    status: str = Field(default="pending", max_length=50)
    mp_payment_id: str | None = Field(default=None, max_length=100)
    qr_code: str | None = None
    qr_code_base64: str | None = None


class RifaPublic(SQLModel):
    id: uuid.UUID
    created_at: datetime
    nome: str
    email: EmailStr
    valor: float
    quantidade: int
    status: str
    mp_payment_id: str | None = None


# Let's Coffe Produtos
class ProdutoBase(SQLModel):
    nome: str = Field(min_length=1, max_length=255)
    quantidade: int = Field(default=1, ge=0)
    preco: float = Field(gt=0)
    descricao: str | None = Field(default=None, max_length=2000)
    foto: str | None = None  # URL ou Data URL base64


class ProdutoCreate(ProdutoBase):
    pass


class ProdutoUpdate(SQLModel):
    nome: str | None = Field(default=None, max_length=255)
    quantidade: int | None = Field(default=None, ge=0)
    preco: float | None = Field(default=None, gt=0)
    descricao: str | None = Field(default=None, max_length=2000)
    foto: str | None = None


class Produto(ProdutoBase, table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class ProdutoPublic(ProdutoBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime


class ProdutosPublic(SQLModel):
    data: list[ProdutoPublic]
    count: int
