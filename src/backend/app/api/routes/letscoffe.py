from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import func, select

from app.api.deps import SessionDep, require_roles
from app.models import (
    Produto,
    ProdutoCreate,
    ProdutoPublic,
    ProdutoUpdate,
    ProdutosPublic,
    UserRole,
)


router = APIRouter(prefix="/letscoffe", tags=["letscoffe"])


@router.post(
    "/produtos",
    status_code=201,
    dependencies=[Depends(require_roles(UserRole.LETSCOFFE))],
    response_model=ProdutoPublic,
)
def criar_produto(session: SessionDep, body: ProdutoCreate) -> ProdutoPublic:
    db_obj = Produto.model_validate(body)
    session.add(db_obj)
    session.commit()
    session.refresh(db_obj)
    return ProdutoPublic.model_validate(db_obj)


@router.get(
    "/produtos",
    dependencies=[Depends(require_roles(UserRole.LETSCOFFE))],
    response_model=ProdutosPublic,
)
def listar_produtos(session: SessionDep) -> ProdutosPublic:
    count = session.exec(select(func.count()).select_from(Produto)).one()
    results = session.exec(select(Produto).order_by(Produto.created_at.desc())).all()
    data = [ProdutoPublic.model_validate(p) for p in results]
    return ProdutosPublic(data=data, count=count)


# Optional aliases with trailing slash to avoid 404/redirect surprises
@router.get(
    "/produtos/",
    dependencies=[Depends(require_roles(UserRole.LETSCOFFE))],
    include_in_schema=False,
)
def listar_produtos_alt(session: SessionDep) -> ProdutosPublic:  # pragma: no cover
    return listar_produtos(session)


@router.post(
    "/produtos/",
    status_code=201,
    dependencies=[Depends(require_roles(UserRole.LETSCOFFE))],
    include_in_schema=False,
)
def criar_produto_alt(session: SessionDep, body: ProdutoCreate) -> ProdutoPublic:  # pragma: no cover
    return criar_produto(session, body)


@router.patch(
    "/produtos/{id}",
    dependencies=[Depends(require_roles(UserRole.LETSCOFFE))],
    response_model=ProdutoPublic,
)
def atualizar_produto(id: str, session: SessionDep, body: ProdutoUpdate) -> ProdutoPublic:
    import uuid as _uuid
    from datetime import datetime, timezone

    try:
        pid = _uuid.UUID(str(id))
    except Exception:
        raise HTTPException(status_code=400, detail="ID inválido")
    produto = session.get(Produto, pid)
    if not produto:
        raise HTTPException(status_code=404, detail="Produto não encontrado")
    update_data = body.model_dump(exclude_unset=True)
    produto.sqlmodel_update(update_data, update={"updated_at": datetime.now(timezone.utc)})
    session.add(produto)
    session.commit()
    session.refresh(produto)
    return ProdutoPublic.model_validate(produto)


@router.delete(
    "/produtos/{id}",
    status_code=204,
    dependencies=[Depends(require_roles(UserRole.LETSCOFFE))],
)
def deletar_produto(id: str, session: SessionDep) -> None:
    import uuid as _uuid
    try:
        pid = _uuid.UUID(str(id))
    except Exception:
        raise HTTPException(status_code=400, detail="ID inválido")
    produto = session.get(Produto, pid)
    if not produto:
        raise HTTPException(status_code=404, detail="Produto não encontrado")
    session.delete(produto)
    session.commit()
