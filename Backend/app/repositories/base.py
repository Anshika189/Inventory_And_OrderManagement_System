"""Generic repository primitives.

Each domain repository inherits ``BaseRepository`` to get the same
list/get/create/delete contract, then adds domain-specific queries.
"""

from typing import Generic, Iterable, Sequence, Type, TypeVar

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.database.base import Base

ModelT = TypeVar("ModelT", bound=Base)


class BaseRepository(Generic[ModelT]):
    """Reusable CRUD operations on a single model."""

    model: Type[ModelT]

    def __init__(self, db: Session) -> None:
        self.db = db

    # ---- read ----------------------------------------------------------
    def get(self, pk) -> ModelT | None:
        return self.db.get(self.model, pk)

    def get_or_404(self, pk) -> ModelT:
        obj = self.get(pk)
        if obj is None:
            from app.core.exceptions import NotFoundError
            raise NotFoundError(f"{self.model.__name__} not found")
        return obj

    def list_all(self) -> Sequence[ModelT]:
        stmt = select(self.model)
        return self.db.execute(stmt).scalars().all()

    def count(self) -> int:
        stmt = select(func.count()).select_from(self.model)
        return int(self.db.execute(stmt).scalar_one() or 0)

    # ---- write ---------------------------------------------------------
    def add(self, obj: ModelT) -> ModelT:
        self.db.add(obj)
        self.db.flush()
        return obj

    def add_all(self, objs: Iterable[ModelT]) -> list[ModelT]:
        self.db.add_all(list(objs))
        self.db.flush()
        return list(objs)

    def delete(self, obj: ModelT) -> None:
        self.db.delete(obj)
        self.db.flush()

    def refresh(self, obj: ModelT) -> ModelT:
        self.db.refresh(obj)
        return obj


__all__ = ["BaseRepository"]
