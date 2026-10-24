"""
AegisAgent DRP V2 — Stage 2A: Safe URL Fetching and SSRF Protection Service

Defends against Server-Side Request Forgery (SSRF), DNS rebinding / TOCTOU,
unsafe redirect chains, protocol downgrades, and resource exhaustion attacks.
"""

import ipaddress
import logging
import re
import socket
import time
import typing
import urllib.parse
from enum import Enum
from typing import Callable, Dict, List, Optional, Set, Tuple

import httpcore
import httpcore._backends.sync
import httpx
from httpx._transports.default import ResponseStream, map_httpcore_exceptions
import idna

try:
    import dns.resolver
    import dns.exception
    HAS_DNSPYTHON = True
except ImportError:
    HAS_DNSPYTHON = False

logger = logging.getLogger("aegis.safe_fetch")


class FetchFailureCategory(str, Enum):
    INVALID_URL = "INVALID_URL"
    UNSUPPORTED_SCHEME = "UNSUPPORTED_SCHEME"
    EMBEDDED_CREDENTIALS = "EMBEDDED_CREDENTIALS"
    DISALLOWED_PORT = "DISALLOWED_PORT"
    LOCAL_OR_INTERNAL_HOSTNAME = "LOCAL_OR_INTERNAL_HOSTNAME"
    PROHIBITED_DESTINATION = "PROHIBITED_DESTINATION"
    DNS_RESOLUTION_FAILED = "DNS_RESOLUTION_FAILED"
    DOWNGRADE_REDIRECT_DISALLOWED = "DOWNGRADE_REDIRECT_DISALLOWED"
    REDIRECT_LIMIT_EXCEEDED = "REDIRECT_LIMIT_EXCEEDED"
    CONNECTION_TIMEOUT = "CONNECTION_TIMEOUT"
    RESPONSE_TOO_LARGE = "RESPONSE_TOO_LARGE"
    UNSUPPORTED_CONTENT_TYPE = "UNSUPPORTED_CONTENT_TYPE"
    FETCH_ERROR = "FETCH_ERROR"


class SSRFSecurityError(Exception):
    """Base exception for all safe URL fetching and SSRF policy violations."""

    def __init__(self, category: FetchFailureCategory, message: str):
        super().__init__(message)
        self.category = category
        self.message = message


class SafeFetchHop:
    def __init__(self, hop_number: int, url: str, status_code: int, resolved_ip: str):
        self.hop_number = hop_number
        self.url = url
        self.status_code = status_code
        self.resolved_ip = resolved_ip

    def to_dict(self) -> Dict[str, object]:
        return {
            "hop_number": self.hop_number,
            "url": self.url,
            "status_code": self.status_code,
            "resolved_ip": self.resolved_ip,
        }


class SafeFetchResult:
    def __init__(
        self,
        submitted_url: str,
        is_valid: bool,
        final_url: Optional[str] = None,
        status_code: Optional[int] = None,
        content_type: Optional[str] = None,
        content_length_bytes: int = 0,
        body_sample: Optional[str] = None,
        redirect_chain: Optional[List[SafeFetchHop]] = None,
        failure_category: Optional[FetchFailureCategory] = None,
        error_detail: Optional[str] = None,
        is_verified_safe_content: bool = False,
    ):
        self.submitted_url = submitted_url
        self.is_valid = is_valid
        self.final_url = final_url
        self.status_code = status_code
        self.content_type = content_type
        self.content_length_bytes = content_length_bytes
        self.body_sample = body_sample
        self.redirect_chain = redirect_chain or []
        self.failure_category = failure_category
        self.error_detail = error_detail
        self.is_verified_safe_content = is_verified_safe_content

    def to_dict(self) -> Dict[str, object]:
        return {
            "submitted_url": self.submitted_url,
            "is_valid": self.is_valid,
            "final_url": self.final_url,
            "status_code": self.status_code,
            "content_type": self.content_type,
            "content_length_bytes": self.content_length_bytes,
            "body_sample": self.body_sample,
            "redirect_chain": [h.to_dict() for h in self.redirect_chain],
            "failure_category": self.failure_category.value if self.failure_category else None,
            "error_detail": self.error_detail,
            "is_verified_safe_content": self.is_verified_safe_content,
        }


