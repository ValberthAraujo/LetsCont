# LetsCont — API e Frontend (FastAPI + React)

Projeto baseado no Full Stack FastAPI Template, com backend em FastAPI/SQLModel e frontend em React/TypeScript (Vite + Chakra UI). Inclui autenticação JWT, migrações Alembic e integração opcional com envio de e‑mails e Sentry.

## Stack
- Backend: FastAPI, SQLModel, Pydantic v2, Alembic, PostgreSQL
- Frontend: React, Vite, TypeScript, Chakra UI, OpenAPI client gerado
- Infra: Docker Compose, Traefik (proxy), Adminer

## Estrutura
- `backend/` — API, modelos, rotas, migrações, scripts
- `frontend/` — dashboard em React + client OpenAPI
- `scripts/` — utilitários de build, deploy e geração de client
- `docker-compose.yml` e `docker-compose.override.yml` — orquestração dev/prod
- `.env` — variáveis de ambiente da stack (na raiz)
- `test.py` — teste manual rápido de inscrições e usuários

## Como Rodar (Desenvolvimento)
1) Crie um `.env` na raiz (exemplo mínimo):
```
STACK_NAME=letscont
DOMAIN=localhost
ENVIRONMENT=local
PROJECT_NAME=LetsCont
FRONTEND_HOST=http://localhost:5173
BACKEND_CORS_ORIGINS=http://localhost:5173
SECRET_KEY=<gere com: python -c "import secrets; print(secrets.token_urlsafe(32))">
FIRST_SUPERUSER=admin@example.com
FIRST_SUPERUSER_PASSWORD=SuperSecret123!
POSTGRES_DB=app
POSTGRES_USER=postgres
POSTGRES_PASSWORD=<sua_senha_db>
POSTGRES_PORT=5432
DOCKER_IMAGE_BACKEND=letscont-backend
DOCKER_IMAGE_FRONTEND=letscont-frontend
```

2) Suba a stack:
```
docker compose up -d --build
```

3) Acesse:
- API: http://localhost:8000 (docs: http://localhost:8000/docs)
- Frontend: http://localhost:5173
- Adminer: http://localhost:8080

Notas
- O serviço `prestart` aplica migrações e cria o superusuário. Garanta `FIRST_SUPERUSER_PASSWORD` com até 40 caracteres.
- Em dev você pode ignorar avisos de TLS do Traefik; use HTTP.

## Como Rodar (Local sem Docker)
Backend (usando `uv`):
```
cd backend
uv sync
set ENVIRONMENT=local
set PROJECT_NAME=LetsCont
set FRONTEND_HOST=http://localhost:5173
set FIRST_SUPERUSER=admin@example.com
set FIRST_SUPERUSER_PASSWORD=SuperSecret123!
set POSTGRES_SERVER=localhost
set POSTGRES_USER=user
set POSTGRES_PASSWORD=x
set POSTGRES_DB=app
set SQLALCHEMY_DATABASE_URI_OVERRIDE=sqlite:///./dev.db
uv run python -m app.initial_data
uv run fastapi dev app/main.py
```

Frontend:
```
cd frontend
echo VITE_API_URL=http://localhost:8000 > .env.local
npm install
npm run dev
```

## Banco de Dados e Migrações
- Persistência: volume `app-db-data` no PostgreSQL (evite `docker compose down -v` para não apagar dados).
- Migrações: dentro do container do backend:
```
docker compose exec backend bash
alembic revision --autogenerate -m "Mensagem da migração"
alembic upgrade head
```

## Testes
- Rápido (manual):
```
API_URL=http://localhost:8000 \
ADMIN_EMAIL=admin@example.com \
ADMIN_PASSWORD=SuperSecret123! \
python test.py
```

- Automatizados (no container):
```
docker compose exec -T backend bash scripts/tests-start.sh
```

## Endpoints de Inscrições
- `POST /api/v1/inscricoes/` — público, cria uma inscrição (201). Retorna `id`, `created_at`, `nome`, `email`, `origem`.
- `GET /api/v1/inscricoes/` — restrito a superusuário; retorna `{ data, count }`.

## E‑mails
- Na criação de usuário pelo admin, o sistema envia link de definição de senha (token), não senha em claro.
- Em desenvolvimento, os e‑mails ficam desativados por padrão. Para testar, configure SMTP no `.env` (SMTP_HOST/PORT/TLS/USER/PASSWORD/EMAILS_FROM_EMAIL).

## Produção
- Defina `LETSENCRYPT_RESOLVER=le` no `.env` e configure o Traefik com ACME (porta 80/443, e‑mail e storage do ACME).
- DNS do seu domínio deve apontar para o servidor.

## Scripts Úteis
- `scripts/generate-client.sh` — gera o client OpenAPI do frontend
- `scripts/build.sh` / `scripts/build-push.sh` — build (e push) das imagens
- `scripts/deploy.sh` — gera `docker-stack.yml` e faz deploy em Swarm
- `backend/scripts/prestart.sh` — healthcheck do DB, migrações e dados iniciais

---

Documentação adicional:
- `backend/README.md` — detalhes do backend
- `frontend/README.md` — detalhes do frontend
