import sentry_sdk
from fastapi import FastAPI
from fastapi.routing import APIRoute
from starlette.middleware.cors import CORSMiddleware
from starlette.middleware.gzip import GZipMiddleware

# ProxyHeadersMiddleware became optional across Starlette versions; import defensively
try:  # pragma: no cover - environment-dependent
    from starlette.middleware.proxy_headers import ProxyHeadersMiddleware as _ProxyHeadersMiddleware
except Exception:  # pragma: no cover
    _ProxyHeadersMiddleware = None

from app.api.main import api_router
from app.core.config import settings


def custom_generate_unique_id(route: APIRoute) -> str:
    return f"{route.tags[0]}-{route.name}"


if settings.SENTRY_DSN and settings.ENVIRONMENT != "local":
    sentry_sdk.init(dsn=str(settings.SENTRY_DSN), enable_tracing=True)

extra_docs = {"docs_url": "/docs", "redoc_url": "/redoc"}
if settings.ENVIRONMENT != "local":
    extra_docs = {"docs_url": None, "redoc_url": None}

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    generate_unique_id_function=custom_generate_unique_id,
    **extra_docs,
)

# Set all CORS enabled origins
if settings.all_cors_origins:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.all_cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

app.include_router(api_router, prefix=settings.API_V1_STR)

# Compression for responses over 1KB
app.add_middleware(GZipMiddleware, minimum_size=1024)

# Honor X-Forwarded-Proto / X-Forwarded-For from Traefik/NGINX
# Ensures redirects use https scheme when behind a reverse proxy
if _ProxyHeadersMiddleware is not None:
    app.add_middleware(_ProxyHeadersMiddleware)
