"""ORM model package.

Importing this package ensures every model is registered against
``Base.metadata`` so Alembic autogenerate can see them.
"""

from app.models.customer import Customer
from app.models.enums import OrderStatus
from app.models.order import Order
from app.models.order_item import OrderItem
from app.models.product import Product

__all__ = ["Customer", "Order", "OrderItem", "OrderStatus", "Product"]
