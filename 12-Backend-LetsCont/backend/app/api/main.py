from fastapi import APIRouter, Depends

from app.api.routes import contatos, inscricoes, items, login, private, rifas, users, utils
from app.api.deps import enforce_readonly_user
from app.core.config import settings

api_router = APIRouter(dependencies=[Depends(enforce_readonly_user)])
api_router.include_router(login.router)
api_router.include_router(users.router)
api_router.include_router(utils.router)
api_router.include_router(items.router)
api_router.include_router(inscricoes.router)
api_router.include_router(contatos.router)
api_router.include_router(rifas.router)


if settings.ENVIRONMENT == "local":
    api_router.include_router(private.router)
