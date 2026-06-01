"""Customer ORM model."""

from sqlalchemy import Index, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class Customer(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """A buyer that can place orders."""

    __tablename__ = "customers"
    __table_args__ = (
        Index("ix_customers_full_name", "full_name"),
        Index("ix_customers_created_at", "created_at"),
    )

    full_name: Mapped[str] = mapped_column(String(200), nullable=False)
    email: Mapped[str] = mapped_column(
        String(254), nullable=False, unique=True, index=True
    )
    phone: Mapped[str | None] = mapped_column(String(32), nullable=True)

    orders: Mapped[list["Order"]] = relationship(  # noqa: F821
        back_populates="customer",
        cascade="all, delete-orphan",
        lazy="selectin",
    )

    def __repr__(self) -> str:  # pragma: no cover
        return f"<Customer id={self.id} email={self.email!r}>"


__all__ = ["Customer"]
