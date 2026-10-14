from fastapi import APIRouter, HTTPException, status
from backend.app.schemas import MonitoringRunRequest, MonitoringRunResponse
from backend.app.services.monitoring import execute_monitoring_pipeline

router = APIRouter(prefix="/api/monitoring", tags=["Monitoring"])


@router.post("/social/run", response_model=MonitoringRunResponse)
def trigger_social_monitoring(payload: MonitoringRunRequest):
    try:
        run_result = execute_monitoring_pipeline(
            brand_id=payload.brand_id,
            channel="social",
            use_demo_fixtures=payload.use_demo_fixtures
        )
        return run_result
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(ve)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Social monitoring pipeline error: {str(e)}"
        )


@router.post("/apps/run", response_model=MonitoringRunResponse)
def trigger_apps_monitoring(payload: MonitoringRunRequest):
    try:
        run_result = execute_monitoring_pipeline(
            brand_id=payload.brand_id,
            channel="apps",
            use_demo_fixtures=payload.use_demo_fixtures
        )
        return run_result
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(ve)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"App store monitoring pipeline error: {str(e)}"
        )
