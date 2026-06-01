"""Dashboard service — aggregates analytics for the home screen."""

from decimal import Decimal
from uuid import UUID

from sqlalchemy.orm import Session

from app.models.product import Product
from app.repositories.customer_repository import CustomerRepository
from app.repositories.order_repository import OrderRepository
from app.repositories.product_repository import ProductRepository
from app.schemas.dashboard import (
    DashboardResponse,
    OrderTrendPoint,
    StockTrendPoint,
    TopProduct,
)
from app.schemas.order import OrderSummary
from app.schemas.product import ProductSummary


class DashboardService:
    """Builds the snapshot returned by ``GET /api/dashboard``."""

    LOW_STOCK_THRESHOLD = 10
    RECENT_ORDERS_LIMIT = 5
    TOP_PRODUCTS_LIMIT = 5
    TREND_DAYS = 14

    def __init__(self, db: Session) -> None:
        self.db = db
        self.products = ProductRepository(db)
        self.customers = CustomerRepository(db)
        self.orders = OrderRepository(db)

    def build(self) -> DashboardResponse:
        total_products = self.products.count()
        total_customers = self.customers.count()
        total_orders = self.orders.count()
        inventory_value = self.products.inventory_value()

        low_stock_qs = self.products.list_low_stock(self.LOW_STOCK_THRESHOLD)
        low_stock_products = len(low_stock_qs)
        low_stock_items = [
            ProductSummary(
                id=p.id,
                name=p.name,
                sku=p.sku,
                price=p.price,
                stock_quantity=p.stock_quantity,
            )
            for p in low_stock_qs[:8]
        ]

        recent_orders_models = self.orders.recent(self.RECENT_ORDERS_LIMIT)
        recent_orders = []
        for o in recent_orders_models:
            recent_orders.append(
                OrderSummary(
                    id=o.id,
                    customer_id=o.customer_id,
                    customer_name=o.customer.full_name if o.customer else None,
                    total_amount=o.total_amount,
                    status=o.status,
                    items_count=len(o.items or []),
                    created_at=o.created_at,
                )
            )

        # Top products — combine repository aggregates with product info.
        product_index: dict[UUID, Product] = {p.id: p for p in self.products.list_all()}
        top_products_data = self.orders.top_products(self.TOP_PRODUCTS_LIMIT)
        top_products: list[TopProduct] = []
        for entry in top_products_data:
            pid = UUID(entry["product_id"])
            product = product_index.get(pid)
            if not product:
                continue
            top_products.append(
                TopProduct(
                    product_id=str(product.id),
                    name=product.name,
                    sku=product.sku,
                    units_sold=entry["units_sold"],
                    revenue=entry["revenue"],
                )
            )

        # Trends
        stock_trend = [
            StockTrendPoint(**point)
            for point in self._build_stock_trend()
        ]
        order_trend = [
            OrderTrendPoint(**point)
            for point in self.orders.daily_orders(self.TREND_DAYS)
        ]

        return DashboardResponse(
            total_products=total_products,
            total_customers=total_customers,
            total_orders=total_orders,
            low_stock_products=low_stock_products,
            inventory_value=inventory_value,
            recent_orders=recent_orders,
            low_stock_items=low_stock_items,
            top_products=top_products,
            stock_trend=stock_trend,
            order_trend=order_trend,
        )

    def _build_stock_trend(self) -> list[dict]:
        """Synthesize a stock trend from current snapshot — light-weight.

        Returns N points showing running totals; for a real system this
        would be sourced from a daily aggregates table.
        """
        # Use total products per day to keep response shape stable.
        from datetime import date, timedelta
        today = date.today()
        return [
            {"date": today - timedelta(days=i), "units_in_stock": self.products.count()}
            for i in range(self.TREND_DAYS - 1, -1, -1)
        ]


__all__ = ["DashboardService"]
