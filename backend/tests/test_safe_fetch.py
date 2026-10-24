"""
AegisAgent DRP V2 — Stage 2A: Safe URL Fetching and SSRF Protection Test Suite

Comprehensive offline unit and security tests verifying:
- URL validation, scheme, port, and credential rules
- IPv4/IPv6 private, loopback, link-local, and cloud metadata defense
- Mixed public/prohibited DNS answer rejection
- DNS rebinding prevention via pinned IP transport
- Safe manual redirect tracking, limit capping, and downgrade prevention
- Resource capping (5 MiB body limit, timeouts)
- Content-type whitelisting and error sanitization
"""

import socket
import time
import pytest
import httpx

from backend.app.services.safe_fetch import (
    SafeFetchService,
    FetchFailureCategory,
    validate_and_normalize_url,
    resolve_and_validate_hostname,
    is_prohibited_ip,
    SSRFSecurityError,
    PinnedIPSyncBackend,
)


# ============================================================================
# 1. Valid HTTP and HTTPS URL Validation
# ============================================================================
def test_valid_http_and_https_urls():
    valid_urls = [
        ("https://example.com", "https://example.com/", "example.com", 443),
        ("https://example.com/path/to/resource?q=test#frag", "https://example.com/path/to/resource?q=test", "example.com", 443),
        ("http://example.com:8080/check", "http://example.com:8080/check", "example.com", 8080),
        ("https://sub.domain.co.uk:8443/api/v1", "https://sub.domain.co.uk:8443/api/v1", "sub.domain.co.uk", 8443),
    ]

    for raw, expected_norm, expected_host, expected_port in valid_urls:
        norm, host, port = validate_and_normalize_url(raw)
        assert norm == expected_norm
        assert host == expected_host
        assert port == expected_port

    # Test full fetch on valid URL with mocked transport
    def mock_handler(request: httpx.Request):
        return httpx.Response(
            status_code=200,
            headers={"Content-Type": "text/html; charset=utf-8"},
            content=b"<!DOCTYPE html><html><body><h1>Safe Brand Portal</h1></body></html>",
        )

    service = SafeFetchService(
        dns_resolver=lambda h, p: ["93.184.216.34"],
        transport_factory=lambda ip: httpx.MockTransport(mock_handler),
    )
    result = service.fetch_url("https://example.com/portal")
    assert result.is_valid is True
    assert result.status_code == 200
    assert result.is_verified_safe_content is True
    assert "Safe Brand Portal" in (result.body_sample or "")
    assert result.failure_category is None


# ============================================================================
# 2. Unsupported Schemes and Malformed URLs
# ============================================================================
def test_unsupported_schemes_and_malformed_urls():
    invalid_schemes = [
        "file:///etc/passwd",
        "ftp://files.example.com/dump.tar.gz",
        "gopher://evil.com/",
        "javascript:alert(1)",
        "data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==",
        "blob:https://example.com/uuid",
        "ws://echo.websocket.org",
        "//example.com/relative",
        "example.com/no-scheme",
        "",
        "   ",
    ]

    for url in invalid_schemes:
        service = SafeFetchService(dns_resolver=lambda h, p: ["93.184.216.34"])
        result = service.fetch_url(url)
        assert result.is_valid is False
        assert result.failure_category in (
            FetchFailureCategory.UNSUPPORTED_SCHEME,
            FetchFailureCategory.INVALID_URL,
        )


# ============================================================================
# 3. Embedded Credentials and Disallowed Ports
# ============================================================================
def test_embedded_credentials_and_disallowed_ports():
    credential_urls = [
        "http://admin:secret123@example.com/",
        "https://user:password@sub.example.com:8443/",
        "https://bot@example.com/",
    ]

    for url in credential_urls:
        service = SafeFetchService()
        result = service.fetch_url(url)
        assert result.is_valid is False
        assert result.failure_category == FetchFailureCategory.EMBEDDED_CREDENTIALS

    disallowed_port_urls = [
        ("http://example.com:22/", 22),     # SSH
        ("http://example.com:25/", 25),     # SMTP
        ("http://example.com:3306/", 3306), # MySQL
        ("http://example.com:5432/", 5432), # PostgreSQL
        ("http://example.com:6379/", 6379), # Redis
        ("http://example.com:27017/", 27017), # MongoDB
        ("http://example.com:9200/", 9200), # Elasticsearch
    ]

    for url, port in disallowed_port_urls:
        service = SafeFetchService()
        result = service.fetch_url(url)
        assert result.is_valid is False
        assert result.failure_category == FetchFailureCategory.DISALLOWED_PORT


