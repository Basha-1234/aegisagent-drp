import json
from datetime import datetime, timezone
from typing import List
from fastapi import APIRouter, HTTPException, Depends, status
import sqlite3

from backend.app.database import get_db_connection
from backend.app.auth import get_current_user, AuthenticatedUser
from backend.app.schemas import BrandCreate, BrandResponse

router = APIRouter(prefix="/api/brands", tags=["Brands"])


def _row_to_brand_dict(row: sqlite3.Row) -> dict:
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


@router.get("", response_model=List[BrandResponse])
def list_brands(current_user: AuthenticatedUser = Depends(get_current_user)):
    conn = get_db_connection()
    try:
        cur = conn.cursor()
        cur.execute(
            "SELECT * FROM brands WHERE organization_id = ? ORDER BY name ASC",
            (current_user.organization_id,)
        )
        rows = cur.fetchall()
        return [_row_to_brand_dict(r) for r in rows]
    finally:
        conn.close()


@router.post("", response_model=BrandResponse, status_code=status.HTTP_201_CREATED)
def create_brand(
    payload: BrandCreate,
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    conn = get_db_connection()
    try:
        cur = conn.cursor()
        cur.execute("SELECT id FROM brands WHERE id = ?", (payload.id,))
        if cur.fetchone():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Brand with ID '{payload.id}' already exists"
            )

        now_str = datetime.now(timezone.utc).isoformat()
        cur.execute(
            """
            INSERT INTO brands (
                id, organization_id, name, industry, official_handle, support_handle,
                official_domain, verified_handles, official_apps,
                logo_url, risk_threshold, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                payload.id,
                current_user.organization_id,
                payload.name,
                payload.industry,
                payload.official_handle,
                payload.support_handle,
                payload.official_domain,
                json.dumps(payload.verified_handles),
                json.dumps([app.model_dump() for app in payload.official_apps]),
                payload.logo_url,
                payload.risk_threshold,
                now_str
            )
        )
        conn.commit()

        cur.execute(
            "SELECT * FROM brands WHERE id = ? AND organization_id = ?",
            (payload.id, current_user.organization_id)
        )
        new_row = cur.fetchone()
        return _row_to_brand_dict(new_row)
    finally:
        conn.close()


@router.get("/{brand_id}", response_model=BrandResponse)
def get_brand(
    brand_id: str,
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    conn = get_db_connection()
    try:
        cur = conn.cursor()
        cur.execute(
            "SELECT * FROM brands WHERE id = ? AND organization_id = ?",
            (brand_id, current_user.organization_id)
        )
        row = cur.fetchone()
        if not row:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Brand '{brand_id}' not found"
            )
        return _row_to_brand_dict(row)
    finally:
        conn.close()
