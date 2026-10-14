import os
from pathlib import Path
from typing import List

# Base directories
BASE_DIR = Path(__file__).resolve().parent.parent.parent

# Database configuration
DEFAULT_DB_PATH = str(BASE_DIR / "data" / "aegis_drp.db")
DB_PATH = os.getenv("AEGIS_DB_PATH", DEFAULT_DB_PATH)

# Ensure parent directory for database exists
db_file = Path(DB_PATH)
db_file.parent.mkdir(parents=True, exist_ok=True)

# CORS configuration
CORS_ORIGINS_RAW = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,http://localhost:4173"
)
CORS_ORIGINS: List[str] = [origin.strip() for origin in CORS_ORIGINS_RAW.split(",") if origin.strip()]

APP_NAME = "AegisAgent DRP API"
APP_VERSION = "1.0.0"
