from backend.app.services.detection import (
    is_official_asset,
    detect_lookalike_variations,
    levenshtein_distance,
    analyze_app_store_threat,
    analyze_scam_intent,
    analyze_domain_risk,
    calculate_explainable_risk
)

MOCK_BRAND = {
    "id": "razorpay",
    "name": "Razorpay Technologies",
    "official_handle": "@Razorpay",
    "support_handle": "@RazorpaySupport",
    "official_domain": "razorpay.com",
    "verified_handles": ["@Razorpay", "@RazorpaySupport", "@RazorpayCare"],
    "official_apps": [
        {
            "appName": "Razorpay: Payment Gateway & POS",
            "appId": "com.razorpay.payments.app",
            "publisher": "Razorpay Software Private Limited"
        }
    ]
}


def test_official_asset_exclusion_layer():
    # Primary official handle
    assert is_official_asset("@Razorpay", MOCK_BRAND) is True
    assert is_official_asset("razorpay", MOCK_BRAND) is True

    # Support handle
    assert is_official_asset("@RazorpaySupport", MOCK_BRAND) is True
    assert is_official_asset("@razorpaysupport", MOCK_BRAND) is True

    # Verified handles list
    assert is_official_asset("@RazorpayCare", MOCK_BRAND) is True

    # Mobile app package ID and app name
    assert is_official_asset("com.razorpay.payments.app", MOCK_BRAND) is True
    assert is_official_asset("Razorpay: Payment Gateway & POS", MOCK_BRAND) is True

    # Authoritative domain
    assert is_official_asset("razorpay.com", MOCK_BRAND) is True
    assert is_official_asset("https://razorpay.com", MOCK_BRAND) is True

    # Impersonators must NOT be excluded
    assert is_official_asset("@Razorpay_Support_24x7", MOCK_BRAND) is False
    assert is_official_asset("@Razorpay_HeIp", MOCK_BRAND) is False
    assert is_official_asset("com.razorpay.fake.app", MOCK_BRAND) is False


def test_lookalike_name_detection():
    # Character swap (homoglyphs e.g. I for l or 0 for o)
    res_swap = detect_lookalike_variations("@Razorpay_HeIp", "@Razorpay")
    assert res_swap["has_character_swap"] is True
    assert res_swap["is_lookalike"] is True

    # Added words squatting
    res_words = detect_lookalike_variations("@Razorpay_Support_Desk", "@Razorpay")
    assert res_words["has_added_words"] is True
    assert "support" in res_words["detected_added_words"]
    assert "desk" in res_words["detected_added_words"]

    # Spacing and delimiters
    res_delim = detect_lookalike_variations("razor_pay_official", "razorpay")
    assert res_delim["has_delimiter_changes"] is True
    assert "_" in res_delim["delimiters_found"]


def test_levenshtein_similarity():
    # Identical
    res_exact = levenshtein_distance("razorpay", "razorpay")
    assert res_exact["distance"] == 0
    assert res_exact["similarity"] == 100

    # Minor edit
    res_minor = levenshtein_distance("razorpay", "razorpay_help")
    assert res_minor["distance"] == 5
    assert 60 <= res_minor["similarity"] < 100


def test_app_store_publisher_mismatch():
    # Unauthorized developer
    res_unauth = analyze_app_store_threat(
        suspect_app_name="Razorpay POS Terminal",
        suspect_publisher="Rogue Devs Inc.",
        suspect_app_id="com.razorpay.pos.fake",
        official_apps=MOCK_BRAND["official_apps"],
        official_brand_name=MOCK_BRAND["name"]
    )
    assert res_unauth["is_suspicious_app"] is True
    assert any("Publisher mismatch" in f for f in res_unauth["flags"])

    # Authorized developer
    res_auth = analyze_app_store_threat(
        suspect_app_name="Razorpay: Payment Gateway & POS",
        suspect_publisher="Razorpay Software Private Limited",
        suspect_app_id="com.razorpay.payments.app",
        official_apps=MOCK_BRAND["official_apps"],
        official_brand_name=MOCK_BRAND["name"]
    )
    assert not any("Publisher mismatch" in f for f in res_auth["flags"])


def test_missing_evidence_is_not_treated_as_suspicious():
    # When publisher or metadata is missing, it is noted as unavailable without triggering suspicious flag
    res_missing = analyze_app_store_threat(
        suspect_app_name="Random Utility",
        suspect_publisher=None,
        suspect_app_id=None,
        official_apps=MOCK_BRAND["official_apps"],
        official_brand_name=MOCK_BRAND["name"]
    )
    assert "Publisher metadata unavailable from store listing" in res_missing["missing_evidence"]
    assert "App package identifier unavailable" in res_missing["missing_evidence"]
    assert res_missing["is_suspicious_app"] is False
    assert res_missing["score"] == 0


def test_name_similarity_alone_does_not_classify_malicious():
    # A candidate with similar letters but ZERO other signals (no scam keywords, no visual match, no scam TLD)
    res = calculate_explainable_risk(
        suspect_handle="@Razor_Pay_TechNews",
        official_handle="@Razorpay",
        suspect_bio="Independent tech blogger reviewing payment APIs.",
        post_captions=["Sharing thoughts on software architecture."],
        suspect_url="https://techblog.org",
        official_domain="razorpay.com",
        logo_match_percent=15,
        channel="Social Profile",
        brand=MOCK_BRAND
    )
    # Must NOT be classified as CRITICAL or HIGH
    assert res["severity"] == "LOW"
    assert res["composite_score"] <= 30


def test_explainable_risk_high_severity_when_signals_align():
    res = calculate_explainable_risk(
        suspect_handle="@Razorpay_Support_24x7",
        official_handle="@Razorpay",
        suspect_bio="Official helpdesk. DM for instant refund. Send OTP to unfreeze balance.",
        post_captions=["Instant refund processed."],
        suspect_url="https://razorpay-merchant-refund.xyz/claim",
        official_domain="razorpay.com",
        logo_match_percent=94,
        channel="Social Profile",
        brand=MOCK_BRAND
    )
    assert res["severity"] in ["CRITICAL", "HIGH"]
    assert res["composite_score"] >= 70
    assert any("refund" in r.lower() or "scam" in r.lower() for r in res["reasons"])
    assert any("logo" in r.lower() for r in res["reasons"])
