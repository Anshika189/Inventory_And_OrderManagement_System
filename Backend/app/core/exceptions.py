"""
Domain-level exception hierarchy.

Each exception maps cleanly to an HTTP status code in the FastAPI handler
and surfaces a stable error code that the frontend can branch on.
"""

from typing import Any, Dict, List, Optional


class AppException(Exception):
    """Base exception for all application errors."""

    status_code: int = 500
    code: str = "internal_error"

    def __init__(
        self,
        message: str,
        *,
        errors: Optional[List[Dict[str, Any]]] = None,
        code: Optional[str] = None,
        status_code: Optional[int] = None,
    ) -> None:
        super().__init__(message)
        self.message = message
        self.errors = errors or []
        if code is not None:
            self.code = code
        if status_code is not None:
            self.status_code = status_code


class NotFoundError(AppException):
    status_code = 404
    code = "not_found"


class ConflictError(AppException):
    status_code = 409
    code = "conflict"


class ValidationError(AppException):
    status_code = 422
    code = "validation_error"


class BusinessRuleError(AppException):
    status_code = 422
    code = "business_rule_violation"


class AuthenticationError(AppException):
    status_code = 401
    code = "unauthenticated"


class AuthorizationError(AppException):
    status_code = 403
    code = "forbidden"
