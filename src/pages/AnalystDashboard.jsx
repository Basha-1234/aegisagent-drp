import React, { useState, useMemo, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { BRANDS, INITIAL_THREATS } from '../data/mockData';
import { api } from '../utils/apiClient';
import LogoDiffHeatmap from '../components/analyst/LogoDiffHeatmap';
import ThreatVectorPieChart from '../components/analyst/ThreatVectorPieChart';
import SyndicateNodeGraph from '../components/analyst/SyndicateNodeGraph';
import TemporalThreatHeatmap from '../components/analyst/TemporalThreatHeatmap';
import ApkPermissionGauge from '../components/analyst/ApkPermissionGauge';
import HomoglyphInspector from '../components/analyst/HomoglyphInspector';
import ThreatVelocityChart from '../components/analyst/ThreatVelocityChart';
import {
  ShieldAlert,
  Search,
  Radio,
  Flame,
  Layers,
  Network,
  PieChart as PieChartIcon,
  Calendar,
  Scale,
  Smartphone,
  Globe,
  AtSign,
  Zap,
  Clock,
  Sparkles,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  FileText,
  ChevronRight,
  LayoutGrid,
  Filter,
  Check,
  RefreshCw,
  Play,
  Download,
  ShieldCheck,
  Database,
  Loader2,
  X,
  Info
} from 'lucide-react';

function normalizeFinding(f, brand) {
  const isApp = f.channel === 'Rogue Mobile App' || Boolean(f.suspect_publisher);
  const isDomain = f.channel === 'Phishing Website' || f.channel === 'Phishing Domain';
  const platform = f.platform || (isApp ? 'Google Play Store' : isDomain ? 'Web Domain' : 'Social Platform');

  return {
    id: f.id,
    brandId: f.brand_id || f.brandId || brand?.id || 'razorpay',
    platform: platform,
    channel: f.channel || (isApp ? 'Rogue Mobile App' : isDomain ? 'Phishing Website' : 'Social Profile'),
    suspectName: f.suspect_name || f.suspectName || 'Unknown Entity',
    suspectHandle: f.suspect_handle || f.suspectHandle || f.suspect_name || f.suspectName,
    suspectPublisher: f.suspect_publisher || f.suspectPublisher || null,
    avatarUrl: f.avatar_url || f.avatarUrl || brand?.logoUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
    suspectBio: f.suspect_bio || f.suspectBio || '',
    suspectUrl: f.suspect_url || f.suspectUrl || '',
    postCaptions: f.post_captions || f.postCaptions || [],
    followersCount: f.followers_count || f.followersCount || 0,
    accountAgeDays: f.account_age_days || f.accountAgeDays || 0,
    status: f.review_status || f.status || 'NEW',
    logoMatchPercent: f.logo_match_percent !== undefined ? f.logo_match_percent : (f.logoMatchPercent || 0),
    compositeScore: f.composite_score !== undefined ? f.composite_score : (f.riskScore || f.logoMatchPercent || 75),
    severity: f.severity || (f.composite_score >= 80 ? 'CRITICAL' : 'HIGH'),
    reasons: f.reasons || [],
    breakdown: f.breakdown || {},
    provenance: f.provenance || 'demo_fixture',
    isLive: f.provenance === 'live_connector',
    detectionDate: f.created_at || f.detectionDate || new Date().toISOString()
  };
}

export default function AnalystDashboard() {
  const { user, activeBrandId, loginAsRole } = useAuth();
  const { isDark } = useTheme();

  // Active brand profile
  const currentBrand = BRANDS.find(b => b.id === activeBrandId) || BRANDS[0];

  // Dashboard Module Toggle State (Defaults to Threat Radar Ingestion)
  // Options: 'radar' | 'heatmap' | 'forensics' | 'syndicate' | 'pie' | 'temporal' | 'legal' | 'all'
  const [activeModule, setActiveModule] = useState('radar');

  // Backend Integration State
  const [backendFindings, setBackendFindings] = useState(null);
  const [isApiConnected, setIsApiConnected] = useState(false);
  const [isLoadingFindings, setIsLoadingFindings] = useState(false);
  const [isScanningSocial, setIsScanningSocial] = useState(false);
  const [isScanningApps, setIsScanningApps] = useState(false);
  const [statusUpdatingId, setStatusUpdatingId] = useState(null);
  const [scanNotification, setScanNotification] = useState(null);
  const [isBrandAssetsModalOpen, setIsBrandAssetsModalOpen] = useState(false);

  // Threat filtering & selection state
  const [selectedThreatId, setSelectedThreatId] = useState('THREAT-101');
  const [vectorFilter, setVectorFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Brand-specific threat list (normalized from backend or local fallback)
  const brandThreats = useMemo(() => {
    if (backendFindings && backendFindings.length > 0) {
      return backendFindings.map(f => normalizeFinding(f, currentBrand));
    }
    return INITIAL_THREATS.filter(t => t.brandId === currentBrand.id).map(t => normalizeFinding(t, currentBrand));
  }, [backendFindings, currentBrand]);

  // Load findings from backend
  const loadFindings = async () => {
    setIsLoadingFindings(true);
    try {
      const health = await api.getHealth();
      if (health.status === 'ok') {
        setIsApiConnected(true);
      }
      const findings = await api.getFindings({ brandId: currentBrand.id });
      setBackendFindings(findings);
    } catch (err) {
      console.warn('Backend offline or unreachable, using local fallback:', err);
      setIsApiConnected(false);
      setBackendFindings(null);
    } finally {
      setIsLoadingFindings(false);
    }
  };

  useEffect(() => {
    loadFindings();
  }, [currentBrand.id]);

  // Sync selectedThreatId with current threat list
  useEffect(() => {
    if (brandThreats.length > 0) {
      const exists = brandThreats.some(t => t.id === selectedThreatId);
      if (!exists) {
        setSelectedThreatId(brandThreats[0].id);
      }
    }
  }, [brandThreats, selectedThreatId]);

  // Action handlers
  const handleRunSocialMonitoring = async () => {
    setIsScanningSocial(true);
    setScanNotification(null);
    try {
      const result = await api.runSocialMonitoring(currentBrand.id);
      setScanNotification({
        type: 'success',
        title: 'Social Monitoring Run Complete',
        runId: result.run_id,
        details: `Scanned ${result.candidates_scanned} candidate profiles. Flagged ${result.threats_detected} threats (${result.excluded_official_assets} official handles protected by exclusion registry).`,
        provenance: result.provenance,
        timestamp: new Date().toLocaleTimeString()
      });
      await loadFindings();
    } catch (err) {
      console.error('Social monitoring run failed:', err);
      setScanNotification({
        type: 'error',
        title: 'Social Monitoring Failed',
        details: err.message || 'FastAPI service unavailable.'
      });
    } finally {
      setIsScanningSocial(false);
    }
  };

  const handleRunAppMonitoring = async () => {
    setIsScanningApps(true);
    setScanNotification(null);
    try {
      const result = await api.runAppMonitoring(currentBrand.id);
      setScanNotification({
        type: 'success',
        title: 'App Store Monitoring Run Complete',
        runId: result.run_id,
        details: `Audited ${result.candidates_scanned} mobile packages. Flagged ${result.threats_detected} rogue applications (${result.excluded_official_assets} official apps protected).`,
        provenance: result.provenance,
        timestamp: new Date().toLocaleTimeString()
      });
      await loadFindings();
    } catch (err) {
      console.error('App monitoring run failed:', err);
      setScanNotification({
        type: 'error',
        title: 'App Monitoring Failed',
        details: err.message || 'FastAPI service unavailable.'
      });
    } finally {
      setIsScanningApps(false);
    }
  };

  const handleStatusUpdate = async (threatId, newStatus) => {
    setStatusUpdatingId(threatId);
    try {
      await api.updateFindingStatus(threatId, newStatus);
      setBackendFindings(prev => {
        if (!prev) return prev;
        return prev.map(f => f.id === threatId ? { ...f, review_status: newStatus } : f);
      });
    } catch (err) {
      console.error('Failed to update status on backend:', err);
      setBackendFindings(prev => {
        if (!prev) return prev;
        return prev.map(f => f.id === threatId ? { ...f, review_status: newStatus } : f);
      });
    } finally {
      setStatusUpdatingId(null);
    }
  };

  const handleExportDocket = async (threatId) => {
    try {
      const report = await api.getEvidentiaryReport(threatId);
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(report, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `evidentiary_docket_${threatId}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (err) {
      console.error('Failed to export docket:', err);
      alert('Could not export docket: ' + err.message);
    }
  };

  // Filtered threats
  const filteredThreats = useMemo(() => {
    return brandThreats.filter(threat => {
      if (vectorFilter === 'social' && threat.channel !== 'Social Profile') return false;
      if (vectorFilter === 'domain' && threat.channel !== 'Phishing Website' && threat.channel !== 'Phishing Domain') return false;
      if (vectorFilter === 'apk' && threat.channel !== 'Rogue Mobile App') return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = threat.suspectName?.toLowerCase().includes(q);
        const matchHandle = threat.suspectHandle?.toLowerCase().includes(q);
        const matchPlatform = threat.platform?.toLowerCase().includes(q);
        if (!matchName && !matchHandle && !matchPlatform) return false;
      }
      return true;
    });
  }, [brandThreats, vectorFilter, searchQuery]);

  // Active threat object
  const activeThreat = useMemo(() => {
    return brandThreats.find(t => t.id === selectedThreatId) || brandThreats[0] || INITIAL_THREATS[0];
  }, [brandThreats, selectedThreatId]);

  // Threat vector category
  const threatType = useMemo(() => {
    if (activeThreat.channel === 'Rogue Mobile App') return 'apk';
    if (activeThreat.channel === 'Phishing Website' || activeThreat.channel === 'Phishing Domain' || activeThreat.platform === 'Phishing Domain') return 'domain';
    return 'social';
  }, [activeThreat]);

  // Platform icon helper
  const renderPlatformIcon = (platform, className = "w-4 h-4") => {
    const p = platform.toLowerCase();
    if (p.includes('google') || p.includes('app') || p.includes('apk')) {
      return <Smartphone className={className} />;
    }
    if (p.includes('domain') || p.includes('phishing') || p.includes('web')) {
      return <Globe className={className} />;
    }
    return <AtSign className={className} />;
  };

  // Dashboard Toggle Navigation Items - High Contrast Solid Badges
  const dashboardModules = [
    {
      id: 'radar',
      name: 'Threat Radar & Ingestion Feed',
      sublabel: 'Live Multi-Signal Stream',
      icon: Radio,
      badge: `${brandThreats.length} Alerts`,
      badgeColor: isDark
        ? 'border-cyan-500/40 bg-cyan-950/60 text-cyan-300'
        : 'border-sky-300 bg-sky-100 text-sky-900 font-bold shadow-xs'
    },
    {
      id: 'heatmap',
      name: 'Visual Logo Diff Heatmap',
      sublabel: '12x12 Pixel Delta Matrix',
      icon: Flame,
      badge: '144 Cells',
      badgeColor: isDark
        ? 'border-amber-500/40 bg-amber-950/60 text-amber-300'
        : 'border-amber-300 bg-amber-100 text-amber-900 font-bold shadow-xs'
    },
    {
      id: 'forensics',
      name: 'Vector Deep Forensics',
      sublabel: 'APK Audit & Homoglyph Spec',
      icon: ShieldAlert,
      badge: 'L4 Critical',
      badgeColor: isDark
        ? 'border-red-500/40 bg-red-950/60 text-red-300'
        : 'border-red-300 bg-red-100 text-red-900 font-bold shadow-xs'
    },
    {
      id: 'syndicate',
      name: 'Coordinated Syndicate Graph',
      sublabel: 'Kraken-09 Attack Ring',
      icon: Network,
      badge: '5 Nodes',
      badgeColor: isDark
        ? 'border-blue-500/40 bg-blue-950/60 text-blue-300'
        : 'border-blue-300 bg-blue-100 text-blue-900 font-bold shadow-xs'
    },
    {
      id: 'pie',
      name: 'Threat Vector Distribution',
      sublabel: 'SVG Pie & Donut Diagram',
      icon: PieChartIcon,
      badge: '44% / 33% / 22%',
      badgeColor: isDark
        ? 'border-cyan-500/40 bg-cyan-950/60 text-cyan-300'
        : 'border-sky-300 bg-sky-100 text-sky-900 font-bold shadow-xs'
    },
    {
      id: 'temporal',
      name: 'Temporal Heatmap & Velocity',
      sublabel: '7-Day Cycles & 24h Area Graph',
      icon: Calendar,
      badge: 'Peak 9/hr',
      badgeColor: isDark
        ? 'border-purple-500/40 bg-purple-950/60 text-purple-300'
        : 'border-purple-300 bg-purple-100 text-purple-900 font-bold shadow-xs'
    },
    {
      id: 'legal',
      name: 'Legal Escalation Dock',
      sublabel: 'Affidavit Builder & Takedown',
      icon: Scale,
      badge: 'Ready',
      badgeColor: isDark
        ? 'border-emerald-500/40 bg-emerald-950/60 text-emerald-300'
        : 'border-emerald-300 bg-emerald-100 text-emerald-900 font-bold shadow-xs'
    },
    {
      id: 'all',
      name: 'Unified Command Matrix',
      sublabel: 'All Visual Components',
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
              ? 'bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
              : 'bg-sky-100 border border-sky-300 text-sky-950 shadow-xs'
          }`}>
            <ShieldAlert className={`w-3.5 h-3.5 ${isDark ? 'text-cyan-400' : 'text-sky-700'}`} />
            <span>ROLE 1: SECURITY ANALYST FORENSIC WORKSPACE (/analyst)</span>
          </div>
          <h1 className={`text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-3 ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}>
            <span>Threat Triage &amp; Visual Evidence Engine</span>
            <span className={`text-xs px-2.5 py-1 rounded-full font-mono font-semibold transition ${
              isDark
                ? 'bg-blue-900/40 border border-blue-500/40 text-blue-300'
                : 'bg-blue-100 border border-blue-300 text-blue-950 shadow-xs font-bold'
            }`}>
              Tenant: {currentBrand.name}
            </span>
          </h1>
          <p className={`text-sm sm:text-base mt-1.5 max-w-3xl leading-relaxed ${
            isDark ? 'text-slate-300' : 'text-slate-600'
          }`}>
            Select any module from the <strong>Dashboard Toggle</strong> on the left to display its dedicated workspace on the right.
          </p>
        </div>

        {/* Real-time Telemetry Indicators */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
          <div className={`p-3.5 rounded-xl border text-center min-w-[110px] transition ${
            isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200 shadow-xs'
          }`}>
            <div className={`text-xl font-bold font-mono ${isDark ? 'text-cyan-400' : 'text-blue-700'}`}>
              {brandThreats.length} Alerts
            </div>
            <div className={`text-xs uppercase font-bold flex items-center justify-center gap-1.5 mt-0.5 ${
              isDark ? 'text-slate-400' : 'text-slate-600'
            }`}>
              <Zap className={`w-3 h-3 ${isDark ? 'text-cyan-400' : 'text-blue-600'}`} /> Active Queue
            </div>
          </div>

          <div className={`p-3.5 rounded-xl border text-center min-w-[110px] transition ${
            isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200 shadow-xs'
          }`}>
            <div className={`text-xl font-bold font-mono ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>&lt; 2.4 min</div>
            <div className={`text-xs uppercase font-bold flex items-center justify-center gap-1.5 mt-0.5 ${
              isDark ? 'text-slate-400' : 'text-slate-600'
            }`}>
              <Clock className={`w-3 h-3 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} /> MTTD (Benchmark)
            </div>
          </div>

          <div className={`p-3.5 rounded-xl border text-center min-w-[110px] transition ${
            isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200 shadow-xs'
          }`}>
            <div className={`text-xl font-bold font-mono ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>2 Clusters</div>
            <div className={`text-xs uppercase font-bold flex items-center justify-center gap-1.5 mt-0.5 ${
              isDark ? 'text-slate-400' : 'text-slate-600'
            }`}>
              <Network className={`w-3 h-3 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} /> Syndicates (Demo)
            </div>
          </div>

          <div className={`p-3.5 rounded-xl border text-center min-w-[110px] transition ${
            isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200 shadow-xs'
          }`}>
            <div className={`text-xl font-bold font-mono ${isDark ? 'text-purple-400' : 'text-purple-700'}`}>96.8%</div>
            <div className={`text-xs uppercase font-bold flex items-center justify-center gap-1.5 mt-0.5 ${
              isDark ? 'text-slate-400' : 'text-slate-600'
            }`}>
              <Sparkles className={`w-3 h-3 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} /> Diff (Benchmark)
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
                <LayoutGrid className={`w-4 h-4 ${isDark ? 'text-cyan-400' : 'text-blue-600'}`} />
                <h2 className={`text-xs font-mono font-bold uppercase tracking-wider ${
                  isDark ? 'text-cyan-300' : 'text-slate-900'
                }`}>
                  Dashboard Modules
                </h2>
              </div>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold border ${
                isDark
                  ? 'bg-slate-900 border-slate-800 text-slate-400'
                  : 'bg-slate-100 border-slate-300 text-slate-700'
              }`}>
                8 Views
              </span>
            </div>

            {/* Navigation Toggle Buttons List */}
            <div className="space-y-1.5">
              {dashboardModules.map((mod) => {
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

          {/* ACTIVE TARGET SELECTOR QUICK CARD */}
          <div className={`p-4 rounded-2xl transition-all duration-300 space-y-2.5 ${
            isDark
              ? 'bg-[#071120]/90 backdrop-blur-xl border border-blue-500/30 shadow-2xl'
              : 'bg-white border border-slate-300 shadow-sm'
          }`}>
            <div className="flex items-center justify-between">
              <span className={`text-[11px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                isDark ? 'text-cyan-300' : 'text-slate-900'
              }`}>
                <Flame className={`w-3.5 h-3.5 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} /> Active Threat Target
              </span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold border ${
                isDark
                  ? 'bg-red-950/80 border-red-500/40 text-red-300'
                  : 'bg-rose-100 border-rose-300 text-rose-950 shadow-xs'
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

            <div className={`p-2.5 rounded-xl border text-[11px] font-mono space-y-2 ${
              isDark ? 'bg-slate-950/70 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}>
              <div className={`font-bold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{activeThreat.suspectName}</div>
              <div className={`flex items-center justify-between text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                <span>Platform: {activeThreat.platform}</span>
                <span className={`font-bold ${isDark ? 'text-cyan-400' : 'text-blue-700'}`}>Match: {activeThreat.logoMatchPercent}%</span>
              </div>

              {/* Provenance Tag */}
              <div className="flex items-center justify-between text-[10px] pt-1.5 border-t border-slate-800/60">
                <span className="text-slate-400">Provenance:</span>
                <span className={`px-2 py-0.5 rounded border font-semibold flex items-center gap-1 ${
                  activeThreat.provenance === 'live_connector'
                    ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                    : 'bg-slate-900 border-slate-700 text-slate-300'
                }`}>
                  <Database className="w-2.5 h-2.5" />
                  {activeThreat.provenance === 'live_connector' ? 'Live Stream' : 'Demo Fixture (Synthetic)'}
                </span>
              </div>

              {/* Review Status Selector */}
              <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between gap-1.5">
                <span className="text-[10px] text-slate-400 shrink-0">Review Status:</span>
                <select
                  value={activeThreat.status || 'NEW'}
                  onChange={(e) => handleStatusUpdate(activeThreat.id, e.target.value)}
                  disabled={statusUpdatingId === activeThreat.id}
                  className={`w-full text-[10px] font-mono font-bold rounded-lg px-2 py-1 border transition cursor-pointer ${
                    isDark ? 'bg-slate-900 border-slate-700 text-cyan-300 focus:border-cyan-500' : 'bg-white border-slate-300 text-slate-900 shadow-xs'
                  }`}
                >
                  <option value="NEW">NEW</option>
                  <option value="INVESTIGATING">INVESTIGATING</option>
                  <option value="CONFIRMED_THREAT">CONFIRMED_THREAT</option>
                  <option value="BENIGN_DISMISSED">BENIGN_DISMISSED</option>
                  <option value="TAKEDOWN_REQUESTED">TAKEDOWN_REQUESTED</option>
                </select>
              </div>

              {/* Quick Export Docket */}
              <button
                type="button"
                onClick={() => handleExportDocket(activeThreat.id)}
                className={`w-full mt-1 py-1.5 px-2 rounded-lg border text-[11px] font-mono font-bold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                  isDark
                    ? 'bg-blue-600/20 border-blue-500/40 text-cyan-300 hover:bg-blue-600/30'
                    : 'bg-blue-50 border-blue-200 text-blue-800 hover:bg-blue-100 shadow-xs'
                }`}
              >
                <Download className="w-3.5 h-3.5 text-cyan-400" />
                <span>Export Court Docket (JSON)</span>
              </button>
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
              <span className={isDark ? 'text-slate-500' : 'text-slate-400'}>Analyst Workspace</span>
              <span className={isDark ? 'text-slate-600' : 'text-slate-300'}>/</span>
              <span className={`font-bold ${isDark ? 'text-cyan-400' : 'text-blue-700'}`}>
                {dashboardModules.find(m => m.id === activeModule)?.name}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className={`flex items-center gap-1.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                <span>Inspecting:</span>
                <span className={`font-bold px-2 py-0.5 rounded border font-mono ${
                  isDark ? 'text-white bg-slate-900 border-slate-800' : 'text-slate-900 bg-slate-100 border-slate-300'
                }`}>
                  {activeThreat.suspectHandle}
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

          {/* DYNAMIC VIEW ROUTING: SHOW ONLY THE SELECTED COMPONENT */}
          <div className="transition-all duration-300">

            {/* 1. THREAT RADAR & INGESTION FEED */}
            {activeModule === 'radar' && (
              <div className={`p-5 rounded-2xl space-y-5 transition-all duration-300 ${
                isDark
                  ? 'bg-[#071120]/90 backdrop-blur-xl border border-blue-500/30 shadow-2xl'
                  : 'bg-white border border-slate-300 shadow-sm'
              }`}>
                <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b ${
                  isDark ? 'border-slate-800/80' : 'border-slate-200'
                }`}>
                  <div>
                    <div className="flex items-center gap-2">
                      <Radio className={`w-4 h-4 animate-pulse ${isDark ? 'text-cyan-400' : 'text-blue-600'}`} />
                      <h2 className={`text-sm font-mono font-bold uppercase tracking-wider ${
                        isDark ? 'text-cyan-300' : 'text-slate-900'
                      }`}>
                        Multi-Signal Threat Radar &amp; Ingestion Stream
                      </h2>
                    </div>
                    <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                      Real-time cross-platform radar ingesting suspicious profiles, domains, and app packages.
                    </p>
                  </div>

                  {/* Search Bar */}
                  <div className="relative w-full sm:w-72">
                    <Search className={`w-4 h-4 absolute left-3 top-2.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search handles, domains, APKs..."
                      className={`w-full rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none border transition ${
                        isDark
                          ? 'bg-slate-950/90 border-slate-800 text-white placeholder-slate-500 focus:border-cyan-500'
                          : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-blue-600 shadow-xs'
                      }`}
                    />
                  </div>
                </div>

                {/* Backend Pipeline Controls Toolbar */}
                <div className={`p-3.5 rounded-xl border flex flex-wrap items-center justify-between gap-3 ${
                  isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Run Social Monitoring */}
                    <button
                      type="button"
                      onClick={handleRunSocialMonitoring}
                      disabled={isScanningSocial || isScanningApps}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-2 transition cursor-pointer ${
                        isScanningSocial
                          ? 'bg-cyan-950/60 border border-cyan-500/50 text-cyan-300 opacity-80 cursor-wait'
                          : isDark
                          ? 'bg-blue-600/20 border border-blue-500/40 text-blue-300 hover:bg-blue-600/30'
                          : 'bg-blue-50 border border-blue-300 text-blue-700 hover:bg-blue-100 shadow-xs'
                      }`}
                    >
                      {isScanningSocial ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                      ) : (
                        <Radio className="w-3.5 h-3.5 text-cyan-400" />
                      )}
                      <span>{isScanningSocial ? 'Scanning Social...' : 'Run Social Monitoring'}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-950/60 border border-cyan-500/40 text-cyan-300">FastAPI</span>
                    </button>

                    {/* Run App Monitoring */}
                    <button
                      type="button"
                      onClick={handleRunAppMonitoring}
                      disabled={isScanningSocial || isScanningApps}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-2 transition cursor-pointer ${
                        isScanningApps
                          ? 'bg-amber-950/60 border border-amber-500/50 text-amber-300 opacity-80 cursor-wait'
                          : isDark
                          ? 'bg-amber-600/20 border border-amber-500/40 text-amber-300 hover:bg-amber-600/30'
                          : 'bg-amber-50 border border-amber-300 text-amber-800 hover:bg-amber-100 shadow-xs'
                      }`}
                    >
                      {isScanningApps ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                      ) : (
                        <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                      )}
                      <span>{isScanningApps ? 'Auditing Packages...' : 'Run App Store Monitoring'}</span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-950/60 border border-amber-500/40 text-amber-300">APK Audit</span>
                    </button>

                    {/* Refresh Findings */}
                    <button
                      type="button"
                      onClick={loadFindings}
                      disabled={isLoadingFindings}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 border transition cursor-pointer ${
                        isDark
                          ? 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
                          : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100 shadow-xs'
                      }`}
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isLoadingFindings ? 'animate-spin text-cyan-400' : ''}`} />
                      <span>Refresh</span>
                    </button>

                    {/* Official Brand Assets */}
                    <button
                      type="button"
                      onClick={() => setIsBrandAssetsModalOpen(true)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 border transition cursor-pointer ${
                        isDark
                          ? 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white'
                          : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100 shadow-xs'
                      }`}
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Official Assets</span>
                    </button>
                  </div>

                  {/* Provenance & API Status indicator */}
                  <div className="flex items-center gap-2 text-[11px] font-mono">
                    <span className={`px-2.5 py-1 rounded-full border font-bold flex items-center gap-1.5 ${
                      isApiConnected
                        ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}>
                      <span className={`w-2 h-2 rounded-full ${isApiConnected ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                      {isApiConnected ? 'FastAPI Connected' : 'Mock Fallback'}
                    </span>
                  </div>
                </div>

                {/* Scan Notification Banner */}
                {scanNotification && (
                  <div className={`p-4 rounded-xl border flex items-start justify-between gap-3 text-xs font-mono transition-all ${
                    scanNotification.type === 'success'
                      ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                      : 'bg-red-950/40 border-red-500/40 text-red-200'
                  }`}>
                    <div className="flex items-start gap-2.5">
                      {scanNotification.type === 'success' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <div className="font-bold flex items-center gap-2">
                          <span>{scanNotification.title}</span>
                          {scanNotification.runId && (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-900/60 border border-emerald-500/40 text-emerald-300">
                              Run: {scanNotification.runId}
                            </span>
                          )}
                          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300">
                            Provenance: Demo Fixture
                          </span>
                        </div>
                        <p className="mt-1 text-[11px] opacity-90">{scanNotification.details}</p>
                        <p className="mt-1 text-[10px] text-slate-400 italic">
                          * Hackathon Transparency: Evaluated candidate profiles are synthetic demo fixtures. External platforms were not scraped without authorized API credentials.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setScanNotification(null)}
                      className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Vector Filter Bar */}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className={`text-xs font-mono mr-1 flex items-center gap-1 ${
                    isDark ? 'text-slate-400' : 'text-slate-600'
                  }`}>
                    <Filter className="w-3.5 h-3.5" /> Filter:
                  </span>
                  <button
                    onClick={() => setVectorFilter('all')}
                    className={`px-3 py-1.5 rounded-lg border font-mono transition font-bold ${
                      vectorFilter === 'all'
                        ? isDark
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-sm'
                          : 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : isDark
                        ? 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-white'
                        : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    All Vectors ({brandThreats.length})
                  </button>
                  <button
                    onClick={() => setVectorFilter('social')}
                    className={`px-3 py-1.5 rounded-lg border font-mono transition font-bold ${
                      vectorFilter === 'social'
                        ? isDark
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-sm'
                          : 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : isDark
                        ? 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-white'
                        : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    Social Handles ({brandThreats.filter(t => t.channel === 'Social Profile').length})
                  </button>
                  <button
                    onClick={() => setVectorFilter('domain')}
                    className={`px-3 py-1.5 rounded-lg border font-mono transition font-bold ${
                      vectorFilter === 'domain'
                        ? isDark
                          ? 'bg-blue-500/20 text-blue-300 border-blue-500/50 shadow-sm'
                          : 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : isDark
                        ? 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-white'
                        : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    Phishing Domains ({brandThreats.filter(t => t.channel === 'Phishing Website' || t.channel === 'Phishing Domain').length})
                  </button>
                  <button
                    onClick={() => setVectorFilter('apk')}
                    className={`px-3 py-1.5 rounded-lg border font-mono transition font-bold ${
                      vectorFilter === 'apk'
                        ? isDark
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm'
                          : 'bg-blue-600 text-white border-blue-600 shadow-xs'
                        : isDark
                        ? 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-white'
                        : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    Rogue APKs ({brandThreats.filter(t => t.channel === 'Rogue Mobile App').length})
                  </button>
                </div>

                {/* Threat Stream Grid */}
                {filteredThreats.length === 0 ? (
                  <div className={`p-8 rounded-xl border text-center space-y-3 ${
                    isDark ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <Filter className="w-8 h-8 mx-auto text-slate-500 opacity-60" />
                    <div className={`font-bold font-mono text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      No candidate threats match the selected vector or search filter
                    </div>
                    <p className={`text-xs max-w-md mx-auto ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      Adjust your channel filters or click "Run Social Monitoring" / "Run App Store Monitoring" to ingest fresh candidates.
                    </p>
                    <button
                      type="button"
                      onClick={() => { setVectorFilter('all'); setSearchQuery(''); }}
                      className="px-3 py-1.5 rounded-lg border text-xs font-mono font-bold bg-blue-600 text-white"
                    >
                      Reset All Filters
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredThreats.map((threat) => {
                      const isSelected = threat.id === activeThreat.id;
                      const isCritical = threat.severity === 'CRITICAL' || threat.logoMatchPercent >= 90 || threat.channel === 'Rogue Mobile App';

                      return (
                        <div
                          key={threat.id}
                          onClick={() => setSelectedThreatId(threat.id)}
                          className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                            isSelected
                              ? isDark
                                ? 'bg-gradient-to-r from-blue-950/80 to-slate-900 border-cyan-500 shadow-[0_0_16px_rgba(6,182,212,0.25)] ring-1 ring-cyan-500/40'
                                : 'bg-blue-50 border-blue-600 shadow-md ring-1 ring-blue-500'
                              : isDark
                              ? 'bg-slate-950/70 border-slate-800/80 hover:bg-slate-900/60 hover:border-slate-700'
                              : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-xs'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <div className="flex items-center gap-2">
                                <div className={`p-1.5 rounded-lg border ${
                                  isSelected
                                    ? isDark ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300' : 'bg-blue-600 border-blue-600 text-white'
                                    : isDark ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-slate-100 border-slate-200 text-slate-600'
                                }`}>
                                  {renderPlatformIcon(threat.platform, "w-4 h-4")}
                                </div>
                                <span className={`text-xs font-mono font-bold ${
                                  isDark ? 'text-white' : 'text-slate-900'
                                }`}>
                                  {threat.suspectHandle}
                                </span>
                              </div>

                              <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase border ${
                                isCritical
                                  ? isDark
                                    ? 'bg-red-950/80 text-red-300 border-red-500/50'
                                    : 'bg-rose-100 text-rose-950 border-rose-300 shadow-xs'
                                  : isDark
                                  ? 'bg-amber-950/80 text-amber-300 border-amber-500/50'
                                  : 'bg-amber-100 text-amber-950 border-amber-300 shadow-xs'
                              }`}>
                                {isCritical ? 'L4 CRITICAL' : 'L3 HIGH'}
                              </span>
                            </div>

                            <div className={`text-xs font-semibold mb-1 ${
                              isDark ? 'text-slate-200' : 'text-slate-800'
                            }`}>
                              {threat.suspectName}
                            </div>

                            {/* Provenance & Status Pills */}
                            <div className="flex flex-wrap items-center gap-1.5 my-2">
                              <span className={`text-[9px] font-mono px-2 py-0.5 rounded border font-semibold flex items-center gap-1 ${
                                threat.provenance === 'live_connector'
                                  ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                                  : isDark
                                  ? 'bg-slate-900 border-slate-700 text-slate-300'
                                  : 'bg-slate-100 border-slate-300 text-slate-700'
                              }`}>
                                <Database className="w-2.5 h-2.5" />
                                {threat.provenance === 'live_connector' ? 'Live Stream' : 'Demo Fixture (Synthetic)'}
                              </span>
                              <span className={`text-[9px] font-mono px-2 py-0.5 rounded border font-semibold ${
                                threat.status === 'CONFIRMED_THREAT' ? 'bg-red-950/80 text-red-300 border-red-500/40' :
                                threat.status === 'TAKEDOWN_REQUESTED' ? 'bg-amber-950/80 text-amber-300 border-amber-500/40' :
                                threat.status === 'BENIGN_DISMISSED' ? 'bg-slate-800 text-slate-400 border-slate-700' :
                                'bg-blue-950/80 text-blue-300 border-blue-500/40'
                              }`}>
                                {threat.status}
                              </span>
                              {threat.compositeScore !== undefined && (
                                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-purple-950/60 border border-purple-500/40 text-purple-300 font-semibold">
                                  Score: {threat.compositeScore}
                                </span>
                              )}
                            </div>

                            <p className={`text-[11px] line-clamp-2 italic mb-2 ${
                              isDark ? 'text-slate-400' : 'text-slate-600'
                            }`}>
                              "{threat.suspectBio}"
                            </p>

                            {/* Explainable Forensic Reasons Preview */}
                            {threat.reasons && threat.reasons.length > 0 && (
                              <div className="mb-3 space-y-1">
                                {threat.reasons.slice(0, 2).map((reason, idx) => (
                                  <div key={idx} className="text-[10px] font-mono text-amber-300/90 flex items-start gap-1">
                                    <span className="text-amber-400 shrink-0">›</span>
                                    <span className="truncate">{reason}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          <div className={`pt-2 border-t space-y-2 text-[11px] font-mono ${
                            isDark ? 'border-slate-900 text-slate-400' : 'border-slate-100 text-slate-500'
                          }`}>
                            <div className="flex items-center justify-between">
                              <span className={`flex items-center gap-1 font-bold ${
                                isDark ? 'text-cyan-400' : 'text-blue-700'
                              }`}>
                                <Flame className={`w-3.5 h-3.5 ${isDark ? 'text-cyan-400' : 'text-blue-600'}`} />
                                Logo Diff: {threat.logoMatchPercent}%
                              </span>
                              <span className={isDark ? 'text-slate-500' : 'text-slate-500'}>
                                Channel: {threat.channel}
                              </span>
                            </div>

                            {/* Interactive Card Action Bar */}
                            <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-900/60" onClick={(e) => e.stopPropagation()}>
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] text-slate-400">Review:</span>
                                <select
                                  value={threat.status || 'NEW'}
                                  onChange={(e) => handleStatusUpdate(threat.id, e.target.value)}
                                  disabled={statusUpdatingId === threat.id}
                                  className={`text-[10px] font-mono font-bold rounded px-1.5 py-0.5 border cursor-pointer ${
                                    isDark ? 'bg-slate-900 border-slate-700 text-cyan-300' : 'bg-white border-slate-300 text-slate-800'
                                  }`}
                                >
                                  <option value="NEW">NEW</option>
                                  <option value="INVESTIGATING">INVESTIGATING</option>
                                  <option value="CONFIRMED_THREAT">CONFIRMED</option>
                                  <option value="BENIGN_DISMISSED">DISMISSED</option>
                                  <option value="TAKEDOWN_REQUESTED">TAKEDOWN</option>
                                </select>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleExportDocket(threat.id)}
                                title="Download Court-Admissible JSON Evidentiary Report"
                                className={`px-2 py-0.5 rounded border text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer transition ${
                                  isDark ? 'bg-blue-950/60 border-blue-500/40 text-cyan-300 hover:bg-blue-900/80' : 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100'
                                }`}
                              >
                                <Download className="w-3 h-3 text-cyan-400" />
                                <span>Docket</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* 2. VISUAL LOGO DIFF HEATMAP */}
            {activeModule === 'heatmap' && (
              <div className="space-y-4">
                <LogoDiffHeatmap
                  officialLogo={currentBrand.logoUrl}
                  suspectAvatar={activeThreat.avatarUrl}
                  matchPercent={activeThreat.logoMatchPercent || 92}
                  suspectName={activeThreat.suspectName}
                  brandName={currentBrand.name}
                />
              </div>
            )}

            {/* 3. VECTOR DEEP FORENSICS (APK & HOMOGLYPH) */}
            {activeModule === 'forensics' && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                  <ApkPermissionGauge threat={activeThreat} brand={currentBrand} />
                  <HomoglyphInspector threat={activeThreat} brand={currentBrand} />
                </div>
              </div>
            )}

            {/* 4. COORDINATED SYNDICATE GRAPH */}
            {activeModule === 'syndicate' && (
              <div className="space-y-4">
                <SyndicateNodeGraph
                  brand={currentBrand}
                  onSelectThreat={(node) => {
                    const match = brandThreats.find(t =>
                      (node.id === 'twitter' && t.channel === 'Social Profile') ||
                      (node.id === 'domain' && (t.channel === 'Phishing Website' || t.channel === 'Phishing Domain')) ||
                      (node.id === 'apk' && t.channel === 'Rogue Mobile App') ||
                      (node.id === 'telegram' && t.channel === 'Messaging Channel')
                    );
                    if (match) setSelectedThreatId(match.id);
                  }}
                />
              </div>
            )}

            {/* 5. THREAT VECTOR DISTRIBUTION (PIE DIAGRAM) */}
            {activeModule === 'pie' && (
              <div className="space-y-4">
                <ThreatVectorPieChart
                  activeFilter={vectorFilter}
                  onFilterChange={(v) => setVectorFilter(v)}
                  threats={brandThreats}
                />
              </div>
            )}

            {/* 6. TEMPORAL ATTACK HEATMAP & VELOCITY */}
            {activeModule === 'temporal' && (
              <div className="space-y-5">
                <TemporalThreatHeatmap />
                <ThreatVelocityChart />
              </div>
            )}

            {/* 7. STATUTORY LEGAL ESCALATION DOCK */}
            {activeModule === 'legal' && (
              <div className={`p-6 rounded-2xl border shadow-2xl space-y-5 transition-all duration-300 ${
                isDark
                  ? 'bg-gradient-to-br from-[#0c1829] to-[#071120] border-blue-500/40'
                  : 'bg-white border-slate-300 shadow-sm'
              }`}>
                <div className={`flex items-center justify-between pb-4 border-b ${
                  isDark ? 'border-slate-800' : 'border-slate-200'
                }`}>
                  <div className="flex items-center gap-2.5">
                    <div className={`p-2 rounded-xl border ${
                      isDark
                        ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                        : 'bg-amber-100 border-amber-300 text-amber-950 shadow-xs'
                    }`}>
                      <Scale className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className={`text-base font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        Statutory Evidence Compilation &amp; Legal Handoff
                      </h3>
                      <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        Transfers multi-vector forensic indicators into the Legal Counsel &amp; Takedown Desk.
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full font-mono text-xs font-bold border ${
                    isDark
                      ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300'
                      : 'bg-emerald-100 border-emerald-300 text-emerald-950 shadow-xs'
                  }`}>
                    EVIDENCE SEALED
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className={`p-4 rounded-xl border space-y-1 ${
                    isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div className={`text-[10px] font-mono uppercase font-bold ${isDark ? 'text-cyan-400' : 'text-blue-700'}`}>Artifact 1</div>
                    <div className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Visual Logo Heatmap</div>
                    <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>144-cell matrix showing 92% trademark delta overlap.</div>
                  </div>

                  <div className={`p-4 rounded-xl border space-y-1 ${
                    isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div className={`text-[10px] font-mono uppercase font-bold ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>Artifact 2</div>
                    <div className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Manifest Permissions</div>
                    <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Unverified keystore certificate + READ_SMS exploitation.</div>
                  </div>

                  <div className={`p-4 rounded-xl border space-y-1 ${
                    isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div className={`text-[10px] font-mono uppercase font-bold ${isDark ? 'text-blue-400' : 'text-blue-700'}`}>Artifact 3</div>
                    <div className={`text-sm font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Syndicate Topology</div>
                    <div className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>5-node Kraken-09 cross-platform campaign correlation.</div>
                  </div>
                </div>

                <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isDark ? 'bg-blue-950/30 border-blue-500/30' : 'bg-blue-50 border-blue-200'
                }`}>
                  <div>
                    <div className={`text-xs font-bold ${isDark ? 'text-white' : 'text-blue-950'}`}>Target Ready for Immediate Legal Dispatch</div>
                    <div className={`text-xs mt-0.5 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                      Suspect: <span className={`font-mono font-bold ${isDark ? 'text-cyan-300' : 'text-blue-700'}`}>{activeThreat.suspectHandle}</span> on {activeThreat.platform}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => loginAsRole('legal')}
                    className="py-3 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-md transition cursor-pointer shrink-0"
                  >
                    <Scale className="w-4 h-4" />
                    <span>Open Legal Takedown Desk (/legal)</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
              </div>
            )}

            {/* 8. UNIFIED COMMAND MATRIX (ALL-IN-ONE) */}
            {activeModule === 'all' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                  <LogoDiffHeatmap
                    officialLogo={currentBrand.logoUrl}
                    suspectAvatar={activeThreat.avatarUrl}
                    matchPercent={activeThreat.logoMatchPercent || 92}
                    suspectName={activeThreat.suspectName}
                  />
                  <ThreatVectorPieChart
                    activeFilter={vectorFilter}
                    onFilterChange={(v) => setVectorFilter(v)}
                  />
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                  <SyndicateNodeGraph
                    onSelectThreat={(node) => {
                      if (node.id === 'twitter') setSelectedThreatId('THREAT-102');
                      if (node.id === 'domain') setSelectedThreatId('THREAT-106');
                      if (node.id === 'apk') setSelectedThreatId('THREAT-103');
                      if (node.id === 'telegram') setSelectedThreatId('THREAT-105');
                    }}
                  />
                  <div className="space-y-5">
                    {threatType === 'apk' ? (
                      <ApkPermissionGauge threat={activeThreat} />
                    ) : (
                      <HomoglyphInspector threat={activeThreat} />
                    )}
                    <ThreatVelocityChart />
                  </div>
                </div>

                <TemporalThreatHeatmap />
              </div>
            )}

          </div>

        </div>

      </div>

      {/* ============================================================ */}
      {/* BRAND ASSETS & EXCLUSION REGISTRY MODAL                      */}
      {/* ============================================================ */}
      {isBrandAssetsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className={`w-full max-w-2xl rounded-2xl p-6 border shadow-2xl space-y-5 transition-all ${
            isDark ? 'bg-[#071120] border-blue-500/40 text-white' : 'bg-white border-slate-300 text-slate-900'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-700/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-500/20 border border-blue-500/40 text-cyan-300">
                  <ShieldCheck className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold">Official Brand Assets &amp; Exclusion Registry</h3>
                  <p className="text-xs text-slate-400">Tenant: {currentBrand.name} ({currentBrand.id})</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsBrandAssetsModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs font-mono">
              <div className={`p-3.5 rounded-xl border ${isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <div className="font-bold text-cyan-400 mb-1">Official Domain &amp; TLD:</div>
                <div className="text-slate-200 font-bold">{currentBrand.officialDomain}</div>
              </div>

              <div className={`p-3.5 rounded-xl border ${isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <div className="font-bold text-cyan-400 mb-1">Verified Social Handles:</div>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {currentBrand.verifiedHandles.map(h => (
                    <span key={h} className="px-2 py-0.5 rounded bg-blue-950/80 border border-blue-500/40 text-blue-300 font-bold">
                      {h}
                    </span>
                  ))}
                </div>
              </div>

              <div className={`p-3.5 rounded-xl border ${isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                <div className="font-bold text-cyan-400 mb-1">Official Mobile Application Registry:</div>
                <div className="space-y-2 mt-1">
                  {currentBrand.officialApps.map(app => (
                    <div key={app.appId} className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-slate-200">{app.appName}</span>
                      <span className="text-emerald-400 font-bold">{app.appId}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-950/20 text-emerald-300 text-[11px] leading-relaxed flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
                <span>
                  <strong>Deterministic Exclusion Policy:</strong> Any social profile, domain, or mobile package matching these registered identifiers is automatically excluded by the backend pipeline (<code>is_official_excluded = True</code>), preventing self-takedowns and false alarms on legitimate brand infrastructure.
                </span>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setIsBrandAssetsModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs cursor-pointer shadow-md"
              >
                Close Registry
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
