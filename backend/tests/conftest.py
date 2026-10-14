import os
import sys
import tempfile
from pathlib import Path
import pytest

# Ensure project root is on sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

# Create an isolated temporary database for test runs
temp_db_fd, temp_db_path = tempfile.mkstemp(suffix=".db")
os.close(temp_db_fd)
os.environ["AEGIS_DB_PATH"] = temp_db_path

from fastapi.testclient import TestClient
from backend.app.database import init_db
from backend.app.main import app


@pytest.fixture(scope="session", autouse=True)
def setup_test_database():
    init_db(temp_db_path)
    yield
    if os.path.exists(temp_db_path):
        try:
            os.remove(temp_db_path)
        except Exception:
            pass


@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c
