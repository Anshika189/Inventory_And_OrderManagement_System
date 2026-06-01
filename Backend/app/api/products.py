"""Product API."""

from uuid import UUID

from fastapi import APIRouter, status

from app.api.deps import DbSession, Pagination
from app.schemas.common import APIResponse, Paginated
from app.schemas.product import ProductCreate, ProductRead, ProductUpdate
from app.services.product_service import ProductService

router = APIRouter(prefix="/products", tags=["Products"])


@router.post(
    "",
    response_model=APIResponse[ProductRead],
    status_code=status.HTTP_201_CREATED,
    summary="Create a product",
)
def create_product(payload: ProductCreate, db: DbSession) -> APIResponse[ProductRead]:
    product = ProductService(db).create(payload)
    return APIResponse[ProductRead](
        success=True,
        message="Product created successfully",
        data=ProductRead.model_validate(product),
    )


@router.get(
    "",
    response_model=APIResponse[Paginated[ProductRead]],
    summary="List products",
)
def list_products(db: DbSession, pagination: Pagination) -> APIResponse[Paginated[ProductRead]]:
    result = ProductService(db).list(**pagination.model_dump())
    return APIResponse[Paginated[ProductRead]](
        success=True,
        message="OK",
        data=result,
    )


@router.get(
    "/{product_id}",
    response_model=APIResponse[ProductRead],
    summary="Get a product by id",
)
def get_product(product_id: UUID, db: DbSession) -> APIResponse[ProductRead]:
    product = ProductService(db).get(product_id)
    return APIResponse[ProductRead](
        success=True,
        message="OK",
        data=ProductRead.model_validate(product),
    )


@router.put(
    "/{product_id}",
    response_model=APIResponse[ProductRead],
    summary="Update a product",
)
def update_product(
    product_id: UUID, payload: ProductUpdate, db: DbSession
) -> APIResponse[ProductRead]:
    product = ProductService(db).update(product_id, payload)
    return APIResponse[ProductRead](
        success=True,
        message="Product updated successfully",
        data=ProductRead.model_validate(product),
    )


@router.delete(
    "/{product_id}",
    response_model=APIResponse[None],
    status_code=status.HTTP_200_OK,
    summary="Delete a product",
)
def delete_product(product_id: UUID, db: DbSession) -> APIResponse[None]:
    ProductService(db).delete(product_id)
    return APIResponse[None](success=True, message="Product deleted successfully")


__all__ = ["router"]
