from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import func, select

from app.api.deps import SessionDep, require_roles
from app.models import (
    Inscricao,
    InscricaoCreate,
    InscricaoPublic,
    InscricoesPublic,
    UserRole,
)

router = APIRouter(prefix="/inscricoes", tags=["inscricoes"])


@router.post("/", status_code=201, response_model=InscricaoPublic)
def create_inscricao(session: SessionDep, body: InscricaoCreate) -> InscricaoPublic:
    # Impede inscrições duplicadas por e-mail
    existing = session.exec(
        select(Inscricao).where(Inscricao.email == body.email)
    ).first()
    if existing:
        raise HTTPException(status_code=409, detail="E-mail já cadastrado")

    db_obj = Inscricao.model_validate(body)
    session.add(db_obj)
    session.commit()
    session.refresh(db_obj)
    return InscricaoPublic.model_validate(db_obj)


@router.get(
    "/",
    dependencies=[Depends(require_roles(UserRole.DIVULGACAO))],
    response_model=InscricoesPublic,
)
def list_inscricoes(session: SessionDep) -> InscricoesPublic:
    count = session.exec(select(func.count()).select_from(Inscricao)).one()
    results = session.exec(select(Inscricao)).all()
    return InscricoesPublic(data=results, count=count)
