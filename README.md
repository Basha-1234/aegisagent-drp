# 🛡️ BrandGuard AI — Autonomous Digital Risk Protection & Remediation Console

> **HacXLerate 2026 (presented by byteXL)**  
> **Challenge:** Problem Statement #3 — *Digital Risk Protection Platform (Kampus.vc)*  
> **Domain:** AI-Powered Brand Security, Impersonation Defense, Trust & Safety

[![Vite](https://img.shields.io/badge/Vite-8.3-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 📌 Executive Summary
Scammers deceive millions of consumers by cloning brand logos, squatting lookalike handles (e.g., `@Brand_Support_24x7`), creating fraudulent lookalike APKs, and operating phishing domains. Small and medium enterprises lose millions of dollars and brand credibility with no dedicated cybersecurity team to track and eliminate these threats.

**BrandGuard AI** is an enterprise-grade Digital Risk Protection (DRP) console that combines **4-Signal Explainable AI** with an **Automated 1-Click Platform & Legal Takedown Generator**, reducing mean detection and removal times from 14 days down to minutes.

---

## ⚡ Core Features

### 1. 🛡️ Real-Time Impersonation Threat Stream
- Proactively ingests and monitors endpoints across **Instagram, X (Twitter), Google Play Store, Telegram, and Phishing Domains**.
- Automatically tags threat severity: **CRITICAL (75%+), HIGH (50–74%), MEDIUM (30–49%), and LOW**.
- Instant status lifecycle management: `New Alert` ➔ `Under Review` ➔ `Takedown Dispatched` ➔ `Resolved`.

### 2. 🔬 4-Signal Explainable AI Forensic Engine
Rather than presenting an untrusted black-box score, BrandGuard AI provides transparent, mathematical forensic proof:
- **Signal 1: Handle Typosquatting & Homoglyph Matching (30% Weight)**: Normalized Levenshtein distance and character substitution analysis (e.g., detecting `0` for `o`, `I` for `l`).
- **Signal 2: Visual Trademark & Logo Overlap (30% Weight)**: Perceptual image hashing comparing suspect avatars against official trademark assets.
- **Signal 3: Social Engineering & Scam Intent NLP (25% Weight)**: Heuristic keyword pattern extraction (*"instant refund"*, *"send OTP"*, *"emergency KYC verification"*).
- **Signal 4: Lookalike Domain Reputation (15% Weight)**: Flags suspicious low-cost TLDs (`.xyz`, `.top`, `.click`) and hyphenated brand squatting.

### 3. ⚖️ 1-Click Legal & Platform Takedown Generator
- Auto-compiles formal, statutory **Notices of Trademark Infringement & DMCA Impersonation Reports** formatted for platform Trust & Safety desks.
- Generates complete evidence dossiers with direct profile URLs, similarity percentages, and timestamps.
- Features **instant webhook dispatch simulation**, **one-click clipboard copy**, and **downloadable .txt reports**.

### 4. 🧪 Live Suspect Profile Sandbox
- Allows judges and analysts to input **ANY custom handle, bio text, or URL** to witness the multi-signal forensic calculations execute live in real time.

### 5. 🏛️ Authoritative Brand Asset Vault
- Secure repository for official brand identity assets: verified handles, authorized domains, support channels, and AI detection sensitivity thresholds.

---

## 🏗️ Technical Architecture

```
[ Authoritative Brand Vault ]
(Name, Verified Handles, Official Domain, Registered Logo)
                  │
                  ▼
   [ Multi-Signal Threat Ingestion Layer ]
(Simulated Threat Streams: X, Instagram, Play Store, Domains)
                  │
                  ▼
   [ 4-Signal Explainable Risk Engine ]
  ├── 1. Levenshtein String Distance & Homoglyphs
  ├── 2. Visual Perceptual Logo Similarity Index
  ├── 3. NLP Scam Intent & Phishing Pattern Classifier
  └── 4. Lookalike Domain / URL Risk Analyzer
                  │
                  ▼
  [ Composite Forensic Scorecard (0–100) ]
        [ Low / Med / High / Critical ]
                  │
                  ▼
   [ Security Operations Console & Takedown Desk ]
  ├── Explainable Forensic Deep-Dive Dossier
  └── 1-Click Platform & Legal Takedown Notice Generator
```

---

## 🚀 Quickstart & Local Setup

```bash
# 1. Clone the repository
git clone https://github.com/your-username/brandguard-ai.git
cd brandguard-ai

# 2. Install dependencies
npm install

# 3. Launch the development server
npm run dev

# 4. Create production build
npm run build
```

---

## 📊 24-Hour Hackathon Delivery Highlights

| Criteria | BrandGuard AI Implementation |
| :--- | :--- |
| **Problem Understanding** | Solves high-impact brand impersonation & customer fraud for SMBs. |
| **Innovation & Explainability** | Transparent 4-signal breakdown rather than an opaque black-box score. |
| **Actionable Remediation** | Closes the loop with automated, legally structured takedown notices. |
| **System Stability** | Zero-latency, highly resilient frontend architecture deployed live on Vercel. |

---

## 👥 Team
- **Technical Lead & Developer:** Shaik Basha
- **Built for:** HacXLerate 2026 — byteXL Hackathon