# Security Policy Configurations
ALLOWED_SCHEMES: Set[str] = {"http", "https"}
ALLOWED_PORTS: Set[int] = {80, 443, 8080, 8443}
MAX_REDIRECTS: int = 5
MAX_BODY_BYTES: int = 5 * 1024 * 1024  # 5 MiB
MAX_SAMPLE_CHARS: int = 4096

CONNECT_TIMEOUT: float = 3.0  # seconds
READ_TIMEOUT: float = 5.0  # seconds
OVERALL_DEADLINE: float = 10.0  # seconds
DNS_DEFAULT_LIFETIME: float = 2.5  # seconds max for DNS resolution

DISALLOWED_METADATA_IPS: Set[str] = {
    "169.254.169.254",  # AWS/Azure/GCP/OpenStack instance metadata
    "169.254.170.2",    # AWS ECS/EKS task metadata
    "100.100.100.200",  # Alibaba Cloud metadata
}

DISALLOWED_HOST_SUFFIXES: Tuple[str, ...] = (
    ".localhost",
    ".local",
    ".internal",
    ".lan",
    ".localdomain",
    ".home",
    ".corp",
    ".test",
    ".example",
    ".invalid",
)

PERMITTED_CONTENT_TYPES: Set[str] = {
    "text/html",
    "text/plain",
    "application/xhtml+xml",
    "application/json",
    "text/xml",
    "application/xml",
}


def is_prohibited_ip(ip: ipaddress.IPv4Address | ipaddress.IPv6Address) -> bool:
    """
    Evaluates whether an IP address is private, loopback, link-local, multicast,
    reserved, unspecified, documentation, or cloud metadata.
    """
    # Unpack IPv4-mapped IPv6 address (e.g., ::ffff:127.0.0.1 -> 127.0.0.1)
    if isinstance(ip, ipaddress.IPv6Address) and ip.ipv4_mapped:
        ip = ip.ipv4_mapped

    str_ip = str(ip)
    if str_ip in DISALLOWED_METADATA_IPS:
        return True

    # Check standard Python ipaddress classification
    if (
        not ip.is_global
        or ip.is_private
        or ip.is_loopback
        or ip.is_link_local
        or ip.is_multicast
        or ip.is_reserved
        or ip.is_unspecified
    ):
        return True

    # Shared address space / CGNAT (100.64.0.0/10)
    cgnat_net = ipaddress.ip_network("100.64.0.0/10")
    if isinstance(ip, ipaddress.IPv4Address) and ip in cgnat_net:
        return True

    return False


