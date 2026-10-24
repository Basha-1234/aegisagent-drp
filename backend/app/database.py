import json
import os
import sqlite3
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional, List, Dict, Any

from backend.app.config import (
    DB_PATH,
    IS_PRODUCTION,
    BOOTSTRAP_ADMIN_EMAIL,
    BOOTSTRAP_ADMIN_PASSWORD,
    BOOTSTRAP_ADMIN_NAME,
)

DEFAULT_LEGACY_ORG_ID = "org-default-legacy"
DEFAULT_LEGACY_ORG_NAME = "Primary Enterprise Organization"

SCHEMA_MIGRATIONS_SQL = """
CREATE TABLE IF NOT EXISTS schema_migrations (
    version INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    applied_at TEXT NOT NULL
);
"""

SCHEMA_V2_TABLES_SQL = """
-- 1. Organizations (Customer Multi-Tenancy)
CREATE TABLE IF NOT EXISTS organizations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

-- 2. Users (Authenticated Identities & RBAC)
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL,
    email TEXT NOT NULL COLLATE NOCASE,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (organization_id) REFERENCES organizations (id) ON DELETE CASCADE
);

-- 3. Brands (Customer-Owned Assets)
CREATE TABLE IF NOT EXISTS brands (
    id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL DEFAULT 'org-default-legacy',
    name TEXT NOT NULL,
    industry TEXT,
    official_handle TEXT NOT NULL,
    support_handle TEXT,
    official_domain TEXT NOT NULL,
    verified_handles TEXT NOT NULL DEFAULT '[]',
    official_apps TEXT NOT NULL DEFAULT '[]',
    logo_url TEXT,
    risk_threshold INTEGER NOT NULL DEFAULT 50,
    created_at TEXT NOT NULL,
    FOREIGN KEY (organization_id) REFERENCES organizations (id) ON DELETE CASCADE
);

-- 4. Monitoring Runs
CREATE TABLE IF NOT EXISTS monitoring_runs (
    id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL DEFAULT 'org-default-legacy',
    brand_id TEXT NOT NULL,
    channel TEXT NOT NULL,
    status TEXT NOT NULL,
    provenance TEXT NOT NULL DEFAULT 'demo_fixture',
    is_live INTEGER NOT NULL DEFAULT 0,
    candidates_scanned INTEGER NOT NULL DEFAULT 0,
    threats_detected INTEGER NOT NULL DEFAULT 0,
    summary_notes TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (organization_id) REFERENCES organizations (id) ON DELETE CASCADE,
    FOREIGN KEY (brand_id) REFERENCES brands (id) ON DELETE CASCADE
);

-- 5. Findings
CREATE TABLE IF NOT EXISTS findings (
    id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL DEFAULT 'org-default-legacy',
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
    FOREIGN KEY (organization_id) REFERENCES organizations (id) ON DELETE CASCADE,
    FOREIGN KEY (brand_id) REFERENCES brands (id) ON DELETE CASCADE,
    FOREIGN KEY (run_id) REFERENCES monitoring_runs (id) ON DELETE SET NULL
);

-- 6. Takedown Reports
CREATE TABLE IF NOT EXISTS takedown_reports (
    id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL DEFAULT 'org-default-legacy',
    finding_id TEXT NOT NULL,
    brand_id TEXT NOT NULL,
    document_status TEXT NOT NULL DEFAULT 'Demonstration Draft — Not Sent',
    recipient_platform TEXT NOT NULL,
    subject TEXT NOT NULL,
    content_markdown TEXT NOT NULL,
    analyst_name TEXT,
    analyst_designation TEXT,
    review_state TEXT NOT NULL DEFAULT 'DRAFT',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (organization_id) REFERENCES organizations (id) ON DELETE CASCADE,
    FOREIGN KEY (finding_id) REFERENCES findings (id) ON DELETE CASCADE,
    FOREIGN KEY (brand_id) REFERENCES brands (id) ON DELETE CASCADE
);

-- 7. Immutable Investigation Logs (Audit Trail)
CREATE TABLE IF NOT EXISTS investigation_logs (
    id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL,
    finding_id TEXT NOT NULL,
    user_id TEXT,
    actor_email TEXT NOT NULL,
    actor_role TEXT NOT NULL,
    action TEXT NOT NULL,
    previous_state TEXT,
    new_state TEXT,
    rationale TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (organization_id) REFERENCES organizations (id) ON DELETE CASCADE,
    FOREIGN KEY (finding_id) REFERENCES findings (id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
);
"""

