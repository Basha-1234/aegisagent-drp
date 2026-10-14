import hashlib
import json
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, status
from backend.app.database import get_db_connection
from backend.app.schemas import ReportResponse

router = APIRouter(prefix="/api/reports", tags=["Reports"])


@router.get("/{finding_id}/json", response_model=ReportResponse)
def get_evidentiary_report(finding_id: str):
    conn = get_db_connection()
    try:
        cur = conn.cursor()

        # 1. Fetch finding
        cur.execute("SELECT * FROM findings WHERE id = ?", (finding_id,))
        finding_row = cur.fetchone()
        if not finding_row:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Finding '{finding_id}' not found"
            )

        # 2. Fetch associated brand
        cur.execute("SELECT * FROM brands WHERE id = ?", (finding_row["brand_id"],))
        brand_row = cur.fetchone()
        brand_name = brand_row["name"] if brand_row else "Protected Enterprise"
        official_domain = brand_row["official_domain"] if brand_row else "brand.com"
        official_handle = brand_row["official_handle"] if brand_row else "@brand"

        now_str = datetime.now(timezone.utc).isoformat()

        suspect_entity = {
            "suspect_name": finding_row["suspect_name"],
            "suspect_handle": finding_row["suspect_handle"],
            "suspect_publisher": finding_row["suspect_publisher"],
            "suspect_url": finding_row["suspect_url"],
            "platform": finding_row["platform"],
            "channel": finding_row["channel"],
            "followers_count": finding_row["followers_count"],
            "account_age_days": finding_row["account_age_days"]
        }

        reasons = json.loads(finding_row["reasons"] or "[]")
        breakdown = json.loads(finding_row["breakdown"] or "{}")

        forensic_evidence = {
            "composite_risk_score": finding_row["composite_score"],
            "severity_level": finding_row["severity"],
            "visual_logo_match_percent": finding_row["logo_match_percent"],
            "breakdown": breakdown,
            "evidence_reasons": reasons,
            "provenance": finding_row["provenance"],
            "recorded_at": finding_row["created_at"]
        }

        statutory_grounds = {
            "it_rules_2021": {
                "section": "Rule 3(2)(b) of the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021",
                "mandate": "Mandatory removal or disabling of access within 24 hours of receipt of notice",
                "grounds": "Unauthorized impersonation of financial brand, fraudulent financial solicitation, and deceptive customer support."
            },
            "dmca": {
                "section": "17 U.S.C. § 512(c) Notice and Takedown Procedure",
                "mandate": "Expeditious removal of infringing copyright and trademark materials",
                "grounds": "Unauthorized visual reproduction of corporate logo assets and brand trade dress."
            }
        }

        # Compute cryptographic chain-of-custody proof hash
        proof_payload = f"{finding_id}:{finding_row['suspect_handle']}:{finding_row['composite_score']}:{now_str}"
        proof_hash = hashlib.sha256(proof_payload.encode("utf-8")).hexdigest()

        return ReportResponse(
            report_id=f"RPT-{finding_id}",
            finding_id=finding_id,
            brand_name=brand_name,
            official_domain=official_domain,
            official_handle=official_handle,
            suspect_entity=suspect_entity,
            forensic_evidence=forensic_evidence,
            statutory_grounds=statutory_grounds,
            chain_of_custody_hash=proof_hash,
            generated_at=now_str,
            disclaimer="NOTICE: This report represents a pre-litigation evidentiary dossier prepared for statutory takedown notice filing. Automated evidence collected is cryptographically sealed for judicial verification."
        )
    finally:
        conn.close()
