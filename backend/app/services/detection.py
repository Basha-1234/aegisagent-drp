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
    official_brand_name: str,
    suspect_bio: Optional[str] = "",
    post_captions: Optional[List[str]] = None,
    permissions: Optional[List[str]] = None
) -> Dict[str, Any]:
    flags = []
    risk_score = 0
    missing_evidence = []
    detected_permissions = []

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

    # Check 4: High-Risk Android Permission Audit
    HIGH_RISK_PERMISSIONS = {
        "READ_SMS": {
            "weight": 30,
            "severity": "CRITICAL",
            "desc": "Intercepts incoming 2FA SMS tokens and banking OTPs"
        },
        "SYSTEM_ALERT_WINDOW": {
            "weight": 25,
            "severity": "CRITICAL",
            "desc": "Draws deceptive overlay injection screens over authentic banking apps"
        },
        "BIND_ACCESSIBILITY_SERVICE": {
            "weight": 30,
            "severity": "CRITICAL",
            "desc": "Abuses accessibility service to hijack user screen and keystrokes"
        },
        "REQUEST_INSTALL_PACKAGES": {
            "weight": 20,
            "severity": "HIGH",
            "desc": "Silently downloads and installs secondary rogue APK droppers"
        },
        "RECEIVE_BOOT_COMPLETED": {
            "weight": 15,
            "severity": "HIGH",
            "desc": "Auto-starts persistent background trojan listener upon device reboot"
        }
    }

    text_to_search = f"{suspect_bio or ''} {' '.join(post_captions or [])}".upper()
    all_perms = [p.upper() for p in (permissions or [])]
    for perm_key, perm_meta in HIGH_RISK_PERMISSIONS.items():
        if any(perm_key in p for p in all_perms) or perm_key in text_to_search:
            detected_permissions.append({
                "permission": perm_key,
                "severity": perm_meta["severity"],
                "description": perm_meta["desc"],
                "weight": perm_meta["weight"]
            })
            flags.append(f"Dangerous Android permission declared: {perm_key} ({perm_meta['desc']})")
            risk_score += perm_meta["weight"]

    return {
        "score": min(100, risk_score),
        "flags": flags,
        "missing_evidence": missing_evidence,
        "detected_permissions": detected_permissions,
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
# 7. EXPLANATION SYNTHESIS & RECOMMENDED ACTIONS
# =========================================================================
def derive_recommended_action(severity: str, channel: str, signals: List[Dict[str, Any]]) -> str:
    if severity == "OFFICIAL_WHITELISTED":
        return "No action required: Authenticated enterprise brand touchpoint whitelisted by zero-trust policy."

    if channel == "Rogue Mobile App":
        if severity in ["CRITICAL", "HIGH"]:
            return "Immediate Store Escalation: Dispatch Google Play / APK mirror abuse notice citing unauthorized developer identity and high-risk permission declarations. Blocklist package identifier in enterprise EDR."
        elif severity == "MEDIUM":
            return "App Store Monitoring: Request full APK package sample for automated dynamic sandbox analysis; verify developer signing certificate."
        else:
            return "Routine Registry Logging: Log package in observation ledger; flag for re-audit if store download counts surge."

    if channel in ["Phishing Website", "Phishing Domain"]:
        if severity in ["CRITICAL", "HIGH"]:
            return "Emergency Registrar Takedown: Issue statutory DMCA § 512 / Rule 3(2)(b) notice to hosting provider and domain registrar. Submit URL to Google Safe Browsing and Microsoft SmartScreen."
        else:
            return "DNS Surveillance: Monitor DNS A-records and SSL certificate transparency logs for active credential harvester deployment."

    # Social Profile
    if severity == "CRITICAL":
        return "Platform Abuse Dispatch: File expedited statutory impersonation complaint to platform abuse desk. Issue immediate customer safety alert regarding active credential/OTP interception."
    elif severity == "HIGH":
        return "Legal Enforcement Notice: Dispatch trademark infringement complaint citing brand imitation and deceptive profile bio. Monitor direct messaging activity."
    elif severity == "MEDIUM":
        return "Secondary SOC Review: Assign to frontline analyst for 24h activity surveillance. Check for fraudulent giveaway links or customer interaction."
    else:
        return "Passive Logging: Entity displays minimal threat indicators. Retain in low-priority observation pool without takedown escalation."


def synthesize_explanation_summary(
    suspect_handle: str,
    channel: str,
    composite: int,
    severity: str,
    is_capped: bool,
    signals: List[Dict[str, Any]]
) -> str:
    if severity == "OFFICIAL_WHITELISTED":
        return f"{suspect_handle} is an authenticated official touchpoint. Zero threat risk attributed."

    active_signals = [
        s for s in signals
        if s.get("weighted_points", 0) > 0 and s.get("severity") in ["CRITICAL", "HIGH", "MEDIUM"]
    ]
    if not active_signals:
        if is_capped:
            return f"{suspect_handle} exhibits surface name similarity but zero corroborating threat signals. Risk is strictly capped at {composite}/100 ({severity})."
        return f"Routine scan for {suspect_handle}: No actionable malicious threat indicators detected."

    top_signals_desc = ", ".join(s["name"] for s in active_signals[:2])
    cap_text = " (capped by anti-false-positive safety policy)" if is_capped else ""
    return f"Flagged as {severity} risk ({composite}/100){cap_text} driven primarily by {top_signals_desc}."


# =========================================================================
# 8. COMPOSITE EXPLAINABLE RISK ENGINE
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
    Evaluates risk with strict explainability & safety constraints:
    1. Mandatory check: official brand assets are immediately excluded (0 score).
    2. Exact mathematical attribution: each contributing signal provides actual weighted points.
    3. Name similarity alone NEVER marks a candidate as malicious (Anti-False-Positive Policy).
    4. Missing evidence is noted as unavailable rather than penalized.
    5. Actionable recommended next step tailored to highest contributing signal.
    """
    # 1. Mandatory Official Asset Exclusion
    if brand and is_official_asset(suspect_handle, brand):
        brand_name = brand.get("name", "the brand")
        rec_action = derive_recommended_action("OFFICIAL_WHITELISTED", channel, [])
        summary = synthesize_explanation_summary(suspect_handle, channel, 0, "OFFICIAL_WHITELISTED", False, [])

        empty_signals = [
            {
                "id": "asset_exclusion",
                "name": "Official Brand Whitelist",
                "weight_percent": 100,
                "raw_score": 0,
                "weighted_points": 0.0,
            "points_contributed": 0.0,
                "evidence": f"Matches verified enterprise assets registered for {brand_name}",
                "severity": "SAFE",
                "direction": "neutral",
                "explanation": "Verified official brand asset; protected by exclusion policy."
            }
        ]

        explanation_payload = {
            "final_score": 0,
            "severity": "OFFICIAL_WHITELISTED",
            "is_official_excluded": True,
            "is_capped": False,
            "cap_reason": None,
            "signals": empty_signals,
            "recommended_action": rec_action,
            "summary": summary
        }

        return {
            "composite_score": 0,
            "severity": "OFFICIAL_WHITELISTED",
            "is_official_excluded": True,
            "is_capped": False,
            "cap_reason": None,
            "breakdown": {
                "handle_score": 0,
                "logo_score": 0,
                "scam_score": 0,
                "domain_score": 0,
                "app_score": 0,
                "signals": empty_signals,
                "is_capped": False,
                "cap_reason": None,
                "recommended_action": rec_action,
                "summary": summary,
                "explanation": explanation_payload
            },
            "explanation": explanation_payload,
            "reasons": [f"Verified Official Brand Asset for {brand_name} (Whitelisted by policy)"],
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
    app_audit: Dict[str, Any] = {}
    if channel == "Rogue Mobile App":
        app_audit = analyze_app_store_threat(
            suspect_app_name=suspect_handle,
            suspect_publisher=suspect_publisher,
            suspect_app_id=suspect_url,
            official_apps=official_apps or [],
            official_brand_name=brand.get("name", "Brand") if brand else "Brand",
            suspect_bio=suspect_bio,
            post_captions=post_captions
        )
        app_score = app_audit["score"]
        app_flags = app_audit["flags"]

    effective_handle_score = min(100, handle_sim + (20 if lookalike["is_lookalike"] else 0))

    # Signal Attribution Breakdown
    signals = []
    if channel == "Rogue Mobile App":
        # 1. App Store Publisher & Permissions (35%)
        app_pts = round(app_score * 0.35, 1)
        app_evidence = "; ".join(app_flags) if app_flags else (
            "; ".join(app_audit.get("missing_evidence", [])) if app_audit.get("missing_evidence") else "Publisher and package namespace match registered developer"
        )
        app_sev = "CRITICAL" if app_score >= 70 else ("HIGH" if app_score >= 45 else ("MEDIUM" if app_score >= 20 else "SAFE"))
        signals.append({
            "id": "app_store",
            "name": "App Store Publisher & Permissions",
            "weight_percent": 35,
            "raw_score": app_score,
            "weighted_points": app_pts,
            "points_contributed": app_pts,
            "evidence": app_evidence,
            "severity": app_sev,
            "direction": "increases_risk" if app_score > 0 else "neutral",
            "explanation": "Evaluates developer certificate authenticity, namespace squatting, and dangerous permissions (READ_SMS, SYSTEM_ALERT_WINDOW)."
        })

        # 2. App Icon & Visual Trademark (30%)
        logo_pts = round(logo_match_percent * 0.30, 1)
        logo_sev = "CRITICAL" if logo_match_percent >= 85 else ("HIGH" if logo_match_percent >= 70 else ("MEDIUM" if logo_match_percent >= 50 else "LOW"))
        signals.append({
            "id": "visual_logo",
            "name": "App Icon & Visual Trademark",
            "weight_percent": 30,
            "raw_score": logo_match_percent,
            "weighted_points": logo_pts,
            "points_contributed": logo_pts,
            "evidence": f"{logo_match_percent}% visual app icon similarity against official trademark",
            "severity": logo_sev,
            "direction": "increases_risk" if logo_match_percent >= 50 else "neutral",
            "explanation": "Unauthorized trademark icon reproduction intended to deceive mobile app store users."
        })

        # 3. Package & App Name Similarity (20%)
        handle_pts = round(effective_handle_score * 0.20, 1)
        handle_evidence = "; ".join(lookalike["explanation"]) if lookalike["explanation"] else f"{handle_sim}% title string similarity to official application name"
        handle_sev = "HIGH" if effective_handle_score >= 70 else ("MEDIUM" if effective_handle_score >= 40 else "LOW")
        signals.append({
            "id": "app_naming",
            "name": "Package & App Name Similarity",
            "weight_percent": 20,
            "raw_score": effective_handle_score,
            "weighted_points": handle_pts,
            "points_contributed": handle_pts,
            "evidence": handle_evidence,
            "severity": handle_sev,
            "direction": "increases_risk" if effective_handle_score >= 40 else "neutral",
            "explanation": "Character squatting and typosquatting targeting official mobile app search queries."
        })

        # 4. Manifest Intent & Store Description (15%)
        scam_pts = round(scam_score * 0.15, 1)
        matched_app_phrases = [p["phrase"] for p in scam_result.get("matched_patterns", [])]
        scam_evidence = (
            f"Matched predatory phrases: {', '.join(p['phrase'] for p in scam_result.get('matched_patterns', []))}"
            if matched_app_phrases
            else "No predatory scam keywords matched in listing description"
        )
        scam_sev = "CRITICAL" if scam_score >= 60 else ("HIGH" if scam_score >= 30 else "SAFE")
        signals.append({
            "id": "permissions_scam",
            "name": "Manifest Intent & Store Description",
            "weight_percent": 15,
            "raw_score": scam_score,
            "weighted_points": scam_pts,
            "points_contributed": scam_pts,
            "evidence": scam_evidence,
            "severity": scam_sev,
            "direction": "increases_risk" if scam_score > 0 else "neutral",
            "explanation": "Social engineering and fraudulent promotion copy detected in public app store listing."
        })

        raw_composite = round(app_score * 0.35 + logo_match_percent * 0.30 + effective_handle_score * 0.20 + scam_score * 0.15)
    else:
        # 1. Handle & Homoglyph Lookalike (30%)
        handle_pts = round(effective_handle_score * 0.30, 1)
        handle_evidence = "; ".join(lookalike["explanation"]) if lookalike["explanation"] else f"{handle_sim}% username similarity to official handle {official_handle}"
        handle_sev = "CRITICAL" if effective_handle_score >= 80 else ("HIGH" if effective_handle_score >= 60 else ("MEDIUM" if effective_handle_score >= 40 else "LOW"))
        signals.append({
            "id": "handle_lookalike",
            "name": "Handle & Homoglyph Lookalike",
            "weight_percent": 30,
            "raw_score": effective_handle_score,
            "weighted_points": handle_pts,
            "points_contributed": handle_pts,
            "evidence": handle_evidence,
            "severity": handle_sev,
            "direction": "increases_risk" if effective_handle_score >= 40 else "neutral",
            "explanation": "Evaluates deceptive character swaps, squatting keywords, and edit distance."
        })

        # 2. Visual Trademark & Logo Diff (30%)
        logo_pts = round(logo_match_percent * 0.30, 1)
        logo_sev = "CRITICAL" if logo_match_percent >= 85 else ("HIGH" if logo_match_percent >= 70 else ("MEDIUM" if logo_match_percent >= 50 else "LOW"))
        signals.append({
            "id": "visual_logo",
            "name": "Visual Trademark & Logo Diff",
            "weight_percent": 30,
            "raw_score": logo_match_percent,
            "weighted_points": logo_pts,
            "points_contributed": logo_pts,
            "evidence": f"{logo_match_percent}% visual logo similarity against authentic brand trademark",
            "severity": logo_sev,
            "direction": "increases_risk" if logo_match_percent >= 50 else "neutral",
            "explanation": "Unauthorized reproduction of registered visual brand assets across unauthorized profiles."
        })

        # 3. Scam Intent & Phishing Keywords (25%)
        scam_pts = round(scam_score * 0.25, 1)
        scam_evidence = (
            f"Matched predatory phrases: {', '.join(p['phrase'] for p in scam_result.get('matched_patterns', []))}"
            if scam_result["matched_patterns"]
            else "No predatory fraud keywords matched in public profile text"
        )
        scam_sev = "CRITICAL" if scam_score >= 60 else ("HIGH" if scam_score >= 40 else ("MEDIUM" if scam_score >= 20 else "SAFE"))
        signals.append({
            "id": "scam_intent",
            "name": "Scam Intent & Phishing Keywords",
            "weight_percent": 25,
            "raw_score": scam_score,
            "weighted_points": scam_pts,
            "points_contributed": scam_pts,
            "evidence": scam_evidence,
            "severity": scam_sev,
            "direction": "increases_risk" if scam_score > 0 else "neutral",
            "explanation": "NLP detection of social engineering phrases (instant refund, send OTP, urgent KYC)."
        })

        # 4. Domain Infrastructure & Link Structure (15%)
        domain_pts = round(domain_score * 0.15, 1)
        domain_evidence = "; ".join(domain_result["flags"]) if domain_result["flags"] else (
            "No external landing domain linked" if not suspect_url else "Registered domain structure within normal baseline"
        )
        domain_sev = "CRITICAL" if domain_score >= 60 else ("HIGH" if domain_score >= 40 else ("MEDIUM" if domain_score >= 20 else "SAFE"))
        signals.append({
            "id": "domain_risk",
            "name": "Domain Infrastructure & Link Structure",
            "weight_percent": 15,
            "raw_score": domain_score,
            "weighted_points": domain_pts,
            "points_contributed": domain_pts,
            "evidence": domain_evidence,
            "severity": domain_sev,
            "direction": "increases_risk" if domain_score > 0 else "neutral",
            "explanation": "Inspects low-reputation scam TLDs (.xyz, .top), typosquatting, and deceptive link structures."
        })

        raw_composite = round(effective_handle_score * 0.30 + logo_match_percent * 0.30 + scam_score * 0.25 + domain_score * 0.15)

    # RULE: Name similarity alone NEVER classifies a candidate as malicious.
    other_evidence_present = (
        logo_match_percent >= 70 or
        scam_score >= 30 or
        domain_score >= 40 or
        app_score >= 40 or
        lookalike["has_character_swap"]
    )

    is_capped = False
    cap_reason = None
    if not other_evidence_present and raw_composite > 28:
        composite = 28
        is_capped = True
        cap_reason = (
            f"Score capped from {raw_composite} to 28 by Anti-False-Positive Policy: "
            "Name similarity alone without corroborating rogue signals (scam keywords, malicious permissions, or trademark infringement) cannot exceed LOW severity tier."
        )
    else:
        composite = min(100, max(0, raw_composite))

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
            f"Detected scam phrases: {', '.join(p['phrase'] for p in scam_result.get('matched_patterns', []))}"
        )
    if app_flags:
        reasons.extend(app_flags)
    if domain_result["flags"]:
        reasons.extend(domain_result["flags"])

    if not reasons:
        reasons.append("Routine scan: No high-risk indicators detected on candidate")

    rec_action = derive_recommended_action(severity, channel, signals)
    summary = synthesize_explanation_summary(suspect_handle, channel, composite, severity, is_capped, signals)

    explanation_payload = {
        "final_score": composite,
        "severity": severity,
        "is_official_excluded": False,
        "is_capped": is_capped,
        "cap_reason": cap_reason,
        "signals": signals,
        "recommended_action": rec_action,
        "summary": summary
    }

    return {
        "composite_score": composite,
        "severity": severity,
        "is_official_excluded": False,
        "is_capped": is_capped,
        "cap_reason": cap_reason,
        "breakdown": {
            "handle_score": effective_handle_score,
            "logo_score": logo_match_percent,
            "scam_score": scam_score,
            "domain_score": domain_score,
            "app_score": app_score,
            "signals": signals,
            "is_capped": is_capped,
            "cap_reason": cap_reason,
            "recommended_action": rec_action,
            "summary": summary,
            "explanation": explanation_payload
        },
        "explanation": explanation_payload,
        "lookalike": lookalike,
        "reasons": reasons
    }
