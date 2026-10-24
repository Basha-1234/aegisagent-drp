"""
AegisAgent DRP V2 — Deterministic URL Comparison Engine

Provides offline, Public Suffix List (PSL)-aware domain and URL comparison
between verified official touchpoints and submitted suspicious URLs.

Key Capabilities:
- Pure offline execution: zero socket, DNS, or HTTP network requests.
- Public Suffix List awareness via tldextract (e.g. example.co.uk vs evil.co.uk).
- RFC-compliant normalization and scheme downgrade detection (HTTPS vs HTTP).
- Subdomain abuse and nested brand label spoofing detection.
- Punycode (IDNA) decoding and visual Unicode homoglyph / typosquatting detection.
- Detection of brand text appearing strictly inside paths/queries vs hostnames.
- Embedded credentials (user:pass@) and non-standard service port detection.
- Deterministic signal synthesis with human-readable explanations.
- Heuristic character similarity ratio (strictly labelled as heuristic, not probability).
- Missing evidence and operational boundary documentation.
"""

import ipaddress
import re
import unicodedata
import urllib.parse
from enum import Enum
from typing import Any, Dict, List, Optional, Set, Tuple

import idna
import tldextract

from backend.app.services.detection import levenshtein_distance


class ComparisonStatus(str, Enum):
    MATCH = "MATCH"
    SUSPICIOUS = "SUSPICIOUS"
    INCONCLUSIVE = "INCONCLUSIVE"


# Initialize tldextract with suffix_list_urls=None to strictly guarantee
# 100% offline execution using the bundled Mozilla Public Suffix List snapshot.
_offline_tld_extractor = tldextract.TLDExtract(suffix_list_urls=None)

STANDARD_SCHEMES: Set[str] = {"http", "https"}
STANDARD_PORTS: Dict[str, int] = {"http": 80, "https": 443}

HOMOGLYPH_CANONICAL_MAP = {
    '0': 'o', '1': 'l', '3': 'e', '5': 's', '8': 'b',
    '@': 'a', 'ø': 'o', 'ö': 'o', 'ó': 'o', 'ò': 'o', 'ô': 'o',
    'ı': 'i', 'ï': 'i', 'í': 'i', 'ì': 'i',
    'é': 'e', 'è': 'e', 'ë': 'e', 'ê': 'e',
    'а': 'a', 'с': 'c', 'е': 'e', 'о': 'o', 'р': 'p', 'ѕ': 's',
    'х': 'x', 'у': 'y', 'і': 'i',
}

COMMON_SQUATTING_WORDS = [
    'login', 'verify', 'verification', 'update', 'secure', 'security',
    'auth', 'portal', 'support', 'help', 'helpdesk', 'account', 'banking',
    'wallet', 'settlement', 'fasttrack', 'claim', 'refund', 'service'
]

DEFAULT_LIMITATIONS = [
    "A matching domain does not guarantee safety (e.g. open redirects, file upload abuse, compromised paths).",
    "A differing domain does not automatically prove malicious intent without corroborating threat evidence.",
    "URL comparison operates strictly on lexical and syntactic structure without DNS resolution, WHOIS/RDAP, or TLS checks.",
    "Heuristic character similarity is a string distance metric, not a mathematical probability of malice."
]


def safe_decode_punycode(domain: str) -> Tuple[str, bool]:
    """
    Decodes punycode labels (xn--) to their Unicode representation.
    Returns (decoded_domain, has_punycode).
    """
    if not domain or not isinstance(domain, str):
        return "", False

    labels = domain.split(".")
    decoded_labels = []
    has_punycode = False

    for label in labels:
        if label.lower().startswith("xn--"):
            has_punycode = True
            try:
                decoded_labels.append(idna.decode(label))
            except Exception:
                try:
                    # Fallback to python standard punycode codec
                    decoded_labels.append(label[4:].encode("ascii").decode("punycode"))
                except Exception:
                    decoded_labels.append(label)
        else:
            decoded_labels.append(label)

    return ".".join(decoded_labels), has_punycode


def safe_encode_punycode(domain: str) -> str:
    """
    Encodes Unicode domain to punycode (ACE / ASCII Compatible Encoding).
    """
    if not domain:
        return ""
    try:
        labels = domain.split(".")
        encoded_labels = []
        for label in labels:
            if any(ord(c) > 127 for c in label):
                try:
                    encoded_labels.append(idna.encode(label).decode("ascii"))
                except Exception:
                    encoded_labels.append(f"xn--{label.encode('punycode').decode('ascii')}")
            else:
                encoded_labels.append(label)
        return ".".join(encoded_labels)
    except Exception:
        return domain


