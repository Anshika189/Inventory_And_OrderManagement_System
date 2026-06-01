"""Order repository."""

from datetime import date, datetime, timedelta, timezone
from decimal import Decimal
from typing import Sequence
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.order import Order
from app.models.order_item import OrderItem
from app.repositories.base import BaseRepository


class OrderRepository(BaseRepository[Order]):
    model = Order

    def __init__(self, db: Session) -> None:
        super().__init__(db)

    def paginate(
        self,
        *,
        page: int,
        size: int,
        status: str | None = None,
        sort_by: str | None = "created_at",
        sort_dir: str = "desc",
    ) -> tuple[Sequence[Order], int]:
        stmt = select(Order)
        count_stmt = select(func.count()).select_from(Order)

        if status:
            stmt = stmt.where(Order.status == status)
            count_stmt = count_stmt.where(Order.status == status)

        sortable = {
            "created_at": Order.created_at,
            "total_amount": Order.total_amount,
            "status": Order.status,
        }
        col = sortable.get(sort_by or "created_at", Order.created_at)
        stmt = stmt.order_by(col.asc() if sort_dir == "asc" else col.desc())
        stmt = stmt.offset(max((page - 1) * size, 0)).limit(size)

        items = self.db.execute(stmt).scalars().unique().all()
        total = int(self.db.execute(count_stmt).scalar_one() or 0)
        return items, total

    def recent(self, limit: int = 5) -> Sequence[Order]:
        stmt = (
            select(Order)
            .order_by(Order.created_at.desc())
            .limit(limit)
        )
        return self.db.execute(stmt).scalars().unique().all()

    def total_revenue(self) -> Decimal:
        stmt = select(func.coalesce(func.sum(Order.total_amount), 0))
        return Decimal(self.db.execute(stmt).scalar_one() or 0)

    def daily_orders(self, days: int = 14) -> list[dict]:
        """Return per-day order counts and revenue for the last N days."""
        today = datetime.now(timezone.utc).date()
        start = today - timedelta(days=days - 1)

        # Build a date series
        rows: dict[date, dict] = {}
        for i in range(days):
            d = start + timedelta(days=i)
            rows[d] = {"date": d, "orders": 0, "revenue": Decimal("0")}

        stmt = (
            select(
                func.date(Order.created_at).label("d"),
                func.count(Order.id).label("c"),
                func.coalesce(func.sum(Order.total_amount), 0).label("r"),
            )
            .where(func.date(Order.created_at) >= start)
            .group_by(func.date(Order.created_at))
        )
        for d, c, r in self.db.execute(stmt).all():
            rows[d] = {"date": d, "orders": int(c or 0), "revenue": Decimal(r or 0)}
        return list(rows.values())

    def top_products(self, limit: int = 5) -> list[dict]:
        stmt = (
            select(
                OrderItem.product_id,
                func.coalesce(func.sum(OrderItem.quantity), 0).label("units"),
                func.coalesce(func.sum(OrderItem.line_total), 0).label("revenue"),
            )
            .group_by(OrderItem.product_id)
            .order_by(func.sum(OrderItem.line_total).desc())
            .limit(limit)
        )
        out: list[dict] = []
        for pid, units, revenue in self.db.execute(stmt).all():
            out.append(
                {
                    "product_id": str(pid),
                    "units_sold": int(units or 0),
                    "revenue": Decimal(revenue or 0),
                }
            )
        return out


__all__ = ["OrderRepository"]
