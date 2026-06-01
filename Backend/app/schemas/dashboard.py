"""Dashboard analytics schemas.

``recent_orders`` and ``low_stock_items`` are kept as typed lists of
the existing ``OrderSummary`` / ``ProductSummary`` models. The dashboard
service constructs them via ``.model_validate({...})`` from plain dicts,
so we don't need ``from_attributes`` here.
"""

from datetime import date
from decimal import Decimal
from typing import List

from pydantic import BaseModel

from app.schemas.order import OrderSummary
from app.schemas.product import ProductSummary


class StockTrendPoint(BaseModel):
    """A single day of stock snapshot data."""

    date: date
    units_in_stock: int


class OrderTrendPoint(BaseModel):
    """A single day of order snapshot data."""

    date: date
    orders: int
    revenue: Decimal


class TopProduct(BaseModel):
    """A top-selling product entry."""

    product_id: str | None = None
    name: str
    sku: str
    units_sold: int
    revenue: Decimal


class DashboardResponse(BaseModel):
    total_products: int
    total_customers: int
    total_orders: int
    low_stock_products: int
    inventory_value: Decimal
    recent_orders: List[OrderSummary]
    low_stock_items: List[ProductSummary]
    top_products: List[TopProduct]
    stock_trend: List[StockTrendPoint]
    order_trend: List[OrderTrendPoint]


__all__ = [
    "DashboardResponse",
    "StockTrendPoint",
    "OrderTrendPoint",
    "TopProduct",
]
