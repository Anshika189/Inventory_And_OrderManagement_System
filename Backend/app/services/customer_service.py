"""Customer service."""

from typing import Sequence
from uuid import UUID

from sqlalchemy.orm import Session

from app.core.exceptions import ConflictError
from app.models.customer import Customer
from app.repositories.customer_repository import CustomerRepository
from app.schemas.common import Paginated
from app.schemas.customer import CustomerCreate, CustomerRead, CustomerUpdate


class CustomerService:
    """Customer lifecycle operations."""

    def __init__(self, db: Session) -> None:
        self.db = db
        self.repo = CustomerRepository(db)

    def create(self, payload: CustomerCreate) -> Customer:
        if self.repo.by_email(payload.email):
            raise ConflictError(
                f"Customer with email '{payload.email}' already exists",
                code="email_conflict",
            )
        customer = Customer(
            full_name=payload.full_name,
            email=payload.email,
            phone=payload.phone,
        )
        self.repo.add(customer)
        self.db.commit()
        self.db.refresh(customer)
        return customer

    def get(self, customer_id: UUID) -> Customer:
        return self.repo.get_or_404(customer_id)

    def list(
        self,
        *,
        page: int = 1,
        size: int = 20,
        search: str | None = None,
        sort_by: str | None = "created_at",
        sort_dir: str = "desc",
    ) -> Paginated[CustomerRead]:
        items, total = self.repo.paginate(
            page=page,
            size=size,
            search=search,
            sort_by=sort_by,
            sort_dir=sort_dir,
        )
        return Paginated[CustomerRead].build(
            [
                CustomerRead(
                    id=c.id,
                    full_name=c.full_name,
                    email=c.email,
                    phone=c.phone,
                    created_at=c.created_at,
                    updated_at=c.updated_at,
                )
                for c in items
            ],
            total,
            page,
            size,
        )

    def update(self, customer_id: UUID, payload: CustomerUpdate) -> Customer:
        customer = self.repo.get_or_404(customer_id)
        data = payload.model_dump(exclude_unset=True)
        if "email" in data and data["email"] and data["email"] != customer.email:
            if self.repo.by_email(data["email"]):
                raise ConflictError(
                    f"Customer with email '{data['email']}' already exists",
                    code="email_conflict",
                )
        for field, value in data.items():
            setattr(customer, field, value)
        self.db.commit()
        self.db.refresh(customer)
        return customer

    def delete(self, customer_id: UUID) -> None:
        customer = self.repo.get_or_404(customer_id)
        self.repo.delete(customer)
        self.db.commit()


__all__ = ["CustomerService"]