SCHEMA_V2_INDEXES_SQL = """
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users (email);
CREATE INDEX IF NOT EXISTS idx_users_org_id ON users (organization_id);
CREATE INDEX IF NOT EXISTS idx_brands_org_id ON brands (organization_id);
CREATE INDEX IF NOT EXISTS idx_monitoring_runs_brand_id ON monitoring_runs (brand_id);
CREATE INDEX IF NOT EXISTS idx_monitoring_runs_org_id ON monitoring_runs (organization_id);
CREATE INDEX IF NOT EXISTS idx_findings_brand_id ON findings (brand_id);
CREATE INDEX IF NOT EXISTS idx_findings_org_id ON findings (organization_id);
CREATE INDEX IF NOT EXISTS idx_findings_severity ON findings (severity);
CREATE INDEX IF NOT EXISTS idx_findings_review_status ON findings (review_status);
CREATE INDEX IF NOT EXISTS idx_takedown_reports_finding_id ON takedown_reports (finding_id);
CREATE INDEX IF NOT EXISTS idx_takedown_reports_brand_id ON takedown_reports (brand_id);
CREATE INDEX IF NOT EXISTS idx_takedown_reports_org_id ON takedown_reports (organization_id);
CREATE INDEX IF NOT EXISTS idx_investigation_logs_finding_id ON investigation_logs (finding_id);
CREATE INDEX IF NOT EXISTS idx_investigation_logs_org_id ON investigation_logs (organization_id);
CREATE INDEX IF NOT EXISTS idx_investigation_logs_created_at ON investigation_logs (created_at);
"""

INITIAL_BRANDS = [
    {
        "id": "razorpay",
        "name": "Razorpay Technologies",
        "industry": "Payment Gateway & Merchant B2B Fintech",
        "official_handle": "@Razorpay",
        "support_handle": "@RazorpaySupport",
        "official_domain": "razorpay.com",
        "verified_handles": ["@Razorpay", "@RazorpaySupport", "@RazorpayCare"],
        "official_apps": [
            {
                "appName": "Razorpay: Payment Gateway & POS",
                "appId": "com.razorpay.payments.app",
                "publisher": "Razorpay Software Private Limited",
                "store": "Google Play & Apple App Store",
                "rating": 4.7,
                "iconUrl": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80"
            }
        ],
        "logo_url": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80",
        "risk_threshold": 50
    },
    {
        "id": "phonepe",
        "name": "PhonePe UPI & Payments",
        "industry": "Consumer UPI Payments & Financial Services",
        "official_handle": "@PhonePe",
        "support_handle": "@PhonePeSupport",
        "official_domain": "phonepe.com",
        "verified_handles": ["@PhonePe", "@PhonePeSupport", "@PhonePe_Help"],
        "official_apps": [
            {
                "appName": "PhonePe: UPI, Recharges & Payments",
                "appId": "com.phonepe.app",
                "publisher": "PhonePe India Private Limited",
                "store": "Google Play & Apple App Store",
                "rating": 4.8,
                "iconUrl": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=150&auto=format&fit=crop&q=80"
            }
        ],
        "logo_url": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=150&auto=format&fit=crop&q=80",
        "risk_threshold": 45
    },
    {
        "id": "revolut",
        "name": "Revolut NeoBank",
        "industry": "Global Digital NeoBanking & Crypto",
        "official_handle": "@RevolutApp",
        "support_handle": "@RevolutSupport",
        "official_domain": "revolut.com",
        "verified_handles": ["@RevolutApp", "@RevolutSupport", "@RevolutInsider"],
        "official_apps": [
            {
                "appName": "Revolut: Spend, Save, Invest",
                "appId": "com.revolut.revolut",
                "publisher": "Revolut Ltd",
                "store": "Google Play & Apple App Store",
                "rating": 4.8,
                "iconUrl": "https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?w=150&auto=format&fit=crop&q=80"
            }
        ],
        "logo_url": "https://images.unsplash.com/photo-1622979135225-d2ba269bc1df?w=150&auto=format&fit=crop&q=80",
        "risk_threshold": 60
    }
]


