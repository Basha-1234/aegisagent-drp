from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


# -------------------------------------------------------------
# Brand Schemas
# -------------------------------------------------------------
class OfficialAppSchema(BaseModel):
    appName: str
    appId: str
    publisher: str
    store: Optional[str] = "Google Play & Apple App Store"
    rating: Optional[float] = 4.8
    iconUrl: Optional[str] = None


class BrandBase(BaseModel):
    name: str
    industry: Optional[str] = "Financial Services"
    official_handle: str
    support_handle: Optional[str] = None
    official_domain: str
    verified_handles: List[str] = Field(default_factory=list)
    official_apps: List[OfficialAppSchema] = Field(default_factory=list)
    logo_url: Optional[str] = None
    risk_threshold: int = Field(default=50, ge=0, le=100)


class BrandCreate(BrandBase):
    id: str = Field(..., pattern=r"^[a-z0-9_-]+$")


class BrandResponse(BrandBase):
    id: str
    created_at: str


# -------------------------------------------------------------
# Finding Schemas
# -------------------------------------------------------------
class FindingReviewUpdate(BaseModel):
    review_status: str = Field(
        ...,
        pattern=r"^(NEW|INVESTIGATING|CONFIRMED_THREAT|TAKEDOWN_SENT|FALSE_POSITIVE|RESOLVED)$"
    )


class FindingResponse(BaseModel):
    id: str
    brand_id: str
    run_id: Optional[str] = None
    platform: str
    channel: str
    suspect_name: str
    suspect_handle: str
    suspect_publisher: Optional[str] = None
    suspect_url: Optional[str] = None
    suspect_bio: Optional[str] = None
    post_captions: List[str] = Field(default_factory=list)
    followers_count: int = 0
    account_age_days: int = 0
    logo_match_percent: int = 0
    composite_score: int = 0
    severity: str
    review_status: str
    is_official_excluded: bool = False
    reasons: List[str] = Field(default_factory=list)
    breakdown: Dict[str, Any] = Field(default_factory=dict)
    provenance: str = "demo_fixture"
    created_at: str
    updated_at: str


# -------------------------------------------------------------
# Monitoring Run Schemas
# -------------------------------------------------------------
class MonitoringRunRequest(BaseModel):
    brand_id: str
    use_demo_fixtures: bool = True


class MonitoringRunResponse(BaseModel):
    id: str
    brand_id: str
    channel: str
    status: str
    provenance: str
    is_live: bool
    candidates_scanned: int
    threats_detected: int
    summary_notes: Optional[str] = None
    findings: List[FindingResponse] = Field(default_factory=list)
    created_at: str


# -------------------------------------------------------------
# Report Schemas
# -------------------------------------------------------------
class ReportResponse(BaseModel):
    report_id: str
    finding_id: str
    brand_name: str
    official_domain: str
    official_handle: str
    suspect_entity: Dict[str, Any]
    forensic_evidence: Dict[str, Any]
    statutory_grounds: Dict[str, Any]
    chain_of_custody_hash: str
    generated_at: str
    disclaimer: str


# -------------------------------------------------------------
# Health Check Schema
# -------------------------------------------------------------
class HealthResponse(BaseModel):
    status: str = "ok"
    app: str
    version: str
    database: str
