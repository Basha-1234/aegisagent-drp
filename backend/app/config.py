import os
import secrets
import logging
from pathlib import Path
from typing import List

# Base directories
BASE_DIR = Path(__file__).resolve().parent.parent.parent

# Database configuration
DEFAULT_DB_PATH = str(BASE_DIR / "data" / "aegis_drp.db")
DB_PATH = os.getenv("AEGIS_DB_PATH", DEFAULT_DB_PATH)

# Ensure parent directory for database exists
db_file = Path(DB_PATH)
db_file.parent.mkdir(parents=True, exist_ok=True)

# CORS configuration
CORS_ORIGINS_RAW = os.getenv(
    "CORS_ORIGINS",
    "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,http://localhost:4173"
)
CORS_ORIGINS: List[str] = [origin.strip() for origin in CORS_ORIGINS_RAW.split(",") if origin.strip()]

APP_NAME = "AegisAgent DRP API"
APP_VERSION = "1.0.0"

# Environment detection
AEGIS_ENV = os.getenv("AEGIS_ENV", os.getenv("ENVIRONMENT", "development")).lower()
IS_PRODUCTION = AEGIS_ENV in ("production", "prod")

# Production JWT Security Specification:
# In production, AEGIS_JWT_SECRET must be set to a cryptographically secure random value
# (minimum 32 bytes / 256 bits of entropy, e.g. generated via `secrets.token_hex(32)` or `openssl rand -hex 32`).
# Production secrets must be stored securely in deployment configuration / secrets management,
# never hardcoded or committed to version control, and never exposed in logs or exception messages.

DISALLOWED_SUBSTRINGS = {
    "insecure",
    "changeme",
    "change-me",
    "change_me",
    "placeholder",
    "replace-in-production",
    "replace_in_production",
    "replace-this",
    "to-be-replaced",
    "example",
    "sample",
    "default",
}

DISALLOWED_EXACT_SECRETS = {
    "secret",
    "password",
    "admin",
    "root",
    "12345678",
    "qwerty",
    "dev-insecure-secret-key-for-local-testing-only-replace-in-production-min32chars",
}

SEQUENTIAL_PATTERNS = [
    "0123456789",
    "1234567890",
    "9876543210",
    "abcdefghijklmnopqrstuvwxyz",
    "qwertyuiop",
    "asdfghjkl",
]


def resolve_jwt_secret() -> str:
    raw_secret = os.getenv("AEGIS_JWT_SECRET")
    if raw_secret:
        clean = raw_secret.strip()
        secret_bytes = clean.encode("utf-8")
        if len(secret_bytes) < 32:
            raise RuntimeError(
                f"AEGIS_JWT_SECRET is insufficient: minimum 32 bytes required, got {len(secret_bytes)} bytes."
            )

        clean_lower = clean.lower()

        # 1. Reject known disallowed exact strings or insecure placeholder keywords
        if clean_lower in DISALLOWED_EXACT_SECRETS:
            raise RuntimeError("AEGIS_JWT_SECRET contains a disallowed or known insecure placeholder.")
        for sub in DISALLOWED_SUBSTRINGS:
            if sub in clean_lower:
                raise RuntimeError("AEGIS_JWT_SECRET contains a disallowed or known insecure placeholder.")

        # 2. Reject repeated-character secrets (e.g. 'a' * 32)
        unique_chars = len(set(clean))
        if unique_chars < 8:
            raise RuntimeError(
                "AEGIS_JWT_SECRET is rejected: lacks sufficient character diversity or consists of repeated characters."
            )
        max_char_count = max(clean.count(c) for c in set(clean))
        if max_char_count > len(clean) * 0.35:
            raise RuntimeError(
                "AEGIS_JWT_SECRET is rejected: excessive single-character repetition detected."
            )

        # 3. Reject repeating chunk patterns (e.g. '1234' * 8, 'secret12' * 4)
        for chunk_len in range(1, 17):
            if chunk_len < len(clean):
                chunk = clean[:chunk_len]
                reconstructed = (chunk * ((len(clean) // chunk_len) + 1))[:len(clean)]
                if clean == reconstructed:
                    raise RuntimeError(
                        "AEGIS_JWT_SECRET is rejected: contains a repetitive or patterned sequence."
                    )

        # 4. Reject obvious sequential or keyboard patterns
        for pat in SEQUENTIAL_PATTERNS:
            if pat in clean_lower:
                raise RuntimeError(
                    "AEGIS_JWT_SECRET is rejected: contains an obvious sequential or keyboard pattern."
                )

        return clean

    env = os.getenv("AEGIS_ENV", os.getenv("ENVIRONMENT", "development")).lower()
    is_prod = env in ("production", "prod")

    if is_prod:
        raise RuntimeError(
            "FATAL: AEGIS_JWT_SECRET environment variable is missing in production environment. "
            "Server startup aborted for security."
        )

    # Local development / non-production ephemeral fallback:
    # Ephemeral 256-bit cryptographically secure secret prevents any hardcoded static secrets.
    logger = logging.getLogger("aegis.security")
    logger.warning(
        "[SECURITY NOTICE] AEGIS_JWT_SECRET not set. Generated ephemeral runtime secret for local development. "
        "Tokens will become invalid when the server restarts. Set AEGIS_JWT_SECRET for persistent sessions."
    )
    return secrets.token_hex(32)


JWT_SECRET = resolve_jwt_secret()
JWT_EXPIRE_MINUTES = int(os.getenv("AEGIS_JWT_EXPIRE_MINUTES", "480"))  # 8 hours

# Secure Bootstrap Configuration
BOOTSTRAP_ADMIN_EMAIL = os.getenv("AEGIS_BOOTSTRAP_ADMIN_EMAIL")
BOOTSTRAP_ADMIN_PASSWORD = os.getenv("AEGIS_BOOTSTRAP_ADMIN_PASSWORD")
BOOTSTRAP_ADMIN_NAME = os.getenv("AEGIS_BOOTSTRAP_ADMIN_NAME", "System Administrator")
