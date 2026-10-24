from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


# -------------------------------------------------------------
# Organization & User Schemas (Stage 1 Multi-Tenancy & Auth)
# -------------------------------------------------------------
class OrganizationResponse(BaseModel):
    id: str
    name: str
    created_at: str
    updated_at: str


class UserResponse(BaseModel):
    id: str
    organization_id: str
    email: str
    full_name: str
    role: str
    is_active: bool
    created_at: str
    updated_at: str
    organization: Optional[OrganizationResponse] = None


class LoginRequest(BaseModel):
    email: str = Field(..., min_length=3, max_length=255)
    password: str = Field(..., min_length=1)


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in_minutes: int
    user: UserResponse


class InvestigationLogResponse(BaseModel):
    id: str
    organization_id: str
    finding_id: str
    user_id: Optional[str] = None
    actor_email: str
    actor_role: str
    action: str
    previous_state: Optional[Dict[str, Any]] = None
    new_state: Optional[Dict[str, Any]] = None
    rationale: Optional[str] = None
    created_at: str


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
    organization_id: Optional[str] = None
    created_at: str


# -------------------------------------------------------------
# Risk Explanation Schemas
# -------------------------------------------------------------
class RiskSignalExplanation(BaseModel):
    id: str
    name: str
    weight_percent: int
    raw_score: int
    weighted_points: float
    points_contributed: Optional[float] = None
    evidence: str
    severity: str
    direction: str = "increases_risk"
    explanation: str


class RiskExplanation(BaseModel):
    final_score: int
    severity: str
    is_official_excluded: bool = False
    is_capped: bool = False
    cap_reason: Optional[str] = None
    signals: List[RiskSignalExplanation] = Field(default_factory=list)
    recommended_action: str
    summary: str


# -------------------------------------------------------------
# Finding Schemas
# -------------------------------------------------------------
class FindingReviewUpdate(BaseModel):
    review_status: str = Field(
        ...,
        pattern=r"^(NEW|INVESTIGATING|CONFIRMED_THREAT|TAKEDOWN_SENT|TAKEDOWN_REQUESTED|FALSE_POSITIVE|BENIGN_DISMISSED|RESOLVED)$"
    )
    rationale: Optional[str] = None
    notes: Optional[str] = None


class FindingResponse(BaseModel):
    id: str
    organization_id: Optional[str] = None
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
    explanation: Optional[RiskExplanation] = None
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
    organization_id: Optional[str] = None
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
# Takedown Report Draft Schemas
# -------------------------------------------------------------
class TakedownReportCreate(BaseModel):
    finding_id: str = Field(..., min_length=1, max_length=100)
    brand_id: Optional[str] = Field(None, max_length=100)
    recipient_platform: Optional[str] = Field(None, max_length=100)
    subject: Optional[str] = Field(None, max_length=255)
    content_markdown: Optional[str] = Field(None, min_length=10)
    analyst_name: Optional[str] = Field(None, max_length=120)
    analyst_designation: Optional[str] = Field(None, max_length=120)
    document_status: str = Field(
        default="Demonstration Draft — Not Sent",
        pattern=r"^Demonstration Draft — Not Sent$"
    )
    review_state: str = Field(
        default="DRAFT",
        pattern=r"^(DRAFT|UNDER_REVIEW|REVIEWED|SUPERSEDED)$"
    )


class TakedownReportUpdate(BaseModel):
    content_markdown: Optional[str] = Field(None, min_length=10)
    subject: Optional[str] = Field(None, min_length=1, max_length=255)
    recipient_platform: Optional[str] = Field(None, min_length=1, max_length=100)
    analyst_name: Optional[str] = Field(None, max_length=120)
    analyst_designation: Optional[str] = Field(None, max_length=120)
    review_state: Optional[str] = Field(
        None,
        pattern=r"^(DRAFT|UNDER_REVIEW|REVIEWED|SUPERSEDED)$"
    )
    document_status: Optional[str] = Field(
        None,
        pattern=r"^Demonstration Draft — Not Sent$"
    )


class TakedownReportResponse(BaseModel):
    id: str
    organization_id: Optional[str] = None
    finding_id: str
    brand_id: str
    document_status: str = "Demonstration Draft — Not Sent"
    recipient_platform: str
    subject: str
    content_markdown: str
    analyst_name: Optional[str] = None
    analyst_designation: Optional[str] = None
    review_state: str = "DRAFT"
    created_at: str
    updated_at: str


# -------------------------------------------------------------
# Safe URL Fetching & SSRF Protection Schemas (Stage 2A)
# -------------------------------------------------------------
class SafeFetchHopSchema(BaseModel):
    hop_number: int
    url: str
    status_code: int
    resolved_ip: str


class SafeFetchResultSchema(BaseModel):
    submitted_url: str
    is_valid: bool
    final_url: Optional[str] = None
    status_code: Optional[int] = None
    content_type: Optional[str] = None
    content_length_bytes: int = 0
    body_sample: Optional[str] = None
    redirect_chain: List[SafeFetchHopSchema] = Field(default_factory=list)
    failure_category: Optional[str] = None
    error_detail: Optional[str] = None
    is_verified_safe_content: bool = False


# -------------------------------------------------------------
# Deterministic URL Comparison Schemas
# -------------------------------------------------------------
class URLComparisonRequest(BaseModel):
    suspicious_url: str = Field(..., min_length=1, description="Suspicious URL to analyze")
    official_url: Optional[str] = Field(None, description="Explicit verified official domain or URL")
    brand_id: Optional[str] = Field(None, description="Brand ID to look up verified official domain from registry")
    brand_name: Optional[str] = Field(None, description="Brand name for reporting context")


class ComparisonSignalSchema(BaseModel):
    id: str
    name: str
    severity: str
    explanation: str


class RegistrableDomainComparisonSchema(BaseModel):
    official_registrable_domain: Optional[str] = None
    suspicious_registrable_domain: Optional[str] = None
    is_same_registrable_domain: bool = False
    official_subdomain: Optional[str] = None
    suspicious_subdomain: Optional[str] = None
    official_suffix: Optional[str] = None
    suspicious_suffix: Optional[str] = None


class URLComparisonResponse(BaseModel):
    status: str = Field(..., description="'MATCH', 'SUSPICIOUS', or 'INCONCLUSIVE'")
    normalized_official_url: Optional[str] = None
    normalized_suspicious_url: Optional[str] = None
    official_hostname: Optional[str] = None
    suspicious_hostname: Optional[str] = None
    registrable_domain_comparison: RegistrableDomainComparisonSchema
    signals: List[ComparisonSignalSchema] = Field(default_factory=list)
    heuristic_similarity_ratio: int = 0
    missing_evidence: List[str] = Field(default_factory=list)
    limitations: List[str] = Field(default_factory=list)
    summary: str


# -------------------------------------------------------------
# Health Check Schema
# -------------------------------------------------------------
class HealthResponse(BaseModel):
    status: str = "ok"
    app: str
    version: str
    database: str
