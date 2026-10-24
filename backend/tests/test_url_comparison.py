"""
AegisAgent DRP V2 — URL Comparison Engine Test Suite

Comprehensive offline tests verifying:
1. Exact official-domain match.
2. HTTP/HTTPS scheme difference.
3. Genuine subdomain of the official domain (including multi-part PSL).
4. Lookalike spelling and character substitution.
5. Brand name appearing only in an attacker's hostname.
6. Misleading nested subdomains.
7. Punycode and Unicode hostname handling.
8. Different registrable domains.
9. Malformed URL, unsupported scheme, embedded credentials, and unusual ports.
10. Missing verified official domain returning INCONCLUSIVE.
11. Paths and query strings not being mistaken for domain identity.
12. Zero network access required by the comparison service.
13. API endpoint integration with authentication and brand registry lookup.
"""

import socket
import pytest
from fastapi.testclient import TestClient

from backend.app.main import app
from backend.app.services.url_comparison import (
    compare_urls,
    ComparisonStatus,
    normalize_input_url,
    extract_registrable_domain,
    safe_decode_punycode,
    safe_encode_punycode,
)


# ============================================================================
# 1. Exact Official-Domain Match
# ============================================================================
def test_exact_official_domain_match():
    official = "https://razorpay.com"
    suspicious = "https://razorpay.com/payment/invoice/12345"

    result = compare_urls(suspicious, official, brand_name="Razorpay")

    assert result["status"] == ComparisonStatus.MATCH.value
    assert result["official_hostname"] == "razorpay.com"
    assert result["suspicious_hostname"] == "razorpay.com"
    assert result["registrable_domain_comparison"]["is_same_registrable_domain"] is True
    assert result["registrable_domain_comparison"]["official_registrable_domain"] == "razorpay.com"
    assert result["registrable_domain_comparison"]["suspicious_registrable_domain"] == "razorpay.com"

    signal_ids = [s["id"] for s in result["signals"]]
    assert "EXACT_HOSTNAME_MATCH" in signal_ids
    assert "DIFFERENT_REGISTRABLE_DOMAIN" not in signal_ids

    # Assert safety limitation is documented
    assert any("matching domain does not guarantee safety" in lim.lower() for lim in result["limitations"])


# ============================================================================
# 2. HTTP/HTTPS Scheme Difference
# ============================================================================
def test_http_https_scheme_difference():
    official = "https://razorpay.com"
    suspicious = "http://razorpay.com/docs"

    result = compare_urls(suspicious, official, brand_name="Razorpay")

    assert result["status"] == ComparisonStatus.MATCH.value
    assert result["registrable_domain_comparison"]["is_same_registrable_domain"] is True

    signal_ids = [s["id"] for s in result["signals"]]
    assert "INSECURE_SCHEME" in signal_ids
    insecure_sig = next(s for s in result["signals"] if s["id"] == "INSECURE_SCHEME")
    assert "unencrypted HTTP" in insecure_sig["explanation"]
    assert "Warning: Uses unencrypted HTTP" in result["summary"]


# ============================================================================
# 3. Genuine Subdomain of the Official Domain
# ============================================================================
def test_genuine_subdomain_of_official_domain():
    # Test standard gTLD
    res1 = compare_urls("https://auth.api.razorpay.com/checkout", "https://razorpay.com", "Razorpay")
    assert res1["status"] == ComparisonStatus.MATCH.value
    assert res1["registrable_domain_comparison"]["is_same_registrable_domain"] is True
    assert res1["registrable_domain_comparison"]["official_registrable_domain"] == "razorpay.com"
    assert res1["registrable_domain_comparison"]["suspicious_registrable_domain"] == "razorpay.com"
    assert res1["registrable_domain_comparison"]["suspicious_subdomain"] == "auth.api"
    assert any(s["id"] == "GENUINE_SUBDOMAIN" for s in res1["signals"])

    # Test multi-part PSL (e.g. .co.uk)
    res2 = compare_urls("https://portal.service.example.co.uk/login", "example.co.uk", "Example")
    assert res2["status"] == ComparisonStatus.MATCH.value
    assert res2["registrable_domain_comparison"]["is_same_registrable_domain"] is True
    assert res2["registrable_domain_comparison"]["official_registrable_domain"] == "example.co.uk"
    assert res2["registrable_domain_comparison"]["suspicious_registrable_domain"] == "example.co.uk"
    assert res2["registrable_domain_comparison"]["suspicious_subdomain"] == "portal.service"


