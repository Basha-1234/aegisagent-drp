import json
import sqlite3
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional
from backend.app.config import DB_PATH

SCHEMA_SQL = """
CREATE TABLE IF NOT EXISTS brands (
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

CREATE TABLE IF NOT EXISTS monitoring_runs (
    id TEXT PRIMARY KEY,
    brand_id TEXT NOT NULL,
    channel TEXT NOT NULL,
    status TEXT NOT NULL,
    provenance TEXT NOT NULL DEFAULT 'demo_fixture',
    is_live INTEGER NOT NULL DEFAULT 0,
    candidates_scanned INTEGER NOT NULL DEFAULT 0,
    threats_detected INTEGER NOT NULL DEFAULT 0,
    summary_notes TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (brand_id) REFERENCES brands (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS findings (
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
    FOREIGN KEY (brand_id) REFERENCES brands (id) ON DELETE CASCADE,
    FOREIGN KEY (run_id) REFERENCES monitoring_runs (id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_findings_brand_id ON findings (brand_id);
CREATE INDEX IF NOT EXISTS idx_findings_severity ON findings (severity);
CREATE INDEX IF NOT EXISTS idx_findings_review_status ON findings (review_status);
CREATE INDEX IF NOT EXISTS idx_monitoring_runs_brand_id ON monitoring_runs (brand_id);
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


def init_db(db_path: Optional[str] = None) -> None:
    conn = get_db_connection(db_path)
    try:
        conn.executescript(SCHEMA_SQL)

        # Check if brands table has records
        cur = conn.cursor()
        cur.execute("SELECT COUNT(*) AS count FROM brands")
        count = cur.fetchone()["count"]

        if count == 0:
            now = datetime.now(timezone.utc).isoformat()
            for b in INITIAL_BRANDS:
                cur.execute(
                    """
                    INSERT INTO brands (
                        id, name, industry, official_handle, support_handle,
                        official_domain, verified_handles, official_apps,
                        logo_url, risk_threshold, created_at
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        b["id"],
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
    finally:
        conn.close()