def get_db_connection(db_path: Optional[str] = None) -> sqlite3.Connection:
    target_path = db_path or DB_PATH
    Path(target_path).parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(target_path)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn


def _get_table_columns(cur: sqlite3.Cursor, table_name: str) -> List[str]:
    cur.execute(f"PRAGMA table_info({table_name});")
    return [row["name"] for row in cur.fetchall()]


def migrate_db(conn: sqlite3.Connection) -> None:
    """
    Safe, idempotent migration to Stage 1 Multi-Tenant Schema.
    Preserves all existing data, relationships, and IDs without recreation or data loss.
    Guarantees dependent columns exist BEFORE creating indexes.
    """
    cur = conn.cursor()

    # Step 1: Ensure schema_migrations table exists
    conn.executescript(SCHEMA_MIGRATIONS_SQL)

    # Step 2: Ensure base organizations table exists and default legacy org exists
    cur.execute("""
    CREATE TABLE IF NOT EXISTS organizations (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
    );
    """)
    cur.execute("SELECT id FROM organizations WHERE id = ?", (DEFAULT_LEGACY_ORG_ID,))
    if not cur.fetchone():
        now_str = datetime.now(timezone.utc).isoformat()
        cur.execute(
            "INSERT INTO organizations (id, name, created_at, updated_at) VALUES (?, ?, ?, ?)",
            (DEFAULT_LEGACY_ORG_ID, DEFAULT_LEGACY_ORG_NAME, now_str, now_str)
        )

    # Step 3: Ensure all base tables exist (new databases get full schemas; existing tables preserved)
    conn.executescript(SCHEMA_V2_TABLES_SQL)

    # Step 4: Check and backfill organization_id on legacy tables BEFORE creating indexes
    tables_to_scope = ["brands", "monitoring_runs", "findings", "takedown_reports", "investigation_logs"]
    for tbl in tables_to_scope:
        cur.execute("SELECT name FROM sqlite_master WHERE type='table' AND name = ?", (tbl,))
        if cur.fetchone():
            cols = _get_table_columns(cur, tbl)
            if "organization_id" not in cols:
                cur.execute(f"ALTER TABLE {tbl} ADD COLUMN organization_id TEXT REFERENCES organizations (id) ON DELETE CASCADE;")
                cur.execute(f"UPDATE {tbl} SET organization_id = ? WHERE organization_id IS NULL;", (DEFAULT_LEGACY_ORG_ID,))
            else:
                cur.execute(f"UPDATE {tbl} SET organization_id = ? WHERE organization_id IS NULL;", (DEFAULT_LEGACY_ORG_ID,))

    # Step 5: Now that all tables and columns are guaranteed to exist, safely create all indexes
    conn.executescript(SCHEMA_V2_INDEXES_SQL)

    # Step 6: Verify foreign key integrity
    cur.execute("PRAGMA foreign_key_check;")
    fk_errors = cur.fetchall()
    if fk_errors:
        raise RuntimeError(f"Foreign key integrity check failed after migration: {fk_errors}")

    # Step 7: Record migration version ONLY after all checks and operations succeeded
    cur.execute("SELECT version FROM schema_migrations WHERE version = 2")
    if not cur.fetchone():
        now_str = datetime.now(timezone.utc).isoformat()
        cur.execute(
            "INSERT INTO schema_migrations (version, name, applied_at) VALUES (?, ?, ?)",
            (2, "Stage1_MultiTenant_Auth_InvestigationLogs", now_str)
        )

    conn.commit()


