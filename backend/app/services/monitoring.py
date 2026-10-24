import json
import uuid
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
import sqlite3

from backend.app.database import get_db_connection
from backend.app.services.detection import calculate_explainable_risk
from backend.app.services.fixtures import DEMO_SOCIAL_CANDIDATES, DEMO_APP_CANDIDATES


def _parse_brand_row(row: sqlite3.Row) -> Dict[str, Any]:
    return {
        "id": row["id"],
        "organization_id": row["organization_id"] if "organization_id" in row.keys() else None,
        "name": row["name"],
        "industry": row["industry"],
        "official_handle": row["official_handle"],
        "support_handle": row["support_handle"],
        "official_domain": row["official_domain"],
        "verified_handles": json.loads(row["verified_handles"] or "[]"),
        "official_apps": json.loads(row["official_apps"] or "[]"),
        "logo_url": row["logo_url"],
        "risk_threshold": row["risk_threshold"],
        "created_at": row["created_at"]
    }


def execute_monitoring_pipeline(
    brand_id: str,
    channel: str,  # 'social' or 'apps'
    use_demo_fixtures: bool = True,
    db_conn: Optional[sqlite3.Connection] = None,
    organization_id: Optional[str] = None
) -> Dict[str, Any]:
    conn = db_conn or get_db_connection()
    should_close = db_conn is None

    try:
        cur = conn.cursor()

        # 1. Fetch brand (tenant-scoped if organization_id provided)
        if organization_id:
            cur.execute("SELECT * FROM brands WHERE id = ? AND organization_id = ?", (brand_id, organization_id))
        else:
            cur.execute("SELECT * FROM brands WHERE id = ?", (brand_id,))
        brand_row = cur.fetchone()
        if not brand_row:
            raise ValueError(f"Brand with ID '{brand_id}' not found")

        brand = _parse_brand_row(brand_row)
        resolved_org_id = brand.get("organization_id") or organization_id or "org-default-legacy"

        # 2. Select candidates
        if channel == "social":
            candidates = DEMO_SOCIAL_CANDIDATES.get(brand_id, [])
        else:
            candidates = DEMO_APP_CANDIDATES.get(brand_id, [])

        now_str = datetime.now(timezone.utc).isoformat()
        run_id = f"RUN-{channel.upper()[:3]}-{uuid.uuid4().hex[:8].upper()}"

        # 3. Insert initial monitoring run
        cur.execute(
            """
            INSERT INTO monitoring_runs (
                id, organization_id, brand_id, channel, status, provenance, is_live,
                candidates_scanned, threats_detected, summary_notes, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                run_id,
                resolved_org_id,
                brand_id,
                channel,
                "PROCESSING",
                "demo_fixture" if use_demo_fixtures else "live_connector",
                0 if use_demo_fixtures else 1,
                len(candidates),
                0,
                f"Synthetic {channel} pipeline execution for evaluation",
                now_str
            )
        )
        conn.commit()

        findings_created = []
        threats_count = 0

        # 4. Process each candidate through explainable risk detection engine
        for idx, cand in enumerate(candidates):
            suspect_handle = cand["suspect_handle"]

            risk_result = calculate_explainable_risk(
                suspect_handle=suspect_handle,
                official_handle=brand["official_handle"],
                suspect_bio=cand.get("suspect_bio", ""),
                post_captions=cand.get("post_captions", []),
                suspect_url=cand.get("suspect_url", ""),
                official_domain=brand["official_domain"],
                logo_match_percent=cand.get("logo_match_percent", 0),
                channel=cand["channel"],
                suspect_publisher=cand.get("suspect_publisher"),
                official_apps=brand["official_apps"],
                brand=brand
            )

            is_threat = (
                not risk_result["is_official_excluded"] and
                risk_result["severity"] in ["CRITICAL", "HIGH", "MEDIUM"]
            )
            if is_threat:
                threats_count += 1

            finding_id = f"FND-{brand_id.upper()[:3]}-{channel.upper()[:3]}-{idx+1:02d}-{uuid.uuid4().hex[:4].upper()}"

            finding_data = {
                "id": finding_id,
                "organization_id": resolved_org_id,
                "brand_id": brand_id,
                "run_id": run_id,
                "platform": cand["platform"],
                "channel": cand["channel"],
                "suspect_name": cand["suspect_name"],
                "suspect_handle": suspect_handle,
                "suspect_publisher": cand.get("suspect_publisher"),
                "suspect_url": cand.get("suspect_url"),
                "suspect_bio": cand.get("suspect_bio"),
                "post_captions": cand.get("post_captions", []),
                "followers_count": cand.get("followers_count", 0),
                "account_age_days": cand.get("account_age_days", 0),
                "logo_match_percent": cand.get("logo_match_percent", 0),
                "composite_score": risk_result["composite_score"],
                "severity": risk_result["severity"],
                "review_status": "NEW",
                "is_official_excluded": risk_result["is_official_excluded"],
                "reasons": risk_result["reasons"],
                "breakdown": risk_result["breakdown"],
                "provenance": cand.get("provenance", "demo_fixture"),
                "created_at": now_str,
                "updated_at": now_str
            }

            cur.execute(
                """
                INSERT INTO findings (
                    id, organization_id, brand_id, run_id, platform, channel, suspect_name,
                    suspect_handle, suspect_publisher, suspect_url, suspect_bio,
                    post_captions, followers_count, account_age_days,
                    logo_match_percent, composite_score, severity,
                    review_status, is_official_excluded, reasons,
                    breakdown, provenance, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    finding_data["id"],
                    finding_data["organization_id"],
                    finding_data["brand_id"],
                    finding_data["run_id"],
                    finding_data["platform"],
                    finding_data["channel"],
                    finding_data["suspect_name"],
                    finding_data["suspect_handle"],
                    finding_data["suspect_publisher"],
                    finding_data["suspect_url"],
                    finding_data["suspect_bio"],
                    json.dumps(finding_data["post_captions"]),
                    finding_data["followers_count"],
                    finding_data["account_age_days"],
                    finding_data["logo_match_percent"],
                    finding_data["composite_score"],
                    finding_data["severity"],
                    finding_data["review_status"],
                    1 if finding_data["is_official_excluded"] else 0,
                    json.dumps(finding_data["reasons"]),
                    json.dumps(finding_data["breakdown"]),
                    finding_data["provenance"],
                    finding_data["created_at"],
                    finding_data["updated_at"]
                )
            )
            findings_created.append(finding_data)

        # 5. Finalize run status
        cur.execute(
            """
            UPDATE monitoring_runs
            SET status = 'COMPLETED', threats_detected = ?
            WHERE id = ?
            """,
            (threats_count, run_id)
        )
        conn.commit()

        return {
            "id": run_id,
            "organization_id": resolved_org_id,
            "brand_id": brand_id,
            "channel": channel,
            "status": "COMPLETED",
            "provenance": "demo_fixture" if use_demo_fixtures else "live_connector",
            "is_live": not use_demo_fixtures,
            "candidates_scanned": len(candidates),
            "threats_detected": threats_count,
            "summary_notes": f"Scanned {len(candidates)} candidates; flagged {threats_count} actionable threats.",
            "findings": findings_created,
            "created_at": now_str
        }
    finally:
        if should_close:
            conn.close()
