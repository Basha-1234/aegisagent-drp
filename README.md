# 🛡️ AegisAgent DRP — Autonomous Digital Risk Protection Platform

> **Challenge:** Problem Statement #3 — *Digital Risk Protection Platform: Social & App Monitoring* (HacXLerate 2026 / Kampus.vc)
> **Domain:** External Digital Risk Protection, Autonomous Threat Hunting, Social & Mobile App Security
> **Repository:** [https://github.com/Basha-1234/aegisagent-drp](https://github.com/Basha-1234/aegisagent-drp)

[![React 19](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Python 3.12](https://img.shields.io/badge/Python-3.12-3776AB?logo=python&logoColor=white)](https://python.org/)
[![SQLite](https://img.shields.io/badge/SQLite-WAL%20Mode-003B57?logo=sqlite&logoColor=white)](https://sqlite.org/)
[![Vitest](https://img.shields.io/badge/Vitest-21%20Passed-10B981?logo=vitest&logoColor=white)](https://vitest.dev/)
[![Pytest](https://img.shields.io/badge/Pytest-21%20Passed-10B981?logo=pytest&logoColor=white)](https://pytest.org/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## 📌 Executive Summary & Problem Context

According to the Federal Trade Commission (FTC) Data Book, consumers and enterprises lost **$1.3 Billion** to business and brand impersonation fraud.

While organizations spend heavily on securing internal firewalls and infrastructure, **over 82% of modern cybercrime occurs outside corporate network perimeters**:
- **Social Media Lookalikes:** Fraudsters register lookalike usernames using Cyrillic/Nordic homoglyphs (`а` for `a`, `ø` for `o`) and clone official branding to intercept customer support queries.
- **Rogue Mobile Apps:** Cloned APK packages distributed across third-party Android portals secretly demand invasive permissions (`READ_SMS`, `SYSTEM_ALERT_WINDOW`) to hijack one-time banking passwords (OTPs).
- **Slow Legacy MTTR:** Traditional vendor solutions rely on manual offshore SOC queues taking **24 to 48 hours** to process abuse reports—by which time victims have already suffered irreversible financial losses.

**AegisAgent DRP** is an autonomous full-stack Digital Risk Protection platform featuring a **FastAPI backend engine** with SQLite persistence and a **React 19 command center**. It continuously ingests candidate profiles and apps, checks them against registered official brand assets, calculates explainable multi-signal risk scores, and generates court-admissible evidentiary JSON dockets and statutory legal takedown notices.

---

## ⚡ Core Full-Stack Capabilities

### 1. 📡 Multi-Signal Threat Radar & Ingestion Feed
- Evaluates candidate profiles, rogue domains, and APK packages across distinct enterprise tenants (**Razorpay Technologies**, **PhonePe UPI**, and **Revolut NeoBank**).
- Standardized **4-Tier Threat Hierarchy**:
  - **Level 4 (Critical):** Invasive Trojan APKs with `READ_SMS`, active credential harvesting portals, high-fidelity visual logo clones.
  - **Level 3 (High):** Squatted handles with deceptive keywords (`_Support_24x7`, `_Fast_Loans`), unverified financial disclaimers.
  - **Level 2 (Medium):** Ambiguous domain registrations, name variations lacking clear malicious intent.
  - **Level 1 (Low / Benign):** Legitimate tech reviews, news commentary, or parodies without brand asset imitation.

### 2. 🛡️ Deterministic Official Asset Exclusion Layer
- **Guaranteed Zero Self-Takedown False Positives:** Every incoming candidate is checked against the brand's verified asset registry:
  - Official domain (e.g. `razorpay.com`)
  - Verified social handles (e.g. `@Razorpay`, `@RazorpaySupport`, `@RazorpayCare`)
  - Official Android package IDs (e.g. `com.razorpay.payments.app`)
- Candidates matching registered brand assets are flagged as `is_official_excluded = True` and safely skipped.

### 3. 🔬 Explainable Algorithmic Detection Engine
- **Normalized Levenshtein & Delimiter Scoring:** Detects underscores, dots, hyphens, and high-risk squatted words (`support`, `refund`, `helpdesk`, `kyc`, `verification`, `claim`).
- **Unicode Homoglyph Analysis:** Identifies cross-alphabet character substitutions (Nordic `ø` replacing `o`, Latin uppercase `I` replacing lowercase `l`).
- **Visual Logo Cosine Matrix:** 144-cell (12x12) pixel delta matrix comparing suspect avatars to trademark brand logos.
- **Rogue APK Manifest & Permission Auditor:** Audits Android manifest files for publisher discrepancies and permission abuse (`android.permission.READ_SMS`, `SYSTEM_ALERT_WINDOW`, `REQUEST_INSTALL_PACKAGES`).
- **Safeguard Rule:** Name similarity alone **never** classifies a candidate as malicious (capped at LOW risk if external indicators are absent). Missing evidence is explicitly logged as `unavailable`, not treated as suspicious.

### 4. ⚖️ Evidentiary Docket Generation & Review Workflow
- **Review Status Management:** Analysts can triage findings between `NEW`, `INVESTIGATING`, `CONFIRMED_THREAT`, `BENIGN_DISMISSED`, and `TAKEDOWN_REQUESTED` with live SQLite persistence.
- **Cryptographic Evidentiary Dockets:** Generates downloadable JSON dockets with SHA-256 integrity hashes, complete forensic signal breakdowns, and audit chains of custody.
- **Pre-Flight Draft Takedowns:** Compiles statutory abuse notifications citing **Rule 3(2)(b) of the Indian IT Rules (2021)** (mandatory 24h removal) and **DMCA Section 512**.

---

## 🛠️ Complete Technology Stack

| Layer | Technologies | Rationale |
| :--- | :--- | :--- |
| **Backend API** | Python 3.12, FastAPI, Pydantic v2 | High-performance async REST API with strict request/response validation |
| **Persistence** | SQLite 3 (WAL mode) | Parameterized relational storage for brands, monitoring runs, and findings |
| **Backend Testing**| Pytest, HTTPX TestClient | 21 backend unit and integration tests covering detection, exclusion, and persistence |
| **Frontend UI** | React 19, Vite 8, Tailwind CSS v4 | Sub-second HMR, modern accessible dark-mode UI with high-contrast badges |
| **Frontend Testing**| Vitest | 21 unit tests covering detection algorithms and the reusable API client |
| **Icons** | Lucide React | Clean, semantic cybersecurity iconography |

---

## 🚀 Windows PowerShell Quickstart

### Prerequisites
- **Node.js** (v18.0.0 or higher) & **npm**
- **Python** (3.11 or 3.12)

### 1. Backend Setup & Startup (PowerShell)

Open a PowerShell terminal in the project root:

```powershell
# Navigate to project directory
cd C:\Users\shaik\.gemini\antigravity\scratch\aegisagent-drp

# Create Python virtual environment
python -m venv .venv

# Activate virtual environment
.\.venv\Scripts\Activate.ps1

# Install backend dependencies
pip install -r backend/requirements.txt

# Run backend test suite (21/21 tests)
pytest backend/tests -v

# Start FastAPI development server on 127.0.0.1:8000
uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```

The backend interactive API docs will be available at:
👉 **http://127.0.0.1:8000/docs**

### 2. Frontend Setup & Startup (PowerShell)

Open a second PowerShell terminal in the project root:

```powershell
# Navigate to project directory
cd C:\Users\shaik\.gemini\antigravity\scratch\aegisagent-drp

# Install Node dependencies
npm install

# Run frontend test suite (21/21 tests)
npm test -- --run

# Start Vite development server
npm run dev
```

The web application will be live at:
👉 **http://localhost:5173**

---

## 🔧 Environment Variables

Configure application settings by copying `.env.example` to `.env`:

```env
# Database file path (stored outside tracked git source)
AEGIS_DB_PATH=data/aegis_drp.db

# Allowed CORS origins (comma-separated)
CORS_ORIGINS=http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173

# Frontend API base URL
VITE_API_BASE_URL=http://localhost:8000
```

---

## 📡 REST API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Service health status, database connection, and API version |
| `GET` | `/api/brands` | List all registered enterprise brand profiles |
| `POST` | `/api/brands` | Register a new enterprise brand with official domain, handles, and apps |
| `GET` | `/api/brands/{brand_id}` | Retrieve brand profile and official asset registry |
| `POST` | `/api/monitoring/social/run` | Execute algorithmic social profile monitoring scan for a brand |
| `POST` | `/api/monitoring/apps/run` | Execute rogue mobile app and APK manifest audit scan |
| `GET` | `/api/findings` | Query detected findings (filterable by `brand_id`, `severity`, `status`) |
| `GET` | `/api/findings/{finding_id}` | Retrieve detailed finding record with forensic evidence breakdown |
| `PATCH`| `/api/findings/{finding_id}` | Update triage review status (`INVESTIGATING`, `CONFIRMED_THREAT`, etc.) |
| `GET` | `/api/reports/{finding_id}/json`| Export court-admissible evidentiary JSON docket with SHA-256 hash |

---

## 🧪 Automated Test Verification

Both the backend and frontend include rigorous test suites to guarantee algorithmic integrity, official asset exclusion, and API reliability:

### Backend Test Results (`pytest backend/tests -v`):
```text
backend/tests/test_brands.py::test_list_seeded_brands PASSED
backend/tests/test_brands.py::test_get_single_brand PASSED
backend/tests/test_brands.py::test_get_nonexistent_brand PASSED
backend/tests/test_brands.py::test_create_new_brand PASSED
backend/tests/test_detection.py::test_official_asset_exclusion_layer PASSED
backend/tests/test_detection.py::test_lookalike_name_detection PASSED
backend/tests/test_detection.py::test_levenshtein_similarity PASSED
backend/tests/test_detection.py::test_app_store_publisher_mismatch PASSED
backend/tests/test_detection.py::test_missing_evidence_is_not_treated_as_suspicious PASSED
backend/tests/test_detection.py::test_name_similarity_alone_does_not_classify_malicious PASSED
backend/tests/test_detection.py::test_explainable_risk_high_severity_when_signals_align PASSED
backend/tests/test_findings.py::test_list_and_filter_findings PASSED
backend/tests/test_findings.py::test_get_single_finding PASSED
backend/tests/test_findings.py::test_update_finding_review_status PASSED
backend/tests/test_health.py::test_health_endpoint PASSED
backend/tests/test_health.py::test_root_endpoint PASSED
backend/tests/test_monitoring.py::test_trigger_social_monitoring PASSED
backend/tests/test_monitoring.py::test_trigger_apps_monitoring PASSED
backend/tests/test_monitoring.py::test_trigger_monitoring_invalid_brand PASSED
backend/tests/test_reports.py::test_generate_json_evidentiary_report PASSED
backend/tests/test_reports.py::test_generate_report_nonexistent_finding PASSED

======================== 21 passed in 0.47s ========================
```

### Frontend Test Results (`npm test -- --run`):
```text
 ✓ src/utils/apiClient.test.js (5 tests)
 ✓ src/utils/detectionEngine.test.js (16 tests)

 Test Files  2 passed (2)
      Tests  21 passed (21)
   Duration  236ms
```

---

## ⚖️ System Limitations & Provenance Notice

In compliance with hackathon evaluation standards, the following architectural boundaries are strictly observed:

1. **Synthetic Demo Fixtures:** Evaluation candidates in Phase 1 are synthetically created test fixtures modeled after real-world recorded scams (Razorpay merchant settlement phishing, PhonePe KYC fraud, and Revolut trojan APKs). The platform clearly badges each record as `Demo Fixture (Synthetic)` and does not claim that live social feeds are being crawled without active API credentials.
2. **Draft Pre-Flight Takedown Packages:** Remediation buttons compile statutory affidavits and structured evidence packages (JSON and PDF drafts). They do not simulate fake "API Confetti Dispatches" or claim successful real-world platform takedowns without authorized external Trust & Safety OAuth connectors.
3. **Demo Authentication:** Role switcher personas (`Security Analyst`, `Legal Counsel`, `Customer Support`, `CISO`) provide convenient role simulation for hackathon demonstrations and are explicitly labeled as `Demo Authentication (Simulated RBAC)`.
4. **Performance Benchmarks:** Header metrics such as `< 2.4 min MTTD` and `96.8% Diff Accuracy` are explicitly labeled as `Demo Benchmark` references.

---

## 👥 Authorship & Acknowledgments
- **Project:** AegisAgent DRP — Autonomous Digital Risk Protection
- **Lead Developer:** Shaik Basha
- **Hackathon:** HacXLerate 2026 (byteXL & Kampus.VC Challenge)
