from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.config import APP_NAME, APP_VERSION, CORS_ORIGINS
from backend.app.database import init_db
from backend.app.routers import health, brands, monitoring, findings, reports


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: ensure SQLite database tables and seed brands exist
    init_db()
    yield
    # Shutdown logic (if any)


app = FastAPI(
    title=APP_NAME,
    version=APP_VERSION,
    description="Autonomous Digital Risk Protection (DRP) Backend API for HacXLerate 2026 Kampus.VC Challenge",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS if CORS_ORIGINS else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(health.router)
app.include_router(brands.router)
app.include_router(monitoring.router)
app.include_router(findings.router)
app.include_router(reports.router)


@app.get("/")
def root():
    return {
        "app": APP_NAME,
        "version": APP_VERSION,
        "status": "operational",
        "docs_url": "/docs",
        "health_url": "/api/health"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="127.0.0.1", port=8000, reload=True)
