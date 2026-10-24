import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { BRANDS, INITIAL_THREATS } from '../data/mockData';
import { api } from '../utils/apiClient';
import { normalizeFinding } from '../utils/normalizeFinding';
import {
  isOfficialAsset,
  calculateExplainableRisk
} from '../utils/detectionEngine';
import {
  Search,
  ShieldCheck,
  HelpCircle,
  Check,
  AlertTriangle,
  Copy,
  ExternalLink,
  RefreshCw,
  Smartphone,
  Globe,
  AtSign,
  Loader2,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  Info,
  Building2,
  CheckCircle2,
  XCircle,
  FileText,
  Radio,
  LayoutGrid,
  ChevronRight,
  Flame,
  Scale,
  Zap,
  Clock,
  Filter
} from 'lucide-react';

export default function SupportDashboard() {
  const { user, activeBrandId, setActiveBrandId, loginAsRole } = useAuth();
  const { isDark } = useTheme();

  // Active brand profile
  const currentBrand = BRANDS.find(b => b.id === activeBrandId) || BRANDS[0];

  // Active module toggle state (Defaults to verifier)
  // Options: 'verifier' | 'registry' | 'scripts' | 'radar' | 'all'
  const [activeModule, setActiveModule] = useState('verifier');

  // Backend findings state for dynamic cross-dashboard sync
  const [backendFindings, setBackendFindings] = useState(null);
  const [isLoadingFindings, setIsLoadingFindings] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      setIsLoadingFindings(true);
      try {
        const findings = await api.getFindings({ brandId: currentBrand.id });
        if (isMounted) setBackendFindings(findings);
      } catch (err) {
        if (isMounted) setBackendFindings(null);
      } finally {
        if (isMounted) setIsLoadingFindings(false);
      }
    }
    load();
    return () => { isMounted = false; };
  }, [currentBrand.id]);

  // Brand threats for frontline lookup (dynamic from backend or fallback)
  const brandThreats = useMemo(() => {
    if (backendFindings && backendFindings.length > 0) {
      return backendFindings.map(f => normalizeFinding(f, currentBrand));
    }
    return INITIAL_THREATS.filter(t => t.brandId === currentBrand.id).map(t => normalizeFinding(t, currentBrand));
  }, [backendFindings, currentBrand]);

  // Active target selection in quick card
  const [selectedThreatId, setSelectedThreatId] = useState(brandThreats[0]?.id || 'THREAT-RZP-101');

  const activeThreat = useMemo(() => {
    return brandThreats.find(t => t.id === selectedThreatId) || brandThreats[0] || INITIAL_THREATS[0];
  }, [brandThreats, selectedThreatId]);

  // -------------------------------------------------------------
  // Feature 1: Instant Handle / Link Verifier State
  // -------------------------------------------------------------
  const [verifierInput, setVerifierInput] = useState('');
  const [verifierResult, setVerifierResult] = useState(null);
  const [verifierError, setVerifierError] = useState('');

  // Sample quick-fill test cases for quick evaluation during demo
  const sampleTestPills = [
    { label: 'Official Handle', value: currentBrand.officialHandle, type: 'official' },
    { label: 'Official Domain', value: currentBrand.officialDomain, type: 'official' },
    { label: 'Spoofed Support', value: `${currentBrand.officialHandle}_Support_24x7`, type: 'scam' },
    { label: 'Phishing Refund', value: `https://${currentBrand.id}-merchant-refund.xyz/claim`, type: 'scam' },
    { label: 'Official App', value: currentBrand.officialApps[0]?.appId || 'com.brand.app', type: 'official' }
  ];

  const handleVerify = (candidateText = verifierInput) => {
    const query = (candidateText || '').trim();
    if (!query) {
      setVerifierError('Please enter a username, handle, domain, or app ID to verify.');
      setVerifierResult(null);
      return;
    }
    setVerifierError('');

    // Check if official asset
    const isOfficial = isOfficialAsset(query, currentBrand);

    if (isOfficial) {
      setVerifierResult({
        query,
        isOfficial: true,
        riskScore: 0,
        severity: 'OFFICIAL_SAFE',
        verdict: 'VERIFIED OFFICIAL BRAND ASSET',
        recommendation: `Confirm to the customer that "${query}" is an authentic, registered official touchpoint for ${currentBrand.name}. Safe to engage.`,
        reasons: [
          `Exact match found in verified brand registry for ${currentBrand.name}`,
          `Whitelisted under enterprise domain/handle safety policy`
        ],
        breakdown: { handleScore: 0, scamScore: 0, domainScore: 0, logoScore: 0 }
      });
      return;
    }

    // Run heuristic explainable detection engine
    const evaluation = calculateExplainableRisk({
      suspectHandle: query,
      officialHandle: currentBrand.officialHandle,
      suspectBio: query.includes('refund') || query.includes('support') ? 'Emergency assistance desk. DM for refund or verification support.' : '',
      postCaptions: [],
      suspectUrl: query.startsWith('http') || query.includes('.') ? query : `https://${query}.xyz`,
      officialDomain: currentBrand.officialDomain,
      logoMatchPercent: 70,
      channel: query.includes('com.') ? 'Rogue Mobile App' : query.includes('.') && query.includes('/') ? 'Phishing Domain' : 'Social Profile',
      brand: currentBrand
    });

    let rec = '';
    if (evaluation.severity === 'CRITICAL' || evaluation.severity === 'HIGH') {
      rec = `CRITICAL WARNING: Advise the customer immediately to NOT share OTPs, PINs, or card numbers. Escalate this finding to the Security Analyst (/analyst) for statutory takedown notice filing.`;
    } else if (evaluation.severity === 'MEDIUM') {
      rec = `CAUTION: Advise customer that this touchpoint is unverified. Direct customer to our official portal at ${currentBrand.officialDomain}.`;
    } else {
      rec = `TOUCHPOINT UNVERIFIED: Does not match registered official assets. Advise customer to use verified brand channels.`;
    }

    setVerifierResult({
      query,
      isOfficial: false,
      riskScore: evaluation.compositeScore,
      severity: evaluation.severity,
      verdict: evaluation.severity === 'CRITICAL' || evaluation.severity === 'HIGH' ? 'POTENTIAL IMPERSONATION / PHISHING' : 'UNVERIFIED TOUCHPOINT',
      recommendation: rec,
      reasons: evaluation.reasons.length > 0 ? evaluation.reasons : ['Does not match any registered official handle, domain, or app in brand registry.'],
      breakdown: evaluation.breakdown
    });
  };

  // -------------------------------------------------------------
  // Feature 2: Brand Registry Search State (FastAPI Backend API)
  // -------------------------------------------------------------
  const [brandsList, setBrandsList] = useState([]);
  const [isBrandsLoading, setIsBrandsLoading] = useState(false);
  const [brandsError, setBrandsError] = useState(null);
  const [brandSearchQuery, setBrandSearchQuery] = useState('');

  const fetchBrands = async () => {
    setIsBrandsLoading(true);
    setBrandsError(null);
    try {
      const data = await api.getBrands();
      if (Array.isArray(data) && data.length > 0) {
        setBrandsList(data);
      } else {
        setBrandsList(BRANDS);
      }
    } catch (err) {
      console.warn('FastAPI brand registry unreachable, falling back to local registry:', err);
      setBrandsList(BRANDS);
      setBrandsError('Backend API unreachable. Displaying cached local enterprise registry.');
    } finally {
      setIsBrandsLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const filteredBrands = useMemo(() => {
    const q = brandSearchQuery.toLowerCase().trim();
    if (!q) return brandsList.length > 0 ? brandsList : BRANDS;
    return (brandsList.length > 0 ? brandsList : BRANDS).filter(b =>
      b.name?.toLowerCase().includes(q) ||
      b.official_domain?.toLowerCase().includes(q) ||
      b.officialDomain?.toLowerCase().includes(q) ||
      b.official_handle?.toLowerCase().includes(q) ||
      b.officialHandle?.toLowerCase().includes(q) ||
      b.industry?.toLowerCase().includes(q)
    );
  }, [brandsList, brandSearchQuery]);

  // -------------------------------------------------------------
  // Feature 3: Customer Advisory Scripts State
  // -------------------------------------------------------------
  const [activeScriptTab, setActiveScriptTab] = useState('impersonation');
  const [customerNameInput, setCustomerNameInput] = useState('Valued Customer');
  const [copiedScriptId, setCopiedScriptId] = useState(null);

  const advisoryTemplates = [
    {
      id: 'impersonation',
      title: 'Fake Social Media Handle / Direct Message Scam',
      category: 'Social Impersonation',
      badge: 'High Risk',
      badgeColor: isDark
        ? 'border-red-500/40 bg-red-950/40 text-red-300'
        : 'border-rose-300 bg-rose-100 text-rose-950 font-bold shadow-xs',
      description: 'Use when a customer reports being contacted on Instagram, X, or Telegram by an account claiming to represent our brand.',
      recommendedAction: 'Advise customer to block and report the account directly on the platform.',
      generateScript: () => `Hello ${customerNameInput},

Thank you for contacting ${currentBrand.name} Customer Support.

We have reviewed the profile you reported (${verifierResult?.query || activeThreat?.suspectHandle || '@[SuspectHandle]'}). This account is NOT an official representative of ${currentBrand.name}.

Please note that our ONLY verified official accounts are:
- Primary Handle: ${currentBrand.officialHandle}
- Support Desk: ${currentBrand.supportHandle || currentBrand.officialHandle}
- Official Website: https://${currentBrand.officialDomain}

SAFETY INSTRUCTIONS:
1. Do not share your OTP, UPI MPIN, or bank card details with anyone.
2. ${currentBrand.name} representatives will NEVER ask for your password or transfer funds for "resolution".
3. Please block and report this fraudulent profile on the platform immediately.

Our security operations center has been alerted to initiate enforcement. Stay safe!`
    },
    {
      id: 'phishing',
      title: 'Suspicious Phishing Link / KYC Refund Scam',
      category: 'Malicious Domain',
      badge: 'Critical Threat',
      badgeColor: isDark
        ? 'border-red-500/40 bg-red-950/40 text-red-300'
        : 'border-red-300 bg-red-100 text-red-950 font-bold shadow-xs',
      description: 'Use when a customer received an SMS or WhatsApp link offering urgent refunds, cashbacks, or KYC verification.',
      recommendedAction: 'Immediate action: instruct customer to close the link and never enter credentials.',
      generateScript: () => `Hello ${customerNameInput},

We have inspected the link you received (${verifierResult?.query || activeThreat?.suspectUrl || 'https://[suspect-link]'}).

This is a fraudulent phishing website designed to steal your credentials and financial funds. It is NOT affiliated with ${currentBrand.name}.

IMMEDIATE PRECAUTIONS:
1. DO NOT open the link or enter any personal information, phone number, or passwords.
2. If you have already entered banking credentials, please change your internet banking passwords immediately and freeze affected accounts.
3. Official ${currentBrand.name} communications only occur on our verified domain: https://${currentBrand.officialDomain}.

We have escalated this deceptive URL to our Legal & Trust enforcement team for domain takedown.`
    },
    {
      id: 'apk',
      title: 'Counterfeit Mobile App / Sideloaded APK',
      category: 'Rogue APK Trojan',
      badge: 'Banking Trojan',
      badgeColor: isDark
        ? 'border-amber-500/40 bg-amber-950/40 text-amber-300'
        : 'border-amber-300 bg-amber-100 text-amber-950 font-bold shadow-xs',
      description: 'Use when a customer mentions downloading an application from a link, APK file, or third-party store.',
      recommendedAction: 'Instruct customer to uninstall the rogue app immediately and scan device for malware.',
      generateScript: () => `Hello ${customerNameInput},

Thank you for reporting this mobile application.

The app package you referenced is an UNAUTHORIZED counterfeit application. It was not published by ${currentBrand.name} and may attempt to intercept SMS verification codes (OTPs).

OFFICIAL APP DOWNLOAD:
- Only download our genuine app from Google Play Store or Apple App Store: "${currentBrand.officialApps[0]?.appName || currentBrand.name}"
- Verified Package Identifier: ${currentBrand.officialApps[0]?.appId || 'com.brand.app'}
- Official Publisher: ${currentBrand.officialApps[0]?.publisher || currentBrand.name}

WHAT YOU SHOULD DO:
1. Uninstall the suspicious app from your device immediately.
2. Review device permissions and revoke any SMS or Accessibility access granted to unverified apps.
3. Always download apps directly through official app stores, never from APK download links.`
    },
    {
      id: 'account_defense',
      title: 'Proactive Account Defense & Anti-Fraud Advisory',
      category: 'General Security',
      badge: 'Standard Advisory',
      badgeColor: isDark
        ? 'border-emerald-500/40 bg-emerald-950/40 text-emerald-300'
        : 'border-emerald-300 bg-emerald-100 text-emerald-950 font-bold shadow-xs',
      description: 'General safety instructions suitable for proactive customer education regarding financial fraud.',
      recommendedAction: 'Provide as standard best-practice advisory at the conclusion of customer interactions.',
      generateScript: () => `Hello ${customerNameInput},

Here are three quick security reminders from ${currentBrand.name} to help keep your account secure:

1. NEVER SHARE SENSITIVE CREDENTIALS:
   ${currentBrand.name} staff will NEVER ask for your OTP, UPI MPIN, password, or CVV. Anyone requesting these details is attempting fraud.

2. VERIFY OFFICIAL TOUCHPOINTS:
   Always ensure you are communicating through our verified website (https://${currentBrand.officialDomain}) or official social handle (${currentBrand.officialHandle}).

3. REPORT SUSPICIOUS ACTIVITY:
   If you ever notice unauthorized transactions or receive suspicious communications, contact our official support team at ${currentBrand.supportHandle || currentBrand.officialHandle} immediately.`
    }
  ];

  const handleCopyScript = (scriptId, text) => {
    navigator.clipboard.writeText(text);
    setCopiedScriptId(scriptId);
    setTimeout(() => setCopiedScriptId(null), 2500);
  };

  const activeScript = advisoryTemplates.find(t => t.id === activeScriptTab) || advisoryTemplates[0];

  // Dashboard Toggle Navigation Items - High Contrast Solid Badges (Matching Role 1 & 2)
  const supportModules = [
    {
      id: 'verifier',
      name: 'Instant Touchpoint Verifier',
      sublabel: 'Handle, Link & APK Authenticator',
      icon: Search,
      badge: 'Sub-Second',
      badgeColor: isDark
        ? 'border-blue-500/40 bg-blue-950/60 text-blue-300'
        : 'border-sky-300 bg-sky-100 text-sky-900 font-bold shadow-xs'
    },
    {
      id: 'registry',
      name: 'Enterprise Brand Registry',
      sublabel: 'Authoritative Domain & App Vault',
      icon: Building2,
      badge: `${brandsList.length || 3} Tenants`,
      badgeColor: isDark
        ? 'border-emerald-500/40 bg-emerald-950/60 text-emerald-300'
        : 'border-emerald-300 bg-emerald-100 text-emerald-900 font-bold shadow-xs'
    },
    {
      id: 'scripts',
      name: 'Customer Advisory Scripts',
      sublabel: '4 Pre-Approved Safety Templates',
      icon: HelpCircle,
      badge: '4 Scenarios',
      badgeColor: isDark
        ? 'border-amber-500/40 bg-amber-950/60 text-amber-300'
        : 'border-amber-300 bg-amber-100 text-amber-900 font-bold shadow-xs'
    },
    {
      id: 'radar',
      name: 'Frontline Incident Feed',
      sublabel: 'Active Tenant Threats Ingestion',
      icon: Radio,
      badge: `${brandThreats.length} Alerts`,
      badgeColor: isDark
        ? 'border-cyan-500/40 bg-cyan-950/60 text-cyan-300'
        : 'border-cyan-300 bg-cyan-100 text-cyan-900 font-bold shadow-xs'
    },
    {
      id: 'all',
      name: 'Unified Support Command',
      sublabel: 'Master Multi-Pane View',
      icon: LayoutGrid,
      badge: 'Full Canvas',
      badgeColor: isDark
        ? 'border-slate-600 bg-slate-900 text-slate-300'
        : 'border-slate-300 bg-slate-100 text-slate-800 font-bold shadow-xs'
    }
  ];

  return (
    <div className="p-4 sm:p-6 max-w-[1740px] mx-auto space-y-5 animate-in fade-in duration-300 font-sans">

      {/* ============================================================ */}
      {/* TOP COMMAND HEADER & TELEMETRY STRIP                          */}
      {/* ============================================================ */}
      <div className={`p-5 rounded-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-4 transition-all duration-300 ${
        isDark
          ? 'bg-[#071120]/90 backdrop-blur-xl border border-blue-500/30 shadow-2xl'
          : 'bg-white border border-slate-300 shadow-sm'
      }`}>
        <div>
          <div className={`inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-mono font-bold mb-2 transition ${
            isDark
              ? 'bg-blue-950/60 border border-blue-500/40 text-blue-300 shadow-[0_0_12px_rgba(59,130,246,0.2)]'
              : 'bg-blue-100 border border-blue-300 text-blue-950 shadow-xs'
          }`}>
            <Search className={`w-3.5 h-3.5 ${isDark ? 'text-blue-400' : 'text-blue-700'}`} />
            <span>ROLE 3: CUSTOMER SUPPORT &amp; FRONTLINE BRAND OPS (/support)</span>
          </div>
          <h1 className={`text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-3 ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}>
            <span>Customer Verification Radar &amp; Advisory Center</span>
            <span className={`text-xs px-2.5 py-1 rounded-full font-mono font-semibold transition ${
              isDark
                ? 'bg-blue-900/40 border border-blue-500/40 text-blue-300'
                : 'bg-blue-100 border border-blue-300 text-blue-950 shadow-xs font-bold'
            }`}>
              Tenant: {currentBrand.name}
            </span>
          </h1>
          <p className={`text-sm sm:text-base mt-1.5 max-w-3xl leading-relaxed ${
            isDark ? 'text-slate-300' : 'text-slate-700'
          }`}>
            Select any module from the <strong>Dashboard Toggle</strong> on the left to verify suspicious touchpoints, search the official brand asset registry, or generate validated customer advisories.
          </p>
        </div>

        {/* Telemetry Status Strip - High Contrast Solid Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
          <div className={`p-3.5 rounded-xl border text-center min-w-[110px] transition ${
            isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-300 shadow-xs'
          }`}>
            <div className={`text-xl font-bold font-mono ${isDark ? 'text-cyan-400' : 'text-blue-700'}`}>
              {brandThreats.length} Alerts
            </div>
            <div className={`text-xs uppercase font-bold flex items-center justify-center gap-1.5 mt-0.5 ${
              isDark ? 'text-slate-400' : 'text-slate-700'
            }`}>
              <Zap className={`w-3 h-3 ${isDark ? 'text-cyan-400' : 'text-blue-600'}`} /> Active Queue
            </div>
          </div>

          <div className={`p-3.5 rounded-xl border text-center min-w-[110px] transition ${
            isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-300 shadow-xs'
          }`}>
            <div className={`text-xl font-bold font-mono ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
              Sub-Sec
            </div>
            <div className={`text-xs uppercase font-bold flex items-center justify-center gap-1.5 mt-0.5 ${
              isDark ? 'text-slate-400' : 'text-slate-700'
            }`}>
              <Clock className={`w-3 h-3 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} /> Lookup Speed
            </div>
          </div>

          <div className={`p-3.5 rounded-xl border text-center min-w-[110px] transition ${
            isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-300 shadow-xs'
          }`}>
            <div className={`text-xl font-bold font-mono ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>
              {currentBrand.verifiedHandles.length + currentBrand.officialApps.length + 1} Assets
            </div>
            <div className={`text-xs uppercase font-bold flex items-center justify-center gap-1.5 mt-0.5 ${
              isDark ? 'text-slate-400' : 'text-slate-700'
            }`}>
              <ShieldCheck className={`w-3 h-3 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} /> Whitelisted
            </div>
          </div>

          <div className={`p-3.5 rounded-xl border text-center min-w-[110px] transition ${
            isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-300 shadow-xs'
          }`}>
            <div className={`text-xl font-bold font-mono ${isDark ? 'text-purple-400' : 'text-purple-700'}`}>
              4 Scripts
            </div>
            <div className={`text-xs uppercase font-bold flex items-center justify-center gap-1.5 mt-0.5 ${
              isDark ? 'text-slate-400' : 'text-slate-700'
            }`}>
              <HelpCircle className={`w-3 h-3 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} /> Advisories
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2-SECTION WORKSPACE: DASHBOARD TOGGLE (LEFT) + WORKSPACE (RIGHT) */}
      {/* ============================================================ */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">

        {/* ========================================================== */}
        {/* LEFT: DASHBOARD MODULE TOGGLE DRAWER (~390px - NO TRUNCATION) */}
        {/* ========================================================== */}
        <div className="w-full lg:w-[390px] shrink-0 space-y-4">

          <div className={`p-4 rounded-2xl transition-all duration-300 ${
            isDark
              ? 'bg-[#071120]/90 backdrop-blur-xl border border-blue-500/30 shadow-2xl'
              : 'bg-white border border-slate-300 shadow-sm'
          }`}>
            <div className={`flex items-center justify-between pb-3 border-b mb-3 ${
              isDark ? 'border-slate-800/80' : 'border-slate-200'
            }`}>
              <div className="flex items-center gap-2">
                <LayoutGrid className={`w-4 h-4 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                <h2 className={`text-xs font-mono font-bold uppercase tracking-wider ${
                  isDark ? 'text-blue-300' : 'text-slate-900'
                }`}>
                  Support Modules
                </h2>
              </div>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold border ${
                isDark
                  ? 'bg-slate-900 border-slate-800 text-slate-400'
                  : 'bg-slate-100 border-slate-300 text-slate-700'
              }`}>
                5 Views
              </span>
            </div>

            {/* Navigation Toggle Buttons List */}
            <div className="space-y-1.5">
              {supportModules.map((mod) => {
                const Icon = mod.icon;
                const isActive = activeModule === mod.id;

                return (
                  <button
                    key={mod.id}
                    type="button"
                    onClick={() => setActiveModule(mod.id)}
                    className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer group ${
                      isActive
                        ? isDark
                          ? 'bg-gradient-to-r from-blue-900/60 to-cyan-950/40 border-cyan-400 shadow-[0_0_16px_rgba(6,182,212,0.25)] text-white'
                          : 'bg-blue-50 border-blue-600 text-blue-950 shadow-xs ring-1 ring-blue-500/50'
                        : isDark
                        ? 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:bg-slate-900/60 hover:text-slate-200 hover:border-slate-700'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`p-2 rounded-lg border shrink-0 transition-colors ${
                        isActive
                          ? isDark
                            ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                            : 'bg-blue-600 border-blue-600 text-white shadow-xs'
                          : isDark
                          ? 'bg-slate-900 border-slate-800 text-slate-400 group-hover:text-cyan-400'
                          : 'bg-slate-100 border-slate-200 text-slate-600 group-hover:text-blue-600'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className={`text-xs font-bold ${
                          isActive
                            ? isDark ? 'text-white' : 'text-blue-950'
                            : isDark ? 'text-slate-300' : 'text-slate-800'
                        }`}>
                          {mod.name}
                        </div>
                        <div className={`text-[10px] ${
                          isDark ? 'text-slate-500' : 'text-slate-500 font-medium'
                        }`}>
                          {mod.sublabel}
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-1.5 ml-2">
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border font-semibold ${mod.badgeColor}`}>
                        {mod.badge}
                      </span>
                      <ChevronRight className={`w-3.5 h-3.5 transition-transform ${
                        isActive
                          ? isDark ? 'text-cyan-400 translate-x-0.5' : 'text-blue-600 translate-x-0.5'
                          : 'text-slate-400'
                      }`} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ACTIVE INQUIRY QUICK CARD */}
          <div className={`p-4 rounded-2xl transition-all duration-300 space-y-2.5 ${
            isDark
              ? 'bg-[#071120]/90 backdrop-blur-xl border border-blue-500/30 shadow-2xl'
              : 'bg-white border border-slate-300 shadow-sm'
          }`}>
            <div className="flex items-center justify-between">
              <span className={`text-[11px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                isDark ? 'text-cyan-300' : 'text-slate-900'
              }`}>
                <Search className={`w-3.5 h-3.5 ${isDark ? 'text-cyan-400' : 'text-blue-600'}`} /> Active Inquiry Focus
              </span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold border ${
                isDark
                  ? 'bg-blue-950/80 border-blue-500/40 text-blue-300'
                  : 'bg-blue-100 border-blue-300 text-blue-950 shadow-xs'
              }`}>
                {activeThreat.id}
              </span>
            </div>

            <select
              value={selectedThreatId}
              onChange={(e) => setSelectedThreatId(e.target.value)}
              className={`w-full rounded-xl px-3 py-2 text-xs focus:outline-none cursor-pointer font-mono border transition ${
                isDark
                  ? 'bg-slate-950 border-slate-800 text-white focus:border-cyan-500'
                  : 'bg-white border-slate-300 text-slate-900 focus:border-blue-600 shadow-xs font-semibold'
              }`}
            >
              {brandThreats.map((t) => (
                <option key={t.id} value={t.id}>
                  [{t.id}] {t.suspectHandle} ({t.channel})
                </option>
              ))}
            </select>

            <div className={`p-2.5 rounded-xl border text-[11px] font-mono space-y-1.5 ${
              isDark ? 'bg-slate-950/70 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-800'
            }`}>
              <div className={`font-bold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{activeThreat.suspectName}</div>
              <div className={`flex items-center justify-between text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>
                <span>Platform: <strong className={isDark ? 'text-slate-200' : 'text-slate-900'}>{activeThreat.platform}</strong></span>
                <span className={`font-bold ${isDark ? 'text-cyan-400' : 'text-blue-700'}`}>Diff: {activeThreat.logoMatchPercent}%</span>
              </div>

              <div className={`pt-2 border-t ${isDark ? 'border-slate-800' : 'border-slate-200'} flex items-center justify-between gap-2`}>
                <button
                  type="button"
                  onClick={() => {
                    setVerifierInput(activeThreat.suspectHandle);
                    handleVerify(activeThreat.suspectHandle);
                    setActiveModule('verifier');
                  }}
                  className={`w-full py-1.5 px-2 rounded-lg border text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                    isDark
                      ? 'bg-blue-600/20 border-blue-500/40 text-blue-300 hover:bg-blue-600/30'
                      : 'bg-blue-50 border-blue-300 text-blue-900 hover:bg-blue-100 shadow-xs'
                  }`}
                >
                  <Search className="w-3.5 h-3.5 text-blue-600" />
                  <span>Verify in Radar</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveModule('scripts');
                  }}
                  className={`w-full py-1.5 px-2 rounded-lg border text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                    isDark
                      ? 'bg-amber-600/20 border-amber-500/40 text-amber-300 hover:bg-amber-600/30'
                      : 'bg-amber-50 border-amber-300 text-amber-900 hover:bg-amber-100 shadow-xs'
                  }`}
                >
                  <Copy className="w-3.5 h-3.5 text-amber-600" />
                  <span>Use Script</span>
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* ========================================================== */}
        {/* RIGHT: DYNAMIC WORKSPACE CANVAS (FLEX-1)                    */}
        {/* ========================================================== */}
        <div className="flex-1 w-full min-w-0 space-y-4">

          {/* Breadcrumb / Context Ribbon */}
          <div className={`p-3.5 rounded-xl border shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs font-mono transition ${
            isDark
              ? 'bg-[#071120]/90 backdrop-blur-xl border-blue-500/20'
              : 'bg-white border-slate-300'
          }`}>
            <div className="flex items-center gap-2">
              <span className={isDark ? 'text-slate-500' : 'text-slate-600 font-semibold'}>Customer Support Workspace</span>
              <span className={isDark ? 'text-slate-600' : 'text-slate-400'}>/</span>
              <span className={`font-bold ${isDark ? 'text-blue-400' : 'text-blue-800'}`}>
                {supportModules.find(m => m.id === activeModule)?.name}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className={`flex items-center gap-1.5 ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>
                <span>Inspecting:</span>
                <span className={`font-bold px-2 py-0.5 rounded border font-mono ${
                  isDark ? 'text-white bg-slate-900 border-slate-800' : 'text-slate-900 bg-slate-100 border-slate-300'
                }`}>
                  {verifierResult?.query || activeThreat.suspectHandle}
                </span>
              </div>
              <div className={`h-4 w-px ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
              <button
                type="button"
                onClick={() => loginAsRole('analyst')}
                className={`px-2.5 py-1 rounded-lg border transition flex items-center gap-1 cursor-pointer font-bold ${
                  isDark
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 hover:bg-cyan-500/30'
                    : 'bg-sky-100 text-sky-950 border-sky-300 hover:bg-sky-200 shadow-xs'
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Jump to Threat Radar</span>
                <ArrowRight className="w-3 h-3 ml-0.5" />
              </button>
            </div>
          </div>

          {/* DYNAMIC VIEW ROUTING */}
          <div className="transition-all duration-300 space-y-6">

            {/* VIEW 1: INSTANT TOUCHPOINT VERIFIER */}
            {(activeModule === 'verifier' || activeModule === 'all') && (
              <div className={`p-5 rounded-2xl border transition-all duration-300 space-y-4 ${
                isDark
                  ? 'bg-[#071120]/90 backdrop-blur-xl border-blue-500/30 shadow-2xl'
                  : 'bg-white border-slate-300 shadow-sm'
              }`}>
                <div className={`flex items-center justify-between pb-3 border-b ${isDark ? 'border-slate-800/80' : 'border-slate-200'}`}>
                  <div className="flex items-center gap-2">
                    <Search className={`w-4 h-4 ${isDark ? 'text-cyan-400' : 'text-blue-600'}`} />
                    <h2 className={`text-sm sm:text-base font-mono font-bold uppercase tracking-wider ${
                      isDark ? 'text-cyan-300' : 'text-slate-900'
                    }`}>
                      Instant Touchpoint Authenticity Verifier
                    </h2>
                  </div>
                  <span className={`text-xs font-mono px-2.5 py-0.5 rounded border font-bold ${
                    isDark ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-slate-100 border-slate-300 text-slate-800'
                  }`}>
                    Deterministic &amp; Heuristic Engine
                  </span>
                </div>

                <p className={`text-xs sm:text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Enter any suspicious username, link, domain, or mobile app ID reported by a customer to answer: <em>"Is this genuine or an impersonation scam?"</em>
                </p>

                {/* Input & Action Bar */}
                <div className="space-y-2.5">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={verifierInput}
                        onChange={(e) => setVerifierInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
                        placeholder="e.g. @Razorpay_Support_24x7, phonepe-cashback.xyz, com.phonepe.app"
                        className={`w-full rounded-xl px-4 py-3 text-xs sm:text-sm font-mono focus:outline-none border transition ${
                          isDark
                            ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500 focus:border-cyan-500'
                            : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-blue-600 shadow-xs'
                        }`}
                      />
                      {verifierInput && (
                        <button
                          type="button"
                          onClick={() => { setVerifierInput(''); setVerifierResult(null); }}
                          className={`absolute right-3 top-3 text-xs font-mono ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'}`}
                        >
                          Clear
                        </button>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleVerify()}
                      className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-mono font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md transition shrink-0"
                    >
                      <Search className="w-4 h-4" />
                      <span>Verify Touchpoint</span>
                    </button>
                  </div>

                  {verifierError && (
                    <div className="text-xs font-mono text-red-600 dark:text-red-400 flex items-center gap-1.5 font-semibold">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>{verifierError}</span>
                    </div>
                  )}

                  {/* Quick-test pills */}
                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    <span className={`text-xs font-mono font-semibold ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>Demo Quick Tests:</span>
                    {sampleTestPills.map((pill, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setVerifierInput(pill.value);
                          handleVerify(pill.value);
                        }}
                        className={`text-xs font-mono font-semibold px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                          pill.type === 'official'
                            ? isDark
                              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/60'
                              : 'bg-emerald-50 border-emerald-300 text-emerald-900 hover:bg-emerald-100 shadow-xs'
                            : isDark
                            ? 'bg-red-950/40 border-red-500/40 text-red-300 hover:bg-red-900/60'
                            : 'bg-rose-50 border-rose-300 text-rose-900 hover:bg-rose-100 shadow-xs'
                        }`}
                      >
                        {pill.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Verification Result Card - High Contrast Solid Palette */}
                {verifierResult && (
                  <div className={`p-5 rounded-2xl border text-xs sm:text-sm font-mono space-y-4 transition-all shadow-md ${
                    verifierResult.isOfficial
                      ? isDark
                        ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-100'
                        : 'bg-emerald-50 border-emerald-300 text-emerald-950'
                      : verifierResult.severity === 'CRITICAL' || verifierResult.severity === 'HIGH'
                      ? isDark
                        ? 'bg-red-950/40 border-red-500/50 text-red-100'
                        : 'bg-rose-50 border-rose-300 text-rose-950'
                      : isDark
                        ? 'bg-amber-950/40 border-amber-500/50 text-amber-100'
                        : 'bg-amber-50 border-amber-300 text-amber-950'
                  }`}>
                    <div className={`flex flex-wrap items-center justify-between gap-3 pb-3 border-b ${
                      isDark ? 'border-slate-800' : 'border-slate-300'
                    }`}>
                      <div className="flex items-center gap-3">
                        {verifierResult.isOfficial ? (
                          <div className={`p-2 rounded-xl border ${
                            isDark ? 'bg-emerald-900/60 border-emerald-500 text-emerald-300' : 'bg-emerald-200 border-emerald-400 text-emerald-900'
                          }`}>
                            <CheckCircle2 className="w-6 h-6" />
                          </div>
                        ) : (
                          <div className={`p-2 rounded-xl border ${
                            isDark ? 'bg-red-900/60 border-red-500 text-red-300' : 'bg-rose-200 border-rose-400 text-rose-900'
                          }`}>
                            <XCircle className="w-6 h-6" />
                          </div>
                        )}
                        <div>
                          <div className={`font-black text-base sm:text-lg ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            {verifierResult.verdict}
                          </div>
                          <div className={`text-xs mt-0.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                            Query: <span className="font-bold underline">{verifierResult.query}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-lg font-bold uppercase text-xs border shadow-xs ${
                          verifierResult.isOfficial
                            ? isDark ? 'bg-emerald-900/80 border-emerald-500 text-emerald-200' : 'bg-emerald-200 border-emerald-400 text-emerald-950'
                            : verifierResult.severity === 'CRITICAL'
                            ? isDark ? 'bg-red-900/80 border-red-500 text-red-200' : 'bg-rose-200 border-rose-400 text-rose-950'
                            : isDark ? 'bg-amber-900/80 border-amber-500 text-amber-200' : 'bg-amber-200 border-amber-400 text-amber-950'
                        }`}>
                          {verifierResult.isOfficial ? 'SAFE' : `${verifierResult.severity} (Score: ${verifierResult.riskScore}/100)`}
                        </span>
                      </div>
                    </div>

                    {/* Forensic Reasons List */}
                    <div className="space-y-1.5">
                      <div className={`font-bold text-xs uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
                        Forensic Reasons &amp; Asset Check:
                      </div>
                      <div className="space-y-1">
                        {verifierResult.reasons.map((r, i) => (
                          <div key={i} className={`text-xs sm:text-sm flex items-start gap-2 ${isDark ? 'text-slate-200' : 'text-slate-900 font-medium'}`}>
                            <span className={`mt-0.5 font-bold ${verifierResult.isOfficial ? 'text-emerald-500' : 'text-red-500'}`}>•</span>
                            <span>{r}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action Card */}
                    <div className={`p-3.5 rounded-xl border text-xs sm:text-sm leading-relaxed ${
                      isDark ? 'bg-slate-950/80 border-slate-800 text-slate-200' : 'bg-white border-slate-300 text-slate-900 shadow-xs'
                    }`}>
                      <strong className={`font-bold ${verifierResult.isOfficial ? (isDark ? 'text-emerald-400' : 'text-emerald-800') : (isDark ? 'text-amber-400' : 'text-amber-800')}`}>
                        Recommended Frontline Action:
                      </strong>{' '}
                      {verifierResult.recommendation}
                    </div>

                    <div className={`text-[11px] italic pt-1 border-t ${isDark ? 'text-slate-400 border-slate-800/80' : 'text-slate-600 border-slate-300'}`}>
                      * Note: Verification evaluates candidate identifiers deterministically against the enterprise official asset registry and heuristic lookalike models. Does not claim live third-party platform API resolution.
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* VIEW 2: ENTERPRISE BRAND REGISTRY */}
            {(activeModule === 'registry' || activeModule === 'all') && (
              <div className={`p-5 rounded-2xl border transition-all duration-300 space-y-4 ${
                isDark
                  ? 'bg-[#071120]/90 backdrop-blur-xl border-blue-500/30 shadow-2xl'
                  : 'bg-white border-slate-300 shadow-sm'
              }`}>
                <div className={`flex items-center justify-between pb-3 border-b ${isDark ? 'border-slate-800/80' : 'border-slate-200'}`}>
                  <div className="flex items-center gap-2">
                    <Building2 className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                    <h2 className={`text-sm sm:text-base font-mono font-bold uppercase tracking-wider ${
                      isDark ? 'text-emerald-300' : 'text-slate-900'
                    }`}>
                      Enterprise Brand Asset Registry
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={fetchBrands}
                    disabled={isBrandsLoading}
                    className={`p-1.5 rounded-lg border transition cursor-pointer ${
                      isDark
                        ? 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white hover:border-slate-700'
                        : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
                    }`}
                    title="Refresh brand registry from FastAPI database"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isBrandsLoading ? 'animate-spin text-cyan-400' : ''}`} />
                  </button>
                </div>

                <p className={`text-xs sm:text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Search authoritative enterprise domains, official verified handles, and authorized mobile app IDs.
                </p>

                <div className="relative">
                  <Search className={`w-4 h-4 absolute left-3.5 top-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                  <input
                    type="text"
                    value={brandSearchQuery}
                    onChange={(e) => setBrandSearchQuery(e.target.value)}
                    placeholder="Search registered brand, domain, or handle..."
                    className={`w-full rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm font-mono focus:outline-none border transition ${
                      isDark
                        ? 'bg-slate-950 border-slate-800 text-white placeholder-slate-500 focus:border-cyan-500'
                        : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-blue-600 shadow-xs'
                    }`}
                  />
                </div>

                {isBrandsLoading && (
                  <div className={`p-8 text-center space-y-2 text-xs font-mono ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    <Loader2 className="w-5 h-5 mx-auto animate-spin text-blue-600" />
                    <div>Loading enterprise registry from FastAPI...</div>
                  </div>
                )}

                {brandsError && !isBrandsLoading && (
                  <div className={`p-3 rounded-xl border text-xs font-mono flex items-center gap-2 ${
                    isDark ? 'border-amber-500/30 bg-amber-950/20 text-amber-300' : 'border-amber-300 bg-amber-50 text-amber-900'
                  }`}>
                    <Info className="w-4 h-4 shrink-0 text-amber-600" />
                    <span>{brandsError}</span>
                  </div>
                )}

                {!isBrandsLoading && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredBrands.map((b) => {
                      const isCurrent = (b.id === currentBrand.id);
                      const officialDomain = b.official_domain || b.officialDomain;
                      const officialHandle = b.official_handle || b.officialHandle;
                      const verifiedHandles = b.verified_handles || b.verifiedHandles || [officialHandle];
                      const officialApps = b.official_apps || b.officialApps || [];

                      return (
                        <div
                          key={b.id}
                          onClick={() => setActiveBrandId(b.id)}
                          className={`p-4 rounded-xl border transition-all cursor-pointer space-y-3 ${
                            isCurrent
                              ? isDark
                                ? 'bg-gradient-to-r from-blue-950/70 to-slate-900 border-cyan-500 shadow-md ring-1 ring-cyan-500/30'
                                : 'bg-blue-50 border-blue-600 shadow-md ring-1 ring-blue-500'
                              : isDark
                              ? 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                              : 'bg-white border-slate-300 hover:bg-slate-50 shadow-xs'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                {b.name}
                              </div>
                              <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600 font-medium'}`}>
                                {b.industry}
                              </div>
                            </div>
                            {isCurrent && (
                              <span className={`text-xs font-mono px-2.5 py-0.5 rounded border font-bold ${
                                isDark
                                  ? 'bg-cyan-950/60 border-cyan-500/50 text-cyan-300'
                                  : 'bg-blue-100 border-blue-300 text-blue-900 shadow-xs'
                              }`}>
                                Active Tenant
                              </span>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                            <div className={`p-2.5 rounded-lg border ${
                              isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
                            }`}>
                              <div className={`text-xs flex items-center gap-1 font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                                <Globe className="w-3.5 h-3.5 text-cyan-500" /> Domain:
                              </div>
                              <div className={`font-bold mt-1 truncate ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>
                                {officialDomain}
                              </div>
                            </div>

                            <div className={`p-2.5 rounded-lg border ${
                              isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
                            }`}>
                              <div className={`text-xs flex items-center gap-1 font-semibold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                                <AtSign className="w-3.5 h-3.5 text-blue-500" /> Primary:
                              </div>
                              <div className={`font-bold mt-1 truncate ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>
                                {officialHandle}
                              </div>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <div className={`text-xs font-mono font-semibold ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>
                              Verified Handles ({verifiedHandles.length}):
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              {verifiedHandles.map((h, i) => (
                                <span key={i} className={`text-xs font-mono px-2 py-0.5 rounded border font-semibold ${
                                  isDark ? 'bg-slate-900 border-slate-800 text-blue-300' : 'bg-slate-100 border-slate-300 text-blue-900 shadow-xs'
                                }`}>
                                  {h}
                                </span>
                              ))}
                            </div>
                          </div>

                          {officialApps.length > 0 && (
                            <div className="space-y-1 pt-1 border-t border-slate-200 dark:border-slate-800">
                              <div className={`text-xs font-mono font-semibold ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>
                                Official App ID:
                              </div>
                              <div className={`text-xs font-mono truncate font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-800'}`}>
                                {officialApps[0]?.appId} ({officialApps[0]?.publisher})
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* VIEW 3: CUSTOMER ADVISORY SCRIPTS */}
            {(activeModule === 'scripts' || activeModule === 'all') && (
              <div className={`p-5 rounded-2xl border transition-all duration-300 space-y-4 ${
                isDark
                  ? 'bg-[#071120]/90 backdrop-blur-xl border-blue-500/30 shadow-2xl'
                  : 'bg-white border-slate-300 shadow-sm'
              }`}>
                <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b ${isDark ? 'border-slate-800/80' : 'border-slate-200'}`}>
                  <div className="flex items-center gap-2">
                    <HelpCircle className={`w-4 h-4 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
                    <h2 className={`text-sm sm:text-base font-mono font-bold uppercase tracking-wider ${
                      isDark ? 'text-amber-300' : 'text-slate-900'
                    }`}>
                      Customer Safety Advisory Templates
                    </h2>
                  </div>
                  <span className={`text-xs font-mono px-2.5 py-0.5 rounded border font-bold ${
                    isDark ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-slate-100 border-slate-300 text-slate-800'
                  }`}>
                    Internal Guidance
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
                  {advisoryTemplates.map((tab) => {
                    const isActive = activeScriptTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveScriptTab(tab.id)}
                        className={`p-2.5 rounded-xl border text-left transition cursor-pointer font-bold ${
                          isActive
                            ? isDark
                              ? 'bg-blue-600/20 border-cyan-500 text-cyan-300'
                              : 'bg-blue-100 border-blue-600 text-blue-950 shadow-xs'
                            : isDark
                            ? 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                            : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        <div className="truncate">{tab.category}</div>
                      </button>
                    );
                  })}
                </div>

                <div className={`p-4 rounded-xl border space-y-3.5 ${
                  isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-300 shadow-xs'
                }`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className={`text-sm font-mono font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {activeScript.title}
                      </h3>
                      <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-700 font-medium'}`}>
                        {activeScript.description}
                      </p>
                    </div>
                    <span className={`text-xs font-mono px-2.5 py-0.5 rounded border font-semibold shrink-0 ${activeScript.badgeColor}`}>
                      {activeScript.badge}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs sm:text-sm font-mono pt-1">
                    <span className={`shrink-0 font-semibold ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>
                      Customer Greeting:
                    </span>
                    <input
                      type="text"
                      value={customerNameInput}
                      onChange={(e) => setCustomerNameInput(e.target.value)}
                      placeholder="Customer Name"
                      className={`w-48 rounded-lg px-3 py-1.5 text-xs sm:text-sm border focus:outline-none transition ${
                        isDark
                          ? 'bg-slate-900 border-slate-700 text-white focus:border-cyan-500'
                          : 'bg-white border-slate-300 text-slate-900 focus:border-blue-600 shadow-xs'
                      }`}
                    />
                  </div>

                  <div className="relative">
                    <textarea
                      readOnly
                      rows={8}
                      value={activeScript.generateScript()}
                      className={`w-full rounded-xl p-3.5 text-xs sm:text-sm font-mono focus:outline-none border resize-none leading-relaxed select-all ${
                        isDark
                          ? 'bg-slate-900 border-slate-700 text-slate-200'
                          : 'bg-white border-slate-300 text-slate-900 shadow-inner'
                      }`}
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
                    <div className={`text-xs flex items-center gap-1.5 ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>
                      <span className={`font-bold ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>Notice:</span>
                      <span>Review and customize bracketed fields before communicating with customers.</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleCopyScript(activeScript.id, activeScript.generateScript())}
                      className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-mono font-bold flex items-center justify-center gap-2 cursor-pointer transition shadow-md ${
                        copiedScriptId === activeScript.id
                          ? 'bg-emerald-600 text-white'
                          : 'bg-blue-600 hover:bg-blue-500 text-white'
                      }`}
                    >
                      {copiedScriptId === activeScript.id ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Copied to Clipboard!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>Copy Advisory Script</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* VIEW 4: FRONTLINE INCIDENT LOOKUP RADAR */}
            {(activeModule === 'radar' || activeModule === 'all') && (
              <div className={`p-5 rounded-2xl border transition-all duration-300 space-y-4 ${
                isDark
                  ? 'bg-[#071120]/90 backdrop-blur-xl border-blue-500/30 shadow-2xl'
                  : 'bg-white border-slate-300 shadow-sm'
              }`}>
                <div className={`flex items-center justify-between pb-3 border-b ${isDark ? 'border-slate-800/80' : 'border-slate-200'}`}>
                  <div className="flex items-center gap-2">
                    <Radio className={`w-4 h-4 ${isDark ? 'text-cyan-400' : 'text-blue-600'}`} />
                    <h2 className={`text-sm sm:text-base font-mono font-bold uppercase tracking-wider ${
                      isDark ? 'text-cyan-300' : 'text-slate-900'
                    }`}>
                      Active Incident Feed for {currentBrand.name}
                    </h2>
                  </div>
                  <span className={`text-xs font-mono px-2.5 py-0.5 rounded border font-bold ${
                    isDark ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-slate-100 border-slate-300 text-slate-800'
                  }`}>
                    {brandThreats.length} Flagged
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {brandThreats.map((threat) => (
                    <div
                      key={threat.id}
                      className={`p-4 rounded-xl border space-y-3 transition ${
                        isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-300 shadow-xs'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-xs sm:text-sm font-mono font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {threat.suspectHandle}
                        </span>
                        <span className={`text-xs font-mono px-2.5 py-0.5 rounded border font-bold ${
                          isDark
                            ? 'bg-red-950/80 border-red-500/40 text-red-300'
                            : 'bg-rose-100 border-rose-300 text-rose-950 shadow-xs'
                        }`}>
                          {threat.channel}
                        </span>
                      </div>
                      <div className={`text-xs sm:text-sm font-semibold ${isDark ? 'text-slate-300' : 'text-slate-900'}`}>
                        {threat.suspectName}
                      </div>
                      <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-700 font-medium'} line-clamp-2`}>
                        "{threat.suspectBio}"
                      </p>
                      <div className={`pt-2.5 border-t ${isDark ? 'border-slate-800/80' : 'border-slate-200'} flex items-center justify-between text-xs font-mono`}>
                        <span className={`${isDark ? 'text-cyan-400' : 'text-blue-700'} font-bold`}>
                          Match: {threat.logoMatchPercent}%
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setVerifierInput(threat.suspectHandle);
                            handleVerify(threat.suspectHandle);
                            setActiveModule('verifier');
                          }}
                          className={`font-bold text-xs flex items-center gap-1 cursor-pointer transition ${
                            isDark ? 'text-cyan-400 hover:text-cyan-300' : 'text-blue-700 hover:text-blue-900 underline'
                          }`}
                        >
                          <span>Verify in Radar</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}