# ============================================================================
# 4. Lookalike Spelling and Character Substitution
# ============================================================================
def test_lookalike_spelling_and_character_substitution():
    # Number swap: '0' for 'o'
    res_zero = compare_urls("https://raz0rpay.com/login", "https://razorpay.com", "Razorpay")
    assert res_zero["status"] == ComparisonStatus.SUSPICIOUS.value
    assert res_zero["registrable_domain_comparison"]["is_same_registrable_domain"] is False
    assert any(s["id"] in ("TYPOSQUATTING_CANONICAL_MATCH", "LOOKALIKE_HOMOGLYPH", "TYPOSQUATTING_HIGH_SIMILARITY") for s in res_zero["signals"])
    assert res_zero["heuristic_similarity_ratio"] >= 80

    # Letter swap: uppercase 'I' substituting lowercase 'l'
    res_revolut = compare_urls("https://revoIut.com/app", "https://revolut.com", "Revolut")
    assert res_revolut["status"] == ComparisonStatus.SUSPICIOUS.value
    assert res_revolut["registrable_domain_comparison"]["is_same_registrable_domain"] is False
    assert res_revolut["heuristic_similarity_ratio"] >= 80


# ============================================================================
# 5. Brand Name Appearing Only in an Attacker's Hostname
# ============================================================================
def test_brand_name_appearing_only_in_attacker_hostname():
    official = "https://razorpay.com"
    suspicious = "https://razorpay-verification.attacker-portal.net/login"

    result = compare_urls(suspicious, official, brand_name="Razorpay")

    assert result["status"] == ComparisonStatus.SUSPICIOUS.value
    assert result["registrable_domain_comparison"]["is_same_registrable_domain"] is False
    assert result["registrable_domain_comparison"]["suspicious_registrable_domain"] == "attacker-portal.net"
    assert result["registrable_domain_comparison"]["official_registrable_domain"] == "razorpay.com"

    signal_ids = [s["id"] for s in result["signals"]]
    assert "SUBDOMAIN_BRAND_SQUATTING" in signal_ids or "DIFFERENT_REGISTRABLE_DOMAIN" in signal_ids
    assert any("Razorpay" in s["explanation"] or "subdomain" in s["explanation"].lower() for s in result["signals"])


# ============================================================================
# 6. Misleading Nested Subdomains
# ============================================================================
def test_misleading_nested_subdomains():
    official = "https://razorpay.com"
    suspicious = "https://razorpay.com.security-resolution-desk.com/verify"

    result = compare_urls(suspicious, official, brand_name="Razorpay")

    assert result["status"] == ComparisonStatus.SUSPICIOUS.value
    assert result["registrable_domain_comparison"]["is_same_registrable_domain"] is False
    assert result["registrable_domain_comparison"]["suspicious_registrable_domain"] == "security-resolution-desk.com"
    assert "razorpay.com" in (result["registrable_domain_comparison"]["suspicious_subdomain"] or "")

    signal_ids = [s["id"] for s in result["signals"]]
    assert "NESTED_SUBDOMAIN_DECEPTION" in signal_ids
    nested_sig = next(s for s in result["signals"] if s["id"] == "NESTED_SUBDOMAIN_DECEPTION")
    assert "razorpay.com" in nested_sig["explanation"]
    assert "security-resolution-desk.com" in nested_sig["explanation"]


