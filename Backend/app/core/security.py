"""
Security utilities.

Kept minimal for the assessment scope. The seam is in place to add JWT-based
auth, password hashing, etc. without rewriting callers.
"""

import base64
import hashlib
import hmac
import json
from typing import Any, Dict

from fastapi import Request

from app.core.config import settings


def _b64encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode("ascii")


def _b64decode(data: str) -> bytes:
    padding = "=" * (-len(data) % 4)
    return base64.urlsafe_b64decode(data + padding)


def _sign(payload_b64: str) -> str:
    secret = settings.SECRET_KEY.encode("utf-8")
    digest = hmac.new(secret, payload_b64.encode("ascii"), hashlib.sha256).digest()
    return _b64encode(digest)


def create_session_token(payload: Dict[str, Any]) -> str:
    """Serialize a small payload into a signed token."""
    body = _b64encode(json.dumps(payload, separators=(",", ":"), sort_keys=True).encode("utf-8"))
    return f"{body}.{_sign(body)}"


def decode_session_token(token: str) -> Dict[str, Any]:
    """Decode and verify a signed token; raises on tampering."""
    from app.core.exceptions import AuthenticationError
    try:
        body, sig = token.rsplit(".", 1)
    except ValueError as exc:
        raise AuthenticationError("Malformed token") from exc
    if not hmac.compare_digest(sig, _sign(body)):
        raise AuthenticationError("Invalid or expired token")
    try:
        return json.loads(_b64decode(body).decode("utf-8"))
    except (ValueError, json.JSONDecodeError) as exc:
        raise AuthenticationError("Corrupted token payload") from exc


def get_client_ip(request: Request) -> str:
    """Return the most trustworthy client IP we can determine."""
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


# Standard bearer scheme for future auth integration
BEARER_SCHEME = "Bearer"
HTTP_401_HEADERS = {"WWW-Authenticate": BEARER_SCHEME}


__all__ = [
    "create_session_token",
    "decode_session_token",
    "get_client_ip",
    "BEARER_SCHEME",
    "HTTP_401_HEADERS",
]