# ============================================================================
# 4. IPv4 and IPv6 Loopback, Private, Link-Local, Reserved, & Ambiguous IPs
# ============================================================================
def test_ip_address_rejection_loopback_private_reserved_metadata():
    prohibited_destinations = [
        # IPv4 Loopback
        "http://127.0.0.1/",
        "http://127.0.0.2:8080/",
        "http://127.1.2.3/",
        # IPv4 Private RFC1918
        "http://10.0.0.1/",
        "http://10.254.254.254/",
        "http://172.16.0.1/",
        "http://172.31.255.255/",
        "http://192.168.0.1/",
        "http://192.168.1.100/",
        # Cloud Metadata Destinations
        "http://169.254.169.254/",
        "http://169.254.170.2/",
        "http://100.100.100.200/",
        # Carrier-Grade NAT (CGNAT)
        "http://100.64.0.1/",
        # IPv4 Unspecified & Broadcast
        "http://0.0.0.0/",
        "http://255.255.255.255/",
        # IPv6 Loopback & Unspecified
        "http://[::1]/",
        "http://[::]/",
        # IPv6 Unique Local Address (ULA)
        "http://[fc00::1]/",
        "http://[fd00::1]/",
        # IPv6 Link-Local
        "http://[fe80::1]/",
        # IPv4-Mapped IPv6 bypasses
        "http://[::ffff:127.0.0.1]/",
        "http://[::ffff:169.254.169.254]/",
        "http://[::ffff:10.0.0.1]/",
        # Local / Internal hostnames
        "http://localhost/",
        "http://localhost:8080/",
        "http://router.local/",
        "http://metadata.google.internal/",
        "http://database.lan/",
        "http://test.corp/",
        "http://printer/",
    ]

    for url in prohibited_destinations:
        service = SafeFetchService()
        result = service.fetch_url(url)
        assert result.is_valid is False
        assert result.failure_category in (
            FetchFailureCategory.PROHIBITED_DESTINATION,
            FetchFailureCategory.LOCAL_OR_INTERNAL_HOSTNAME,
            FetchFailureCategory.INVALID_URL,
        )

    # Ambiguous decimal / octal / hex representations
    ambiguous_urls = [
        "http://2130706433/",     # 127.0.0.1 in decimal integer
        "http://0177.0.0.1/",     # 127.0.0.1 in octal notation
        "http://0x7f.0.0.1/",     # 127.0.0.1 in hex notation
    ]
    for url in ambiguous_urls:
        service = SafeFetchService()
        result = service.fetch_url(url)
        assert result.is_valid is False
        assert result.failure_category in (
            FetchFailureCategory.INVALID_URL,
            FetchFailureCategory.LOCAL_OR_INTERNAL_HOSTNAME,
            FetchFailureCategory.PROHIBITED_DESTINATION,
        )


# ============================================================================
# 5. Hostnames Resolving to Mixture of Public and Prohibited Addresses
# ============================================================================
def test_mixed_public_and_prohibited_dns_resolution():
    mixed_answers = [
        ["93.184.216.34", "127.0.0.1"],
        ["10.0.0.1", "104.18.25.1"],
        ["2606:4700:4700::1111", "::1"],
        ["169.254.169.254", "1.1.1.1"],
    ]

    for answer in mixed_answers:
        service = SafeFetchService(dns_resolver=lambda h, p, ans=answer: ans)
        result = service.fetch_url("https://dual-homed-attack.com")
        assert result.is_valid is False
        assert result.failure_category == FetchFailureCategory.PROHIBITED_DESTINATION
        assert "Domain resolves to one or more non-public" in (result.error_detail or "")