def validate_and_normalize_url(url: str) -> Tuple[str, str, int]:
    """
    Validates scheme, credentials, ports, and formats.
    Returns (normalized_url, hostname, port).
    """
    if not url or not isinstance(url, str):
        raise SSRFSecurityError(FetchFailureCategory.INVALID_URL, "URL must be a non-empty string.")

    trimmed = url.strip()
    if not trimmed:
        raise SSRFSecurityError(FetchFailureCategory.INVALID_URL, "URL cannot be blank.")

    try:
        parsed = urllib.parse.urlsplit(trimmed)
    except Exception:
        raise SSRFSecurityError(FetchFailureCategory.INVALID_URL, "Malformed URL structure.")

    # 1. Scheme validation
    scheme = parsed.scheme.lower()
    if not scheme:
        raise SSRFSecurityError(FetchFailureCategory.UNSUPPORTED_SCHEME, "URL must include an absolute scheme.")
    if scheme not in ALLOWED_SCHEMES:
        raise SSRFSecurityError(
            FetchFailureCategory.UNSUPPORTED_SCHEME,
            f"Unsupported protocol scheme '{scheme}'. Only HTTP and HTTPS are permitted."
        )

    # 2. Embedded credentials rejection
    if parsed.username or parsed.password or ("@" in parsed.netloc.split(":")[0]):
        raise SSRFSecurityError(
            FetchFailureCategory.EMBEDDED_CREDENTIALS,
            "URLs containing embedded authentication credentials (username:password@) are prohibited."
        )

    # 3. Hostname presence and format
    raw_host = parsed.hostname
    if not raw_host:
        raise SSRFSecurityError(FetchFailureCategory.INVALID_URL, "URL hostname is missing or malformed.")

    host_lower = raw_host.lower()

    # Reject localhost or internal host suffixes
    if host_lower == "localhost" or any(host_lower.endswith(suffix) for suffix in DISALLOWED_HOST_SUFFIXES):
        raise SSRFSecurityError(
            FetchFailureCategory.LOCAL_OR_INTERNAL_HOSTNAME,
            "Localhost and internal enterprise domain names are prohibited."
        )

    # Reject ambiguous integer, octal, or hex IP representations
    if host_lower.isdigit():
        raise SSRFSecurityError(
            FetchFailureCategory.INVALID_URL,
            "Ambiguous decimal integer IP address representation is prohibited."
        )

    parts = host_lower.split(".")
    if len(parts) == 4 and all(p.isdigit() for p in parts):
        for p in parts:
            if len(p) > 1 and p.startswith("0"):
                raise SSRFSecurityError(
                    FetchFailureCategory.INVALID_URL,
                    "Ambiguous octal IP address representation with leading zeros is prohibited."
                )
    if any(p.startswith("0x") for p in parts):
        raise SSRFSecurityError(
            FetchFailureCategory.INVALID_URL,
            "Ambiguous hexadecimal IP address notation is prohibited."
        )

    # Reject single-label internal hosts without dots (unless it's an IPv6 literal)
    if "." not in host_lower and not host_lower.startswith("[") and ":" not in host_lower:
        raise SSRFSecurityError(
            FetchFailureCategory.LOCAL_OR_INTERNAL_HOSTNAME,
            "Single-label internal network hostnames are prohibited."
        )

    # Normalize IDN via punycode / idna
    try:
        # Strip square brackets for IPv6
        clean_host_for_idna = host_lower[1:-1] if (host_lower.startswith("[") and host_lower.endswith("]")) else host_lower
        if ":" not in clean_host_for_idna:
            ascii_host = idna.encode(clean_host_for_idna).decode("ascii")
        else:
            ascii_host = clean_host_for_idna
    except Exception:
        raise SSRFSecurityError(
            FetchFailureCategory.INVALID_URL,
            "Malformed or invalid internationalized domain name."
        )

    # 4. Port validation
    default_port = 443 if scheme == "https" else 80
    port = parsed.port if parsed.port is not None else default_port

    if port not in ALLOWED_PORTS:
        raise SSRFSecurityError(
            FetchFailureCategory.DISALLOWED_PORT,
            f"Port {port} is outside explicitly permitted HTTP/HTTPS service ports ({sorted(ALLOWED_PORTS)})."
        )

    # Reconstruct normalized URL
    netloc = ascii_host
    if parsed.port and parsed.port != default_port:
        netloc = f"{ascii_host}:{parsed.port}"

    normalized_url = urllib.parse.urlunsplit((
        scheme,
        netloc,
        parsed.path or "/",
        parsed.query,
        ""  # Exclude fragment from outbound requests
    ))

    return normalized_url, ascii_host, port


