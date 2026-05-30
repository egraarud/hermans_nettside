import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from app.config import settings

logger = logging.getLogger(__name__)


def send_provisional_password(to_email: str, username: str, password: str) -> None:
    if not settings.smtp_host or settings.smtp_host == "localhost":
        logger.info(
            "SMTP ikke konfigurert — logger passord til konsoll: "
            "bruker=%s passord=%s epost=%s",
            username,
            password,
            to_email,
        )
        return

    subject = "Velkommen til Hermans Turnering — ditt midlertidige passord"
    body = (
        f"Hei!\n\n"
        f"Du har fått en brukerkonto på Hermans Turnering.\n\n"
        f"Brukernavn: {username}\n"
        f"Midlertidig passord: {password}\n\n"
        f"Logg inn og bytt passordet ditt ved første innlogging.\n\n"
        f"Ha det gøy i turneringen!\n"
    )

    msg = MIMEMultipart()
    msg["From"] = settings.smtp_from
    msg["To"] = to_email
    msg["Subject"] = subject
    msg.attach(MIMEText(body, "plain", "utf-8"))

    try:
        with smtplib.SMTP(settings.smtp_host, settings.smtp_port) as server:
            server.ehlo()
            server.starttls()
            if settings.smtp_user:
                server.login(settings.smtp_user, settings.smtp_pass)
            server.sendmail(settings.smtp_from, [to_email], msg.as_string())
    except Exception:
        logger.exception("Klarte ikke sende e-post til %s", to_email)
        raise
