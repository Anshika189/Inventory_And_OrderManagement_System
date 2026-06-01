"""
Standardized API response envelopes.

Every endpoint returns one of these so the frontend can branch on
`success` deterministically.
"""

from typing import Any, Generic, List, Optional, TypeVar

from pydantic import BaseModel, Field

T = TypeVar("T")


class APIResponse(BaseModel, Generic[T]):
    """Unified success envelope.

    Note: ``from_attributes`` is intentionally NOT enabled here. Enabling
    it on the generic envelope forces Pydantic to introspect the inner
    type's ORM relationships when building the generic schema, which
    fails for models with nested SQLAlchemy relationships.
    """

    success: bool = True
    message: str = "OK"
    data: Optional[T] = None


class APIError(BaseModel):
    """Unified error envelope."""

    success: bool = False
    message: str
    code: str = "internal_error"
    errors: List[dict] = Field(default_factory=list)


class PaginationParams(BaseModel):
    """Common pagination query parameters."""

    page: int = Field(default=1, ge=1)
    size: int = Field(default=20, ge=1, le=100)
    search: Optional[str] = None
    sort_by: Optional[str] = None
    sort_dir: Optional[str] = Field(default="desc", pattern="^(asc|desc)$")


class Paginated(BaseModel, Generic[T]):
    """Paginated payload returned in `data` for list endpoints."""

    items: List[T]
    total: int
    page: int
    size: int
    pages: int

    @classmethod
    def build(cls, items: List[T], total: int, page: int, size: int) -> "Paginated[T]":
        pages = (total + size - 1) // size if size else 1
        return cls(items=items, total=total, page=page, size=size, pages=pages)


__all__ = ["APIResponse", "APIError", "PaginationParams", "Paginated"]
