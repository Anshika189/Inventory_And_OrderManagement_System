"""Order API."""

from uuid import UUID

from fastapi import APIRouter, Query, status

from app.api.deps import DbSession, Pagination
from app.schemas.common import APIResponse, Paginated
from app.schemas.order import OrderCreate, OrderRead
from app.services.order_service import OrderService, _serialize_order

router = APIRouter(prefix="/orders", tags=["Orders"])


@router.post(
    "",
    response_model=APIResponse[OrderRead],
    status_code=status.HTTP_201_CREATED,
    summary="Create an order",
)
def create_order(payload: OrderCreate, db: DbSession) -> APIResponse[OrderRead]:
    order = OrderService(db).create(payload)
    return APIResponse[OrderRead](
        success=True,
        message="Order created successfully",
        data=_serialize_order(order),
    )


@router.get(
    "",
    response_model=APIResponse[Paginated[OrderRead]],
    summary="List orders",
)
def list_orders(
    db: DbSession,
    pagination: Pagination,
    status_filter: str | None = Query(default=None, alias="status"),
) -> APIResponse[Paginated[OrderRead]]:
    result = OrderService(db).list(
        page=pagination.page,
        size=pagination.size,
        status=status_filter,
        sort_by=pagination.sort_by,
        sort_dir=pagination.sort_dir,
    )
    return APIResponse[Paginated[OrderRead]](
        success=True,
        message="OK",
        data=result,
    )


@router.get(
    "/{order_id}",
    response_model=APIResponse[OrderRead],
    summary="Get an order with details",
)
def get_order(order_id: UUID, db: DbSession) -> APIResponse[OrderRead]:
    order = OrderService(db).get(order_id)
    return APIResponse[OrderRead](
        success=True,
        message="OK",
        data=_serialize_order(order),
    )


@router.delete(
    "/{order_id}",
    response_model=APIResponse[None],
    status_code=status.HTTP_200_OK,
    summary="Delete an order",
)
def delete_order(order_id: UUID, db: DbSession) -> APIResponse[None]:
    OrderService(db).delete(order_id)
    return APIResponse[None](success=True, message="Order deleted successfully")


__all__ = ["router"]