def resolve_and_validate_hostname(
    host: str,
    port: int,
    dns_resolver: Optional[Callable[..., List[str]]] = None,
    lifetime: float = DNS_DEFAULT_LIFETIME,
) -> List[str]:
    """
    Resolves hostname to IP addresses and validates EVERY resolved address.
    If ANY resolved IP is prohibited (e.g. mixture of public and private),
    the entire domain is rejected.
    Enforces a strict DNS resolution lifetime and per-query timeout using dnspython
    to eliminate thread starvation, hanging OS calls, and slow DNS attacks.
    """
    # Check if host is already an IP literal
    clean_ip_host = host[1:-1] if (host.startswith("[") and host.endswith("]")) else host
    try:
        ip_obj = ipaddress.ip_address(clean_ip_host)
        if is_prohibited_ip(ip_obj):
            raise SSRFSecurityError(
                FetchFailureCategory.PROHIBITED_DESTINATION,
                "Destination IP address is non-public or prohibited."
            )
        return [str(ip_obj)]
    except ValueError:
        pass

    # Resolve via custom resolver or dnspython
    if dns_resolver:
        try:
            try:
                resolved_ips = dns_resolver(host, port, lifetime=lifetime)
            except TypeError:
                resolved_ips = dns_resolver(host, port)
        except SSRFSecurityError:
            raise
        except Exception:
            raise SSRFSecurityError(
                FetchFailureCategory.DNS_RESOLUTION_FAILED,
                "DNS resolution failed for the submitted domain."
            )
    else:
        if HAS_DNSPYTHON:
            try:
                resolver = dns.resolver.Resolver()
                effective_lifetime = max(0.1, lifetime)
                resolver.lifetime = effective_lifetime
                resolver.timeout = max(0.1, min(1.0, effective_lifetime))

                resolved_ips: List[str] = []
                # Query A records (IPv4)
                try:
                    answers_a = resolver.resolve(host, "A")
                    for rdata in answers_a:
                        resolved_ips.append(str(rdata.address))
                except dns.resolver.NXDOMAIN:
                    raise SSRFSecurityError(
                        FetchFailureCategory.DNS_RESOLUTION_FAILED,
                        f"Domain '{host}' does not exist (NXDOMAIN)."
                    )
                except (dns.resolver.NoAnswer, dns.resolver.NoNameservers):
                    pass
                except dns.exception.Timeout:
                    raise SSRFSecurityError(
                        FetchFailureCategory.CONNECTION_TIMEOUT,
                        f"DNS resolution timed out within allotted lifetime budget ({lifetime:.2f}s).",
                    )
                except Exception:
                    pass

                # Query AAAA records (IPv6)
                try:
                    answers_aaaa = resolver.resolve(host, "AAAA")
                    for rdata in answers_aaaa:
                        resolved_ips.append(str(rdata.address))
                except (dns.resolver.NoAnswer, dns.resolver.NXDOMAIN, dns.resolver.NoNameservers):
                    pass
                except dns.exception.Timeout:
                    if not resolved_ips:
                        raise SSRFSecurityError(
                            FetchFailureCategory.CONNECTION_TIMEOUT,
                            f"DNS resolution timed out within allotted lifetime budget ({lifetime:.2f}s).",
                        )
                except Exception:
                    pass

                resolved_ips = list(dict.fromkeys(resolved_ips))
            except SSRFSecurityError:
                raise
            except dns.exception.Timeout:
                raise SSRFSecurityError(
                    FetchFailureCategory.CONNECTION_TIMEOUT,
                    f"DNS resolution timed out within allotted lifetime budget ({lifetime:.2f}s).",
                )
            except Exception:
                raise SSRFSecurityError(
                    FetchFailureCategory.DNS_RESOLUTION_FAILED,
                    "DNS resolution failed for the submitted domain.",
                )
        else:
            try:
                addr_info = socket.getaddrinfo(host, port, proto=socket.IPPROTO_TCP)
                resolved_ips = list(dict.fromkeys(r[4][0] for r in addr_info))
            except Exception:
                raise SSRFSecurityError(
                    FetchFailureCategory.DNS_RESOLUTION_FAILED,
                    "DNS resolution failed for the submitted domain.",
                )

    if not resolved_ips:
        raise SSRFSecurityError(
            FetchFailureCategory.DNS_RESOLUTION_FAILED,
            "No IP addresses resolved for domain."
        )

    # Validate EVERY resolved IP address
    for ip_str in resolved_ips:
        try:
            ip_obj = ipaddress.ip_address(ip_str)
        except ValueError:
            raise SSRFSecurityError(
                FetchFailureCategory.PROHIBITED_DESTINATION,
                "Resolved IP address is malformed."
            )
        if is_prohibited_ip(ip_obj):
            raise SSRFSecurityError(
                FetchFailureCategory.PROHIBITED_DESTINATION,
                "Domain resolves to one or more non-public, internal, or prohibited network addresses."
            )

    return resolved_ips


