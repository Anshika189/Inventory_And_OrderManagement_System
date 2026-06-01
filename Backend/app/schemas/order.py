"""Pydantic schemas for Order and OrderItem."""

from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, Field, field_validator

from app.models.enums import OrderStatus


class OrderItemCreate(BaseModel):
    product_id: UUID
    quantity: int = Field(..., gt=0, le=10_000)


class OrderItemRead(BaseModel):
    """Construct via ``model_validate({...})`` from a plain dict."""

    id: UUID
    product_id: UUID
    product_name: str | None = None
    product_sku: str | None = None
    quantity: int
    unit_price: Decimal
    line_total: Decimal


class OrderCreate(BaseModel):
    customer_id: UUID
    items: list[OrderItemCreate] = Field(..., min_length=1, max_length=200)
    status: OrderStatus = OrderStatus.PENDING

    @field_validator("items")
    @classmethod
    def _unique_products(cls, items: list[OrderItemCreate]) -> list[OrderItemCreate]:
        seen: set[UUID] = set()
        for item in items:
            if item.product_id in seen:
                raise ValueError("duplicate product in order items")
            seen.add(item.product_id)
        return items


class OrderRead(BaseModel):
    """Construct via ``model_validate({...})`` from a plain dict."""

    id: UUID
    customer_id: UUID
    customer_name: str | None = None
    customer_email: str | None = None
    total_amount: Decimal
    status: OrderStatus
    items: list[OrderItemRead]
    created_at: datetime
    updated_at: datetime


class OrderSummary(BaseModel):
    """Lightweight projection for dashboards / list rows.

    Construct via ``OrderSummary.model_validate({...})`` from a plain dict
    — avoids the SQLAlchemy forward-ref issue Pydantic v2 has when
    nested in a generic ``APIResponse`` envelope.
    """

    id: UUID
    customer_id: UUID
    customer_name: str | None = None
    total_amount: Decimal
    status: OrderStatus
    items_count: int = 0
    created_at: datetime


__all__ = [
    "OrderItemCreate",
    "OrderItemRead",
    "OrderCreate",
    "OrderRead",
    "OrderSummary",
]
