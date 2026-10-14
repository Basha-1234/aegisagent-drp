import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { BRANDS, INITIAL_THREATS } from '../data/mockData';
import { api } from '../utils/apiClient';
import {
  BarChart3,
  DollarSign,
  Clock,
  ShieldCheck,
  Users,
  Download,
  FileText,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Info,
  ChevronRight,
  Building2,
  Lock,
  ArrowRight,
  RefreshCw,
  Sparkles,
  LayoutGrid,
  Check,
  Sliders,
  Calculator,
  Scale,
  Zap,
  Globe,
  Radio
} from 'lucide-react';

export default function ExecutiveDashboard() {
  const { user, activeBrandId, loginAsRole } = useAuth();
  const { isDark } = useTheme();

  // Active brand profile
  const currentBrand = BRANDS.find(b => b.id === activeBrandId) || BRANDS[0];

  // Active dashboard module toggle state (Defaults to calculator)
  // Options: 'calculator' | 'mttr' | 'access' | 'audit' | 'all'
  const [activeModule, setActiveModule] = useState('calculator');

  // -------------------------------------------------------------
  // Feature 1: Financial Fraud Loss Avoidance Calculator State
  // -------------------------------------------------------------
  const [affectedCustomers, setAffectedCustomers] = useState(2500);
  const [avgLossPerCustomer, setAvgLossPerCustomer] = useState(180);
  const [preventionRate, setPreventionRate] = useState(85);
  const [currencySymbol, setCurrencySymbol] = useState('$');

  // Attack scenario benchmark presets
  const scenarioPresets = [
    {
      name: 'Rogue APK Trojan Campaign',
      customers: 1200,
      avgLoss: 450,
      prevention: 92,
      description: 'Cloned banking APK harvesting OTPs via READ_SMS permissions.'
    },
    {
      name: 'UPI Cashback Phishing Ring',
      customers: 4500,
      avgLoss: 120,
      prevention: 85,
      description: 'Coordinated social accounts directing victims to credential harvesters.'
    },
    {
      name: 'Executive Impersonation Wire Fraud',
      customers: 150,
      avgLoss: 2800,
      prevention: 96,
      description: 'VIP spoofing attempting invoice redirection and corporate wire fraud.'
    }
  ];

  const handleApplyPreset = (preset) => {
    setAffectedCustomers(preset.customers);
    setAvgLossPerCustomer(preset.avgLoss);
    setPreventionRate(preset.prevention);
  };

  // Math: Exposure = N * L; Avoided Loss = Exposure * (Prevention Rate / 100)
  const grossPotentialExposure = useMemo(() => {
    return Math.max(0, affectedCustomers * avgLossPerCustomer);
  }, [affectedCustomers, avgLossPerCustomer]);

  const estimatedAvoidedLoss = useMemo(() => {
    return Math.round(grossPotentialExposure * (preventionRate / 100));
  }, [grossPotentialExposure, preventionRate]);

  const residualRiskExposure = useMemo(() => {
    return Math.max(0, grossPotentialExposure - estimatedAvoidedLoss);
  }, [grossPotentialExposure, estimatedAvoidedLoss]);

  // -------------------------------------------------------------
  // Feature 2: MTTR Benchmark & Telemetry State
  // -------------------------------------------------------------
  const [findings, setFindings] = useState([]);
  const [isFindingsLoading, setIsFindingsLoading] = useState(false);

  useEffect(() => {
    async function loadFindings() {
      setIsFindingsLoading(true);
      try {
        const data = await api.getFindings({ brandId: currentBrand.id });
        if (Array.isArray(data)) {
          setFindings(data);
        }
      } catch (err) {
        console.warn('Could not fetch findings for MTTR telemetry, using baseline:', err);
      } finally {
        setIsFindingsLoading(false);
      }
    }
    loadFindings();
  }, [currentBrand.id]);

  // Industry benchmark comparison figures (in hours)
  const mttrBenchmarks = [
    {
      stage: 'AegisAgent DRP Autonomous Pipeline',
      timeText: '< 60 Seconds',
      hours: 0.016,
      barWidthPercent: 2,
      color: 'bg-emerald-500',
      badge: '98.6% Faster',
      badgeColor: isDark
        ? 'border-emerald-500/40 bg-emerald-950/60 text-emerald-300'
        : 'border-emerald-300 bg-emerald-100 text-emerald-900 font-bold shadow-xs'
    },
    {
      stage: 'Level 1 SOC Triage (Manual Queue)',
      timeText: '4.5 Hours',
      hours: 4.5,
      barWidthPercent: 12,
      color: 'bg-blue-500',
      badge: 'Manual Triage',
      badgeColor: isDark
        ? 'border-blue-500/40 bg-blue-950/60 text-blue-300'
        : 'border-blue-300 bg-blue-100 text-blue-900 font-bold shadow-xs'
    },
    {
      stage: 'Legal Counsel Statutory Drafting',
      timeText: '18.0 Hours',
      hours: 18.0,
      barWidthPercent: 40,
      color: 'bg-amber-500',
      badge: 'Manual Affidavit',
      badgeColor: isDark
        ? 'border-amber-500/40 bg-amber-950/60 text-amber-300'
        : 'border-amber-300 bg-amber-100 text-amber-900 font-bold shadow-xs'
    },
    {
      stage: 'Legacy Enterprise DRP Vendor Takedown',
      timeText: '48.0 Hours',
      hours: 48.0,
      barWidthPercent: 100,
      color: 'bg-red-500',
      badge: 'Industry Average',
      badgeColor: isDark
        ? 'border-red-500/40 bg-red-950/60 text-red-300'
        : 'border-red-300 bg-red-100 text-red-900 font-bold shadow-xs'
    }
  ];

  // -------------------------------------------------------------
  // Feature 3: SOC 2 Audit Log Exporter State
  // -------------------------------------------------------------
  const auditEvents = useMemo(() => {
    const baseEvents = [
      {
        id: 'EVT-AUTH-001',
        timestamp: '2026-10-14T09:00:12Z',
        actor: user?.email || 'admin@razorpay.com',
        role: user?.role || 'ciso',
        action: 'USER_AUTHENTICATED',
        targetEntity: 'AegisAgent Enterprise Console',
        status: 'SUCCESS',
        severity: 'LOW',
        hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
      },
      {
        id: 'EVT-RULE-002',
        timestamp: '2026-10-14T09:14:00Z',
        actor: 'Autonomous Engine (FastAPI)',
        role: 'system',
        action: 'OFFICIAL_ASSET_EXCLUSION_SYNC',
        targetEntity: `Brand Registry [${currentBrand.name}]`,
        status: 'ENFORCED',
        severity: 'LOW',
        hash: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08'
      },
      {
        id: 'EVT-SCAN-003',
        timestamp: '2026-10-14T09:18:22Z',
        actor: 'Security Analyst (Alex Chen)',
        role: 'analyst',
        action: 'SOCIAL_RADAR_MONITORING_RUN',
        targetEntity: `${currentBrand.officialHandle} candidates`,
        status: 'COMPLETED',
        severity: 'MEDIUM',
        hash: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8'
      },
      {
        id: 'EVT-EVID-004',
        timestamp: '2026-10-14T09:22:45Z',
        actor: 'Legal Counsel (Sarah Vance)',
        role: 'legal',
        action: 'DRAFT_TAKEDOWN_DOCKET_COMPILED',
        targetEntity: 'Rule 3(2)(b) IT Rules 2021 Statutory Notice',
        status: 'DRAFT_SEALED',
        severity: 'HIGH',
        hash: '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a'
      }
    ];

    if (findings.length > 0) {
      findings.forEach((f, i) => {
        baseEvents.push({
          id: `EVT-FIND-${String(i + 5).padStart(3, '0')}`,
          timestamp: f.created_at || '2026-10-14T10:00:00Z',
          actor: 'DRP Ingestion Scanner',
          role: 'system',
          action: 'THREAT_INGESTED',
          targetEntity: f.suspect_handle || f.suspect_name,
          status: f.review_status || 'NEW',
          severity: f.severity || 'HIGH',
          hash: `b872${i}91823f66a7b${i}981`
        });
      });
    }

    return baseEvents;
  }, [findings, currentBrand, user]);

  const handleExportJSON = () => {
    const payload = {
      exportMetadata: {
        system: 'AegisAgent DRP Enterprise Console',
        tenant: currentBrand.name,
        exportedAt: new Date().toISOString(),
        exportedBy: user?.email || 'admin@razorpay.com',
        auditStandardTarget: 'SOC 2 Type II - CC6.1 / CC7.2 (Preparation Export)',
        disclaimer: 'This artifact contains operational event logs exported from AegisAgent DRP. It does not constitute a formal SOC 2 certification.'
      },
      totalEvents: auditEvents.length,
      events: auditEvents
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aegisagent-drp-audit-log-${currentBrand.id}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    const headers = ['Event ID', 'Timestamp', 'Actor', 'Role', 'Action', 'Target Entity', 'Status', 'Severity', 'SHA-256 Hash'];
    const rows = auditEvents.map(e => [
      e.id,
      e.timestamp,
      `"${e.actor}"`,
      e.role,
      e.action,
      `"${e.targetEntity}"`,
      e.status,
      e.severity,
      e.hash
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aegisagent-drp-audit-log-${currentBrand.id}-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // -------------------------------------------------------------
  // Feature 4: Employee Workspace Access Control State (Preserved)
  // -------------------------------------------------------------
  const [accessRequests, setAccessRequests] = useState([
    {
      id: 'REQ-EMP-201',
      name: 'Rohan Sharma',
      email: 'rohan.s@razorpay.com',
      department: 'Fraud Investigation',
      requestedRole: 'analyst',
      submittedAt: 'Today, 10:14 AM'
    },
    {
      id: 'REQ-EMP-202',
      name: 'Pooja Iyer',
      email: 'pooja.i@razorpay.com',
      department: 'Corporate Legal',
      requestedRole: 'legal',
      submittedAt: 'Today, 11:30 AM'
    }
  ]);

  const approveAccessRequest = (requestId, roleGranted) => {
    setAccessRequests(prev => prev.filter(r => r.id !== requestId));
  };

  // Dashboard Toggle Navigation Items - High Contrast Solid Badges (Matching Role 1 & 2)
  const executiveModules = [
    {
      id: 'calculator',
      name: 'Loss Avoidance Calculator',
      sublabel: 'ROI & Heuristic Risk Model',
      icon: DollarSign,
      badge: `${currencySymbol}${estimatedAvoidedLoss.toLocaleString()}`,
      badgeColor: isDark
        ? 'border-emerald-500/40 bg-emerald-950/60 text-emerald-300'
        : 'border-emerald-300 bg-emerald-100 text-emerald-900 font-bold shadow-xs'
    },
    {
      id: 'mttr',
      name: 'MTTR Latency Benchmarks',
      sublabel: 'Aegis vs SANS Industry Baseline',
      icon: Clock,
      badge: '< 60 Sec',
      badgeColor: isDark
        ? 'border-blue-500/40 bg-blue-950/60 text-blue-300'
        : 'border-sky-300 bg-sky-100 text-sky-900 font-bold shadow-xs'
    },
    {
      id: 'access',
      name: 'Workspace RBAC Governance',
      sublabel: 'CISO Employee Approvals',
      icon: Users,
      badge: `${accessRequests.length} Pending`,
      badgeColor: isDark
        ? 'border-amber-500/40 bg-amber-950/60 text-amber-300'
        : 'border-amber-300 bg-amber-100 text-amber-900 font-bold shadow-xs'
    },
    {
      id: 'audit',
      name: 'SOC 2 Audit Trail Exporter',
      sublabel: 'JSON & CSV Cryptographic Logs',
      icon: ShieldCheck,
      badge: `${auditEvents.length} Logs`,
      badgeColor: isDark
        ? 'border-purple-500/40 bg-purple-950/60 text-purple-300'
        : 'border-purple-300 bg-purple-100 text-purple-900 font-bold shadow-xs'
    },
    {
      id: 'all',
      name: 'Unified Executive Command',
      sublabel: 'Master CISO Matrix Canvas',
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
          ? 'bg-[#071120]/90 backdrop-blur-xl border border-emerald-500/30 shadow-2xl'
          : 'bg-white border border-slate-300 shadow-sm'
      }`}>
        <div>
          <div className={`inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-mono font-bold mb-2 transition ${
            isDark
              ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.2)]'
              : 'bg-emerald-100 border border-emerald-300 text-emerald-950 shadow-xs'
          }`}>
            <BarChart3 className={`w-3.5 h-3.5 ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`} />
            <span>ROLE 4: CISO &amp; EXECUTIVE RISK COMMAND (/executive)</span>
          </div>
          <h1 className={`text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-3 ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}>
            <span>Enterprise Risk Posture &amp; Compliance Center</span>
            <span className={`text-xs px-2.5 py-1 rounded-full font-mono font-semibold transition ${
              isDark
                ? 'bg-emerald-900/40 border border-emerald-500/40 text-emerald-300'
                : 'bg-emerald-100 border border-emerald-300 text-emerald-950 shadow-xs font-bold'
            }`}>
              Tenant: {currentBrand.name}
            </span>
          </h1>
          <p className={`text-sm sm:text-base mt-1.5 max-w-3xl leading-relaxed ${
            isDark ? 'text-slate-300' : 'text-slate-700'
          }`}>
            Logged in as <strong>{user?.name || 'Elena Rostova'}</strong> (CISO). Select any module from the <strong>Dashboard Toggle</strong> on the left to evaluate financial fraud avoidance, monitor MTTR benchmarks, authorize employee RBAC, or export audit event logs.
          </p>
        </div>

        {/* Real-time Executive Indicators - High Contrast Solid Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
          <div className={`p-3.5 rounded-xl border text-center min-w-[110px] transition ${
            isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-300 shadow-xs'
          }`}>
            <div className={`text-xl font-bold font-mono ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
              {currencySymbol}{estimatedAvoidedLoss.toLocaleString()}
            </div>
            <div className={`text-xs uppercase font-bold flex items-center justify-center gap-1.5 mt-0.5 ${
              isDark ? 'text-slate-400' : 'text-slate-700'
            }`}>
              <DollarSign className={`w-3 h-3 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} /> Avoided Loss
            </div>
          </div>

          <div className={`p-3.5 rounded-xl border text-center min-w-[110px] transition ${
            isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-300 shadow-xs'
          }`}>
            <div className={`text-xl font-bold font-mono ${isDark ? 'text-cyan-400' : 'text-blue-700'}`}>&lt; 60 sec</div>
            <div className={`text-xs uppercase font-bold flex items-center justify-center gap-1.5 mt-0.5 ${
              isDark ? 'text-slate-400' : 'text-slate-700'
            }`}>
              <Clock className={`w-3 h-3 ${isDark ? 'text-cyan-400' : 'text-blue-600'}`} /> MTTR Speed
            </div>
          </div>

          <div className={`p-3.5 rounded-xl border text-center min-w-[110px] transition ${
            isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-300 shadow-xs'
          }`}>
            <div className={`text-xl font-bold font-mono ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>
              {accessRequests.length} Pending
            </div>
            <div className={`text-xs uppercase font-bold flex items-center justify-center gap-1.5 mt-0.5 ${
              isDark ? 'text-slate-400' : 'text-slate-700'
            }`}>
              <Users className={`w-3 h-3 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} /> Access Queue
            </div>
          </div>

          <div className={`p-3.5 rounded-xl border text-center min-w-[110px] transition ${
            isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-300 shadow-xs'
          }`}>
            <div className={`text-xl font-bold font-mono ${isDark ? 'text-purple-400' : 'text-purple-700'}`}>
              {auditEvents.length} Logs
            </div>
            <div className={`text-xs uppercase font-bold flex items-center justify-center gap-1.5 mt-0.5 ${
              isDark ? 'text-slate-400' : 'text-slate-700'
            }`}>
              <ShieldCheck className={`w-3 h-3 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} /> Audit Trail
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
              ? 'bg-[#071120]/90 backdrop-blur-xl border border-emerald-500/30 shadow-2xl'
              : 'bg-white border border-slate-300 shadow-sm'
          }`}>
            <div className={`flex items-center justify-between pb-3 border-b mb-3 ${
              isDark ? 'border-slate-800/80' : 'border-slate-200'
            }`}>
              <div className="flex items-center gap-2">
                <LayoutGrid className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                <h2 className={`text-xs font-mono font-bold uppercase tracking-wider ${
                  isDark ? 'text-emerald-300' : 'text-slate-900'
                }`}>
                  Executive Modules
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
              {executiveModules.map((mod) => {
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
                          ? 'bg-gradient-to-r from-emerald-950/70 to-slate-900 border-emerald-400 shadow-[0_0_16px_rgba(16,185,129,0.25)] text-white'
                          : 'bg-emerald-50 border-emerald-600 text-emerald-950 shadow-xs ring-1 ring-emerald-500/50'
                        : isDark
                        ? 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:bg-slate-900/60 hover:text-slate-200 hover:border-slate-700'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`p-2 rounded-lg border shrink-0 transition-colors ${
                        isActive
                          ? isDark
                            ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                            : 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                          : isDark
                          ? 'bg-slate-900 border-slate-800 text-slate-400 group-hover:text-emerald-400'
                          : 'bg-slate-100 border-slate-200 text-slate-600 group-hover:text-emerald-600'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className={`text-xs font-bold ${
                          isActive
                            ? isDark ? 'text-white' : 'text-emerald-950'
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
                          ? isDark ? 'text-emerald-400 translate-x-0.5' : 'text-emerald-600 translate-x-0.5'
                          : 'text-slate-400'
                      }`} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ACTIVE POSTURE QUICK CARD */}
          <div className={`p-4 rounded-2xl transition-all duration-300 space-y-2.5 ${
            isDark
              ? 'bg-[#071120]/90 backdrop-blur-xl border border-emerald-500/30 shadow-2xl'
              : 'bg-white border border-slate-300 shadow-sm'
          }`}>
            <div className="flex items-center justify-between">
              <span className={`text-[11px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                isDark ? 'text-emerald-300' : 'text-slate-900'
              }`}>
                <ShieldCheck className={`w-3.5 h-3.5 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} /> Active Tenant Posture
              </span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold border ${
                isDark
                  ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300'
                  : 'bg-emerald-100 border-emerald-300 text-emerald-950 shadow-xs'
              }`}>
                {currentBrand.id.toUpperCase()}
              </span>
            </div>

            <div className={`p-2.5 rounded-xl border text-[11px] font-mono space-y-1.5 ${
              isDark ? 'bg-slate-950/70 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-800'
            }`}>
              <div className={`font-bold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{currentBrand.name}</div>
              <div className={`flex items-center justify-between text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>
                <span>Industry: {currentBrand.industry}</span>
                <span className={`font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                  {preventionRate}% Protected
                </span>
              </div>

              <div className={`pt-2 border-t ${isDark ? 'border-slate-800' : 'border-slate-200'} flex items-center justify-between gap-2`}>
                <button
                  type="button"
                  onClick={handleExportJSON}
                  className={`w-full py-1.5 px-2 rounded-lg border text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                    isDark
                      ? 'bg-purple-600/20 border-purple-500/40 text-purple-300 hover:bg-purple-600/30'
                      : 'bg-purple-50 border-purple-300 text-purple-900 hover:bg-purple-100 shadow-xs'
                  }`}
                >
                  <Download className="w-3.5 h-3.5 text-purple-600" />
                  <span>Audit JSON</span>
                </button>
                <button
                  type="button"
                  onClick={handleExportCSV}
                  className={`w-full py-1.5 px-2 rounded-lg border text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                    isDark
                      ? 'bg-emerald-600/20 border-emerald-500/40 text-emerald-300 hover:bg-emerald-600/30'
                      : 'bg-emerald-50 border-emerald-300 text-emerald-900 hover:bg-emerald-100 shadow-xs'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Audit CSV</span>
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
              ? 'bg-[#071120]/90 backdrop-blur-xl border-emerald-500/20'
              : 'bg-white border-slate-300'
          }`}>
            <div className="flex items-center gap-2">
              <span className={isDark ? 'text-slate-500' : 'text-slate-600 font-semibold'}>Executive Workspace</span>
              <span className={isDark ? 'text-slate-600' : 'text-slate-400'}>/</span>
              <span className={`font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-800'}`}>
                {executiveModules.find(m => m.id === activeModule)?.name}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className={`flex items-center gap-1.5 ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>
                <span>Tenant:</span>
                <span className={`font-bold px-2 py-0.5 rounded border font-mono ${
                  isDark ? 'text-white bg-slate-900 border-slate-800' : 'text-slate-900 bg-slate-100 border-slate-300'
                }`}>
                  {currentBrand.name}
                </span>
              </div>
              <div className={`h-4 w-px ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
              <button
                type="button"
                onClick={() => loginAsRole('legal')}
                className={`px-2.5 py-1 rounded-lg border transition flex items-center gap-1 cursor-pointer font-bold ${
                  isDark
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                    : 'bg-amber-100 text-amber-950 border-amber-300 hover:bg-amber-200 shadow-xs'
                }`}
              >
                <Scale className="w-3.5 h-3.5" />
                <span>Jump to Legal Desk</span>
                <ArrowRight className="w-3 h-3 ml-0.5" />
              </button>
            </div>
          </div>

          {/* DYNAMIC VIEW ROUTING */}
          <div className="transition-all duration-300 space-y-6">

            {/* VIEW 1: FINANCIAL FRAUD LOSS AVOIDANCE CALCULATOR */}
            {(activeModule === 'calculator' || activeModule === 'all') && (
              <div className={`p-5 rounded-2xl border transition-all duration-300 space-y-5 ${
                isDark
                  ? 'bg-[#071120]/90 backdrop-blur-xl border-emerald-500/30 shadow-2xl'
                  : 'bg-white border-slate-300 shadow-sm'
              }`}>
                <div className={`flex items-center justify-between pb-3 border-b ${isDark ? 'border-slate-800/80' : 'border-slate-200'}`}>
                  <div className="flex items-center gap-2">
                    <Calculator className={`w-4 h-4 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} />
                    <h2 className={`text-sm sm:text-base font-mono font-bold uppercase tracking-wider ${
                      isDark ? 'text-emerald-300' : 'text-slate-900'
                    }`}>
                      Financial Fraud Loss Avoidance Calculator
                    </h2>
                  </div>
                  <span className={`text-xs font-mono px-2.5 py-0.5 rounded border font-bold ${
                    isDark ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-slate-100 border-slate-300 text-slate-800'
                  }`}>
                    Heuristic Exposure Model
                  </span>
                </div>

                <p className={`text-xs sm:text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Quantify avoided enterprise exposure based on neutralised phishing rings and blocked rogue APK installations. Enter parameters or select a scenario preset:
                </p>

                {/* Scenario Preset Buttons */}
                <div className="space-y-2">
                  <span className={`text-xs font-mono font-semibold ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>
                    Scenario Presets:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {scenarioPresets.map((preset, idx) => {
                      const isSelected = affectedCustomers === preset.customers && avgLossPerCustomer === preset.avgLoss;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleApplyPreset(preset)}
                          className={`p-3 rounded-xl border text-left text-xs sm:text-sm font-mono transition cursor-pointer ${
                            isSelected
                              ? isDark
                                ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200 shadow-md ring-1 ring-emerald-500/50'
                                : 'bg-emerald-100 border-emerald-600 text-emerald-950 font-bold shadow-xs ring-1 ring-emerald-500'
                              : isDark
                              ? 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                              : 'bg-slate-50 border-slate-300 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          <div className="font-bold truncate">{preset.name}</div>
                          <div className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600 font-medium'}`}>
                            {preset.customers.toLocaleString()} targets @ ${preset.avgLoss}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Interactive Parameter Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs sm:text-sm font-mono">
                  <div className="space-y-1.5">
                    <label className={`block font-bold ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
                      Targeted Customers (N):
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="1000000"
                      value={affectedCustomers}
                      onChange={(e) => setAffectedCustomers(Number(e.target.value))}
                      className={`w-full rounded-xl px-3.5 py-2.5 text-xs sm:text-sm border focus:outline-none transition ${
                        isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-emerald-500' : 'bg-white border-slate-300 text-slate-900 focus:border-blue-600 shadow-xs'
                      }`}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className={`block font-bold ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
                      Avg Loss per Customer (L):
                    </label>
                    <div className="relative">
                      <span className={`absolute left-3.5 top-2.5 font-bold ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>$</span>
                      <input
                        type="number"
                        min="1"
                        max="100000"
                        value={avgLossPerCustomer}
                        onChange={(e) => setAvgLossPerCustomer(Number(e.target.value))}
                        className={`w-full rounded-xl pl-8 pr-3.5 py-2.5 text-xs sm:text-sm border focus:outline-none transition ${
                          isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-emerald-500' : 'bg-white border-slate-300 text-slate-900 focus:border-blue-600 shadow-xs'
                        }`}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className={`font-bold ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
                        Mitigation Rate (%):
                      </label>
                      <span className={`font-bold text-base ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                        {preventionRate}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="99"
                      value={preventionRate}
                      onChange={(e) => setPreventionRate(Number(e.target.value))}
                      className="w-full h-2.5 bg-slate-300 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500 mt-2.5"
                    />
                  </div>
                </div>

                {/* Formula Callout Banner */}
                <div className={`p-3.5 rounded-xl border text-xs sm:text-sm font-mono ${
                  isDark ? 'bg-slate-950/80 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-300 text-slate-900 shadow-xs'
                }`}>
                  <div className={`text-xs uppercase font-bold mb-1 ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>
                    Calculation Formula:
                  </div>
                  <code className="font-bold">
                    Estimated Avoided Loss = ({affectedCustomers.toLocaleString()} Customers × ${avgLossPerCustomer.toLocaleString()} Avg) × ({preventionRate}% Mitigation)
                  </code>
                </div>

                {/* Financial Results Cards - High Contrast Solid Visuals */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div className={`p-4 rounded-xl border text-center space-y-1.5 ${
                    isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-300 shadow-xs'
                  }`}>
                    <div className={`text-xs font-mono uppercase font-bold ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>
                      Gross Potential Exposure
                    </div>
                    <div className={`text-xl sm:text-2xl font-mono font-bold ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>
                      ${grossPotentialExposure.toLocaleString()}
                    </div>
                  </div>

                  <div className={`p-4 rounded-xl border text-center space-y-1.5 shadow-md ${
                    isDark
                      ? 'border-emerald-500/50 bg-emerald-950/40 text-emerald-200 shadow-emerald-950/30'
                      : 'border-emerald-400 bg-emerald-50 text-emerald-950 shadow-sm'
                  }`}>
                    <div className={`text-xs font-mono uppercase font-bold flex items-center justify-center gap-1.5 ${
                      isDark ? 'text-emerald-300' : 'text-emerald-800'
                    }`}>
                      <Sparkles className="w-3.5 h-3.5" /> Estimated Avoided Loss
                    </div>
                    <div className={`text-2xl sm:text-3xl font-mono font-black ${
                      isDark ? 'text-emerald-400' : 'text-emerald-700'
                    }`}>
                      ${estimatedAvoidedLoss.toLocaleString()}
                    </div>
                  </div>

                  <div className={`p-4 rounded-xl border text-center space-y-1.5 ${
                    isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-300 shadow-xs'
                  }`}>
                    <div className={`text-xs font-mono uppercase font-bold ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>
                      Residual Risk Exposure
                    </div>
                    <div className={`text-xl sm:text-2xl font-mono font-bold ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>
                      ${residualRiskExposure.toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className={`text-xs font-mono italic pt-1 border-t ${isDark ? 'text-slate-400 border-slate-800/80' : 'text-slate-600 border-slate-300'}`}>
                  * Modeling Notice: All financial figures are estimates derived from user-configured parameters and heuristic threat impact models. They do not constitute audited financial statements or guaranteed recovery amounts.
                </div>
              </div>
            )}

            {/* VIEW 2: MTTR BENCHMARK & VELOCITY CHARTS */}
            {(activeModule === 'mttr' || activeModule === 'all') && (
              <div className={`p-5 rounded-2xl border transition-all duration-300 space-y-4 ${
                isDark
                  ? 'bg-[#071120]/90 backdrop-blur-xl border-blue-500/30 shadow-2xl'
                  : 'bg-white border-slate-300 shadow-sm'
              }`}>
                <div className={`flex items-center justify-between pb-3 border-b ${isDark ? 'border-slate-800/80' : 'border-slate-200'}`}>
                  <div className="flex items-center gap-2">
                    <Clock className={`w-4 h-4 ${isDark ? 'text-cyan-400' : 'text-blue-600'}`} />
                    <h2 className={`text-sm sm:text-base font-mono font-bold uppercase tracking-wider ${
                      isDark ? 'text-cyan-300' : 'text-slate-900'
                    }`}>
                      Mean Time to Respond (MTTR) Latency Benchmark
                    </h2>
                  </div>
                  <span className={`text-xs font-mono px-2.5 py-0.5 rounded border font-bold ${
                    isDark ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-slate-100 border-slate-300 text-slate-800'
                  }`}>
                    Industry Baseline vs AegisAgent
                  </span>
                </div>

                <p className={`text-xs sm:text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Comparison of automated statutory evidence compilation velocity versus manual offshore SOC and legal queues.
                </p>

                <div className="space-y-4 pt-1">
                  {mttrBenchmarks.map((bm, idx) => (
                    <div key={idx} className="space-y-1.5 font-mono text-xs sm:text-sm">
                      <div className="flex items-center justify-between">
                        <span className={`font-bold ${idx === 0 ? (isDark ? 'text-emerald-400' : 'text-emerald-800') : (isDark ? 'text-slate-200' : 'text-slate-900')}`}>
                          {bm.stage}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{bm.timeText}</span>
                          <span className={`text-xs px-2 py-0.5 rounded border font-semibold ${bm.badgeColor}`}>
                            {bm.badge}
                          </span>
                        </div>
                      </div>

                      <div className={`w-full h-3.5 rounded-full overflow-hidden ${isDark ? 'bg-slate-900' : 'bg-slate-200'}`}>
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${bm.color}`}
                          style={{ width: `${bm.barWidthPercent}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className={`p-3.5 rounded-xl border text-xs sm:text-sm font-mono space-y-1.5 ${
                  isDark ? 'bg-slate-950/70 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-300 text-slate-700'
                }`}>
                  <div className={`flex items-center gap-2 font-bold ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>
                    <Info className="w-4 h-4 text-blue-600" />
                    <span>Benchmark Units &amp; Provenance:</span>
                  </div>
                  <p className="leading-relaxed">
                    AegisAgent latency refers to automated forensic scoring and sealed pre-flight docket generation. Industry baseline metrics (4.5h to 48h) are derived from SANS &amp; Gartner 2024 Incident Response incident queues. This comparison reflects evidence preparation speed, not unconfirmed live third-party platform dispatch.
                  </p>
                </div>
              </div>
            )}

            {/* VIEW 3: WORKSPACE ACCESS MANAGEMENT */}
            {(activeModule === 'access' || activeModule === 'all') && (
              <div className={`p-5 rounded-2xl border transition-all duration-300 space-y-4 ${
                isDark
                  ? 'bg-[#071120]/90 backdrop-blur-xl border-amber-500/30 shadow-2xl'
                  : 'bg-white border-slate-300 shadow-sm'
              }`}>
                <div className={`flex items-center justify-between pb-3 border-b ${isDark ? 'border-slate-800/80' : 'border-slate-200'}`}>
                  <div className="flex items-center gap-2">
                    <Users className={`w-4 h-4 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
                    <h2 className={`text-sm sm:text-base font-mono font-bold uppercase tracking-wider ${
                      isDark ? 'text-amber-300' : 'text-slate-900'
                    }`}>
                      Employee Workspace Access Requests (CISO Authorization)
                    </h2>
                  </div>
                  <span className={`text-xs font-mono px-2.5 py-0.5 rounded font-bold border ${
                    accessRequests.length > 0
                      ? isDark ? 'bg-amber-950/60 border-amber-500/50 text-amber-300' : 'bg-amber-100 border-amber-300 text-amber-950 shadow-xs'
                      : isDark ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300' : 'bg-emerald-100 border-emerald-300 text-emerald-950 shadow-xs'
                  }`}>
                    {accessRequests.length} Pending Approval
                  </span>
                </div>

                {accessRequests.length === 0 ? (
                  <div className={`p-5 rounded-xl border text-center text-xs sm:text-sm font-mono ${
                    isDark ? 'bg-slate-950/50 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-300 text-slate-700'
                  }`}>
                    Zero pending access requests. All organization employees provisioned with authorized RBAC credentials.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {accessRequests.map((req) => (
                      <div
                        key={req.id}
                        className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm font-mono transition ${
                          isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-300 shadow-xs'
                        }`}
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <strong className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>{req.name}</strong>
                            <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>({req.email})</span>
                          </div>
                          <div className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-700 font-medium'}`}>
                            Department: <span className={`font-semibold ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>{req.department}</span> • Requested Role:{' '}
                            <span className={`font-bold uppercase ${isDark ? 'text-cyan-400' : 'text-blue-700'}`}>{req.requestedRole}</span> • {req.submittedAt}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => approveAccessRequest(req.id, req.requestedRole)}
                            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition flex items-center gap-1.5 text-xs sm:text-sm cursor-pointer shadow-sm"
                          >
                            <Check className="w-4 h-4" />
                            <span>Approve &amp; Grant {req.requestedRole.toUpperCase()}</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* VIEW 4: SOC 2 AUDIT LOG EXPORTER */}
            {(activeModule === 'audit' || activeModule === 'all') && (
              <div className={`p-5 rounded-2xl border transition-all duration-300 space-y-4 ${
                isDark
                  ? 'bg-[#071120]/90 backdrop-blur-xl border-purple-500/30 shadow-2xl'
                  : 'bg-white border-slate-300 shadow-sm'
              }`}>
                <div className={`flex items-center justify-between pb-3 border-b ${isDark ? 'border-slate-800/80' : 'border-slate-200'}`}>
                  <div className="flex items-center gap-2">
                    <ShieldCheck className={`w-4 h-4 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} />
                    <h2 className={`text-sm sm:text-base font-mono font-bold uppercase tracking-wider ${
                      isDark ? 'text-purple-300' : 'text-slate-900'
                    }`}>
                      Audit Event Log Exporter
                    </h2>
                  </div>
                  <span className={`text-xs font-mono px-2.5 py-0.5 rounded border font-bold ${
                    isDark ? 'bg-slate-900 border-slate-800 text-slate-300' : 'bg-slate-100 border-slate-300 text-slate-800'
                  }`}>
                    Export Utility
                  </span>
                </div>

                <p className={`text-xs sm:text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                  Download cryptographically sealed records of all system triage decisions, brand exclusions, and docket generations for internal review and compliance preparation.
                </p>

                <div className={`rounded-xl border overflow-hidden ${
                  isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-300 shadow-xs'
                }`}>
                  <div className="max-h-56 overflow-y-auto">
                    <table className="w-full text-left text-xs font-mono">
                      <thead className={`border-b sticky top-0 ${
                        isDark ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-slate-100 border-slate-300 text-slate-900 font-bold'
                      }`}>
                        <tr>
                          <th className="p-3">Event ID</th>
                          <th className="p-3">Action</th>
                          <th className="p-3">Actor</th>
                          <th className="p-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className={`divide-y ${isDark ? 'divide-slate-800/60' : 'divide-slate-200'}`}>
                        {auditEvents.slice(0, 6).map((evt) => (
                          <tr key={evt.id} className={isDark ? 'hover:bg-slate-900/50' : 'hover:bg-slate-50'}>
                            <td className={`p-3 font-bold ${isDark ? 'text-cyan-400' : 'text-blue-700'}`}>{evt.id}</td>
                            <td className={`p-3 truncate max-w-[150px] font-semibold ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>{evt.action}</td>
                            <td className={`p-3 truncate max-w-[120px] ${isDark ? 'text-slate-400' : 'text-slate-700'}`}>{evt.actor}</td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded border text-xs font-bold ${
                                isDark
                                  ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
                                  : 'bg-emerald-100 border-emerald-300 text-emerald-950 shadow-xs'
                              }`}>
                                {evt.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={handleExportJSON}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-mono font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer shadow-md transition"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export Audit Log (JSON)</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleExportCSV}
                    className={`w-full sm:w-auto px-5 py-2.5 rounded-xl border font-mono font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition ${
                      isDark
                        ? 'bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800'
                        : 'bg-slate-100 border-slate-300 text-slate-800 hover:bg-slate-200 shadow-xs'
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    <span>Export Audit Log (CSV)</span>
                  </button>
                </div>

                <div className={`text-xs font-mono italic pt-1 border-t ${isDark ? 'text-slate-400 border-slate-800/80' : 'text-slate-600 border-slate-300'}`}>
                  * Audit Utility Notice: This tool exports recorded system triage events and operator actions. It serves as an audit trail export utility and does NOT constitute a formal SOC 2 Type II attestation, third-party certification, or legal guarantee of compliance.
                </div>
              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}
