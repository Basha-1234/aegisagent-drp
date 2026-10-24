import pytest
import sqlite3
from backend.app.auth import create_access_token
from backend.app.database import get_db_connection


def test_login_successful(unauthenticated_client):
    payload = {
        "email": "admin@aegis.local",
        "password": "ValidTestPassword123!"
    }
    response = unauthenticated_client.post("/api/auth/login", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["expires_in_minutes"] == 60
    assert data["user"]["email"] == "admin@aegis.local"
    assert data["user"]["role"] == "admin"
    assert data["user"]["organization"]["id"] == "org-default-legacy"
    assert data["user"]["organization"]["name"] == "Primary Enterprise Organization"


def test_login_invalid_password(unauthenticated_client):
    payload = {
        "email": "admin@aegis.local",
        "password": "WrongPasswordXYZ"
    }
    response = unauthenticated_client.post("/api/auth/login", json=payload)
    assert response.status_code == 401
    assert "invalid email or password" in response.json()["detail"].lower()


def test_login_nonexistent_user(unauthenticated_client):
    payload = {
        "email": "nobody@nowhere.com",
        "password": "ValidTestPassword123!"
    }
    response = unauthenticated_client.post("/api/auth/login", json=payload)
    assert response.status_code == 401
    assert "invalid email or password" in response.json()["detail"].lower()


def test_login_disabled_user(unauthenticated_client):
    payload = {
        "email": "disabled@aegis.local",
        "password": "ValidTestPassword123!"
    }
    response = unauthenticated_client.post("/api/auth/login", json=payload)
    assert response.status_code == 403
    assert "disabled" in response.json()["detail"].lower()


def test_get_me_authenticated(analyst_client):
    response = analyst_client.get("/api/auth/me")
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "analyst@aegis.local"
    assert data["role"] == "analyst"
    assert data["organization_id"] == "org-default-legacy"
    assert data["organization"]["name"] == "Primary Enterprise Organization"


def test_unauthenticated_requests_rejected(unauthenticated_client):
    # Verify all protected endpoints return 401 when no token is provided
    assert unauthenticated_client.get("/api/auth/me").status_code == 401
    assert unauthenticated_client.get("/api/brands").status_code == 401
    assert unauthenticated_client.get("/api/findings").status_code == 401
    assert unauthenticated_client.post("/api/monitoring/social/run", json={"brand_id": "razorpay"}).status_code == 401
    assert unauthenticated_client.post("/api/reports/takedown", json={"finding_id": "any"}).status_code == 401


def test_expired_token_rejected(unauthenticated_client):
    # Create an expired token (negative TTL)
    expired_token = create_access_token(
        user_id="usr-test-analyst",
        organization_id="org-default-legacy",
        email="analyst@aegis.local",
        role="analyst",
        expires_in_seconds=-60
    )
    headers = {"Authorization": f"Bearer {expired_token}"}
    response = unauthenticated_client.get("/api/auth/me", headers=headers)
    assert response.status_code == 401
    assert "expired" in response.json()["detail"].lower()


def test_tampered_token_rejected(unauthenticated_client):
    valid_token = create_access_token(
        user_id="usr-test-analyst",
        organization_id="org-default-legacy",
        email="analyst@aegis.local",
        role="analyst"
    )
    # Tamper with the payload part
    parts = valid_token.split(".")
    tampered_token = f"{parts[0]}.eyJzdWIiOiAiaGFja2VyIn0.{parts[2]}"

    headers = {"Authorization": f"Bearer {tampered_token}"}
    response = unauthenticated_client.get("/api/auth/me", headers=headers)
    assert response.status_code == 401


def test_cross_organization_brand_isolation(analyst_client, secondary_client):
    # Primary client should see Razorpay, PhonePe, Revolut, but NOT secbrand
    res_primary = analyst_client.get("/api/brands")
    assert res_primary.status_code == 200
    primary_brand_ids = [b["id"] for b in res_primary.json()]
    assert "razorpay" in primary_brand_ids
    assert "secbrand" not in primary_brand_ids

    # Secondary client should ONLY see secbrand, NOT Razorpay
    res_secondary = secondary_client.get("/api/brands")
    assert res_secondary.status_code == 200
    secondary_brand_ids = [b["id"] for b in res_secondary.json()]
    assert "secbrand" in secondary_brand_ids
    assert "razorpay" not in secondary_brand_ids

    # Secondary client cannot access primary brand directly by ID
    assert secondary_client.get("/api/brands/razorpay").status_code == 404
    # Primary client cannot access secondary brand directly by ID
    assert analyst_client.get("/api/brands/secbrand").status_code == 404


def test_cross_organization_finding_and_report_isolation(client, secondary_client):
    # Admin runs monitoring for Razorpay in primary organization
    client.post("/api/monitoring/social/run", json={"brand_id": "razorpay"})
    primary_findings = client.get("/api/findings?brand_id=razorpay").json()
    assert len(primary_findings) > 0
    target_id = primary_findings[0]["id"]

    # Secondary tenant cannot see primary findings in their list
    secondary_findings = secondary_client.get("/api/findings").json()
    secondary_fnd_ids = [f["id"] for f in secondary_findings]
    assert target_id not in secondary_fnd_ids

    # Secondary tenant cannot get the finding by ID
    assert secondary_client.get(f"/api/findings/{target_id}").status_code == 404

    # Secondary tenant cannot update the finding status
    assert secondary_client.patch(
        f"/api/findings/{target_id}",
        json={"review_status": "CONFIRMED_THREAT"}
    ).status_code == 404

    # Secondary tenant cannot create a takedown report on the primary finding
    bad_report = secondary_client.post(
        "/api/reports/takedown",
        json={"finding_id": target_id}
    )
    assert bad_report.status_code == 404


def test_rbac_report_edit_restrictions(client, analyst_client, legal_client):
    # Setup finding and takedown report
    client.post("/api/monitoring/social/run", json={"brand_id": "razorpay"})
    findings = client.get("/api/findings?brand_id=razorpay").json()
    target_fnd_id = findings[0]["id"]

    create_res = client.post(
        "/api/reports/takedown",
        json={"finding_id": target_fnd_id}
    )
    assert create_res.status_code == 201
    report_id = create_res.json()["id"]

    # 1. Analyst cannot update report (forbidden by RBAC)
    analyst_update = analyst_client.put(
        f"/api/reports/takedown/{report_id}",
        json={"content_markdown": "Analyst trying to edit notice markdown text"}
    )
    assert analyst_update.status_code == 403
    assert "not authorized" in analyst_update.json()["detail"].lower()

    # 2. Legal role CAN update report
    legal_update = legal_client.put(
        f"/api/reports/takedown/{report_id}",
        json={"content_markdown": "Legal counsel formal edits applied here", "review_state": "REVIEWED"}
    )
    assert legal_update.status_code == 200
    assert legal_update.json()["review_state"] == "REVIEWED"


def test_investigation_log_audit_trail_persistence(analyst_client):
    # Run monitoring and pick a finding
    analyst_client.post("/api/monitoring/social/run", json={"brand_id": "razorpay"})
    findings = analyst_client.get("/api/findings?brand_id=razorpay").json()
    fnd = findings[0]
    target_id = fnd["id"]

    # Patch finding status with rationale
    update_res = analyst_client.patch(
        f"/api/findings/{target_id}",
        json={
            "review_status": "CONFIRMED_THREAT",
            "rationale": "High-confidence brand spoof verified against registry"
        }
    )
    assert update_res.status_code == 200

    # Retrieve history
    history_res = analyst_client.get(f"/api/findings/{target_id}/history")
    assert history_res.status_code == 200
    history = history_res.json()
    assert len(history) >= 1

    latest = history[0]
    assert latest["finding_id"] == target_id
    assert latest["actor_email"] == "analyst@aegis.local"
    assert latest["actor_role"] == "analyst"
    assert latest["action"] == "STATUS_CHANGE"
    assert latest["previous_state"]["review_status"] == fnd["review_status"]
    assert latest["new_state"]["review_status"] == "CONFIRMED_THREAT"
    assert latest["rationale"] == "High-confidence brand spoof verified against registry"


def test_foreign_key_enforcement():
    conn = get_db_connection()
    try:
        cur = conn.cursor()
        # Verify PRAGMA foreign_keys is 1 (ON)
        cur.execute("PRAGMA foreign_keys;")
        assert cur.fetchone()[0] == 1

        # Attempt to insert a brand pointing to a non-existent organization_id
        with pytest.raises(sqlite3.IntegrityError):
            cur.execute(
                """
                INSERT INTO brands (
                    id, organization_id, name, official_handle, official_domain, created_at
                ) VALUES (?, ?, ?, ?, ?, ?)
                """,
                ("orphan_brand", "nonexistent_org_xyz", "Orphan", "@orphan", "orphan.com", "2026-01-01T00:00:00Z")
            )
            conn.commit()
    finally:
        conn.close()



def test_fresh_database_initialization(tmp_path):
    db_file = str(tmp_path / "fresh_test.db")
    from backend.app.database import init_db
    init_db(db_file)
    conn = get_db_connection(db_file)
    cur = conn.cursor()
    cur.execute("SELECT version, name FROM schema_migrations")
    rows = cur.fetchall()
    assert len(rows) == 1
    assert rows[0]["version"] == 2
    cur.execute("PRAGMA foreign_key_check;")
    assert len(cur.fetchall()) == 0
    conn.close()


def test_legacy_database_migration_with_preexisting_data(tmp_path):
    db_file = str(tmp_path / "legacy_test.db")
    # 1. Create purely legacy tables without organization_id
    conn = sqlite3.connect(db_file)
    cur = conn.cursor()
    cur.execute("""
    CREATE TABLE brands (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        industry TEXT,
        official_handle TEXT NOT NULL,
        support_handle TEXT,
        official_domain TEXT NOT NULL,
        verified_handles TEXT NOT NULL DEFAULT '[]',
        official_apps TEXT NOT NULL DEFAULT '[]',
        logo_url TEXT,
        risk_threshold INTEGER NOT NULL DEFAULT 50,
        created_at TEXT NOT NULL
    );
    """)
    cur.execute("""
    CREATE TABLE findings (
        id TEXT PRIMARY KEY,
        brand_id TEXT NOT NULL,
        run_id TEXT,
        platform TEXT NOT NULL,
        channel TEXT NOT NULL,
        suspect_name TEXT NOT NULL,
        suspect_handle TEXT NOT NULL,
        suspect_publisher TEXT,
        suspect_url TEXT,
        suspect_bio TEXT,
        post_captions TEXT NOT NULL DEFAULT '[]',
        followers_count INTEGER NOT NULL DEFAULT 0,
        account_age_days INTEGER NOT NULL DEFAULT 0,
        logo_match_percent INTEGER NOT NULL DEFAULT 0,
        composite_score INTEGER NOT NULL DEFAULT 0,
        severity TEXT NOT NULL DEFAULT 'LOW',
        review_status TEXT NOT NULL DEFAULT 'NEW',
        is_official_excluded INTEGER NOT NULL DEFAULT 0,
        reasons TEXT NOT NULL DEFAULT '[]',
        breakdown TEXT NOT NULL DEFAULT '{}',
        provenance TEXT NOT NULL DEFAULT 'demo_fixture',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (brand_id) REFERENCES brands (id) ON DELETE CASCADE
    );
    """)
    cur.execute("INSERT INTO brands (id, name, official_handle, official_domain, created_at) VALUES ('legacy-pre-v2', 'Legacy Corp', '@legacy', 'legacy.com', '2025-10-01')")
    cur.execute("INSERT INTO findings (id, brand_id, platform, channel, suspect_name, suspect_handle, created_at, updated_at) VALUES ('FND-LEGACY-999', 'legacy-pre-v2', 'Instagram', 'Social Profile', 'Fake Pre-V2', '@fake_prev2', '2025-10-02', '2025-10-02')")
    conn.commit()
    conn.close()

    # 2. Run init_db (must not raise OperationalError: no such column: organization_id)
    from backend.app.database import init_db
    init_db(db_file)

    # 3. Assert data integrity and schema
    conn = get_db_connection(db_file)
    cur = conn.cursor()
    cur.execute("SELECT * FROM brands WHERE id = 'legacy-pre-v2'")
    brand_row = cur.fetchone()
    assert brand_row is not None
    assert brand_row["organization_id"] == "org-default-legacy"

    cur.execute("SELECT * FROM findings WHERE id = 'FND-LEGACY-999'")
    fnd_row = cur.fetchone()
    assert fnd_row is not None
    assert fnd_row["organization_id"] == "org-default-legacy"
    assert fnd_row["suspect_handle"] == "@fake_prev2"

    cur.execute("SELECT version FROM schema_migrations WHERE version = 2")
    assert cur.fetchone() is not None

    cur.execute("PRAGMA foreign_key_check;")
    assert len(cur.fetchall()) == 0

    # 4. Rerun init_db to test idempotency
    init_db(db_file)
    cur.execute("SELECT COUNT(*) AS count FROM brands WHERE id = 'legacy-pre-v2'")
    assert cur.fetchone()["count"] == 1
    conn.close()


def test_jwt_secret_resolution_logic(monkeypatch, caplog):
    import logging
    import secrets
    from backend.app.config import resolve_jwt_secret

    # 1. Missing secret in production raises RuntimeError (fails closed)
    monkeypatch.setenv("AEGIS_ENV", "production")
    monkeypatch.delenv("AEGIS_JWT_SECRET", raising=False)
    with pytest.raises(RuntimeError) as exc_info:
        resolve_jwt_secret()
    assert "missing in production" in str(exc_info.value)

    # 2. Too short secret in production raises RuntimeError
    monkeypatch.setenv("AEGIS_JWT_SECRET", "short-secret")
    with pytest.raises(RuntimeError) as exc_info:
        resolve_jwt_secret()
    assert "minimum 32 bytes required" in str(exc_info.value)

    # 3. Repeated-character secret in production raises RuntimeError
    weak_repeated = "a" * 32
    with pytest.raises(RuntimeError) as exc_info:
        monkeypatch.setenv("AEGIS_JWT_SECRET", weak_repeated)
        resolve_jwt_secret()
    assert "lacks sufficient character diversity" in str(exc_info.value)
    assert weak_repeated not in str(exc_info.value)  # Confirms secret is not disclosed

    # 4. Obvious sequential or patterned placeholder secret raises RuntimeError
    weak_pattern = "1234567890" * 3 + "12"
    with pytest.raises(RuntimeError) as exc_info:
        monkeypatch.setenv("AEGIS_JWT_SECRET", weak_pattern)
        resolve_jwt_secret()
    assert "repetitive or patterned sequence" in str(exc_info.value) or "sequential or keyboard pattern" in str(exc_info.value)
    assert weak_pattern not in str(exc_info.value)

    weak_alphabet = "abcdefghijklmnopqrstuvwxyz123456"
    with pytest.raises(RuntimeError) as exc_info:
        monkeypatch.setenv("AEGIS_JWT_SECRET", weak_alphabet)
        resolve_jwt_secret()
    assert "sequential or keyboard pattern" in str(exc_info.value)

    # 5. Known insecure placeholder raises RuntimeError
    weak_placeholder = "dev-insecure-secret-key-for-local-testing-only-replace-in-production-min32chars"
    with pytest.raises(RuntimeError) as exc_info:
        monkeypatch.setenv("AEGIS_JWT_SECRET", weak_placeholder)
        resolve_jwt_secret()
    assert "disallowed or known insecure" in str(exc_info.value)

    # 6. Properly generated 32-byte random secret in hexadecimal form is accepted
    csprng_hex_secret = secrets.token_hex(32)  # 64 hex chars = 256 bits of entropy
    monkeypatch.setenv("AEGIS_JWT_SECRET", csprng_hex_secret)
    resolved = resolve_jwt_secret()
    assert resolved == csprng_hex_secret

    valid_key = "valid-cryptographic-signing-key-production-32bytes!!"
    monkeypatch.setenv("AEGIS_JWT_SECRET", valid_key)
    assert resolve_jwt_secret() == valid_key

    # 7. Development/test fallback remains cryptographically secure
    monkeypatch.setenv("AEGIS_ENV", "development")
    monkeypatch.delenv("AEGIS_JWT_SECRET", raising=False)
    with caplog.at_level(logging.WARNING):
        ephemeral = resolve_jwt_secret()
    assert len(ephemeral) == 64
    assert len(set(ephemeral)) >= 10  # High character diversity

    # 8. Production validation does not log the secret
    # Ensure logs captured do not reveal any secret values
    for record in caplog.records:
        assert csprng_hex_secret not in record.message
        assert weak_repeated not in record.message
        assert weak_pattern not in record.message
        assert ephemeral not in record.message
