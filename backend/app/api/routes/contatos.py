from typing import Any
import uuid
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import func, select

from app.api.deps import SessionDep, require_roles
from app.core.config import settings
from app.models import (
    Contato,
    ContatoCreate,
    ContatoPublic,
    ContatosPublic,
    UserRole,
)


router = APIRouter(prefix="/contatos", tags=["contatos"])


@router.post("/", status_code=201, response_model=ContatoPublic)
def criar_contato(session: SessionDep, body: ContatoCreate) -> ContatoPublic:
    # Timeout (cooldown) entre submissões por e-mail
    now = datetime.now(timezone.utc)
    timeout_since = now - timedelta(seconds=settings.CONTACTS_POST_TIMEOUT_SECONDS)
    last = session.exec(
        select(Contato)
        .where(Contato.email == body.email)
        .where(Contato.created_at >= timeout_since)
        .order_by(Contato.created_at.desc())
    ).first()
    if last is not None:
        raise HTTPException(
            status_code=429,
            detail=f"Aguarde {settings.CONTACTS_POST_TIMEOUT_SECONDS}s para novo envio",
        )
    db_obj = Contato.model_validate(body)
    session.add(db_obj)
    session.commit()
    session.refresh(db_obj)
    return ContatoPublic.model_validate(db_obj)


@router.get(
    "/",
    dependencies=[Depends(require_roles(UserRole.INFRA))],
    response_model=ContatosPublic,
)
def listar_contatos(session: SessionDep) -> ContatosPublic:
    count = session.exec(select(func.count()).select_from(Contato)).one()
    results = session.exec(select(Contato).order_by(Contato.created_at.desc())).all()
    return ContatosPublic(data=results, count=count)


class ContatoRespostaBody(ContatoPublic):
    pass


@router.patch(
    "/{id}/responder",
    dependencies=[Depends(require_roles(UserRole.INFRA))],
    response_model=ContatoPublic,
)
def responder_contato(id: str, session: SessionDep, body: dict[str, Any]) -> ContatoPublic:
    try:
        contato_id = uuid.UUID(str(id))
    except Exception:
        raise HTTPException(status_code=400, detail="ID inválido")
    contato = session.get(Contato, contato_id)
    if not contato:
        raise HTTPException(status_code=404, detail="Contato não encontrado")
    resposta = (body or {}).get("resposta")
    if not resposta:
        raise HTTPException(status_code=400, detail="Campo 'resposta' é obrigatório")
    from datetime import datetime, timezone

    contato.resposta = str(resposta)
    contato.respondido = True
    contato.respondido_em = datetime.now(timezone.utc)
    session.add(contato)
    session.commit()
    session.refresh(contato)
    return ContatoPublic.model_validate(contato)
