"""Product service."""

from decimal import Decimal
from typing import Sequence
from uuid import UUID

from sqlalchemy.orm import Session

from app.core.exceptions import BusinessRuleError, ConflictError
from app.models.product import Product
from app.repositories.product_repository import ProductRepository
from app.schemas.common import Paginated
from app.schemas.product import ProductCreate, ProductRead, ProductUpdate


class ProductService:
    """Coordinates product use-cases.

    Encapsulates business rules (SKU uniqueness, non-negative stock) and
    delegates persistence to the repository.
    """

    LOW_STOCK_THRESHOLD = 10

    def __init__(self, db: Session) -> None:
        self.db = db
        self.repo = ProductRepository(db)

    # ---- create --------------------------------------------------------
    def create(self, payload: ProductCreate) -> Product:
        if self.repo.by_sku(payload.sku):
            raise ConflictError(
                f"Product with SKU '{payload.sku}' already exists",
                code="sku_conflict",
            )
        product = Product(
            name=payload.name,
            sku=payload.sku,
            price=payload.price,
            stock_quantity=payload.stock_quantity,
        )
        self.repo.add(product)
        self.db.commit()
        self.db.refresh(product)
        return product

    # ---- read ----------------------------------------------------------
    def get(self, product_id: UUID) -> Product:
        return self.repo.get_or_404(product_id)

    def list(
        self,
        *,
        page: int = 1,
        size: int = 20,
        search: str | None = None,
        sort_by: str | None = "created_at",
        sort_dir: str = "desc",
    ) -> Paginated[ProductRead]:
        items, total = self.repo.paginate(
            page=page,
            size=size,
            search=search,
            sort_by=sort_by,
            sort_dir=sort_dir,
        )
        return Paginated[ProductRead].build(
            [
                ProductRead(
                    id=p.id,
                    name=p.name,
                    sku=p.sku,
                    price=p.price,
                    stock_quantity=p.stock_quantity,
                    created_at=p.created_at,
                    updated_at=p.updated_at,
                )
                for p in items
            ],
            total,
            page,
            size,
        )

    # ---- update --------------------------------------------------------
    def update(self, product_id: UUID, payload: ProductUpdate) -> Product:
        product = self.repo.get_or_404(product_id)
        data = payload.model_dump(exclude_unset=True)

        if "sku" in data and data["sku"] and data["sku"] != product.sku:
            if self.repo.by_sku(data["sku"]):
                raise ConflictError(
                    f"Product with SKU '{data['sku']}' already exists",
                    code="sku_conflict",
                )

        for field, value in data.items():
            setattr(product, field, value)

        self.db.commit()
        self.db.refresh(product)
        return product

    # ---- delete --------------------------------------------------------
    def delete(self, product_id: UUID) -> None:
        product = self.repo.get_or_404(product_id)
        # DB-level restrict constraint will block if there are order items.
        self.repo.delete(product)
        self.db.commit()

    # ---- helpers -------------------------------------------------------
    def adjust_stock(self, product_id: UUID, delta: int) -> Product:
        """Apply a signed delta to a product's stock with a row lock."""
        product = self.repo.get_with_lock(product_id)
        if product is None:
            from app.core.exceptions import NotFoundError
            raise NotFoundError("Product not found")

        new_qty = product.stock_quantity + delta
        if new_qty < 0:
            raise BusinessRuleError(
                f"Insufficient stock for '{product.name}'",
                code="insufficient_stock",
            )
        product.stock_quantity = new_qty
        self.db.flush()
        return product


__all__ = ["ProductService"]
