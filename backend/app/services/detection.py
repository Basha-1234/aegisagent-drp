import re
from typing import Dict, Any, List, Optional

# =========================================================================
# 1. OFFICIAL ASSET EXCLUSION LAYER
# =========================================================================
def is_official_asset(suspect_identifier: Optional[str], brand: Dict[str, Any]) -> bool:
    """
    Mandatory Rubric: Ensures verified brand accounts, registered apps,
    and official domains are NEVER flagged as threats.
    """
    if not suspect_identifier or not brand:
        return False

    clean_suspect = suspect_identifier.lower().strip().lstrip("@")

    # 1. Primary official handle
    official_handle = (brand.get("official_handle") or "").lower().strip().lstrip("@")
    if clean_suspect == official_handle:
        return True

    # 2. Support handle
    support_handle = (brand.get("support_handle") or "").lower().strip().lstrip("@")
    if clean_suspect == support_handle:
        return True

    # 3. Verified handles list
    verified_handles = brand.get("verified_handles") or []
    for h in verified_handles:
        if h.lower().strip().lstrip("@") == clean_suspect:
            return True

    # 4. Official mobile app package IDs and app names
    official_apps = brand.get("official_apps") or []
    for app in official_apps:
        app_id = (app.get("appId") or app.get("app_id") or "").lower().strip()
        app_name = (app.get("appName") or app.get("app_name") or "").lower().strip()
        if clean_suspect == app_id or clean_suspect == app_name:
            return True

    # 5. Authoritative domains
    raw_domain = (brand.get("official_domain") or "").lower()
    clean_domain = re.sub(r"^(https?://)?(www\.)?", "", raw_domain).split("/")[0].strip()
    clean_suspect_domain = re.sub(r"^(https?://)?(www\.)?", "", clean_suspect).split("/")[0].strip()
    if clean_suspect_domain == clean_domain:
        return True

    return False


# =========================================================================
# 2. LOOK-ALIKE NAME & HOMOGLYPH VARIATION DETECTOR
# =========================================================================
CHAR_SWAP_MAP = {
    '0': 'o', 'o': '0',
    '1': 'l', 'l': '1', 'i': 'l', 'l': 'i',
    '5': 's', 's': '5',
    '3': 'e', 'e': '3',
    '@': 'a', 'a': '@',
    'v': 'u', 'vv': 'w',
    'ø': 'o', 'ı': 'i'
}

COMMON_ADDED_WORDS = [
    'official', 'support', 'help', 'helpdesk', 'care', 'service',
    'verify', 'verified', 'secure', 'team', 'desk', 'refund',
    'claim', 'portal', 'center', 'assist', 'emergency', 'bonus'
]


