"""Customer repository."""

from typing import Sequence
from uuid import UUID

from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.models.customer import Customer
from app.repositories.base import BaseRepository


class CustomerRepository(BaseRepository[Customer]):
    model = Customer

    def __init__(self, db: Session) -> None:
        super().__init__(db)

    def by_email(self, email: str) -> Customer | None:
        stmt = select(Customer).where(Customer.email == email)
        return self.db.execute(stmt).scalar_one_or_none()

    def by_ids(self, ids: list[UUID]) -> Sequence[Customer]:
        if not ids:
            return []
        stmt = select(Customer).where(Customer.id.in_(ids))
        return self.db.execute(stmt).scalars().all()

    def paginate(
        self,
        *,
        page: int,
        size: int,
        search: str | None = None,
        sort_by: str | None = "created_at",
        sort_dir: str = "desc",
    ) -> tuple[Sequence[Customer], int]:
        stmt = select(Customer)
        count_stmt = select(func.count()).select_from(Customer)

        if search:
            term = f"%{search.lower()}%"
            cond = or_(
                func.lower(Customer.full_name).like(term),
                func.lower(Customer.email).like(term),
                func.coalesce(func.lower(Customer.phone), "").like(term),
            )
            stmt = stmt.where(cond)
            count_stmt = count_stmt.where(cond)

        sortable = {
            "full_name": Customer.full_name,
            "email": Customer.email,
            "created_at": Customer.created_at,
        }
        col = sortable.get(sort_by or "created_at", Customer.created_at)
        stmt = stmt.order_by(col.asc() if sort_dir == "asc" else col.desc())
        stmt = stmt.offset(max((page - 1) * size, 0)).limit(size)

        items = self.db.execute(stmt).scalars().all()
        total = int(self.db.execute(count_stmt).scalar_one() or 0)
        return items, total


__all__ = ["CustomerRepository"]
