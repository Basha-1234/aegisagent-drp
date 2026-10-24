import json
import uuid
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query, Depends, status
import sqlite3

from backend.app.database import get_db_connection
from backend.app.auth import get_current_user, AuthenticatedUser
from backend.app.schemas import (
    FindingResponse,
    FindingReviewUpdate,
    InvestigationLogResponse,
    URLComparisonRequest,
    URLComparisonResponse,
)
from backend.app.services.url_comparison import compare_urls

router = APIRouter(prefix="/api/findings", tags=["Findings"])


def _row_to_finding_dict(row: sqlite3.Row) -> dict:
    breakdown_data = json.loads(row["breakdown"] or "{}")
    explanation_data = breakdown_data.get("explanation")
    if not explanation_data and "signals" in breakdown_data:
        explanation_data = {
            "final_score": row["composite_score"],
            "severity": row["severity"],
            "is_official_excluded": bool(row["is_official_excluded"]),
            "is_capped": breakdown_data.get("is_capped", False),
            "cap_reason": breakdown_data.get("cap_reason"),
            "signals": breakdown_data.get("signals", []),
            "recommended_action": breakdown_data.get("recommended_action", "Review finding evidence and evaluate operational impact."),
            "summary": breakdown_data.get("summary", "Risk assessment calculated from multi-signal detection engine.")
        }

    return {
        "id": row["id"],
        "organization_id": row["organization_id"] if "organization_id" in row.keys() else None,
        "brand_id": row["brand_id"],
        "run_id": row["run_id"],
        "platform": row["platform"],
        "channel": row["channel"],
        "suspect_name": row["suspect_name"],
        "suspect_handle": row["suspect_handle"],
        "suspect_publisher": row["suspect_publisher"],
        "suspect_url": row["suspect_url"],
        "suspect_bio": row["suspect_bio"],
        "post_captions": json.loads(row["post_captions"] or "[]"),
        "followers_count": row["followers_count"],
        "account_age_days": row["account_age_days"],
        "logo_match_percent": row["logo_match_percent"],
        "composite_score": row["composite_score"],
        "severity": row["severity"],
        "review_status": row["review_status"],
        "is_official_excluded": bool(row["is_official_excluded"]),
        "reasons": json.loads(row["reasons"] or "[]"),
        "breakdown": breakdown_data,
        "explanation": explanation_data,
        "provenance": row["provenance"],
        "created_at": row["created_at"],
        "updated_at": row["updated_at"]
    }


