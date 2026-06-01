"""
Sample seed data.

Inserts a small but realistic data set so a fresh deployment has
something interesting to show. Idempotent — checks for existing
records before inserting.
"""

from __future__ import annotations

from decimal import Decimal
from datetime import timedelta
import random

from sqlalchemy import select

from app.database.session import SessionLocal
from app.models.customer import Customer
from app.models.enums import OrderStatus
from app.models.order import Order
from app.models.order_item import OrderItem
from app.models.product import Product


CUSTOMERS: list[dict] = [
    {"full_name": "Acme Corporation", "email": "ops@acme.test", "phone": "+1 555 0100"},
    {"full_name": "Bluewave Studio", "email": "hello@bluewave.test", "phone": "+1 555 0101"},
    {"full_name": "Northwind Trading", "email": "trade@northwind.test", "phone": "+1 555 0102"},
    {"full_name": "Pioneer Logistics", "email": "ops@pioneer.test", "phone": "+1 555 0103"},
    {"full_name": "Lumen Retail", "email": "buyers@lumen.test", "phone": "+1 555 0104"},
    {"full_name": "Vertex Labs", "email": "supply@vertex.test", "phone": "+1 555 0105"},
]

PRODUCTS: list[dict] = [
    {"name": "Aurora Headphones", "sku": "AUD-001", "price": Decimal("249.00"), "stock_quantity": 42},
    {"name": "Pulse Smartwatch", "sku": "WTC-002", "price": Decimal("199.00"), "stock_quantity": 28},
    {"name": "Nimbus Wireless Charger", "sku": "CHG-003", "price": Decimal("49.00"), "stock_quantity": 6},
    {"name": "Halo Desk Lamp", "sku": "LMP-004", "price": Decimal("89.00"), "stock_quantity": 35},
    {"name": "Quill Mechanical Keyboard", "sku": "KEY-005", "price": Decimal("159.00"), "stock_quantity": 19},
    {"name": "Voyager Backpack", "sku": "BAG-006", "price": Decimal("119.00"), "stock_quantity": 0},
    {"name": "Drift Water Bottle", "sku": "BTL-007", "price": Decimal("29.00"), "stock_quantity": 80},
    {"name": "Echo Bluetooth Speaker", "sku": "SPK-008", "price": Decimal("129.00"), "stock_quantity": 4},
    {"name": "Crisp Webcam 4K", "sku": "CAM-009", "price": Decimal("179.00"), "stock_quantity": 12},
    {"name": "Glide Office Chair", "sku": "CHR-010", "price": Decimal("349.00"), "stock_quantity": 9},
]


def _ensure_customers(db) -> list[Customer]:
    existing = {c.email for c in db.execute(select(Customer)).scalars().all()}
    created: list[Customer] = []
    for entry in CUSTOMERS:
        if entry["email"] in existing:
            continue
        c = Customer(**entry)
        db.add(c)
        created.append(c)
    db.flush()
    return created


def _ensure_products(db) -> list[Product]:
    existing = {p.sku for p in db.execute(select(Product)).scalars().all()}
    created: list[Product] = []
    for entry in PRODUCTS:
        if entry["sku"] in existing:
            continue
        p = Product(**entry)
        db.add(p)
        created.append(p)
    db.flush()
    return created


def _ensure_orders(db, customers: list[Customer], products: list[Product]) -> int:
    if db.execute(select(Order).limit(1)).scalar_one_or_none() is not None:
        return 0

    rng = random.Random(42)
    statuses = list(OrderStatus)
    total_created = 0
    for customer in customers:
        for _ in range(rng.randint(1, 3)):
            sampled = rng.sample(products, k=rng.randint(1, 3))
            items: list[OrderItem] = []
            total = Decimal("0")
            for p in sampled:
                qty = rng.randint(1, 5)
                line = p.price * qty
                total += line
                items.append(
                    OrderItem(
                        product_id=p.id,
                        quantity=qty,
                        unit_price=p.price,
                        line_total=line,
                    )
                )
            order = Order(
                customer_id=customer.id,
                total_amount=total,
                status=rng.choice(statuses),
                items=items,
            )
            db.add(order)
            total_created += 1
    db.flush()
    return total_created


def main() -> None:
    db = SessionLocal()
    try:
        customers = _ensure_customers(db)
        products = _ensure_products(db)
        orders = _ensure_orders(db, customers or db.execute(select(Customer)).scalars().all(),
                                products or db.execute(select(Product)).scalars().all())
        db.commit()
        print(
            f"Seed complete — customers: {len(customers)} new, "
            f"products: {len(products)} new, orders: {orders} new"
        )
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
