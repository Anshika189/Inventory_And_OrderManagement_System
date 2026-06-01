"""Product ORM model."""

from decimal import Decimal

from sqlalchemy import CheckConstraint, Index, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base, TimestampMixin, UUIDPrimaryKeyMixin
from app.models.order_item import OrderItem  # noqa: F401  (back-population)


class Product(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """A sellable product tracked in inventory."""

    __tablename__ = "products"
    __table_args__ = (
        CheckConstraint("stock_quantity >= 0", name="stock_non_negative"),
        CheckConstraint("price > 0", name="price_positive"),
        Index("ix_products_name", "name"),
        Index("ix_products_created_at", "created_at"),
    )

    name: Mapped[str] = mapped_column(String(200), nullable=False)
    sku: Mapped[str] = mapped_column(String(64), nullable=False, unique=True, index=True)
    price: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    stock_quantity: Mapped[int] = mapped_column(default=0, nullable=False)

    # Back-references — string-based to avoid circular imports.
    order_items: Mapped[list["OrderItem"]] = relationship(
        back_populates="product",
        cascade="all, delete-orphan",
        lazy="selectin",
    )

    def __repr__(self) -> str:  # pragma: no cover - debugging
        return f"<Product id={self.id} sku={self.sku!r}>"


__all__ = ["Product"]