@router.get("", response_model=List[FindingResponse])
def list_findings(
    brand_id: Optional[str] = Query(None, description="Filter by brand ID"),
    channel: Optional[str] = Query(None, description="Filter by channel ('Social Profile', 'Rogue Mobile App', etc.)"),
    severity: Optional[str] = Query(None, description="Filter by severity ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW')"),
    review_status: Optional[str] = Query(None, description="Filter by review status"),
    include_excluded: bool = Query(False, description="Whether to include officially whitelisted assets"),
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    conn = get_db_connection()
    try:
        cur = conn.cursor()
        query = "SELECT * FROM findings WHERE organization_id = ?"
        params = [current_user.organization_id]

        if brand_id:
            query += " AND brand_id = ?"
            params.append(brand_id)
        if channel:
            query += " AND channel = ?"
            params.append(channel)
        if severity:
            query += " AND severity = ?"
            params.append(severity)
        if review_status:
            query += " AND review_status = ?"
            params.append(review_status)
        if not include_excluded:
            query += " AND is_official_excluded = 0"

        query += " ORDER BY composite_score DESC, created_at DESC"
        cur.execute(query, params)
        rows = cur.fetchall()
        return [_row_to_finding_dict(r) for r in rows]
    finally:
        conn.close()


@router.post("/compare-url", response_model=URLComparisonResponse)
def compare_url_endpoint(
    req: URLComparisonRequest,
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    """
    Compares a submitted suspicious URL against a verified official touchpoint or brand registry entry.
    Deterministic, offline, and Public Suffix List (PSL)-aware.
    """
    official_domain = req.official_url
    brand_name = req.brand_name

    # If brand_id is supplied and official_url not provided, resolve from tenant brand registry
    if req.brand_id and not official_domain:
        conn = get_db_connection()
        try:
            cur = conn.cursor()
            cur.execute(
                "SELECT * FROM brands WHERE id = ? AND (organization_id = ? OR organization_id IS NULL)",
                (req.brand_id, current_user.organization_id)
            )
            brand_row = cur.fetchone()
            if brand_row:
                official_domain = brand_row["official_domain"]
                if not brand_name:
                    brand_name = brand_row["name"]
        finally:
            conn.close()

    result = compare_urls(
        suspicious_url=req.suspicious_url,
        official_url_or_domain=official_domain,
        brand_name=brand_name
    )
    return result


@router.get("/{finding_id}", response_model=FindingResponse)
def get_finding(
    finding_id: str,
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    conn = get_db_connection()
    try:
        cur = conn.cursor()
        cur.execute(
            "SELECT * FROM findings WHERE id = ? AND organization_id = ?",
            (finding_id, current_user.organization_id)
        )
        row = cur.fetchone()
        if not row:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Finding '{finding_id}' not found"
            )
        return _row_to_finding_dict(row)
    finally:
        conn.close()


@router.patch("/{finding_id}", response_model=FindingResponse)
def update_finding_status(
    finding_id: str,
    payload: FindingReviewUpdate,
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    conn = get_db_connection()
    try:
        cur = conn.cursor()
        cur.execute(
            "SELECT * FROM findings WHERE id = ? AND organization_id = ?",
            (finding_id, current_user.organization_id)
        )
        row = cur.fetchone()
        if not row:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Finding '{finding_id}' not found"
            )

        previous_status = row["review_status"]
        now = datetime.now(timezone.utc).isoformat()

        # Update finding status
        cur.execute(
            """
            UPDATE findings
            SET review_status = ?, updated_at = ?
            WHERE id = ? AND organization_id = ?
            """,
            (payload.review_status, now, finding_id, current_user.organization_id)
        )

        # Audit trail: insert into investigation_logs in the same transaction
        log_id = f"LOG-{uuid.uuid4().hex[:12].upper()}"
        rationale = payload.rationale or payload.notes or f"Status transitioned from {previous_status} to {payload.review_status}"
        cur.execute(
            """
            INSERT INTO investigation_logs (
                id, organization_id, finding_id, user_id, actor_email, actor_role,
                action, previous_state, new_state, rationale, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                log_id,
                current_user.organization_id,
                finding_id,
                current_user.id,
                current_user.email,
                current_user.role,
                "STATUS_CHANGE",
                json.dumps({"review_status": previous_status}),
                json.dumps({"review_status": payload.review_status}),
                rationale,
                now
            )
        )

        conn.commit()

        cur.execute(
            "SELECT * FROM findings WHERE id = ? AND organization_id = ?",
            (finding_id, current_user.organization_id)
        )
        updated_row = cur.fetchone()
        return _row_to_finding_dict(updated_row)
    finally:
        conn.close()


@router.get("/{finding_id}/history", response_model=List[InvestigationLogResponse])
def get_finding_history(
    finding_id: str,
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    conn = get_db_connection()
    try:
        cur = conn.cursor()
        # Verify finding exists within user's organization
        cur.execute(
            "SELECT id FROM findings WHERE id = ? AND organization_id = ?",
            (finding_id, current_user.organization_id)
        )
        if not cur.fetchone():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Finding '{finding_id}' not found"
            )

        cur.execute(
            """
            SELECT * FROM investigation_logs
            WHERE finding_id = ? AND organization_id = ?
            ORDER BY created_at DESC
            """,
            (finding_id, current_user.organization_id)
        )
        rows = cur.fetchall()

        history = []
        for r in rows:
            history.append(
                InvestigationLogResponse(
                    id=r["id"],
                    organization_id=r["organization_id"],
                    finding_id=r["finding_id"],
                    user_id=r["user_id"],
                    actor_email=r["actor_email"],
                    actor_role=r["actor_role"],
                    action=r["action"],
                    previous_state=json.loads(r["previous_state"]) if r["previous_state"] else None,
                    new_state=json.loads(r["new_state"]) if r["new_state"] else None,
                    rationale=r["rationale"],
                    created_at=r["created_at"]
                )
            )
        return history
    finally:
        conn.close()