# ============================================================================
# 7. Punycode and Unicode Hostname Handling
# ============================================================================
def test_punycode_and_unicode_hostname_handling():
    official = "https://razorpay.com"
    # xn--razrpay-s1a.com encodes razørpay.com (Nordic slashed o U+00F8)
    suspicious_puny = "https://xn--razrpay-s1a.com/portal"

    result = compare_urls(suspicious_puny, official, brand_name="Razorpay")

    assert result["status"] == ComparisonStatus.SUSPICIOUS.value
    assert result["registrable_domain_comparison"]["is_same_registrable_domain"] is False

    signal_ids = [s["id"] for s in result["signals"]]
    assert "PUNYCODE_HOST" in signal_ids or "LOOKALIKE_HOMOGLYPH" in signal_ids
    assert "DIFFERENT_REGISTRABLE_DOMAIN" in signal_ids

    # Test direct Unicode input
    suspicious_unicode = "https://razørpay.com/portal"
    res_unicode = compare_urls(suspicious_unicode, official, brand_name="Razorpay")
    assert res_unicode["status"] == ComparisonStatus.SUSPICIOUS.value
    assert any("ø" in s["explanation"] or "homoglyph" in s["name"].lower() for s in res_unicode["signals"])


# ============================================================================
# 8. Different Registrable Domains
# ============================================================================
def test_different_registrable_domains():
    official = "https://razorpay.com"
    suspicious = "https://completely-unrelated-thirdparty.org/account"

    result = compare_urls(suspicious, official, brand_name="Razorpay")

    assert result["status"] == ComparisonStatus.SUSPICIOUS.value
    assert result["registrable_domain_comparison"]["is_same_registrable_domain"] is False
    assert result["registrable_domain_comparison"]["official_registrable_domain"] == "razorpay.com"
    assert result["registrable_domain_comparison"]["suspicious_registrable_domain"] == "completely-unrelated-thirdparty.org"

    signal_ids = [s["id"] for s in result["signals"]]
    assert "DIFFERENT_REGISTRABLE_DOMAIN" in signal_ids


# ============================================================================
# 9. Malformed URL, Unsupported Scheme, Credentials, and Unusual Ports
# ============================================================================
def test_malformed_url_unsupported_scheme_credentials_and_ports():
    official = "https://razorpay.com"

    # 9A: Malformed URL
    res_malformed = compare_urls("not a url at all %%%", official)
    assert res_malformed["status"] == ComparisonStatus.INCONCLUSIVE.value
    assert any("MALFORMED" in s["id"] for s in res_malformed["signals"])

    # 9B: Unsupported Scheme
    res_scheme = compare_urls("ftp://razorpay.com/download.tar.gz", official)
    assert any(s["id"] == "UNSUPPORTED_SCHEME" for s in res_scheme["signals"])

    # 9C: Embedded Credentials
    res_creds = compare_urls("https://admin:supersecret@razorpay.com/dashboard", official)
    assert any(s["id"] == "EMBEDDED_CREDENTIALS" for s in res_creds["signals"])
    creds_sig = next(s for s in res_creds["signals"] if s["id"] == "EMBEDDED_CREDENTIALS")
    assert "embedded credentials" in creds_sig["explanation"].lower()

    # 9D: Unusual Port
    res_port = compare_urls("https://razorpay.com:8443/api", official)
    assert any(s["id"] == "UNUSUAL_PORT" for s in res_port["signals"])
    port_sig = next(s for s in res_port["signals"] if s["id"] == "UNUSUAL_PORT")
    assert "8443" in port_sig["explanation"]


# ============================================================================
# 10. Missing Verified Official Domain Returning INCONCLUSIVE
# ============================================================================
def test_missing_verified_official_domain_returns_inconclusive():
    suspicious = "https://unverified-check.com/login"

    # Missing None
    res1 = compare_urls(suspicious, None)
    assert res1["status"] == ComparisonStatus.INCONCLUSIVE.value
    assert "Authoritative official domain is unconfigured or unavailable." in res1["missing_evidence"]
    assert any(s["id"] == "MISSING_OFFICIAL_BENCHMARK" for s in res1["signals"])

    # Empty string
    res2 = compare_urls(suspicious, "   ")
    assert res2["status"] == ComparisonStatus.INCONCLUSIVE.value
    assert "Authoritative official domain is unconfigured or unavailable." in res2["missing_evidence"]

    # Verify suspicious URL is NOT automatically declared safe or match
    assert res2["status"] != ComparisonStatus.MATCH.value