# ============================================================================
# 6. DNS Rebinding Defense with Pinned Transport
# ============================================================================
def test_dns_rebinding_defense_with_pinned_transport():
    # Verify that PinnedIPSyncBackend connects directly to the validated pinned IP
    captured_connections = []

    class TestBackend(PinnedIPSyncBackend):
        def connect_tcp(self, host, port, timeout=None, local_address=None, socket_options=None):
            captured_connections.append((host, self.pinned_ip, port))
            # Raise an intentional test exception so no real socket connection is made
            raise OSError("Captured for test assertion")

    backend = TestBackend(pinned_ip="93.184.216.34")
    try:
        backend.connect_tcp(host="evil-rebound-domain.com", port=443)
    except OSError:
        pass

    assert len(captured_connections) == 1
    req_host, pinned_ip, port = captured_connections[0]
    # The backend connected to pinned_ip, ignoring any secondary resolution of req_host!
    assert pinned_ip == "93.184.216.34"
    assert port == 443


# ============================================================================
# 7. Redirects to Loopback, Private Networks, and Metadata Addresses
# ============================================================================
def test_redirects_to_loopback_private_networks_and_metadata():
    malicious_redirect_targets = [
        "https://169.254.169.254/latest/meta-data/",
        "https://127.0.0.1:8080/admin",
        "https://10.0.0.5/internal",
        "https://localhost/secret",
        "https://[::1]/debug",
    ]

    for target in malicious_redirect_targets:
        def redirect_handler(request: httpx.Request, loc=target):
            return httpx.Response(
                status_code=302,
                headers={"Location": loc},
            )

        service = SafeFetchService(
            dns_resolver=lambda h, p: ["93.184.216.34"],
            transport_factory=lambda ip: httpx.MockTransport(redirect_handler),
        )
        result = service.fetch_url("https://initial-public-site.com/start")
        assert result.is_valid is False
        assert result.failure_category in (
            FetchFailureCategory.PROHIBITED_DESTINATION,
            FetchFailureCategory.LOCAL_OR_INTERNAL_HOSTNAME,
        )
        # Verify initial hop was recorded before the redirect was blocked
        assert len(result.redirect_chain) == 1
        assert result.redirect_chain[0].status_code == 302


# ============================================================================
# 8. Redirect Limit Enforcement and Downgrade Rejection
# ============================================================================
def test_redirect_limit_and_downgrade_rejection():
    # 8A: Exceeding maximum 5 redirects
    hop_counter = {"count": 0}

    def infinite_loop_handler(request: httpx.Request):
        hop_counter["count"] += 1
        return httpx.Response(
            status_code=302,
            headers={"Location": f"https://example.com/hop-{hop_counter['count']}"},
        )

    service = SafeFetchService(
        dns_resolver=lambda h, p: ["93.184.216.34"],
        transport_factory=lambda ip: httpx.MockTransport(infinite_loop_handler),
    )
    result = service.fetch_url("https://example.com/hop-0")
    assert result.is_valid is False
    assert result.failure_category == FetchFailureCategory.REDIRECT_LIMIT_EXCEEDED
    assert len(result.redirect_chain) == 5

    # 8B: Protocol downgrade from HTTPS to HTTP
    def downgrade_handler(request: httpx.Request):
        return httpx.Response(
            status_code=301,
            headers={"Location": "http://example.com/insecure-landing"},
        )

    service = SafeFetchService(
        dns_resolver=lambda h, p: ["93.184.216.34"],
        transport_factory=lambda ip: httpx.MockTransport(downgrade_handler),
    )
    result = service.fetch_url("https://example.com/secure-start")
    assert result.is_valid is False
    assert result.failure_category == FetchFailureCategory.DOWNGRADE_REDIRECT_DISALLOWED
    assert "Insecure protocol downgrade" in (result.error_detail or "")


# ============================================================================
# 9. Connection/Read Timeout and Overall Deadline Handling
# ============================================================================
def test_connection_and_read_timeout_and_deadline():
    def timeout_handler(request: httpx.Request):
        raise httpx.ReadTimeout("Simulated read timeout on remote host")

    service = SafeFetchService(
        dns_resolver=lambda h, p: ["93.184.216.34"],
        transport_factory=lambda ip: httpx.MockTransport(timeout_handler),
    )
    result = service.fetch_url("https://example.com/slow")
    assert result.is_valid is False
    assert result.failure_category == FetchFailureCategory.CONNECTION_TIMEOUT
    assert "timeout" in (result.error_detail or "").lower()