def normalize_input_url(raw_input: Optional[str]) -> Tuple[Optional[str], Optional[urllib.parse.SplitResult], List[str]]:
    """
    Safely parses and normalizes an input URL or domain string.
    Returns (normalized_url, split_result, parse_warnings).
    """
    if not raw_input or not isinstance(raw_input, str):
        return None, None, ["Input is null or not a string."]

    trimmed = raw_input.strip()
    if not trimmed:
        return None, None, ["Input is blank."]

    parse_warnings: List[str] = []

    # If input is a raw domain without scheme, prefix https:// for parsing
    has_explicit_scheme = bool(re.match(r"^[a-zA-Z][a-zA-Z0-9+.-]*://", trimmed))
    target_to_parse = trimmed if has_explicit_scheme else f"https://{trimmed}"

    try:
        parsed = urllib.parse.urlsplit(target_to_parse)
    except Exception as e:
        return None, None, [f"URL parsing failed: {str(e)}"]

    scheme = (parsed.scheme or "https").lower()
    netloc = parsed.netloc

    # Extract userinfo if present
    username = parsed.username
    password = parsed.password
    if username or password or ("@" in netloc.split(":")[0]):
        parse_warnings.append("Embedded authentication credentials detected.")

    raw_host = parsed.hostname or ""
    host_clean = raw_host.lower().strip()

    if not host_clean:
        return None, None, ["No valid hostname found in URL."]

    # Hostname validation: reject spaces, control characters, and illegal URI symbols in hostnames
    illegal_host_chars = {" ", "\t", "\r", "\n", "%", "<", ">", '"', "'", "\\", "^", "`", "{", "}", "|"}
    if any(c in illegal_host_chars for c in host_clean):
        return None, None, ["Hostname contains invalid characters or whitespace."]

    # Normalize IDN / punycode
    decoded_host, _ = safe_decode_punycode(host_clean)
    ascii_host = safe_encode_punycode(decoded_host)

    # Reconstruct normalized URL
    default_port = STANDARD_PORTS.get(scheme)
    port = parsed.port
    port_suffix = f":{port}" if (port and port != default_port) else ""

    norm_netloc = f"{ascii_host}{port_suffix}"
    norm_url = urllib.parse.urlunsplit((
        scheme,
        norm_netloc,
        parsed.path or "/",
        parsed.query,
        ""  # Exclude fragment from outbound normalization
    ))

    return norm_url, parsed, parse_warnings


def extract_registrable_domain(hostname: str) -> Tuple[str, str, str]:
    """
    Extracts (subdomain, registrable_domain, suffix) using tldextract with offline PSL.
    """
    if not hostname:
        return "", "", ""

    # Check if host is an IP literal
    try:
        ipaddress.ip_address(hostname.strip("[]"))
        return "", hostname, ""
    except ValueError:
        pass

    ext = _offline_tld_extractor(hostname)
    reg_domain = f"{ext.domain}.{ext.suffix}" if ext.domain and ext.suffix else (ext.domain or hostname)
    return ext.subdomain or "", reg_domain, ext.suffix or ""


def canonicalize_for_homoglyph_detection(text: str) -> str:
    """
    Canonicalizes lookalike characters and common visual substitutions.
    """
    # Replace uppercase I with lowercase l when comparing sans-serif confusion
    s = text.replace("I", "l").lower()
    s = s.replace("vv", "w").replace("rn", "m").replace("cl", "d")
    out = []
    for ch in s:
        out.append(HOMOGLYPH_CANONICAL_MAP.get(ch, ch))
    return "".join(out)