# ============================================================================
# 11. Paths and Query Strings Not Mistaken for Domain Identity
# ============================================================================
def test_paths_and_query_strings_not_mistaken_for_domain_identity():
    official = "https://razorpay.com"
    # The string 'razorpay' appears only in path and query, but host is aws-s3-bucket.com
    suspicious = "https://aws-s3-bucket.com/download/razorpay/invoice.pdf?brand=razorpay&auth=verified"

    result = compare_urls(suspicious, official, brand_name="Razorpay")

    assert result["status"] == ComparisonStatus.SUSPICIOUS.value
    assert result["registrable_domain_comparison"]["is_same_registrable_domain"] is False
    assert result["registrable_domain_comparison"]["suspicious_registrable_domain"] == "aws-s3-bucket.com"

    signal_ids = [s["id"] for s in result["signals"]]
    assert "PATH_OR_QUERY_BRAND_REFERENCE" in signal_ids
    assert "DIFFERENT_REGISTRABLE_DOMAIN" in signal_ids

    path_sig = next(s for s in result["signals"] if s["id"] == "PATH_OR_QUERY_BRAND_REFERENCE")
    assert "path or query" in path_sig["name"].lower()
    assert "does not establish brand authority" in path_sig["explanation"].lower()


# ============================================================================
# 12. Zero Network Access Required by Comparison Service
# ============================================================================
def test_no_network_access_required_by_comparison_service(monkeypatch):
    """
    Strictly verifies that no network sockets, DNS resolution, or HTTP requests
    are invoked during URL comparison execution.
    """
    def block_network(*args, **kwargs):
        raise RuntimeError("CRITICAL ERROR: Network operation attempted during offline comparison!")

    monkeypatch.setattr(socket, "getaddrinfo", block_network)
    monkeypatch.setattr(socket, "socket", block_network)

    # Execute comprehensive batch of comparisons offline
    test_pairs = [
        ("https://razorpay.com/payment", "https://razorpay.com", "Razorpay"),
        ("https://auth.razorpay.com", "https://razorpay.com", "Razorpay"),
        ("https://raz0rpay.com", "https://razorpay.com", "Razorpay"),
        ("https://nested.razorpay.com.attacker.com", "https://razorpay.com", "Razorpay"),
        ("https://legit.com/razorpay", "https://razorpay.com", "Razorpay"),
        ("https://xn--razrpay-s1a.com", "https://razorpay.com", "Razorpay"),
        ("http://example.co.uk", "https://example.co.uk", "Example"),
    ]

    for susp, off, bname in test_pairs:
        res = compare_urls(susp, off, brand_name=bname)
        assert res["status"] in (ComparisonStatus.MATCH.value, ComparisonStatus.SUSPICIOUS.value)


# ============================================================================
# 13. API Endpoint Integration with Auth and Brand Lookup
# ============================================================================
def test_api_endpoint_url_comparison(analyst_client):
    # 13A: Explicit official URL
    payload_explicit = {
        "suspicious_url": "https://raz0rpay.com/verify",
        "official_url": "https://razorpay.com",
        "brand_name": "Razorpay"
    }
    resp1 = analyst_client.post("/api/findings/compare-url", json=payload_explicit)
    assert resp1.status_code == 200
    data1 = resp1.json()
    assert data1["status"] == "SUSPICIOUS"
    assert data1["registrable_domain_comparison"]["is_same_registrable_domain"] is False
    assert len(data1["signals"]) > 0

    # 13B: Resolution via brand_id from brand registry
    payload_brand_id = {
        "suspicious_url": "https://auth.razorpay.com/login",
        "brand_id": "razorpay"
    }
    resp2 = analyst_client.post("/api/findings/compare-url", json=payload_brand_id)
    assert resp2.status_code == 200
    data2 = resp2.json()
    assert data2["status"] == "MATCH"
    assert data2["registrable_domain_comparison"]["is_same_registrable_domain"] is True
    assert data2["official_hostname"] == "razorpay.com"

    # 13C: Missing official domain returns INCONCLUSIVE
    payload_missing = {
        "suspicious_url": "https://mystery-target.com"
    }
    resp3 = analyst_client.post("/api/findings/compare-url", json=payload_missing)
    assert resp3.status_code == 200
    data3 = resp3.json()
    assert data3["status"] == "INCONCLUSIVE"
    assert len(data3["missing_evidence"]) > 0
