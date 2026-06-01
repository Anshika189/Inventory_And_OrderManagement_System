"""Pydantic schemas package."""

from app.schemas.common import APIError, APIResponse, Paginated, PaginationParams
from app.schemas.customer import CustomerCreate, CustomerRead, CustomerUpdate
from app.schemas.dashboard import (
    DashboardResponse,
    OrderTrendPoint,
    StockTrendPoint,
    TopProduct,
)
from app.schemas.order import (
    OrderCreate,
    OrderItemCreate,
    OrderItemRead,
    OrderRead,
    OrderSummary,
)
from app.schemas.product import (
    ProductCreate,
    ProductRead,
    ProductSummary,
    ProductUpdate,
)

__all__ = [
    "APIError",
    "APIResponse",
    "Paginated",
    "PaginationParams",
    "CustomerCreate",
    "CustomerRead",
    "CustomerUpdate",
    "DashboardResponse",
    "OrderTrendPoint",
    "StockTrendPoint",
    "TopProduct",
    "OrderCreate",
    "OrderItemCreate",
    "OrderItemRead",
    "OrderRead",
    "OrderSummary",
    "ProductCreate",
    "ProductRead",
    "ProductSummary",
    "ProductUpdate",
]
