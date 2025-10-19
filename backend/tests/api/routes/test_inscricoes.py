from fastapi.testclient import TestClient

from app.core.config import settings


def test_create_inscricao(client: TestClient) -> None:
    payload = {
        "nome": "Teste",
        "email": "inscricao1@example.com",
        "origem": "Estudante",
    }
    r = client.post(f"{settings.API_V1_STR}/inscricoes/", json=payload)
    assert r.status_code == 201
    data = r.json()
    assert data["nome"] == payload["nome"]
    assert data["email"] == payload["email"]
    assert data["origem"] == payload["origem"]
    assert "id" in data
    assert "created_at" in data


def test_create_inscricao_duplicate_email(client: TestClient) -> None:
    payload = {
        "nome": "Teste2",
        "email": "inscricao2@example.com",
        "origem": "Profissional",
    }
    r1 = client.post(f"{settings.API_V1_STR}/inscricoes/", json=payload)
    assert r1.status_code == 201
    r2 = client.post(f"{settings.API_V1_STR}/inscricoes/", json=payload)
    assert r2.status_code == 409
    assert r2.json()["detail"] == "E-mail já cadastrado"


def test_list_inscricoes(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    # Ensure there is at least one entry
    base = {
        "nome": "Teste3",
        "email": "inscricao3@example.com",
        "origem": "Indicação",
    }
    client.post(f"{settings.API_V1_STR}/inscricoes/", json=base)

    r = client.get(
        f"{settings.API_V1_STR}/inscricoes/", headers=superuser_token_headers
    )
    assert r.status_code == 200
    data = r.json()
    assert "data" in data and isinstance(data["data"], list)
    assert "count" in data and isinstance(data["count"], int)
    assert data["count"] >= len(data["data"]) >= 1
