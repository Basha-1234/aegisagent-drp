import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { BRANDS, INITIAL_THREATS } from '../data/mockData';
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
  Check
} from 'lucide-react';

export default function AnalystDashboard() {
  const { user, activeBrandId, loginAsRole } = useAuth();

  // Active brand profile
  const currentBrand = BRANDS.find(b => b.id === activeBrandId) || BRANDS[0];

  // Dashboard Module Toggle State (Defaults to Threat Radar Ingestion)
  // Options: 'radar' | 'heatmap' | 'forensics' | 'syndicate' | 'pie' | 'temporal' | 'legal' | 'all'
  const [activeModule, setActiveModule] = useState('radar');

  // Threat filtering & selection state
  const [selectedThreatId, setSelectedThreatId] = useState('THREAT-101');
  const [vectorFilter, setVectorFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Brand-specific threat list
  const brandThreats = useMemo(() => {
    return INITIAL_THREATS.filter(t => t.brandId === currentBrand.id);
  }, [currentBrand.id]);

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

  // Dashboard Toggle Navigation Items
  const dashboardModules = [
    {
      id: 'radar',
      name: 'Threat Radar & Ingestion Feed',
      sublabel: 'Live Multi-Signal Stream',
      icon: Radio,
      badge: `${brandThreats.length} Alerts`,
      badgeColor: 'border-cyan-500/40 bg-cyan-950/60 text-cyan-300'
    },
    {
      id: 'heatmap',
      name: 'Visual Logo Diff Heatmap',
      sublabel: '12x12 Pixel Delta Matrix',
      icon: Flame,
      badge: '144 Cells',
      badgeColor: 'border-amber-500/40 bg-amber-950/60 text-amber-300'
    },
    {
      id: 'forensics',
      name: 'Vector Deep Forensics',
      sublabel: 'APK Audit & Homoglyph Spec',
      icon: ShieldAlert,
      badge: 'L4 Critical',
      badgeColor: 'border-red-500/40 bg-red-950/60 text-red-300'
    },
    {
      id: 'syndicate',
      name: 'Coordinated Syndicate Graph',
      sublabel: 'Kraken-09 Attack Ring',
      icon: Network,
      badge: '5 Nodes',
      badgeColor: 'border-blue-500/40 bg-blue-950/60 text-blue-300'
    },
    {
      id: 'pie',
      name: 'Threat Vector Distribution',
      sublabel: 'SVG Pie & Donut Diagram',
      icon: PieChartIcon,
      badge: '44% / 33% / 22%',
      badgeColor: 'border-cyan-500/40 bg-cyan-950/60 text-cyan-300'
    },
    {
      id: 'temporal',
      name: 'Temporal Heatmap & Velocity',
      sublabel: '7-Day Cycles & 24h Area Graph',
      icon: Calendar,
      badge: 'Peak 9/hr',
      badgeColor: 'border-purple-500/40 bg-purple-950/60 text-purple-300'
    },
    {
      id: 'legal',
      name: 'Legal Escalation Dock',
      sublabel: 'Affidavit Builder & Takedown',
      icon: Scale,
      badge: 'Ready',
      badgeColor: 'border-emerald-500/40 bg-emerald-950/60 text-emerald-300'
    },
    {
      id: 'all',
      name: 'Unified Command Matrix',
      sublabel: 'All Visual Components',
      icon: LayoutGrid,
      badge: 'Full Canvas',
      badgeColor: 'border-slate-600 bg-slate-900 text-slate-300'
    }
  ];

  return (
    <div className="p-4 sm:p-6 max-w-[1740px] mx-auto space-y-5 animate-in fade-in duration-300 font-sans">
      
      {/* ============================================================ */}
      {/* TOP COMMAND HEADER & TELEMETRY STRIP                          */}
      {/* ============================================================ */}
      <div className="p-5 rounded-2xl bg-[#071120]/90 backdrop-blur-xl border border-blue-500/30 shadow-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold mb-2 shadow-[0_0_12px_rgba(6,182,212,0.2)]">
            <ShieldAlert className="w-3.5 h-3.5 text-cyan-400" />
            <span>ROLE 1: SECURITY ANALYST FORENSIC WORKSPACE (/analyst)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <span>Threat Triage &amp; Visual Evidence Engine</span>
            <span className="text-xs px-2.5 py-1 rounded-full bg-blue-900/40 border border-blue-500/40 text-blue-300 font-mono font-semibold">
              Tenant: {currentBrand.name}
            </span>
          </h1>
          <p className="text-sm sm:text-base text-slate-300 mt-1.5 max-w-3xl leading-relaxed">
            Select any module from the <strong>Dashboard Toggle</strong> on the left to display its dedicated workspace on the right.
          </p>
        </div>

        {/* Real-time Telemetry Indicators */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-center min-w-[110px]">
            <div className="text-xl font-bold text-cyan-400 font-mono">14 Alerts</div>
            <div className="text-xs text-slate-400 uppercase font-bold flex items-center justify-center gap-1.5 mt-0.5">
              <Zap className="w-3 h-3 text-cyan-400" /> Active Queue
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-center min-w-[110px]">
            <div className="text-xl font-bold text-emerald-400 font-mono">&lt; 2.4 min</div>
            <div className="text-xs text-slate-400 uppercase font-bold flex items-center justify-center gap-1.5 mt-0.5">
              <Clock className="w-3 h-3 text-emerald-400" /> MTTD Speed
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-center min-w-[110px]">
            <div className="text-xl font-bold text-amber-400 font-mono">2 Rings</div>
            <div className="text-xs text-slate-400 uppercase font-bold flex items-center justify-center gap-1.5 mt-0.5">
              <Network className="w-3 h-3 text-amber-400" /> Syndicates
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-center min-w-[110px]">
            <div className="text-xl font-bold text-purple-400 font-mono">96.8%</div>
            <div className="text-xs text-slate-400 uppercase font-bold flex items-center justify-center gap-1.5 mt-0.5">
              <Sparkles className="w-3 h-3 text-purple-400" /> Diff Accuracy
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2-SECTION WORKSPACE: DASHBOARD TOGGLE (LEFT) + WORKSPACE (RIGHT) */}
      {/* ============================================================ */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        
        {/* ========================================================== */}
        {/* LEFT: DASHBOARD MODULE TOGGLE DRAWER (~320px)              */}
        {/* ========================================================== */}
        <div className="w-full lg:w-[330px] shrink-0 space-y-4">
          
          <div className="p-4 rounded-2xl bg-[#071120]/90 backdrop-blur-xl border border-blue-500/30 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
              <div className="flex items-center gap-2">
                <LayoutGrid className="w-4 h-4 text-cyan-400" />
                <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-300">
                  Dashboard Modules
                </h2>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-400">
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
                        ? 'bg-gradient-to-r from-blue-900/60 to-cyan-950/40 border-cyan-400 shadow-[0_0_16px_rgba(6,182,212,0.25)] text-white'
                        : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:bg-slate-900/60 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`p-2 rounded-lg border shrink-0 transition-colors ${
                        isActive
                          ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.3)]'
                          : 'bg-slate-900 border-slate-800 text-slate-400 group-hover:text-cyan-400'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className={`text-xs font-bold truncate ${isActive ? 'text-white' : 'text-slate-300'}`}>
                          {mod.name}
                        </div>
                        <div className="text-[10px] text-slate-500 truncate">
                          {mod.sublabel}
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-1.5 ml-2">
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border font-semibold ${mod.badgeColor}`}>
                        {mod.badge}
                      </span>
                      <ChevronRight className={`w-3.5 h-3.5 transition-transform ${
                        isActive ? 'text-cyan-400 translate-x-0.5' : 'text-slate-600'
                      }`} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ACTIVE TARGET SELECTOR QUICK CARD */}
          <div className="p-4 rounded-2xl bg-[#071120]/90 backdrop-blur-xl border border-blue-500/30 shadow-2xl space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-cyan-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-400" /> Active Threat Target
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-950/80 border border-red-500/40 text-red-300 font-bold">
                {activeThreat.id}
              </span>
            </div>

            <select
              value={selectedThreatId}
              onChange={(e) => setSelectedThreatId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 cursor-pointer font-mono"
            >
              {brandThreats.map((t) => (
                <option key={t.id} value={t.id}>
                  [{t.id}] {t.suspectHandle} ({t.channel})
                </option>
              ))}
            </select>

            <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-[11px] font-mono space-y-1">
              <div className="text-white font-bold truncate">{activeThreat.suspectName}</div>
              <div className="text-slate-400 flex items-center justify-between text-[10px]">
                <span>Platform: {activeThreat.platform}</span>
                <span className="text-cyan-400 font-bold">Match: {activeThreat.logoMatchPercent}%</span>
              </div>
            </div>
          </div>

        </div>

        {/* ========================================================== */}
        {/* RIGHT: DYNAMIC WORKSPACE CANVAS (FLEX-1)                    */}
        {/* ========================================================== */}
        <div className="flex-1 w-full min-w-0 space-y-4">
          
          {/* Breadcrumb / Context Ribbon */}
          <div className="p-3.5 rounded-xl bg-[#071120]/90 backdrop-blur-xl border border-blue-500/20 shadow-md flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-2 text-slate-300">
              <span className="text-slate-500">Analyst Workspace</span>
              <span>/</span>
              <span className="text-cyan-400 font-bold">
                {dashboardModules.find(m => m.id === activeModule)?.name}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-slate-400">
                <span>Inspecting:</span>
                <span className="text-white font-bold bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                  {activeThreat.suspectHandle}
                </span>
              </div>
              <div className="h-4 w-px bg-slate-800" />
              <button
                type="button"
                onClick={() => loginAsRole('legal')}
                className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 transition flex items-center gap-1 cursor-pointer font-bold"
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
              <div className="p-5 rounded-2xl bg-[#071120]/90 backdrop-blur-xl border border-blue-500/30 shadow-2xl space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
                  <div>
                    <div className="flex items-center gap-2">
                      <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
                      <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-cyan-300">
                        Multi-Signal Threat Radar &amp; Ingestion Stream
                      </h2>
                    </div>
                    <p className="text-xs text-slate-300 mt-0.5">
                      Real-time cross-platform radar ingesting suspicious profiles, domains, and app packages.
                    </p>
                  </div>

                  {/* Search Bar */}
                  <div className="relative w-full sm:w-72">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search handles, domains, APKs..."
                      className="w-full bg-slate-950/90 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                {/* Vector Filter Bar */}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="text-slate-400 text-xs font-mono mr-1 flex items-center gap-1">
                    <Filter className="w-3.5 h-3.5" /> Filter:
                  </span>
                  <button
                    onClick={() => setVectorFilter('all')}
                    className={`px-3 py-1.5 rounded-lg border font-mono transition ${
                      vectorFilter === 'all'
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-sm'
                        : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    All Vectors ({brandThreats.length})
                  </button>
                  <button
                    onClick={() => setVectorFilter('social')}
                    className={`px-3 py-1.5 rounded-lg border font-mono transition ${
                      vectorFilter === 'social'
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-sm'
                        : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    Social Handles ({brandThreats.filter(t => t.channel === 'Social Profile').length})
                  </button>
                  <button
                    onClick={() => setVectorFilter('domain')}
                    className={`px-3 py-1.5 rounded-lg border font-mono transition ${
                      vectorFilter === 'domain'
                        ? 'bg-blue-500/20 text-blue-300 border-blue-500/50 shadow-sm'
                        : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    Phishing Domains ({brandThreats.filter(t => t.channel === 'Phishing Website' || t.channel === 'Phishing Domain').length})
                  </button>
                  <button
                    onClick={() => setVectorFilter('apk')}
                    className={`px-3 py-1.5 rounded-lg border font-mono transition ${
                      vectorFilter === 'apk'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-sm'
                        : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    Rogue APKs ({brandThreats.filter(t => t.channel === 'Rogue Mobile App').length})
                  </button>
                </div>

                {/* Threat Stream Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredThreats.map((threat) => {
                    const isSelected = threat.id === activeThreat.id;
                    const isCritical = threat.logoMatchPercent >= 90 || threat.channel === 'Rogue Mobile App';

                    return (
                      <div
                        key={threat.id}
                        onClick={() => setSelectedThreatId(threat.id)}
                        className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'bg-gradient-to-r from-blue-950/80 to-slate-900 border-cyan-500 shadow-[0_0_16px_rgba(6,182,212,0.25)] ring-1 ring-cyan-500/40'
                            : 'bg-slate-950/70 border-slate-800/80 hover:bg-slate-900/60 hover:border-slate-700'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2">
                              <div className={`p-1.5 rounded-lg border ${
                                isSelected ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300' : 'bg-slate-900 border-slate-800 text-slate-400'
                              }`}>
                                {renderPlatformIcon(threat.platform, "w-4 h-4")}
                              </div>
                              <span className="text-xs font-mono font-bold text-white">
                                {threat.suspectHandle}
                              </span>
                            </div>

                            <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                              isCritical
                                ? 'bg-red-950/80 text-red-300 border border-red-500/50'
                                : 'bg-amber-950/80 text-amber-300 border border-amber-500/50'
                            }`}>
                              {isCritical ? 'L4 CRITICAL' : 'L3 HIGH'}
                            </span>
                          </div>

                          <div className="text-xs font-semibold text-slate-200 mb-1">
                            {threat.suspectName}
                          </div>

                          <p className="text-[11px] text-slate-400 line-clamp-2 italic mb-3">
                            "{threat.suspectBio}"
                          </p>
                        </div>

                        <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-[11px] font-mono text-slate-400">
                          <span className="text-cyan-400 flex items-center gap-1 font-bold">
                            <Flame className="w-3.5 h-3.5 text-cyan-400" />
                            Logo Diff: {threat.logoMatchPercent}%
                          </span>
                          <span className="text-slate-500">
                            Channel: {threat.channel}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
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
                />
              </div>
            )}

            {/* 3. VECTOR DEEP FORENSICS (APK & HOMOGLYPH) */}
            {activeModule === 'forensics' && (
              <div className="space-y-5">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                  <ApkPermissionGauge threat={activeThreat} />
                  <HomoglyphInspector threat={activeThreat} />
                </div>
              </div>
            )}

            {/* 4. COORDINATED SYNDICATE GRAPH */}
            {activeModule === 'syndicate' && (
              <div className="space-y-4">
                <SyndicateNodeGraph 
                  onSelectThreat={(node) => {
                    if (node.id === 'twitter') setSelectedThreatId('THREAT-102');
                    if (node.id === 'domain') setSelectedThreatId('THREAT-106');
                    if (node.id === 'apk') setSelectedThreatId('THREAT-103');
                    if (node.id === 'telegram') setSelectedThreatId('THREAT-105');
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
              <div className="p-6 rounded-2xl bg-gradient-to-br from-[#0c1829] to-[#071120] border border-blue-500/40 shadow-2xl space-y-5">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300">
                      <Scale className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">
                        Statutory Evidence Compilation &amp; Legal Handoff
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Transfers multi-vector forensic indicators into the Legal Counsel &amp; Takedown Desk.
                      </p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-mono text-xs font-bold">
                    EVIDENCE SEALED
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                    <div className="text-[10px] font-mono text-cyan-400 uppercase">Artifact 1</div>
                    <div className="text-sm font-bold text-white">Visual Logo Heatmap</div>
                    <div className="text-xs text-slate-400">144-cell matrix showing 92% trademark delta overlap.</div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                    <div className="text-[10px] font-mono text-amber-400 uppercase">Artifact 2</div>
                    <div className="text-sm font-bold text-white">Manifest Permissions</div>
                    <div className="text-xs text-slate-400">Unverified keystore certificate + READ_SMS exploitation.</div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                    <div className="text-[10px] font-mono text-blue-400 uppercase">Artifact 3</div>
                    <div className="text-sm font-bold text-white">Syndicate Topology</div>
                    <div className="text-xs text-slate-400">5-node Kraken-09 cross-platform campaign correlation.</div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-blue-950/30 border border-blue-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="text-xs font-bold text-white">Target Ready for Immediate Legal Dispatch</div>
                    <div className="text-xs text-slate-300 mt-0.5">
                      Suspect: <span className="font-mono text-cyan-300 font-bold">{activeThreat.suspectHandle}</span> on {activeThreat.platform}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => loginAsRole('legal')}
                    className="py-3 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.35)] transition cursor-pointer shrink-0"
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

    </div>
  );
}