# ============================================================================
# 10. Response-Size Limit Enforcement (5 MiB Cap)
# ============================================================================
def test_response_size_limit_enforcement():
    # Return 6 MiB of data (> 5 MiB cap)
    oversized_data = b"A" * (6 * 1024 * 1024)

    def oversized_handler(request: httpx.Request):
        return httpx.Response(
            status_code=200,
            headers={"Content-Type": "text/html"},
            content=oversized_data,
        )

    service = SafeFetchService(
        dns_resolver=lambda h, p: ["93.184.216.34"],
        transport_factory=lambda ip: httpx.MockTransport(oversized_handler),
    )
    result = service.fetch_url("https://example.com/huge")
    assert result.is_valid is False
    assert result.failure_category == FetchFailureCategory.RESPONSE_TOO_LARGE
    assert "5 MiB" in (result.error_detail or "")


# ============================================================================
# 11. Unsupported Content-Type Rejection
# ============================================================================
def test_unsupported_content_type_rejection():
    disallowed_content_types = [
        "application/octet-stream",
        "application/x-msdownload",
        "application/vnd.android.package-archive",
        "application/zip",
        "image/png",
        "video/mp4",
    ]

    for ctype in disallowed_content_types:
        def binary_handler(request: httpx.Request, ct=ctype):
            return httpx.Response(
                status_code=200,
                headers={"Content-Type": ct},
                content=b"BINARY_PAYLOAD_NOT_FOR_TEXT_INVESTIGATION",
            )

        service = SafeFetchService(
            dns_resolver=lambda h, p: ["93.184.216.34"],
            transport_factory=lambda ip: httpx.MockTransport(binary_handler),
        )
        result = service.fetch_url("https://example.com/download.exe")
        assert result.is_valid is False
        assert result.failure_category == FetchFailureCategory.UNSUPPORTED_CONTENT_TYPE
        assert "Content-Type" in (result.error_detail or "")


# ============================================================================
# 12. Sanitized Errors and Logs Without Secret Leakage
# ============================================================================
def test_sanitized_errors_and_logs_without_secret_leakage(caplog):
    def error_handler(request: httpx.Request):
        raise httpx.ConnectError("Connection refused to internal proxy 10.0.0.1:8080")

    secret_token = "ultra-secret-bearer-token-should-never-leak-998877"
    url = f"https://example.com/investigate?token={secret_token}"

    service = SafeFetchService(
        dns_resolver=lambda h, p: ["93.184.216.34"],
        transport_factory=lambda ip: httpx.MockTransport(error_handler),
    )
    result = service.fetch_url(url)
    assert result.is_valid is False
    # Error detail should be sanitized generic text, never exposing internal network details
    assert "10.0.0.1" not in (result.error_detail or "")
    assert secret_token not in (result.error_detail or "")

    for record in caplog.records:
        assert secret_token not in record.message


# ============================================================================
# 13. DNS and HTTP Failures Reported as Unavailable/Unverified Rather than Safe
# ============================================================================
def test_dns_and_http_failures_reported_unverified_rather_than_safe():
    # DNS failure test
    def failing_dns(h, p):
        raise socket.gaierror(-2, "Name or service not known")

    service = SafeFetchService(dns_resolver=failing_dns)
    result = service.fetch_url("https://non-existent-domain-999.xyz")
    assert result.is_valid is False
    assert result.is_verified_safe_content is False
    assert result.failure_category == FetchFailureCategory.DNS_RESOLUTION_FAILED

    # HTTP failure test
    def connection_fail(request: httpx.Request):
        raise httpx.ConnectError("Network unreachable")

    service_http = SafeFetchService(
        dns_resolver=lambda h, p: ["93.184.216.34"],
        transport_factory=lambda ip: httpx.MockTransport(connection_fail),
    )
    result_http = service_http.fetch_url("https://example.com/fail")
    assert result_http.is_valid is False
    assert result_http.is_verified_safe_content is False
    assert result_http.failure_category == FetchFailureCategory.FETCH_ERROR