def seed_demo_users_if_needed(conn: sqlite3.Connection) -> None:
    """
    Seeds local development demo evaluation personas in non-production mode.
    Never executed in production.
    """
    if IS_PRODUCTION:
        return

    from backend.app.auth import hash_password
    cur = conn.cursor()
    demo_users = [
        ("usr-analyst-01", "alex.chen@razorpay.com", "Alex Chen", "analyst"),
        ("usr-legal-02", "sarah.vance@razorpay.com", "Sarah Vance", "legal"),
        ("usr-support-03", "marcus.brooks@razorpay.com", "Marcus Brooks", "support"),
        ("usr-ciso-04", "elena.rostova@razorpay.com", "Elena Rostova", "ciso"),
    ]
    now_str = datetime.now(timezone.utc).isoformat()
    demo_pwd_hash = hash_password("AegisDemo2026!")

    for uid, email, name, role in demo_users:
        cur.execute("SELECT id FROM users WHERE email = ?", (email.lower(),))
        if not cur.fetchone():
            cur.execute(
                """
                INSERT INTO users (
                    id, organization_id, email, password_hash, full_name,
                    role, is_active, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (uid, DEFAULT_LEGACY_ORG_ID, email.lower(), demo_pwd_hash, name, role, 1, now_str, now_str)
            )
    conn.commit()


def bootstrap_initial_admin(conn: sqlite3.Connection) -> Optional[str]:
    """
    Secure bootstrap mechanism for the first organization administrator.
    Only creates an admin if:
    1. No admin user currently exists in the database.
    2. AEGIS_BOOTSTRAP_ADMIN_EMAIL and AEGIS_BOOTSTRAP_ADMIN_PASSWORD environment variables are set.
    Cannot be reused after an admin exists.
    """
    if not BOOTSTRAP_ADMIN_EMAIL or not BOOTSTRAP_ADMIN_PASSWORD:
        return None

    from backend.app.auth import hash_password

    cur = conn.cursor()
    cur.execute("SELECT id FROM users WHERE role = 'admin' LIMIT 1")
    if cur.fetchone():
        # An administrator already exists; bootstrap mechanism cannot be reused.
        return None

    now_str = datetime.now(timezone.utc).isoformat()
    admin_id = f"usr-admin-{uuid.uuid4().hex[:8]}"
    pwd_hash = hash_password(BOOTSTRAP_ADMIN_PASSWORD)

    cur.execute(
        """
        INSERT INTO users (
            id, organization_id, email, password_hash, full_name,
            role, is_active, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            admin_id,
            DEFAULT_LEGACY_ORG_ID,
            BOOTSTRAP_ADMIN_EMAIL.strip().lower(),
            pwd_hash,
            BOOTSTRAP_ADMIN_NAME,
            "admin",
            1,
            now_str,
            now_str
        )
    )
    conn.commit()
    return admin_id


def init_db(db_path: Optional[str] = None) -> None:
    conn = get_db_connection(db_path)
    try:
        # Run safe schema migration
        migrate_db(conn)

        # Check if brands table has records; if not, seed initial brands
        cur = conn.cursor()
        cur.execute("SELECT COUNT(*) AS count FROM brands")
        count = cur.fetchone()["count"]

        if count == 0:
            now = datetime.now(timezone.utc).isoformat()
            for b in INITIAL_BRANDS:
                cur.execute(
                    """
                    INSERT INTO brands (
                        id, organization_id, name, industry, official_handle, support_handle,
                        official_domain, verified_handles, official_apps,
                        logo_url, risk_threshold, created_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        b["id"],
                        DEFAULT_LEGACY_ORG_ID,
                        b["name"],
                        b["industry"],
                        b["official_handle"],
                        b["support_handle"],
                        b["official_domain"],
                        json.dumps(b["verified_handles"]),
                        json.dumps(b["official_apps"]),
                        b["logo_url"],
                        b["risk_threshold"],
                        now
                    )
                )
            conn.commit()

        # Seed local evaluation personas in development mode
        seed_demo_users_if_needed(conn)

        # Run bootstrap if configured
        bootstrap_initial_admin(conn)
    finally:
        conn.close()