# Safe Pinned Transport Strategy (Eliminates DNS Rebinding / TOCTOU)
class PinnedIPSyncBackend(httpcore._backends.sync.SyncBackend):
    """
    Custom HTTPCore NetworkBackend that binds TCP connections directly to a pre-validated IP.
    This guarantees that the underlying socket cannot perform a secondary DNS lookup
    that could rebind to an internal address.
    """

    def __init__(self, pinned_ip: str):
        super().__init__()
        self.pinned_ip = pinned_ip

    def connect_tcp(
        self,
        host: str,
        port: int,
        timeout: Optional[float] = None,
        local_address: Optional[str] = None,
        socket_options: Optional[typing.Iterable[httpcore._backends.sync.SOCKET_OPTION]] = None,
    ) -> httpcore._backends.sync.NetworkStream:
        return super().connect_tcp(
            host=self.pinned_ip,
            port=port,
            timeout=timeout,
            local_address=local_address,
            socket_options=socket_options,
        )


class PinnedIPTransport(httpx.BaseTransport):
    """
    HTTPX Transport that routes connections through PinnedIPSyncBackend,
    while preserving original hostname in TLS SNI (server_hostname) and HTTP Host headers.
    """

    def __init__(self, pinned_ip: str, verify: bool = True):
        super().__init__()
        self.pinned_ip = pinned_ip
        ssl_context = httpx.create_ssl_context(verify=verify)
        self._backend = PinnedIPSyncBackend(pinned_ip)
        self._pool = httpcore.ConnectionPool(
            ssl_context=ssl_context,
            network_backend=self._backend,
            http1=True,
            http2=False,
            retries=0,
        )

    def handle_request(self, request: httpx.Request) -> httpx.Response:
        req = httpcore.Request(
            method=request.method,
            url=httpcore.URL(
                scheme=request.url.raw_scheme,
                host=request.url.raw_host,
                port=request.url.port,
                target=request.url.raw_path,
            ),
            headers=request.headers.raw,
            content=request.stream,
            extensions=request.extensions,
        )
        with map_httpcore_exceptions():
            resp = self._pool.handle_request(req)

        return httpx.Response(
            status_code=resp.status,
            headers=resp.headers,
            stream=ResponseStream(resp.stream),
            extensions=resp.extensions,
        )

    def close(self) -> None:
        self._pool.close()