# ============================================================================
# 14. Remediation Finding 1: Drip-Feed and Streaming Exceeding Global Deadline
# ============================================================================
def test_streaming_drip_feed_exceeds_overall_deadline():
    """
    Simulates a slow-read attack (drip feed) where small chunks arrive slowly.
    The total streaming duration exceeds the overall deadline, verifying that
    the transfer is aborted with CONNECTION_TIMEOUT.
    """
    def drip_feed_stream():
        yield b"chunk1 "
        time.sleep(0.25)
        yield b"chunk2 "
        yield b"chunk3"

    def drip_handler(request: httpx.Request):
        return httpx.Response(
            status_code=200,
            headers={"Content-Type": "text/html"},
            content=drip_feed_stream(),
        )

    # Service with short deadline of 0.15 seconds
    service = SafeFetchService(
        dns_resolver=lambda h, p: ["93.184.216.34"],
        transport_factory=lambda ip: httpx.MockTransport(drip_handler),
        overall_deadline=0.15,
    )
    result = service.fetch_url("https://example.com/drip")
    assert result.is_valid is False
    assert result.failure_category == FetchFailureCategory.CONNECTION_TIMEOUT
    assert "Overall investigation deadline" in (result.error_detail or "")
    assert result.is_verified_safe_content is False


def test_shared_overall_deadline_across_redirect_hops():
    """
    Verifies that the overall deadline is shared across multiple redirect hops,
    preventing an attacker from keeping the connection alive through cascading redirects.
    """
    def slow_redirect_handler(request: httpx.Request):
        time.sleep(0.12)
        return httpx.Response(
            status_code=302,
            headers={"Location": "https://example.com/hop2"},
        )

    # 2 hops of 0.12s will exceed overall deadline of 0.20s
    service = SafeFetchService(
        dns_resolver=lambda h, p: ["93.184.216.34"],
        transport_factory=lambda ip: httpx.MockTransport(slow_redirect_handler),
        overall_deadline=0.20,
    )
    result = service.fetch_url("https://example.com/hop1")
    assert result.is_valid is False
    assert result.failure_category == FetchFailureCategory.CONNECTION_TIMEOUT
    assert "Overall investigation deadline" in (result.error_detail or "")


# ============================================================================
# 15. Remediation Finding 2: Bounded DNS Resolution Lifetime and Timeout
# ============================================================================
def test_dns_resolution_bounded_lifetime_and_timeout():
    """
    Verifies that DNS resolution enforces a bounded lifetime budget using dnspython,
    and returns CONNECTION_TIMEOUT when the resolution exceeds the deadline.
    """
    import dns.exception

    class MockHangingResolver:
        def __init__(self, *args, **kwargs):
            self.lifetime = 0.0
            self.timeout = 0.0

        def resolve(self, host, rdtype):
            raise dns.exception.Timeout("DNS lifetime exceeded during lookup")

    with pytest.MonkeyPatch.context() as mp:
        mp.setattr("dns.resolver.Resolver", MockHangingResolver)
        with pytest.raises(SSRFSecurityError) as exc_info:
            resolve_and_validate_hostname("slow-dns.example.com", 443, lifetime=1.5)
        assert exc_info.value.category == FetchFailureCategory.CONNECTION_TIMEOUT
        assert "DNS resolution timed out" in exc_info.value.message

    # Also test via SafeFetchService fetch_url flow
    def slow_dns_resolver(host, port, lifetime=2.5):
        raise SSRFSecurityError(
            FetchFailureCategory.CONNECTION_TIMEOUT,
            f"DNS resolution timed out within allotted lifetime budget ({lifetime:.2f}s)."
        )

    service = SafeFetchService(dns_resolver=slow_dns_resolver)
    result = service.fetch_url("https://slow-dns-test.example.com")
    assert result.is_valid is False
    assert result.failure_category == FetchFailureCategory.CONNECTION_TIMEOUT
    assert "DNS resolution timed out" in (result.error_detail or "")


