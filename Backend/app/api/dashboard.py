"""Dashboard API."""

from fastapi import APIRouter

from app.api.deps import DbSession
from app.schemas.common import APIResponse
from app.schemas.dashboard import DashboardResponse
from app.services.dashboard_service import DashboardService

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get(
    "",
    response_model=APIResponse[DashboardResponse],
    summary="Aggregated dashboard metrics",
)
def get_dashboard(db: DbSession) -> APIResponse[DashboardResponse]:
    payload = DashboardService(db).build()
    return APIResponse[DashboardResponse](success=True, message="OK", data=payload)


__all__ = ["router"]
