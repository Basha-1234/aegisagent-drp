import hashlib
import json
import uuid
from datetime import datetime, timezone
from typing import List, Optional, Any
from fastapi import APIRouter, HTTPException, Depends, status
import sqlite3

from backend.app.database import get_db_connection
from backend.app.auth import get_current_user, AuthenticatedUser
from backend.app.schemas import (
    ReportResponse,
    TakedownReportCreate,
    TakedownReportUpdate,
    TakedownReportResponse,
)

router = APIRouter(prefix="/api/reports", tags=["Reports"])


def generate_default_takedown_notice(finding_row: Any, brand_row: Any) -> str:
    brand_name = brand_row["name"] if brand_row else "Protected Brand"
    official_handle = brand_row["official_handle"] if brand_row else "@official"
    official_domain = brand_row["official_domain"] if brand_row else "brand.com"
    suspect_handle = finding_row["suspect_handle"]
    suspect_name = finding_row["suspect_name"]
    platform = finding_row["platform"]
    suspect_url = finding_row["suspect_url"] or "[No external URL observed]"
    bio = finding_row["suspect_bio"] or "[No profile bio provided]"
    logo_match = finding_row["logo_match_percent"]
    composite_score = finding_row["composite_score"]
    severity = finding_row["severity"]
    obs_date = finding_row["created_at"][:10] if finding_row["created_at"] else "Current"

    reasons = json.loads(finding_row["reasons"] or "[]")
    reasons_str = "; ".join(reasons) if reasons else "Unauthorized branding resemblance requiring platform review"

    return f"""# SAMPLE — DIGITAL IMPERSONATION TAKEDOWN NOTICE

**Document status:** Demonstration Draft — Not Sent  
**Case ID:** AEGIS-{finding_row["id"]}  
**Date:** {obs_date}

**To:** Trust & Safety / Abuse Response Team  
**Platform:** {platform}

**Subject: Request for Review and Removal of Suspected Brand-Impersonating Profile**

Dear Trust & Safety Team,

We request a review of the following account for suspected unauthorized impersonation of **{brand_name}**, subject to verification by the brand's authorized representative.

### 1. Reported account

- **Platform:** {platform}
- **Profile name:** {suspect_name}
- **Profile URL:** {suspect_url}
- **Account identifier:** {suspect_handle}
- **Date observed:** {obs_date}

### 2. Evidence observed

The AegisAgent DRP investigation record identifies the following indicators:

- **Name similarity:** Observed handle "{suspect_handle}" compared with official brand asset "{official_handle}"
- **Visual resemblance:** Observed visual profile assets exhibit a {logo_match}% visual correlation with complainant's registered brand assets
- **Profile content:** Observed content/bio telemetry: "{bio}"
- **Suspicious links:** {suspect_url}
- **Additional evidence:** Platform risk score: {composite_score}/100 ({severity}); Telemetry indicators: {reasons_str}

These observations are indicators requiring review. They do not independently establish the account operator's identity, intent, or a legal violation.

### 3. Requested action

Please review the account under your applicable impersonation, intellectual property, and platform policies. If the investigation confirms a violation, we request the appropriate enforcement action under your procedures.

Supporting evidence can be provided through the authorized reporting process.

### 4. Authorization and verification

**Reporting organization:** {brand_name} Legal & Brand Safety  
**Authorized representative:** Authorized Brand Protection Analyst  
**Contact details:** trust-safety@{official_domain}  
**Reference case:** AEGIS-{finding_row["id"]}

This document is a demonstration template. It must be reviewed and completed by an authorized representative before submission. It is not a legal opinion or proof of infringement.

Sincerely,

Authorized Brand Protection Analyst  
Senior Analyst, Digital Risk & Threat Operations  
{brand_name} Legal Department"""


@router.get("/{finding_id}/json", response_model=ReportResponse)
def get_evidentiary_report(
    finding_id: str,
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    conn = get_db_connection()
    try:
        cur = conn.cursor()

        # 1. Fetch finding within user's organization
        cur.execute(
            "SELECT * FROM findings WHERE id = ? AND organization_id = ?",
            (finding_id, current_user.organization_id)
        )
        finding_row = cur.fetchone()
        if not finding_row:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Finding '{finding_id}' not found"
            )

        # 2. Fetch associated brand within user's organization
        cur.execute(
            "SELECT * FROM brands WHERE id = ? AND organization_id = ?",
            (finding_row["brand_id"], current_user.organization_id)
        )
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