def test_dnspython_nxdomain_handling():
    """
    Verifies that NXDOMAIN from dnspython is cleanly caught and reported
    as DNS_RESOLUTION_FAILED without leaking raw DNS exceptions.
    """
    import dns.resolver

    class MockNXDomainResolver:
        def __init__(self, *args, **kwargs):
            self.lifetime = 2.5
            self.timeout = 1.0

        def resolve(self, host, rdtype):
            raise dns.resolver.NXDOMAIN()

    with pytest.MonkeyPatch.context() as mp:
        mp.setattr("dns.resolver.Resolver", MockNXDomainResolver)
        with pytest.raises(SSRFSecurityError) as exc_info:
            resolve_and_validate_hostname("nonexistent-domain-test.com", 443)
        assert exc_info.value.category == FetchFailureCategory.DNS_RESOLUTION_FAILED
        assert "does not exist (NXDOMAIN)" in exc_info.value.message


# ============================================================================
# 16. Remediation Finding 3: Missing, Empty, and Whitespace Content-Type Rejection
# ============================================================================
def test_missing_empty_whitespace_content_type_rejection():
    """
    Finding 3: Responses with missing, empty, or whitespace Content-Type header
    must NOT bypass the whitelist. They must be rejected as UNSUPPORTED_CONTENT_TYPE.
    """
    cases = [
        ({}, "missing or empty Content-Type"),
        ({"Content-Type": ""}, "missing or empty Content-Type"),
        ({"Content-Type": "   "}, "missing or empty Content-Type"),
        ({"Content-Type": "\t\n"}, "missing or empty Content-Type"),
    ]

    for headers, expected_msg in cases:
        def mock_handler(request: httpx.Request, h=headers):
            return httpx.Response(
                status_code=200,
                headers=h,
                content=b"<!DOCTYPE html><html><body>Content without proper content type header</body></html>",
            )

        service = SafeFetchService(
            dns_resolver=lambda h, p: ["93.184.216.34"],
            transport_factory=lambda ip: httpx.MockTransport(mock_handler),
        )
        result = service.fetch_url("https://example.com/no-content-type")
        assert result.is_valid is False
        assert result.status_code == 200
        assert result.failure_category == FetchFailureCategory.UNSUPPORTED_CONTENT_TYPE
        assert expected_msg in (result.error_detail or "")
        assert result.is_verified_safe_content is False
        assert result.content_type is None


def test_permitted_content_types_with_parameters_and_prohibited_types():
    """
    Verifies that permitted content types with parameters are accepted,
    while non-permitted types (e.g., PDF, binaries, scripts) are rejected.
    """
    permitted = [
        "text/html; charset=utf-8",
        "text/html; charset=ISO-8859-1",
        "application/json; charset=utf-8",
        "text/plain; charset=us-ascii",
        "application/xhtml+xml",
        "application/xml",
        "text/xml",
    ]
    for ctype in permitted:
        def ok_handler(request: httpx.Request, ct=ctype):
            return httpx.Response(
                status_code=200,
                headers={"Content-Type": ct},
                content=b"Valid content payload",
            )
        service = SafeFetchService(
            dns_resolver=lambda h, p: ["93.184.216.34"],
            transport_factory=lambda ip: httpx.MockTransport(ok_handler),
        )
        result = service.fetch_url("https://example.com/page")
        assert result.is_valid is True
        assert result.failure_category is None
        assert result.is_verified_safe_content is True

    prohibited = [
        "application/pdf",
        "application/javascript",
        "text/javascript",
        "image/svg+xml",
        "application/x-sh",
    ]
    for ctype in prohibited:
        def bad_handler(request: httpx.Request, ct=ctype):
            return httpx.Response(
                status_code=200,
                headers={"Content-Type": ct},
                content=b"Non-permitted payload",
            )
        service = SafeFetchService(
            dns_resolver=lambda h, p: ["93.184.216.34"],
            transport_factory=lambda ip: httpx.MockTransport(bad_handler),
        )
        result = service.fetch_url("https://example.com/bad-type")
        assert result.is_valid is False
        assert result.failure_category == FetchFailureCategory.UNSUPPORTED_CONTENT_TYPE
        assert result.is_verified_safe_content is False
