import sqlite3
from fastapi import APIRouter
from backend.app.config import APP_NAME, APP_VERSION
from backend.app.database import get_db_connection
from backend.app.schemas import HealthResponse

router = APIRouter(prefix="/api", tags=["System"])


@router.get("/health", response_model=HealthResponse)
def get_health():
    db_status = "connected"
    try:
        conn = get_db_connection()
        conn.execute("SELECT 1").fetchone()
        conn.close()
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"

    return HealthResponse(
        status="ok" if db_status == "connected" else "degraded",
        app=APP_NAME,
        version=APP_VERSION,
        database=db_status
    )
