"""Product repository."""

from decimal import Decimal
from typing import Sequence
from uuid import UUID

from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session

from app.models.product import Product
from app.repositories.base import BaseRepository


class ProductRepository(BaseRepository[Product]):
    model = Product

    def __init__(self, db: Session) -> None:
        super().__init__(db)

    # ---- lookups -------------------------------------------------------
    def by_sku(self, sku: str) -> Product | None:
        stmt = select(Product).where(Product.sku == sku)
        return self.db.execute(stmt).scalar_one_or_none()

    def by_ids(self, ids: list[UUID]) -> Sequence[Product]:
        if not ids:
            return []
        stmt = select(Product).where(Product.id.in_(ids))
        return self.db.execute(stmt).scalars().all()

    def get_with_lock(self, product_id: UUID) -> Product | None:
        """SELECT ... FOR UPDATE; used during order placement."""
        stmt = (
            select(Product)
            .where(Product.id == product_id)
            .with_for_update()
        )
        return self.db.execute(stmt).scalar_one_or_none()

    # ---- list / search / sort -----------------------------------------
    def paginate(
        self,
        *,
        page: int,
        size: int,
        search: str | None = None,
        sort_by: str | None = "created_at",
        sort_dir: str = "desc",
        low_stock_threshold: int | None = None,
    ) -> tuple[Sequence[Product], int]:
        stmt = select(Product)
        count_stmt = select(func.count()).select_from(Product)

        if search:
            term = f"%{search.lower()}%"
            cond = or_(
                func.lower(Product.name).like(term),
                func.lower(Product.sku).like(term),
            )
            stmt = stmt.where(cond)
            count_stmt = count_stmt.where(cond)

        if low_stock_threshold is not None:
            stmt = stmt.where(Product.stock_quantity <= low_stock_threshold)
            count_stmt = count_stmt.where(Product.stock_quantity <= low_stock_threshold)

        sortable = {
            "name": Product.name,
            "sku": Product.sku,
            "price": Product.price,
            "stock_quantity": Product.stock_quantity,
            "created_at": Product.created_at,
        }
        col = sortable.get(sort_by or "created_at", Product.created_at)
        stmt = stmt.order_by(col.asc() if sort_dir == "asc" else col.desc())
        stmt = stmt.offset(max((page - 1) * size, 0)).limit(size)

        items = self.db.execute(stmt).scalars().all()
        total = int(self.db.execute(count_stmt).scalar_one() or 0)
        return items, total

    def low_stock(self, threshold: int = 10, limit: int = 8) -> Sequence[Product]:
        stmt = (
            select(Product)
            .where(Product.stock_quantity <= threshold)
            .order_by(Product.stock_quantity.asc())
            .limit(limit)
        )
        return self.db.execute(stmt).scalars().all()

    def list_low_stock(self, threshold: int = 10) -> Sequence[Product]:
        """Return ALL products at or below a stock threshold (no limit)."""
        stmt = (
            select(Product)
            .where(Product.stock_quantity <= threshold)
            .order_by(Product.stock_quantity.asc())
        )
        return self.db.execute(stmt).scalars().all()

    # ---- analytics ----------------------------------------------------
    def inventory_value(self) -> Decimal:
        stmt = select(func.coalesce(func.sum(Product.price * Product.stock_quantity), 0))
        return Decimal(self.db.execute(stmt).scalar_one() or 0)


__all__ = ["ProductRepository"]
