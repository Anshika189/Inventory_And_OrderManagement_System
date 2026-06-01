"""Order service.

This is the most complex service because it spans customers, products,
and stock. The transaction is structured so a failure anywhere rolls
back the entire order — no partial deductions, no orphan orders.
"""

from decimal import Decimal
from typing import Sequence
from uuid import UUID

from sqlalchemy.orm import Session

from app.core.exceptions import (
    BusinessRuleError,
    NotFoundError,
    ValidationError,
)
from app.models.order import Order
from app.models.order_item import OrderItem
from app.models.product import Product
from app.repositories.customer_repository import CustomerRepository
from app.repositories.order_repository import OrderRepository
from app.repositories.product_repository import ProductRepository
from app.schemas.common import Paginated
from app.schemas.order import OrderCreate, OrderItemRead, OrderRead, OrderSummary


def _serialize_order(order: Order) -> OrderRead:
    """Materialize an Order ORM instance into a fully-detached OrderRead.

    Centralized here so the API layer and the service share one source
    of truth and Pydantic never has to walk SQLAlchemy relationships.
    """
    return OrderRead(
        id=order.id,
        customer_id=order.customer_id,
        customer_name=order.customer.full_name if order.customer else None,
        customer_email=order.customer.email if order.customer else None,
        total_amount=order.total_amount,
        status=order.status,
        items=[
            OrderItemRead(
                id=item.id,
                product_id=item.product_id,
                product_name=item.product.name if item.product else None,
                product_sku=item.product.sku if item.product else None,
                quantity=item.quantity,
                unit_price=item.unit_price,
                line_total=item.line_total,
            )
            for item in order.items
        ],
        created_at=order.created_at,
        updated_at=order.updated_at,
    )


class OrderService:
    """Coordinates order placement, pricing, and stock deduction."""

    def __init__(self, db: Session) -> None:
        self.db = db
        self.orders = OrderRepository(db)
        self.products = ProductRepository(db)
        self.customers = CustomerRepository(db)

    # ---- create --------------------------------------------------------
    def create(self, payload: OrderCreate) -> Order:
        customer = self.customers.get_or_404(payload.customer_id)

        # Aggregate quantities per product in case of duplicates upstream.
        product_qty: dict[UUID, int] = {}
        for item in payload.items:
            product_qty[item.product_id] = product_qty.get(item.product_id, 0) + item.quantity

        # Lock all involved product rows in a stable order to avoid deadlocks.
        products: dict[UUID, Product] = {}
        for pid in sorted(product_qty.keys()):
            p = self.products.get_with_lock(pid)
            if p is None:
                raise NotFoundError(f"Product {pid} not found", code="product_not_found")
            products[pid] = p

        # Validate stock BEFORE mutating anything.
        for pid, qty in product_qty.items():
            product = products[pid]
            if product.stock_quantity < qty:
                raise BusinessRuleError(
                    f"Insufficient stock for '{product.name}'. "
                    f"Requested {qty}, available {product.stock_quantity}.",
                    code="insufficient_stock",
                )

        # Build order with computed pricing.
        order = Order(
            customer_id=customer.id,
            total_amount=Decimal("0"),
            status=payload.status,
        )
        total = Decimal("0")
        items: list[OrderItem] = []
        for pid, qty in product_qty.items():
            product = products[pid]
            unit_price = product.price
            line_total = unit_price * qty
            total += line_total
            items.append(
                OrderItem(
                    product_id=product.id,
                    quantity=qty,
                    unit_price=unit_price,
                    line_total=line_total,
                )
            )
        order.total_amount = total
        order.items = items

        # Apply stock changes (locks already held).
        for pid, qty in product_qty.items():
            product = products[pid]
            product.stock_quantity = product.stock_quantity - qty

        self.orders.add(order)
        self.db.commit()
        self.db.refresh(order)
        return order

    # ---- read ----------------------------------------------------------
    def get(self, order_id: UUID) -> Order:
        return self.orders.get_or_404(order_id)

    def list(
        self,
        *,
        page: int = 1,
        size: int = 20,
        status: str | None = None,
        sort_by: str | None = "created_at",
        sort_dir: str = "desc",
    ) -> Paginated[OrderRead]:
        items, total = self.orders.paginate(
            page=page,
            size=size,
            status=status,
            sort_by=sort_by,
            sort_dir=sort_dir,
        )
        return Paginated[OrderRead].build(
            [_serialize_order(o) for o in items],
            total,
            page,
            size,
        )

    def delete(self, order_id: UUID) -> None:
        order = self.orders.get_or_404(order_id)
        # OrderItems have ON DELETE CASCADE on order_id, so deletion is safe.
        self.orders.delete(order)
        self.db.commit()


__all__ = ["OrderService"]
