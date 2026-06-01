"""Domain enums reused by models and schemas."""

import enum


class OrderStatus(str, enum.Enum):
    """Lifecycle states for an order."""

    PENDING = "pending"
    CONFIRMED = "confirmed"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"


__all__ = ["OrderStatus"]