def detect_lookalike_variations(
    suspect_name_or_handle: Optional[str],
    official_name_or_handle: Optional[str]
) -> Dict[str, Any]:
    suspect = (suspect_name_or_handle or "").lower().lstrip("@").strip()
    official = (official_name_or_handle or "").lower().lstrip("@").strip()

    variations = {
        "has_character_swap": False,
        "swapped_characters": [],
        "has_added_words": False,
        "detected_added_words": [],
        "has_delimiter_changes": False,
        "delimiters_found": [],
        "is_lookalike": False,
        "confidence_score": 0,
        "explanation": []
    }

    if not suspect or not official:
        return variations

    # Check A: Delimiter / Spacing Changes
    delimiters = ['_', '.', '-', ' ']
    for d in delimiters:
        if d in suspect and d not in official:
            variations["has_delimiter_changes"] = True
            variations["delimiters_found"].append(d)

    stripped_suspect = re.sub(r"[_\.\-\s]", "", suspect)
    stripped_official = re.sub(r"[_\.\-\s]", "", official)

    # Check B: Character Swaps (homoglyphs)
    normalized_suspect = stripped_suspect
    swaps_found = []
    for i, ch in enumerate(stripped_suspect):
        if ch in CHAR_SWAP_MAP:
            canonical = CHAR_SWAP_MAP[ch]
            test_normalized = normalized_suspect[:i] + canonical + normalized_suspect[i+1:]
            if canonical in stripped_official or any(w in test_normalized and w not in stripped_suspect for w in COMMON_ADDED_WORDS):
                swaps_found.append(f"{ch} ➔ {canonical}")
                normalized_suspect = test_normalized

    if swaps_found:
        variations["has_character_swap"] = True
        variations["swapped_characters"] = sorted(list(set(swaps_found)))

    # Check C: Added Words Detection
    for word in COMMON_ADDED_WORDS:
        if word in suspect and word not in official:
            variations["has_added_words"] = True
            variations["detected_added_words"].append(word)

    # Confidence calculation
    score = 0
    if stripped_official in normalized_suspect or normalized_suspect in stripped_official:
        score += 40

    if variations["has_character_swap"]:
        score += 30
    if variations["has_added_words"]:
        score += 25
    if variations["has_delimiter_changes"]:
        score += 15

    # False-positive dampener: If core brand stem is not in normalized name
    if stripped_official not in normalized_suspect and score < 40:
        score = int(score * 0.3)

    variations["confidence_score"] = min(100, score)
    variations["is_lookalike"] = variations["confidence_score"] >= 50

    if variations["has_character_swap"]:
        variations["explanation"].append(
            f"Character swap detected: [{', '.join(variations['swapped_characters'])}]"
        )
    if variations["has_added_words"]:
        variations["explanation"].append(
            f"Added deceptive squatting words: [{', '.join(variations['detected_added_words'])}]"
        )
    if variations["has_delimiter_changes"]:
        variations["explanation"].append(
            f"Delimiter modification using '{', '.join(variations['delimiters_found'])}'"
        )

    return variations


# =========================================================================
# 3. LEVENSHTEIN DISTANCE & SIMILARITY
# =========================================================================
def levenshtein_distance(s1: str, s2: str) -> Dict[str, int]:
    a = (s1 or "").lower().strip()
    b = (s2 or "").lower().strip()
    m = len(a)
    n = len(b)

    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(m + 1):
        dp[i][0] = i
    for j in range(n + 1):
        dp[0][j] = j

    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if a[i - 1] == b[j - 1]:
                dp[i][j] = dp[i - 1][j - 1]
            else:
                dp[i][j] = 1 + min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])

    dist = dp[m][n]
    max_len = max(m, n) or 1
    similarity = max(0, round((1.0 - (dist / max_len)) * 100))
    return {"distance": dist, "similarity": similarity}


# =========================================================================
# 4. APP STORE THREAT AUDITOR
# =========================================================================
def analyze_app_store_threat(
    suspect_app_name: str,
    suspect_publisher: Optional[str],
    suspect_app_id: Optional[str],
    official_apps: List[Dict[str, Any]],
    official_brand_name: str
) -> Dict[str, Any]:
    flags = []
    risk_score = 0
    missing_evidence = []

    # Check 1: Publisher Discrepancy
    if not suspect_publisher:
        missing_evidence.append("Publisher metadata unavailable from store listing")
    else:
        is_authorized = any(
            (app.get("publisher") or "").lower().strip() == suspect_publisher.lower().strip()
            for app in official_apps
        )
        if not is_authorized:
            flags.append(f'Publisher mismatch: "{suspect_publisher}" is not an authorized enterprise developer')
            risk_score += 45

    # Check 2: App Name Similarity
    primary_official_name = official_apps[0].get("appName") if official_apps else official_brand_name
    name_sim = levenshtein_distance(suspect_app_name, primary_official_name)["similarity"]
    if name_sim >= 65:
        flags.append(f'{name_sim}% App name imitation targeting "{primary_official_name}"')
        risk_score += 35

    # Check 3: Package Name Squatting
    clean_brand = re.sub(r"\s+", "", official_brand_name.lower())
    official_pkg = official_apps[0].get("appId", "") if official_apps else f"com.{clean_brand}"
    if suspect_app_id:
        if clean_brand in suspect_app_id.lower() and suspect_app_id.lower() != official_pkg.lower():
            flags.append(f'Unauthorized Android package namespace: "{suspect_app_id}"')
            risk_score += 20
    else:
        missing_evidence.append("App package identifier unavailable")

    return {
        "score": min(100, risk_score),
        "flags": flags,
        "missing_evidence": missing_evidence,
        "is_suspicious_app": risk_score >= 45
    }


