from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Depends, status
import sqlite3

from backend.app.config import JWT_EXPIRE_MINUTES
from backend.app.database import get_db_connection
from backend.app.auth import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user,
    AuthenticatedUser,
)
from backend.app.schemas import (
    LoginRequest,
    LoginResponse,
    UserResponse,
    OrganizationResponse,
)

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/login", response_model=LoginResponse)
def login(credentials: LoginRequest):
    normalized_email = credentials.email.strip().lower()
    conn = get_db_connection()
    try:
        cur = conn.cursor()
        cur.execute(
            """
            SELECT u.id, u.organization_id, u.email, u.password_hash, u.full_name,
                   u.role, u.is_active, u.created_at, u.updated_at,
                   o.name as org_name, o.created_at as org_created_at, o.updated_at as org_updated_at
            FROM users u
            JOIN organizations o ON u.organization_id = o.id
            WHERE LOWER(u.email) = ?
            """,
            (normalized_email,)
        )
        row = cur.fetchone()

        # Generic error message to prevent account enumeration
        if not row or not verify_password(credentials.password, row["password_hash"]):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )

        if not row["is_active"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User account has been disabled. Please contact your organization administrator."
            )

        token = create_access_token(
            user_id=row["id"],
            organization_id=row["organization_id"],
            email=row["email"],
            role=row["role"]
        )

        org_resp = OrganizationResponse(
            id=row["organization_id"],
            name=row["org_name"],
            created_at=row["org_created_at"],
            updated_at=row["org_updated_at"]
        )

        user_resp = UserResponse(
            id=row["id"],
            organization_id=row["organization_id"],
            email=row["email"],
            full_name=row["full_name"],
            role=row["role"],
            is_active=bool(row["is_active"]),
            created_at=row["created_at"],
            updated_at=row["updated_at"],
            organization=org_resp
        )

        return LoginResponse(
            access_token=token,
            token_type="bearer",
            expires_in_minutes=JWT_EXPIRE_MINUTES,
            user=user_resp
        )
    finally:
        conn.close()


@router.get("/me", response_model=UserResponse)
def get_me(current_user: AuthenticatedUser = Depends(get_current_user)):
    conn = get_db_connection()
    try:
        cur = conn.cursor()
        cur.execute(
            """
            SELECT u.id, u.organization_id, u.email, u.full_name,
                   u.role, u.is_active, u.created_at, u.updated_at,
                   o.name as org_name, o.created_at as org_created_at, o.updated_at as org_updated_at
            FROM users u
            JOIN organizations o ON u.organization_id = o.id
            WHERE u.id = ?
            """,
            (current_user.id,)
        )
        row = cur.fetchone()
        if not row:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        org_resp = OrganizationResponse(
            id=row["organization_id"],
            name=row["org_name"],
            created_at=row["org_created_at"],
            updated_at=row["org_updated_at"]
        )

        return UserResponse(
            id=row["id"],
            organization_id=row["organization_id"],
            email=row["email"],
            full_name=row["full_name"],
            role=row["role"],
            is_active=bool(row["is_active"]),
            created_at=row["created_at"],
            updated_at=row["updated_at"],
            organization=org_resp
        )
    finally:
        conn.close()
