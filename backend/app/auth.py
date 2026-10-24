import base64
import hashlib
import hmac
import json
import os
import secrets
import time
from typing import List, Optional, Dict, Any

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import sqlite3

from backend.app.config import JWT_SECRET, JWT_EXPIRE_MINUTES
from backend.app.database import get_db_connection

# HTTP Bearer scheme for Authorization header
security_bearer = HTTPBearer(auto_error=False)

# Minimum required roles
ROLE_ANALYST = "analyst"
ROLE_LEGAL = "legal"
ROLE_CISO = "ciso"
ROLE_ADMIN = "admin"

ALL_ROLES = [ROLE_ANALYST, ROLE_LEGAL, ROLE_CISO, ROLE_ADMIN]


# =========================================================================
# 1. Cryptographic Password Hashing (PBKDF2-HMAC-SHA256, 600,000 iterations)
# =========================================================================
def hash_password(password: str) -> str:
    salt = secrets.token_bytes(16).hex()
    iterations = 600000
    derived = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), iterations)
    return f"pbkdf2_sha256${iterations}${salt}${derived.hex()}"


def verify_password(password: str, hashed: str) -> bool:
    try:
        parts = hashed.split("$")
        if len(parts) != 4 or parts[0] != "pbkdf2_sha256":
            return False
        iterations = int(parts[1])
        salt = parts[2]
        target_hex = parts[3]
        derived = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), iterations)
        return hmac.compare_digest(derived.hex(), target_hex)
    except Exception:
        return False


# =========================================================================
# 2. JWT Access Tokens (RFC 7519 HMAC-SHA256)
# =========================================================================
def _base64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode("ascii")


def _base64url_decode(s: str) -> bytes:
    padding = 4 - (len(s) % 4)
    if padding != 4:
        s += "=" * padding
    return base64.urlsafe_b64decode(s.encode("ascii"))


def create_access_token(
    user_id: str,
    organization_id: str,
    email: str,
    role: str,
    expires_in_seconds: Optional[int] = None
) -> str:
    secret = JWT_SECRET
    if not secret:
        raise RuntimeError("AEGIS_JWT_SECRET environment variable is missing or empty.")

    header = {"alg": "HS256", "typ": "JWT"}
    now = int(time.time())
    ttl = expires_in_seconds if expires_in_seconds is not None else (JWT_EXPIRE_MINUTES * 60)
    
    payload = {
        "sub": user_id,
        "org_id": organization_id,
        "email": email,
        "role": role,
        "iat": now,
        "exp": now + ttl
    }

    header_enc = _base64url_encode(json.dumps(header, separators=(",", ":")).encode("utf-8"))
    payload_enc = _base64url_encode(json.dumps(payload, separators=(",", ":")).encode("utf-8"))
    signing_input = f"{header_enc}.{payload_enc}".encode("utf-8")

    signature = hmac.new(secret.encode("utf-8"), signing_input, hashlib.sha256).digest()
    sig_enc = _base64url_encode(signature)

    return f"{header_enc}.{payload_enc}.{sig_enc}"


def decode_access_token(token: str) -> Dict[str, Any]:
    secret = JWT_SECRET
    if not secret:
        raise RuntimeError("AEGIS_JWT_SECRET environment variable is missing or empty.")

    parts = token.split(".")
    if len(parts) != 3:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token format"
        )
    header_enc, payload_enc, sig_enc = parts

    try:
        signing_input = f"{header_enc}.{payload_enc}".encode("utf-8")
        expected_sig = hmac.new(secret.encode("utf-8"), signing_input, hashlib.sha256).digest()
        provided_sig = _base64url_decode(sig_enc)

        if not hmac.compare_digest(expected_sig, provided_sig):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token signature"
            )

        payload_bytes = _base64url_decode(payload_enc)
        payload = json.loads(payload_bytes.decode("utf-8"))

        now = int(time.time())
        if "exp" in payload and payload["exp"] < now:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Authentication token has expired"
            )

        return payload
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate authentication credentials"
        )


# =========================================================================
# 3. User Identity & Authentication Dependency
# =========================================================================
class AuthenticatedUser:
    def __init__(self, id: str, organization_id: str, email: str, full_name: str, role: str, is_active: bool):
        self.id = id
        self.organization_id = organization_id
        self.email = email
        self.full_name = full_name
        self.role = role
        self.is_active = is_active


async def get_current_user(
    auth: Optional[HTTPAuthorizationCredentials] = Depends(security_bearer)
) -> AuthenticatedUser:
    if not auth or not auth.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Please provide a valid Bearer token.",
            headers={"WWW-Authenticate": "Bearer"}
        )

    payload = decode_access_token(auth.credentials)
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Malformed token payload"
        )

    conn = get_db_connection()
    try:
        cur = conn.cursor()
        cur.execute("SELECT * FROM users WHERE id = ?", (user_id,))
        row = cur.fetchone()
        if not row:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User account no longer exists"
            )

        if not row["is_active"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User account has been disabled"
            )

        return AuthenticatedUser(
            id=row["id"],
            organization_id=row["organization_id"],
            email=row["email"],
            full_name=row["full_name"],
            role=row["role"],
            is_active=bool(row["is_active"])
        )
    finally:
        conn.close()


def require_role(allowed_roles: List[str]):
    def role_checker(current_user: AuthenticatedUser = Depends(get_current_user)) -> AuthenticatedUser:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Operation requires one of the following roles: {', '.join(allowed_roles)}"
            )
        return current_user
    return role_checker
