"""Customer API."""

from uuid import UUID

from fastapi import APIRouter, status

from app.api.deps import DbSession, Pagination
from app.schemas.common import APIResponse, Paginated
from app.schemas.customer import CustomerCreate, CustomerRead, CustomerUpdate
from app.services.customer_service import CustomerService

router = APIRouter(prefix="/customers", tags=["Customers"])


@router.post(
    "",
    response_model=APIResponse[CustomerRead],
    status_code=status.HTTP_201_CREATED,
    summary="Create a customer",
)
def create_customer(payload: CustomerCreate, db: DbSession) -> APIResponse[CustomerRead]:
    customer = CustomerService(db).create(payload)
    return APIResponse[CustomerRead](
        success=True,
        message="Customer created successfully",
        data=CustomerRead.model_validate(customer),
    )


@router.get(
    "",
    response_model=APIResponse[Paginated[CustomerRead]],
    summary="List customers",
)
def list_customers(db: DbSession, pagination: Pagination) -> APIResponse[Paginated[CustomerRead]]:
    result = CustomerService(db).list(**pagination.model_dump())
    return APIResponse[Paginated[CustomerRead]](
        success=True,
        message="OK",
        data=result,
    )


@router.get(
    "/{customer_id}",
    response_model=APIResponse[CustomerRead],
    summary="Get a customer by id",
)
def get_customer(customer_id: UUID, db: DbSession) -> APIResponse[CustomerRead]:
    customer = CustomerService(db).get(customer_id)
    return APIResponse[CustomerRead](
        success=True,
        message="OK",
        data=CustomerRead.model_validate(customer),
    )


@router.put(
    "/{customer_id}",
    response_model=APIResponse[CustomerRead],
    summary="Update a customer",
)
def update_customer(
    customer_id: UUID, payload: CustomerUpdate, db: DbSession
) -> APIResponse[CustomerRead]:
    customer = CustomerService(db).update(customer_id, payload)
    return APIResponse[CustomerRead](
        success=True,
        message="Customer updated successfully",
        data=CustomerRead.model_validate(customer),
    )


@router.delete(
    "/{customer_id}",
    response_model=APIResponse[None],
    status_code=status.HTTP_200_OK,
    summary="Delete a customer",
)
def delete_customer(customer_id: UUID, db: DbSession) -> APIResponse[None]:
    CustomerService(db).delete(customer_id)
    return APIResponse[None](success=True, message="Customer deleted successfully")


__all__ = ["router"]