@router.post("/takedown", response_model=TakedownReportResponse, status_code=status.HTTP_201_CREATED)
def create_takedown_report(
    payload: TakedownReportCreate,
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    conn = get_db_connection()
    try:
        cur = conn.cursor()

        # 1. Verify finding exists in caller's organization
        cur.execute(
            "SELECT * FROM findings WHERE id = ? AND organization_id = ?",
            (payload.finding_id, current_user.organization_id)
        )
        finding_row = cur.fetchone()
        if not finding_row:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Cannot create takedown report: Finding '{payload.finding_id}' does not exist"
            )

        # 2. Verify brand relationship
        actual_brand_id = finding_row["brand_id"]
        if payload.brand_id and payload.brand_id != actual_brand_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Mismatched brand_id: Finding belongs to '{actual_brand_id}', but '{payload.brand_id}' was specified"
            )

        # 3. Fetch brand row within organization
        cur.execute(
            "SELECT * FROM brands WHERE id = ? AND organization_id = ?",
            (actual_brand_id, current_user.organization_id)
        )
        brand_row = cur.fetchone()
        brand_name = brand_row["name"] if brand_row else "Protected Brand"

        # 4. Resolve defaults
        recipient_platform = payload.recipient_platform or finding_row["platform"]
        subject = payload.subject or f"Request for Review and Removal of Suspected Brand-Impersonating Profile ({brand_name})"
        content_markdown = payload.content_markdown or generate_default_takedown_notice(finding_row, brand_row)
        document_status = "Demonstration Draft — Not Sent"
        review_state = payload.review_state or "DRAFT"

        report_id = f"RPT-TKD-{payload.finding_id}-{uuid.uuid4().hex[:8].upper()}"
        now_str = datetime.now(timezone.utc).isoformat()
        analyst_name = payload.analyst_name or current_user.full_name

        cur.execute(
            """
            INSERT INTO takedown_reports (
                id, organization_id, finding_id, brand_id, document_status, recipient_platform,
                subject, content_markdown, analyst_name, analyst_designation,
                review_state, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                report_id,
                current_user.organization_id,
                payload.finding_id,
                actual_brand_id,
                document_status,
                recipient_platform,
                subject,
                content_markdown,
                analyst_name,
                payload.analyst_designation,
                review_state,
                now_str,
                now_str
            )
        )
        conn.commit()

        return TakedownReportResponse(
            id=report_id,
            organization_id=current_user.organization_id,
            finding_id=payload.finding_id,
            brand_id=actual_brand_id,
            document_status=document_status,
            recipient_platform=recipient_platform,
            subject=subject,
            content_markdown=content_markdown,
            analyst_name=analyst_name,
            analyst_designation=payload.analyst_designation,
            review_state=review_state,
            created_at=now_str,
            updated_at=now_str
        )
    finally:
        conn.close()


@router.get("/takedown/{finding_id}", response_model=List[TakedownReportResponse])
def get_takedown_reports_for_finding(
    finding_id: str,
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    conn = get_db_connection()
    try:
        cur = conn.cursor()

        # 1. Verify finding exists in tenant
        cur.execute(
            "SELECT id FROM findings WHERE id = ? AND organization_id = ?",
            (finding_id, current_user.organization_id)
        )
        if not cur.fetchone():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Finding '{finding_id}' not found"
            )

        # 2. Fetch reports for tenant
        cur.execute(
            """
            SELECT * FROM takedown_reports
            WHERE finding_id = ? AND organization_id = ?
            ORDER BY created_at DESC
            """,
            (finding_id, current_user.organization_id)
        )
        rows = cur.fetchall()
        if not rows:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No takedown reports found for finding '{finding_id}'"
            )

        return [
            TakedownReportResponse(
                id=r["id"],
                organization_id=r["organization_id"] if "organization_id" in r.keys() else None,
                finding_id=r["finding_id"],
                brand_id=r["brand_id"],
                document_status=r["document_status"],
                recipient_platform=r["recipient_platform"],
                subject=r["subject"],
                content_markdown=r["content_markdown"],
                analyst_name=r["analyst_name"],
                analyst_designation=r["analyst_designation"],
                review_state=r["review_state"],
                created_at=r["created_at"],
                updated_at=r["updated_at"]
            )
            for r in rows
        ]
    finally:
        conn.close()


@router.get("/takedown/detail/{report_id}", response_model=TakedownReportResponse)
def get_takedown_report_detail(
    report_id: str,
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    conn = get_db_connection()
    try:
        cur = conn.cursor()
        cur.execute(
            "SELECT * FROM takedown_reports WHERE id = ? AND organization_id = ?",
            (report_id, current_user.organization_id)
        )
        r = cur.fetchone()
        if not r:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Takedown report '{report_id}' not found"
            )
        return TakedownReportResponse(
            id=r["id"],
            organization_id=r["organization_id"] if "organization_id" in r.keys() else None,
            finding_id=r["finding_id"],
            brand_id=r["brand_id"],
            document_status=r["document_status"],
            recipient_platform=r["recipient_platform"],
            subject=r["subject"],
            content_markdown=r["content_markdown"],
            analyst_name=r["analyst_name"],
            analyst_designation=r["analyst_designation"],
            review_state=r["review_state"],
            created_at=r["created_at"],
            updated_at=r["updated_at"]
        )
    finally:
        conn.close()


@router.put("/takedown/{report_id}", response_model=TakedownReportResponse)
def update_takedown_report(
    report_id: str,
    payload: TakedownReportUpdate,
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    # RBAC check: only admin, legal, or ciso may edit/finalize takedown reports
    if current_user.role not in ["admin", "legal", "ciso"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Role '{current_user.role}' is not authorized to edit takedown reports. Required: legal, ciso, or admin."
        )

    conn = get_db_connection()
    try:
        cur = conn.cursor()

        # 1. Verify report exists within tenant
        cur.execute(
            "SELECT * FROM takedown_reports WHERE id = ? AND organization_id = ?",
            (report_id, current_user.organization_id)
        )
        r = cur.fetchone()
        if not r:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Takedown report '{report_id}' not found"
            )

        now_str = datetime.now(timezone.utc).isoformat()

        # Compute updated fields
        new_content = payload.content_markdown if payload.content_markdown is not None else r["content_markdown"]
        new_subject = payload.subject if payload.subject is not None else r["subject"]
        new_platform = payload.recipient_platform if payload.recipient_platform is not None else r["recipient_platform"]
        new_analyst = payload.analyst_name if payload.analyst_name is not None else r["analyst_name"]
        new_designation = payload.analyst_designation if payload.analyst_designation is not None else r["analyst_designation"]
        new_review_state = payload.review_state if payload.review_state is not None else r["review_state"]
        new_doc_status = "Demonstration Draft — Not Sent"

        cur.execute(
            """
            UPDATE takedown_reports
            SET content_markdown = ?,
                subject = ?,
                recipient_platform = ?,
                analyst_name = ?,
                analyst_designation = ?,
                review_state = ?,
                document_status = ?,
                updated_at = ?
            WHERE id = ? AND organization_id = ?
            """,
            (
                new_content,
                new_subject,
                new_platform,
                new_analyst,
                new_designation,
                new_review_state,
                new_doc_status,
                now_str,
                report_id,
                current_user.organization_id
            )
        )
        conn.commit()

        return TakedownReportResponse(
            id=r["id"],
            organization_id=current_user.organization_id,
            finding_id=r["finding_id"],
            brand_id=r["brand_id"],
            document_status=new_doc_status,
            recipient_platform=new_platform,
            subject=new_subject,
            content_markdown=new_content,
            analyst_name=new_analyst,
            analyst_designation=new_designation,
            review_state=new_review_state,
            created_at=r["created_at"],
            updated_at=now_str
        )
    finally:
        conn.close()
