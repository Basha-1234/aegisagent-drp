import json
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query, status
from backend.app.database import get_db_connection
from backend.app.schemas import FindingResponse, FindingReviewUpdate

router = APIRouter(prefix="/api/findings", tags=["Findings"])


def _row_to_finding_dict(row) -> dict:
    return {
        "id": row["id"],
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
        "breakdown": json.loads(row["breakdown"] or "{}"),
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
    include_excluded: bool = Query(False, description="Whether to include officially whitelisted assets")
):
    conn = get_db_connection()
    try:
        cur = conn.cursor()
        query = "SELECT * FROM findings WHERE 1=1"
        params = []

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


@router.get("/{finding_id}", response_model=FindingResponse)
def get_finding(finding_id: str):
    conn = get_db_connection()
    try:
        cur = conn.cursor()
        cur.execute("SELECT * FROM findings WHERE id = ?", (finding_id,))
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
def update_finding_status(finding_id: str, payload: FindingReviewUpdate):
    conn = get_db_connection()
    try:
        cur = conn.cursor()
        cur.execute("SELECT * FROM findings WHERE id = ?", (finding_id,))
        row = cur.fetchone()
        if not row:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Finding '{finding_id}' not found"
            )

        now_str = datetime.now(timezone.utc).isoformat()
        cur.execute(
            """
            UPDATE findings
            SET review_status = ?, updated_at = ?
            WHERE id = ?
            """,
            (payload.review_status, now_str, finding_id)
        )
        conn.commit()

        cur.execute("SELECT * FROM findings WHERE id = ?", (finding_id,))
        updated_row = cur.fetchone()
        return _row_to_finding_dict(updated_row)
    finally:
        conn.close()
