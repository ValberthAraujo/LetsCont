from typing import Any

import logging
import httpx
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlmodel import func, select

from app.api.deps import SessionDep, require_roles
from app.core.config import settings
from app.models import RifaCheckout, RifaPedido, RifaPublic, UserRole

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/rifas", tags=["rifas"])


@router.post("/checkout", status_code=201)
def criar_pagamento_pix(session: SessionDep, body: RifaCheckout) -> dict[str, Any]:
    if not settings.mercado_pago_enabled:
        raise HTTPException(status_code=503, detail="Mercado Pago não configurado")

    # Mercado Pago requer um header de idempotência para evitar pagamentos duplicados
    # e em alguns ambientes a ausência causa erro 400.
    import uuid as _uuid
    idem_key = f"letscont-{_uuid.uuid4()}"

    headers = {
        "Authorization": f"Bearer {settings.MERCADO_PAGO_ACCESS_TOKEN}",
        "Content-Type": "application/json",
        "X-Idempotency-Key": idem_key,
    }
    payload: dict[str, Any] = {
        "transaction_amount": round(float(body.valor), 2),
        "description": f"Rifa LetsCont x{body.quantidade}",
        "payment_method_id": "pix",
        "payer": {
            "email": body.email,
            "first_name": body.nome,
        },
    }
    # Optional notification URL for webhooks, if configured
    if settings.MERCADO_PAGO_WEBHOOK_URL:
        payload["notification_url"] = str(settings.MERCADO_PAGO_WEBHOOK_URL)
    # Create payment
    with httpx.Client(base_url="https://api.mercadopago.com", timeout=15) as client:
        resp = client.post("/v1/payments", headers=headers, json=payload)
        if resp.status_code not in (200, 201):
            raise HTTPException(status_code=502, detail=f"Mercado Pago error: {resp.text}")
        data = resp.json()

    transaction = data.get("point_of_interaction", {}).get("transaction_data", {})
    qr_code = transaction.get("qr_code")
    qr_code_base64 = transaction.get("qr_code_base64")
    payment_id = str(data.get("id")) if data.get("id") is not None else None
    status = data.get("status", "pending")

    pedido = RifaPedido(
        nome=body.nome,
        email=body.email,
        valor=float(body.valor),
        quantidade=int(body.quantidade or 1),
        status=str(status),
        mp_payment_id=payment_id,
        qr_code=qr_code,
        qr_code_base64=qr_code_base64,
    )
    session.add(pedido)
    session.commit()
    session.refresh(pedido)

    return {
        "id": str(pedido.id),
        "status": pedido.status,
        "mp_payment_id": payment_id,
        "qr_code": qr_code,
        "qr_code_base64": qr_code_base64,
    }


@router.post("/webhook")
async def mp_webhook(request: Request, session: SessionDep) -> dict[str, Any]:
    """Endpoint para receber notificações do Mercado Pago.

    Em produção, configure a URL pública no painel do Mercado Pago.
    Para eventos de pagamento, consultamos o detalhe do pagamento e atualizamos o pedido.
    """
    # TODO: Implementar validação de assinatura do webhook para segurança
    # x_signature = request.headers.get("x-signature")
    # x_request_id = request.headers.get("x-request-id")
    # if not is_valid_signature(x_signature, x_request_id, body):
    #     raise HTTPException(status_code=400, detail="Invalid signature")

    try:
        body = await request.json()
    except Exception as e:
        logger.warning(f"Webhook received non-json body: {e}")
        body = None

    # Mercado Pago envia variados formatos. Buscamos id de pagamento.
    payment_id = None
    if isinstance(body, dict) and body.get("action") in ("payment.created", "payment.updated"):
        payment_id = body.get("data", {}).get("id")

    if not payment_id:
        logger.info(f"Webhook received without a valid payment ID or action. Body: {body}")
        return {"status": "ok", "detail": "No relevant action or payment ID."}

    if settings.mercado_pago_enabled:
        headers = {"Authorization": f"Bearer {settings.MERCADO_PAGO_ACCESS_TOKEN}"}
        with httpx.Client(base_url="https://api.mercadopago.com", timeout=15) as client:
            r = client.get(f"/v1/payments/{payment_id}", headers=headers)
            if r.status_code in (200, 201):
                info = r.json()
                status = str(info.get("status", "pending"))
                statement = select(RifaPedido).where(RifaPedido.mp_payment_id == str(payment_id))
                pedido = session.exec(statement).first()
                if pedido:
                    pedido.status = status
                    session.add(pedido)
                    session.commit()
    return {"status": "ok"}


@router.get("/status")
def obter_status(id: str, session: SessionDep) -> dict[str, Any]:
    """Consulta o status de um pedido de rifa.

    Aceita tanto UUID local (pedido.id) quanto mp_payment_id do Mercado Pago.
    Se o MP estiver configurado e houver mp_payment_id, atualiza o status
    consultando a API do Mercado Pago antes de responder.
    """
    pedido: RifaPedido | None = None
    # Tenta resolver como UUID do pedido
    try:
        import uuid

        pedido_uuid = uuid.UUID(str(id))
        pedido = session.get(RifaPedido, pedido_uuid)
    except Exception:
        pedido = None

    # Se não encontrou, tenta por mp_payment_id
    if not pedido:
        pedido = session.exec(
            select(RifaPedido).where(RifaPedido.mp_payment_id == str(id))
        ).first()

    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido não encontrado")

    # Atualiza status consultando o Mercado Pago se possível
    if settings.mercado_pago_enabled and pedido.mp_payment_id:
        headers = {"Authorization": f"Bearer {settings.MERCADO_PAGO_ACCESS_TOKEN}"}
        try:
            with httpx.Client(base_url="https://api.mercadopago.com", timeout=15) as client:
                r = client.get(f"/v1/payments/{pedido.mp_payment_id}", headers=headers)
                if r.status_code in (200, 201):
                    info = r.json()
                    status = str(info.get("status", pedido.status or "pending"))
                    if status and status != pedido.status:
                        pedido.status = status
                        session.add(pedido)
                        session.commit()
        except Exception:
            # Melhor esforço: se falhar a chamada, devolve status atual
            pass

    return {
        "id": str(pedido.id),
        "status": pedido.status,
        "mp_payment_id": pedido.mp_payment_id,
    }


@router.get(
    "/",
    dependencies=[Depends(require_roles(UserRole.FINANCEIRO))],
)
def listar_pedidos(session: SessionDep) -> list[RifaPublic]:
    results = session.exec(select(RifaPedido).order_by(RifaPedido.created_at.desc())).all()
    return [RifaPublic.model_validate(r) for r in results]