# =========================================================================
# 5. SCAM INTENT & KEYWORDS NLP
# =========================================================================
SCAM_KEYWORDS = [
    {"phrase": "instant refund", "weight": 40, "category": "Financial Scam"},
    {"phrase": "dm for refund", "weight": 40, "category": "Financial Scam"},
    {"phrase": "support desk", "weight": 20, "category": "Impersonation"},
    {"phrase": "official help", "weight": 20, "category": "Impersonation"},
    {"phrase": "urgent kyc", "weight": 35, "category": "Credential Harvesting"},
    {"phrase": "kyc verification", "weight": 30, "category": "Credential Harvesting"},
    {"phrase": "giveaway claim", "weight": 35, "category": "Fraudulent Promotion"},
    {"phrase": "crypto bonus", "weight": 35, "category": "Crypto Scam"},
    {"phrase": "verify account", "weight": 25, "category": "Credential Harvesting"},
    {"phrase": "customer care", "weight": 20, "category": "Impersonation"},
    {"phrase": "helpline 24x7", "weight": 20, "category": "Impersonation"},
    {"phrase": "send otp", "weight": 45, "category": "Credential Theft"},
    {"phrase": "claim reward", "weight": 30, "category": "Fraudulent Promotion"}
]


def analyze_scam_intent(bio_text: Optional[str] = "", post_captions: Optional[List[str]] = None) -> Dict[str, Any]:
    captions = post_captions or []
    full_text = f"{(bio_text or '')} {' '.join(captions)}".lower().strip()

    if not full_text:
        return {
            "score": 0,
            "matched_patterns": [],
            "has_severe_threat": False,
            "data_available": False
        }

    matched_patterns = []
    total_score = 0

    for item in SCAM_KEYWORDS:
        if item["phrase"] in full_text:
            matched_patterns.append(item)
            total_score += item["weight"]

    return {
        "score": min(100, total_score),
        "matched_patterns": matched_patterns,
        "has_severe_threat": total_score >= 50,
        "data_available": True
    }


# =========================================================================
# 6. DOMAIN RISK ANALYZER
# =========================================================================
def analyze_domain_risk(url: Optional[str] = "", official_domain: str = "") -> Dict[str, Any]:
    if not url:
        return {"score": 0, "flags": [], "data_available": False}

    suspicious_tlds = ['.xyz', '.top', '.tk', '.ml', '.ga', '.cf', '.gq', '.work', '.click', '.buzz']
    flags = []
    score = 0
    lower_url = url.lower()
    clean_official = re.sub(r"^(https?://)?(www\.)?", "", official_domain.lower())

    for tld in suspicious_tlds:
        if tld in lower_url:
            flags.append(f"Low-reputation scam TLD ({tld})")
            score += 40
            break

    if "-" in lower_url or "_" in lower_url:
        flags.append("Deceptive hyphenated/delimited domain structure")
        score += 20

    clean_brand = clean_official.split(".")[0] if clean_official else ""
    if clean_brand and clean_brand in lower_url and clean_official not in lower_url:
        flags.append("Brand name typosquatting on unverified foreign domain")
        score += 40

    return {
        "score": min(100, score),
        "flags": flags,
        "data_available": True
    }


