from __future__ import annotations

import datetime as dt
from dataclasses import dataclass
from typing import Optional

import jwt

from app.core.config import settings


@dataclass
class EmailData:
    subject: str
    html_content: str


def _now_utc() -> dt.datetime:
    return dt.datetime.now(dt.timezone.utc)


def generate_password_reset_token(email: str, expires_minutes: int = 60) -> str:
    payload = {
        "sub": email,
        "type": "password_recovery",
        "exp": _now_utc() + dt.timedelta(minutes=expires_minutes),
        "iat": _now_utc(),
    }
    token = jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")
    # pyjwt may return bytes on older versions
    return token if isinstance(token, str) else token.decode()


def verify_password_reset_token(token: str) -> Optional[str]:
    try:
        data = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])  # type: ignore[arg-type]
        if data.get("type") != "password_recovery":
            return None
        return str(data.get("sub")) if data.get("sub") else None
    except Exception:
        return None


def generate_reset_password_email(*, email_to: str, email: str, token: str) -> EmailData:
    frontend = settings.FRONTEND_HOST.rstrip("/") if settings.FRONTEND_HOST else ""
    reset_url = f"{frontend}/reset-password?token={token}" if frontend else f"/reset-password?token={token}"
    subject = "Password recovery"
    html = f"""
    <p>Olá,</p>
    <p>Uma solicitação de redefinição de senha foi feita para o usuário <strong>{email}</strong>.</p>
    <p>Se foi você, clique no link abaixo para redefinir sua senha:</p>
    <p><a href=\"{reset_url}\">Redefinir senha</a></p>
    <p>Se você não solicitou, ignore este email.</p>
    """
    return EmailData(subject=subject, html_content=html)


def generate_test_email(*, email_to: str) -> EmailData:
    subject = "Test email"
    html = f"<p>Test email to: {email_to}</p>"
    return EmailData(subject=subject, html_content=html)


def send_email(*, email_to: str, subject: str, html_content: str) -> None:
    """Best-effort email sender. If SMTP is not configured, it logs to stdout.

    This avoids crashing in environments without email settings.
    """
    if not settings.emails_enabled:
        # No SMTP configured; log and exit
        print(f"[email-disabled] To: {email_to} | Subject: {subject}")
        return
    try:
        import emails  # type: ignore

        message = emails.html(html=html_content, subject=subject, mail_from=str(settings.EMAILS_FROM_EMAIL))
        smtp_options = {
            "host": settings.SMTP_HOST,
            "port": settings.SMTP_PORT,
            "user": settings.SMTP_USER,
            "password": settings.SMTP_PASSWORD,
            "tls": True,
        }
        message.send(to=email_to, smtp=smtp_options)
    except Exception as e:
        # Don't raise to keep API resilient
        print(f"[email-error] failed to send email: {e}")

