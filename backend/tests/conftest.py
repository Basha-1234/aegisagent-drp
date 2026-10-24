import os
import sys
import tempfile
import uuid
from datetime import datetime, timezone
from pathlib import Path
import pytest
from fastapi.testclient import TestClient

# Ensure project root is on sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

# Create an isolated temporary database for test runs
temp_db_fd, temp_db_path = tempfile.mkstemp(suffix=".db")
os.close(temp_db_fd)
os.environ["AEGIS_DB_PATH"] = temp_db_path
os.environ["AEGIS_JWT_SECRET"] = "test-cryptographic-jwt-secret-key-32bytes-min!!"
os.environ["AEGIS_JWT_EXPIRE_MINUTES"] = "60"

from backend.app.database import init_db, get_db_connection, DEFAULT_LEGACY_ORG_ID
from backend.app.auth import hash_password, create_access_token
from backend.app.main import app

# Test constants
TEST_PASSWORD = "ValidTestPassword123!"
ORG_SECONDARY_ID = "org-secondary-test"

USER_ADMIN_ID = "usr-test-admin"
USER_ADMIN_EMAIL = "admin@aegis.local"

USER_LEGAL_ID = "usr-test-legal"
USER_LEGAL_EMAIL = "legal@aegis.local"

USER_CISO_ID = "usr-test-ciso"
USER_CISO_EMAIL = "ciso@aegis.local"

USER_ANALYST_ID = "usr-test-analyst"
USER_ANALYST_EMAIL = "analyst@aegis.local"

USER_DISABLED_ID = "usr-test-disabled"
USER_DISABLED_EMAIL = "disabled@aegis.local"

USER_SEC_ANALYST_ID = "usr-sec-analyst"
USER_SEC_ANALYST_EMAIL = "analyst@secondary.local"


@pytest.fixture(scope="session", autouse=True)
def setup_test_database():
    init_db(temp_db_path)
    conn = get_db_connection(temp_db_path)
    try:
        cur = conn.cursor()
        now_str = datetime.now(timezone.utc).isoformat()
        pwd_hash = hash_password(TEST_PASSWORD)

        # 1. Insert secondary organization
        cur.execute(
            """
            INSERT OR IGNORE INTO organizations (id, name, created_at, updated_at)
            VALUES (?, ?, ?, ?)
            """,
            (ORG_SECONDARY_ID, "Secondary Defense Corp", now_str, now_str)
        )

        # 2. Seed test users into primary (legacy) organization
        users_primary = [
            (USER_ADMIN_ID, DEFAULT_LEGACY_ORG_ID, USER_ADMIN_EMAIL, "admin", 1),
            (USER_LEGAL_ID, DEFAULT_LEGACY_ORG_ID, USER_LEGAL_EMAIL, "legal", 1),
            (USER_CISO_ID, DEFAULT_LEGACY_ORG_ID, USER_CISO_EMAIL, "ciso", 1),
            (USER_ANALYST_ID, DEFAULT_LEGACY_ORG_ID, USER_ANALYST_EMAIL, "analyst", 1),
            (USER_DISABLED_ID, DEFAULT_LEGACY_ORG_ID, USER_DISABLED_EMAIL, "analyst", 0),
        ]
        for uid, org_id, email, role, is_active in users_primary:
            cur.execute(
                """
                INSERT OR REPLACE INTO users (
                    id, organization_id, email, password_hash, full_name,
                    role, is_active, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (uid, org_id, email, pwd_hash, f"Test {role.title()}", role, is_active, now_str, now_str)
            )

        # 3. Seed secondary organization user
        cur.execute(
            """
            INSERT OR REPLACE INTO users (
                id, organization_id, email, password_hash, full_name,
                role, is_active, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (USER_SEC_ANALYST_ID, ORG_SECONDARY_ID, USER_SEC_ANALYST_EMAIL, pwd_hash, "Secondary Analyst", "analyst", 1, now_str, now_str)
        )

        # 4. Seed brand for secondary organization to test tenant isolation
        cur.execute(
            """
            INSERT OR IGNORE INTO brands (
                id, organization_id, name, industry, official_handle, support_handle,
                official_domain, verified_handles, official_apps, logo_url, risk_threshold, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, '[]', '[]', NULL, 50, ?)
            """,
            ("secbrand", ORG_SECONDARY_ID, "Secondary Brand Inc", "Security", "@secbrand", "@secsupport", "secbrand.com", now_str)
        )

        conn.commit()
    finally:
        conn.close()

    yield

    if os.path.exists(temp_db_path):
        try:
            os.remove(temp_db_path)
        except Exception:
            pass


@pytest.fixture
def admin_token():
    return create_access_token(USER_ADMIN_ID, DEFAULT_LEGACY_ORG_ID, USER_ADMIN_EMAIL, "admin")


@pytest.fixture
def legal_token():
    return create_access_token(USER_LEGAL_ID, DEFAULT_LEGACY_ORG_ID, USER_LEGAL_EMAIL, "legal")


@pytest.fixture
def ciso_token():
    return create_access_token(USER_CISO_ID, DEFAULT_LEGACY_ORG_ID, USER_CISO_EMAIL, "ciso")


@pytest.fixture
def analyst_token():
    return create_access_token(USER_ANALYST_ID, DEFAULT_LEGACY_ORG_ID, USER_ANALYST_EMAIL, "analyst")


@pytest.fixture
def secondary_token():
    return create_access_token(USER_SEC_ANALYST_ID, ORG_SECONDARY_ID, USER_SEC_ANALYST_EMAIL, "analyst")


@pytest.fixture
def client(admin_token):
    """
    Default test client authenticated as legacy admin.
    Guarantees backward-compatibility for all existing test suites.
    """
    with TestClient(app, headers={"Authorization": f"Bearer {admin_token}"}) as c:
        yield c


@pytest.fixture
def unauthenticated_client():
    """Client with no credentials attached to test 401 unauthenticated protection."""
    with TestClient(app) as c:
        yield c


@pytest.fixture
def analyst_client(analyst_token):
    """Client authenticated as standard analyst in default organization."""
    with TestClient(app, headers={"Authorization": f"Bearer {analyst_token}"}) as c:
        yield c


@pytest.fixture
def legal_client(legal_token):
    """Client authenticated as legal counsel in default organization."""
    with TestClient(app, headers={"Authorization": f"Bearer {legal_token}"}) as c:
        yield c


@pytest.fixture
def secondary_client(secondary_token):
    """Client authenticated as analyst in secondary tenant organization."""
    with TestClient(app, headers={"Authorization": f"Bearer {secondary_token}"}) as c:
        yield c