# =========================================================================
# 7. COMPOSITE EXPLAINABLE RISK ENGINE
# =========================================================================
def calculate_explainable_risk(
    suspect_handle: str,
    official_handle: str,
    suspect_bio: Optional[str] = "",
    post_captions: Optional[List[str]] = None,
    suspect_url: Optional[str] = "",
    official_domain: str = "",
    logo_match_percent: int = 0,
    channel: str = "Social Profile",
    suspect_publisher: Optional[str] = None,
    official_apps: Optional[List[Dict[str, Any]]] = None,
    brand: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Evaluates risk with strict safety constraints:
    1. Mandatory check: official brand assets are immediately excluded (0 score).
    2. Name similarity alone NEVER marks a candidate as malicious.
    3. Missing evidence is noted as unavailable rather than penalized.
    """
    # 1. Mandatory Official Asset Exclusion
    if brand and is_official_asset(suspect_handle, brand):
        return {
            "composite_score": 0,
            "severity": "OFFICIAL_WHITELISTED",
            "is_official_excluded": True,
            "breakdown": {"handle_score": 0, "logo_score": 0, "scam_score": 0, "domain_score": 0, "app_score": 0},
            "reasons": ["Verified Official Brand Asset (Whitelisted by policy)"],
            "lookalike": None
        }

    # 2. Look-alike and String Distance
    lookalike = detect_lookalike_variations(suspect_handle, official_handle)
    handle_sim = levenshtein_distance(suspect_handle, official_handle)["similarity"]

    # 3. Signals
    scam_result = analyze_scam_intent(suspect_bio, post_captions)
    scam_score = scam_result["score"]
    domain_result = analyze_domain_risk(suspect_url, official_domain)
    domain_score = domain_result["score"]

    app_score = 0
    app_flags = []
    if channel == "Rogue Mobile App":
        app_audit = analyze_app_store_threat(
            suspect_app_name=suspect_handle,
            suspect_publisher=suspect_publisher,
            suspect_app_id=suspect_url,
            official_apps=official_apps or [],
            official_brand_name=brand.get("name", "Brand") if brand else "Brand"
        )
        app_score = app_audit["score"]
        app_flags = app_audit["flags"]

    effective_handle_score = min(100, handle_sim + (20 if lookalike["is_lookalike"] else 0))

    # Composite Calculation
    if channel == "Rogue Mobile App":
        composite = round(
            app_score * 0.35 +
            logo_match_percent * 0.30 +
            effective_handle_score * 0.20 +
            scam_score * 0.15
        )
    else:
        composite = round(
            effective_handle_score * 0.30 +
            logo_match_percent * 0.30 +
            scam_score * 0.25 +
            domain_score * 0.15
        )

    # RULE: Name similarity alone NEVER classifies a candidate as malicious.
    other_evidence_present = (
        logo_match_percent >= 70 or
        scam_score >= 30 or
        domain_score >= 40 or
        app_score >= 40 or
        lookalike["has_character_swap"]
    )
    if not other_evidence_present:
        # Cap score to low/informational tier
        composite = min(composite, 28)

    severity = "LOW"
    if composite >= 75:
        severity = "CRITICAL"
    elif composite >= 50:
        severity = "HIGH"
    elif composite >= 30:
        severity = "MEDIUM"

    reasons = []
    if lookalike["explanation"]:
        reasons.extend(lookalike["explanation"])
    elif handle_sim >= 65:
        reasons.append(f"{handle_sim}% username similarity to official handle")

    if logo_match_percent >= 75:
        reasons.append(f"{logo_match_percent}% visual logo imitation match")
    if scam_result["matched_patterns"]:
        reasons.append(
            f"Detected scam phrases: {', '.join(f'\"{p['phrase']}\"' for p in scam_result['matched_patterns'])}"
        )
    if app_flags:
        reasons.extend(app_flags)
    if domain_result["flags"]:
        reasons.extend(domain_result["flags"])

    if not reasons:
        reasons.append("Routine scan: No high-risk indicators detected on candidate")

    return {
        "composite_score": composite,
        "severity": severity,
        "is_official_excluded": False,
        "breakdown": {
            "handle_score": effective_handle_score,
            "logo_score": logo_match_percent,
            "scam_score": scam_score,
            "domain_score": domain_score,
            "app_score": app_score
        },
        "lookalike": lookalike,
        "reasons": reasons
    }
