"""Shared API dependencies."""

from typing import Annotated

from fastapi import Depends, Query
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.schemas.common import PaginationParams


def pagination_params(
    page: Annotated[int, Query(ge=1)] = 1,
    size: Annotated[int, Query(ge=1, le=100)] = 20,
    search: Annotated[str | None, Query(max_length=200)] = None,
    sort_by: Annotated[str | None, Query(max_length=64)] = None,
    sort_dir: Annotated[str | None, Query(pattern="^(asc|desc)$")] = "desc",
) -> PaginationParams:
    return PaginationParams(
        page=page, size=size, search=search, sort_by=sort_by, sort_dir=sort_dir or "desc"
    )


DbSession = Annotated[Session, Depends(get_db)]
Pagination = Annotated[PaginationParams, Depends(pagination_params)]

__all__ = ["DbSession", "Pagination", "pagination_params"]