def compare_urls(
    suspicious_url: str,
    official_url_or_domain: Optional[str] = None,
    brand_name: Optional[str] = None
) -> Dict[str, Any]:
    """
    Compares a submitted suspicious URL against a verified official touchpoint.
    Returns a structured dictionary consistent with AegisAgent DRP schemas.
    """
    signals: List[Dict[str, Any]] = []
    missing_evidence: List[str] = []

    # 1. Official Benchmark Check
    if not official_url_or_domain or not str(official_url_or_domain).strip():
        missing_evidence.append("Authoritative official domain is unconfigured or unavailable.")
        return {
            "status": ComparisonStatus.INCONCLUSIVE.value,
            "normalized_official_url": None,
            "normalized_suspicious_url": suspicious_url,
            "official_hostname": None,
            "suspicious_hostname": None,
            "registrable_domain_comparison": {
                "official_registrable_domain": None,
                "suspicious_registrable_domain": None,
                "is_same_registrable_domain": False,
                "official_subdomain": None,
                "suspicious_subdomain": None,
                "official_suffix": None,
                "suspicious_suffix": None,
            },
            "signals": [
                {
                    "id": "MISSING_OFFICIAL_BENCHMARK",
                    "name": "Missing Verified Official Benchmark",
                    "severity": "INFO",
                    "explanation": "No verified official URL or domain was provided. Legitimacy cannot be established without an authoritative reference point."
                }
            ],
            "heuristic_similarity_ratio": 0,
            "missing_evidence": missing_evidence,
            "limitations": DEFAULT_LIMITATIONS,
            "summary": "Comparison is INCONCLUSIVE: Missing verified official domain benchmark."
        }

    # 2. Normalize Official URL
    norm_official, parsed_official, official_warns = normalize_input_url(official_url_or_domain)
    if not norm_official or not parsed_official or not parsed_official.hostname:
        missing_evidence.append("Provided official domain could not be parsed into a valid hostname.")
        return {
            "status": ComparisonStatus.INCONCLUSIVE.value,
            "normalized_official_url": None,
            "normalized_suspicious_url": suspicious_url,
            "official_hostname": None,
            "suspicious_hostname": None,
            "registrable_domain_comparison": {
                "official_registrable_domain": None,
                "suspicious_registrable_domain": None,
                "is_same_registrable_domain": False,
                "official_subdomain": None,
                "suspicious_subdomain": None,
                "official_suffix": None,
                "suspicious_suffix": None,
            },
            "signals": [
                {
                    "id": "MALFORMED_OFFICIAL_URL",
                    "name": "Malformed Official Domain",
                    "severity": "MEDIUM",
                    "explanation": f"The provided official touchpoint '{official_url_or_domain}' is malformed or invalid."
                }
            ],
            "heuristic_similarity_ratio": 0,
            "missing_evidence": missing_evidence,
            "limitations": DEFAULT_LIMITATIONS,
            "summary": "Comparison is INCONCLUSIVE: Malformed official domain benchmark."
        }

    # 3. Normalize Suspicious URL
    norm_suspicious, parsed_suspicious, suspicious_warns = normalize_input_url(suspicious_url)
    if not norm_suspicious or not parsed_suspicious or not parsed_suspicious.hostname:
        return {
            "status": ComparisonStatus.INCONCLUSIVE.value,
            "normalized_official_url": norm_official,
            "normalized_suspicious_url": None,
            "official_hostname": parsed_official.hostname,
            "suspicious_hostname": None,
            "registrable_domain_comparison": {
                "official_registrable_domain": extract_registrable_domain(parsed_official.hostname)[1],
                "suspicious_registrable_domain": None,
                "is_same_registrable_domain": False,
                "official_subdomain": None,
                "suspicious_subdomain": None,
                "official_suffix": None,
                "suspicious_suffix": None,
            },
            "signals": [
                {
                    "id": "MALFORMED_SUSPICIOUS_URL",
                    "name": "Malformed Suspicious URL",
                    "severity": "HIGH",
                    "explanation": f"The submitted URL '{suspicious_url}' is malformed or has an invalid structure."
                }
            ],
            "heuristic_similarity_ratio": 0,
            "missing_evidence": ["Submitted URL is syntactically invalid."],
            "limitations": DEFAULT_LIMITATIONS,
            "summary": "Comparison is INCONCLUSIVE: Submitted URL is syntactically invalid or unparseable."
        }

    # Extract Hostnames & Registrable Domains
    official_scheme = parsed_official.scheme.lower()
    suspicious_scheme = parsed_suspicious.scheme.lower()

    official_host = parsed_official.hostname.lower()
    suspicious_host = parsed_suspicious.hostname.lower()

    official_sub, official_reg, official_sfx = extract_registrable_domain(official_host)
    suspicious_sub, suspicious_reg, suspicious_sfx = extract_registrable_domain(suspicious_host)

    is_same_reg_domain = (official_reg == suspicious_reg)
    is_exact_host_match = (official_host == suspicious_host)

    # Decode IDN / Punycode representations
    suspicious_unicode_host, has_punycode = safe_decode_punycode(suspicious_host)
    official_unicode_host, _ = safe_decode_punycode(official_host)

    suspicious_reg_unicode, _ = safe_decode_punycode(suspicious_reg)
    official_reg_unicode, _ = safe_decode_punycode(official_reg)

    # 4. Check Scheme Differences
    if official_scheme == "https" and suspicious_scheme == "http":
        signals.append({
            "id": "INSECURE_SCHEME",
            "name": "Insecure HTTP Protocol",
            "severity": "HIGH" if not is_same_reg_domain else "MEDIUM",
            "explanation": "The suspicious URL uses unencrypted HTTP instead of the verified HTTPS standard."
        })
    elif suspicious_scheme not in STANDARD_SCHEMES:
        signals.append({
            "id": "UNSUPPORTED_SCHEME",
            "name": "Non-Standard Protocol Scheme",
            "severity": "HIGH",
            "explanation": f"Protocol scheme '{suspicious_scheme}' is non-standard for web interactions."
        })

    # 5. Check Embedded Credentials & Ports
    if parsed_suspicious.username or parsed_suspicious.password or ("@" in parsed_suspicious.netloc.split(":")[0]):
        signals.append({
            "id": "EMBEDDED_CREDENTIALS",
            "name": "Embedded Authentication Credentials",
            "severity": "CRITICAL",
            "explanation": "URL contains embedded credentials (user:password@), frequently employed in browser phishing obfuscation."
        })

    suspicious_port = parsed_suspicious.port
    default_port = STANDARD_PORTS.get(suspicious_scheme)
    if suspicious_port and suspicious_port != default_port:
        signals.append({
            "id": "UNUSUAL_PORT",
            "name": "Non-Standard Service Port",
            "severity": "MEDIUM",
            "explanation": f"Destination targets non-standard port {suspicious_port} instead of standard web port {default_port}."
        })

    # 6. Check Punycode and Unicode Homoglyphs
    if has_punycode:
        signals.append({
            "id": "PUNYCODE_HOST",
            "name": "Punycode (IDNA) Hostname Detected",
            "severity": "HIGH",
            "explanation": f"Punycode encoded domain detected: '{suspicious_host}' translates to '{suspicious_unicode_host}'."
        })

    # Homoglyph / Confusable Analysis
    official_stem = official_reg_unicode.split(".")[0]
    suspicious_stem = suspicious_reg_unicode.split(".")[0]

    canon_official = canonicalize_for_homoglyph_detection(official_stem)
    canon_suspicious = canonicalize_for_homoglyph_detection(suspicious_stem)

    detected_swaps = []
    for c_orig in suspicious_reg_unicode:
        if c_orig in HOMOGLYPH_CANONICAL_MAP:
            target = HOMOGLYPH_CANONICAL_MAP[c_orig]
            char_info = unicodedata.name(c_orig, "UNKNOWN")
            detected_swaps.append(f"'{c_orig}' ({char_info}) ➔ '{target}'")

    if detected_swaps and not is_same_reg_domain:
        signals.append({
            "id": "LOOKALIKE_HOMOGLYPH",
            "name": "Unicode Homoglyph / Confusable Substitution",
            "severity": "CRITICAL",
            "explanation": f"Detected visual homoglyph character substitutions targeting official brand stem: {', '.join(detected_swaps[:3])}."
        })

    # 7. Subdomain Abuse & Nested Brand Deception
    # Case A: Complete official domain used inside suspicious subdomain (e.g. razorpay.com.attacker.com)
    if not is_same_reg_domain:
        if official_reg in suspicious_sub or official_host in suspicious_sub:
            signals.append({
                "id": "NESTED_SUBDOMAIN_DECEPTION",
                "name": "Nested Official Domain Deception",
                "severity": "CRITICAL",
                "explanation": f"The complete official domain '{official_reg}' is prepended as a deceptive subdomain label under an unrelated domain ('{suspicious_reg}')."
            })
        elif brand_name and brand_name.lower().replace(" ", "") in suspicious_sub.lower():
            signals.append({
                "id": "SUBDOMAIN_BRAND_SQUATTING",
                "name": "Subdomain Brand Squatting",
                "severity": "CRITICAL",
                "explanation": f"The brand name '{brand_name}' appears in the subdomain prefix while the actual registered domain belongs to an unrelated entity ('{suspicious_reg}')."
            })
        elif official_stem in suspicious_sub.lower():
            signals.append({
                "id": "SUBDOMAIN_BRAND_SQUATTING",
                "name": "Subdomain Brand Stem Squatting",
                "severity": "HIGH",
                "explanation": f"Official domain stem '{official_stem}' appears in subdomain '{suspicious_sub}', but the registrable domain is '{suspicious_reg}'."
            })

    # 8. Brand Name / Stem in Path or Query on Unrelated Host
    if not is_same_reg_domain:
        path_query_text = (parsed_suspicious.path + "?" + parsed_suspicious.query).lower()
        brand_clean = (brand_name or "").lower().replace(" ", "")
        if (brand_clean and brand_clean in path_query_text) or (official_stem in path_query_text):
            signals.append({
                "id": "PATH_OR_QUERY_BRAND_REFERENCE",
                "name": "Brand Keyword in Path or Query Parameters",
                "severity": "HIGH",
                "explanation": f"Brand reference appears in URL path or query string on an unrelated host ('{suspicious_host}'). Matching text in URL paths does not establish brand authority."
            })

    # 9. Compute Heuristic Character Similarity Ratio
    sim_data = levenshtein_distance(official_reg, suspicious_reg)
    heuristic_similarity = sim_data["similarity"]

    # 10. Check Typosquatting / Lookalike on Registrable Domain
    if not is_same_reg_domain:
        # Check if canonicalized stems match (e.g. raz0rpay -> razorpay)
        if canon_official == canon_suspicious and canon_official:
            signals.append({
                "id": "TYPOSQUATTING_CANONICAL_MATCH",
                "name": "Canonical Typosquatting Match",
                "severity": "CRITICAL",
                "explanation": f"Registrable domain '{suspicious_reg}' normalizes directly to official brand domain '{official_reg}' under character confusion rules."
            })
        elif heuristic_similarity >= 75 and sim_data["distance"] <= 3:
            signals.append({
                "id": "TYPOSQUATTING_HIGH_SIMILARITY",
                "name": "High Lexical Typosquatting Proximity",
                "severity": "HIGH",
                "explanation": f"Registrable domain '{suspicious_reg}' exhibits {heuristic_similarity}% character similarity (Levenshtein distance {sim_data['distance']}) to '{official_reg}'."
            })

    # 11. Determine Final Comparison Status
    status = ComparisonStatus.SUSPICIOUS

    if is_same_reg_domain:
        if is_exact_host_match:
            status = ComparisonStatus.MATCH
            signals.insert(0, {
                "id": "EXACT_HOSTNAME_MATCH",
                "name": "Exact Hostname Match",
                "severity": "SAFE",
                "explanation": f"Hostname '{suspicious_host}' exactly matches verified official domain '{official_host}'."
            })
        else:
            # Genuine subdomain
            status = ComparisonStatus.MATCH
            signals.insert(0, {
                "id": "GENUINE_SUBDOMAIN",
                "name": "Genuine Official Subdomain",
                "severity": "SAFE",
                "explanation": f"Hostname '{suspicious_host}' is a genuine subdomain of official registrable domain '{official_reg}'."
            })
    else:
        # Registrable domains differ
        signals.append({
            "id": "DIFFERENT_REGISTRABLE_DOMAIN",
            "name": "Different Registrable Domain",
            "severity": "HIGH",
            "explanation": f"Submitted domain '{suspicious_reg}' does not belong to the verified brand domain '{official_reg}'."
        })

    # Synthesize human-readable summary
    if status == ComparisonStatus.MATCH:
        if is_exact_host_match:
            summary = f"MATCH: URL belongs to the verified official hostname '{official_host}'."
        else:
            summary = f"MATCH: URL is hosted on a genuine subdomain ('{suspicious_sub}') of verified domain '{official_reg}'."
        if any(s["id"] == "INSECURE_SCHEME" for s in signals):
            summary += " Warning: Uses unencrypted HTTP protocol."
    else:
        critical_signals = [s["name"] for s in signals if s["severity"] == "CRITICAL"]
        if critical_signals:
            summary = f"SUSPICIOUS: Differing registrable domain with critical deceptive indicators ({', '.join(critical_signals)})."
        else:
            summary = f"SUSPICIOUS: Domain '{suspicious_reg}' differs from verified official domain '{official_reg}' (heuristic similarity: {heuristic_similarity}%)."

    return {
        "status": status.value,
        "normalized_official_url": norm_official,
        "normalized_suspicious_url": norm_suspicious,
        "official_hostname": official_host,
        "suspicious_hostname": suspicious_host,
        "registrable_domain_comparison": {
            "official_registrable_domain": official_reg,
            "suspicious_registrable_domain": suspicious_reg,
            "is_same_registrable_domain": is_same_reg_domain,
            "official_subdomain": official_sub or None,
            "suspicious_subdomain": suspicious_sub or None,
            "official_suffix": official_sfx or None,
            "suspicious_suffix": suspicious_sfx or None,
        },
        "signals": signals,
        "heuristic_similarity_ratio": heuristic_similarity,
        "missing_evidence": missing_evidence,
        "limitations": DEFAULT_LIMITATIONS,
        "summary": summary
    }