class SafeFetchService:
    """
    Orchestrates SSRF-safe HTTP/HTTPS URL investigations.
    Enforces manual redirect inspection, protocol downgrade guards,
    DNS rebinding pinning, streaming response size capping, and content-type verification.
    """

    def __init__(
        self,
        dns_resolver: Optional[Callable[..., List[str]]] = None,
        transport_factory: Optional[Callable[[str], httpx.BaseTransport]] = None,
        user_agent: str = "AegisAgent-DRP-Radar/2.0 (+https://aegisagent.local/bot)",
        overall_deadline: float = OVERALL_DEADLINE,
        dns_lifetime: float = DNS_DEFAULT_LIFETIME,
    ):
        self.dns_resolver = dns_resolver
        self.transport_factory = transport_factory
        self.user_agent = user_agent
        self.overall_deadline = overall_deadline
        self.dns_lifetime = dns_lifetime

    def fetch_url(self, raw_url: str) -> SafeFetchResult:
        """
        Safely investigates the submitted URL with full SSRF and resource protection.
        Returns a structured SafeFetchResult.
        """
        # Step 1: Initial URL syntax validation
        try:
            current_url, host, port = validate_and_normalize_url(raw_url)
        except SSRFSecurityError as err:
            return SafeFetchResult(
                submitted_url=raw_url,
                is_valid=False,
                failure_category=err.category,
                error_detail=err.message,
            )

        redirect_chain: List[SafeFetchHop] = []
        previous_url: Optional[str] = None
        start_time = time.monotonic()
        deadline_timestamp = start_time + self.overall_deadline

        # Step 2: Investigation & Redirect Loop
        for hop in range(MAX_REDIRECTS + 1):
            now = time.monotonic()
            if now >= deadline_timestamp:
                return SafeFetchResult(
                    submitted_url=raw_url,
                    is_valid=False,
                    final_url=current_url,
                    redirect_chain=redirect_chain,
                    failure_category=FetchFailureCategory.CONNECTION_TIMEOUT,
                    error_detail=f"Overall investigation deadline ({self.overall_deadline:.1f}s) exceeded.",
                )
            remaining_time = deadline_timestamp - now

            # Re-validate destination on each hop
            try:
                current_url, host, port = validate_and_normalize_url(current_url)
            except SSRFSecurityError as err:
                return SafeFetchResult(
                    submitted_url=raw_url,
                    is_valid=False,
                    final_url=current_url,
                    redirect_chain=redirect_chain,
                    failure_category=err.category,
                    error_detail=err.message,
                )

            # HTTPS-to-HTTP downgrade rejection
            if previous_url and previous_url.startswith("https://") and current_url.startswith("http://"):
                return SafeFetchResult(
                    submitted_url=raw_url,
                    is_valid=False,
                    final_url=current_url,
                    redirect_chain=redirect_chain,
                    failure_category=FetchFailureCategory.DOWNGRADE_REDIRECT_DISALLOWED,
                    error_detail="Insecure protocol downgrade from HTTPS to HTTP is prohibited.",
                )

            # Resolve DNS and validate every IP address within bounded lifetime
            dns_budget = max(0.1, min(self.dns_lifetime, remaining_time))
            try:
                resolved_ips = resolve_and_validate_hostname(
                    host, port, self.dns_resolver, lifetime=dns_budget
                )
            except SSRFSecurityError as err:
                return SafeFetchResult(
                    submitted_url=raw_url,
                    is_valid=False,
                    final_url=current_url,
                    redirect_chain=redirect_chain,
                    failure_category=err.category,
                    error_detail=err.message,
                )

            now = time.monotonic()
            if now >= deadline_timestamp:
                return SafeFetchResult(
                    submitted_url=raw_url,
                    is_valid=False,
                    final_url=current_url,
                    redirect_chain=redirect_chain,
                    failure_category=FetchFailureCategory.CONNECTION_TIMEOUT,
                    error_detail=f"Overall investigation deadline ({self.overall_deadline:.1f}s) exceeded.",
                )
            remaining_time = deadline_timestamp - now

            pinned_ip = resolved_ips[0]

            # Construct safe pinned transport
            if self.transport_factory:
                transport = self.transport_factory(pinned_ip)
            else:
                transport = PinnedIPTransport(pinned_ip)

            timeout = httpx.Timeout(
                connect=min(CONNECT_TIMEOUT, remaining_time),
                read=min(READ_TIMEOUT, remaining_time),
                write=min(READ_TIMEOUT, remaining_time),
                pool=min(CONNECT_TIMEOUT, remaining_time),
            )

            # Execute single hop with automatic redirects disabled
            try:
                with httpx.Client(transport=transport, follow_redirects=False, timeout=timeout) as client:
                    req_headers = {
                        "User-Agent": self.user_agent,
                        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,text/plain;q=0.8,*/*;q=0.5",
                        "Accept-Language": "en-US,en;q=0.9",
                    }
                    with client.stream("GET", current_url, headers=req_headers) as resp:
                        status_code = resp.status_code

                        # Check for redirect status
                        if status_code in (301, 302, 303, 307, 308):
                            if hop >= MAX_REDIRECTS:
                                resp.close()
                                return SafeFetchResult(
                                    submitted_url=raw_url,
                                    is_valid=False,
                                    final_url=current_url,
                                    redirect_chain=redirect_chain,
                                    failure_category=FetchFailureCategory.REDIRECT_LIMIT_EXCEEDED,
                                    error_detail=f"Exceeded maximum permitted redirect limit of {MAX_REDIRECTS} hops.",
                                )

                            location = resp.headers.get("location")
                            if not location:
                                resp.close()
                                return SafeFetchResult(
                                    submitted_url=raw_url,
                                    is_valid=False,
                                    final_url=current_url,
                                    redirect_chain=redirect_chain,
                                    failure_category=FetchFailureCategory.FETCH_ERROR,
                                    error_detail="Redirect response missing Location header.",
                                )

                            # Resolve relative redirect URLs against current hop URL
                            next_url = urllib.parse.urljoin(current_url, location)

                            redirect_chain.append(SafeFetchHop(
                                hop_number=hop + 1,
                                url=current_url,
                                status_code=status_code,
                                resolved_ip=pinned_ip,
                            ))

                            previous_url = current_url
                            current_url = next_url
                            continue

                        # Non-redirect response reached:
                        # Finding 3: Reject missing, empty, whitespace-only, or unpermitted Content-Type
                        content_type_raw = resp.headers.get("content-type")
                        if not content_type_raw or not content_type_raw.strip():
                            resp.close()
                            return SafeFetchResult(
                                submitted_url=raw_url,
                                is_valid=False,
                                final_url=current_url,
                                status_code=status_code,
                                content_type=None,
                                redirect_chain=redirect_chain,
                                failure_category=FetchFailureCategory.UNSUPPORTED_CONTENT_TYPE,
                                error_detail="Response has missing or empty Content-Type header. Content cannot be verified safe.",
                            )

                        content_type_clean = content_type_raw.split(";")[0].strip().lower()
                        if content_type_clean not in PERMITTED_CONTENT_TYPES:
                            resp.close()
                            return SafeFetchResult(
                                submitted_url=raw_url,
                                is_valid=False,
                                final_url=current_url,
                                status_code=status_code,
                                content_type=content_type_raw,
                                redirect_chain=redirect_chain,
                                failure_category=FetchFailureCategory.UNSUPPORTED_CONTENT_TYPE,
                                error_detail=f"Content-Type '{content_type_clean}' is not permitted for investigation.",
                            )

                        # Finding 1: Stream body with strict 5 MiB size cap AND deadline check per chunk
                        body_chunks: List[bytes] = []
                        total_bytes = 0
                        for chunk in resp.iter_bytes(chunk_size=8192):
                            if time.monotonic() > deadline_timestamp:
                                resp.close()
                                return SafeFetchResult(
                                    submitted_url=raw_url,
                                    is_valid=False,
                                    final_url=current_url,
                                    status_code=status_code,
                                    content_type=content_type_raw,
                                    content_length_bytes=total_bytes,
                                    redirect_chain=redirect_chain,
                                    failure_category=FetchFailureCategory.CONNECTION_TIMEOUT,
                                    error_detail=f"Overall investigation deadline ({self.overall_deadline:.1f}s) exceeded during response transfer.",
                                )

                            total_bytes += len(chunk)
                            if total_bytes > MAX_BODY_BYTES:
                                resp.close()
                                return SafeFetchResult(
                                    submitted_url=raw_url,
                                    is_valid=False,
                                    final_url=current_url,
                                    status_code=status_code,
                                    content_type=content_type_raw,
                                    content_length_bytes=total_bytes,
                                    redirect_chain=redirect_chain,
                                    failure_category=FetchFailureCategory.RESPONSE_TOO_LARGE,
                                    error_detail=f"Response body exceeded maximum limit of {MAX_BODY_BYTES // (1024 * 1024)} MiB.",
                                )
                            body_chunks.append(chunk)

                        full_body = b"".join(body_chunks)
                        sample_text = full_body[:MAX_SAMPLE_CHARS].decode("utf-8", errors="replace")

                        return SafeFetchResult(
                            submitted_url=raw_url,
                            is_valid=True,
                            final_url=current_url,
                            status_code=status_code,
                            content_type=content_type_raw,
                            content_length_bytes=len(full_body),
                            body_sample=sample_text,
                            redirect_chain=redirect_chain,
                            is_verified_safe_content=True,
                        )

            except httpx.TimeoutException:
                return SafeFetchResult(
                    submitted_url=raw_url,
                    is_valid=False,
                    final_url=current_url,
                    redirect_chain=redirect_chain,
                    failure_category=FetchFailureCategory.CONNECTION_TIMEOUT,
                    error_detail="Connection or read timeout occurred while contacting host.",
                )
            except Exception as e:
                # Sanitize error output: never disclose internal network topologies or raw stack traces
                return SafeFetchResult(
                    submitted_url=raw_url,
                    is_valid=False,
                    final_url=current_url,
                    redirect_chain=redirect_chain,
                    failure_category=FetchFailureCategory.FETCH_ERROR,
                    error_detail="An error occurred while establishing a secure HTTP connection to the destination.",
                )

        return SafeFetchResult(
            submitted_url=raw_url,
            is_valid=False,
            final_url=current_url,
            redirect_chain=redirect_chain,
            failure_category=FetchFailureCategory.FETCH_ERROR,
            error_detail="Investigation loop terminated unexpectedly.",
        )
