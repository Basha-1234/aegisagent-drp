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
  Filter, 
  Layers, 
  Activity, 
  Calendar, 
  Smartphone, 
  Globe, 
  AtSign, 
  Flame, 
  Scale, 
  ArrowRight, 
  ExternalLink, 
  CheckCircle2, 
  AlertTriangle, 
  PieChart, 
  Zap, 
  Network,
  Clock,
  Sparkles,
  FileText
} from 'lucide-react';

export default function AnalystDashboard() {
  const { user, activeBrandId, loginAsRole } = useAuth();

  // Active brand data
  const currentBrand = BRANDS.find(b => b.id === activeBrandId) || BRANDS[0];

  // Threat filtering & selection
  const [selectedThreatId, setSelectedThreatId] = useState('THREAT-101');
  const [vectorFilter, setVectorFilter] = useState('all'); // 'all' | 'social' | 'domain' | 'apk'
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [workbenchTab, setWorkbenchTab] = useState('canvas'); // 'canvas' | 'heatmap' | 'vector' | 'temporal'

  // Brand-specific threat list
  const brandThreats = useMemo(() => {
    return INITIAL_THREATS.filter(t => t.brandId === currentBrand.id);
  }, [currentBrand.id]);

  // Filtered threats
  const filteredThreats = useMemo(() => {
    return brandThreats.filter(threat => {
      // Vector filter
      if (vectorFilter === 'social' && threat.channel !== 'Social Profile') return false;
      if (vectorFilter === 'domain' && threat.channel !== 'Phishing Website' && threat.channel !== 'Phishing Domain') return false;
      if (vectorFilter === 'apk' && threat.channel !== 'Rogue Mobile App') return false;

      // Severity filter (derive from match or status)
      const isCritical = (threat.logoMatchPercent >= 90) || threat.channel === 'Rogue Mobile App';
      if (severityFilter === 'CRITICAL' && !isCritical) return false;
      if (severityFilter === 'HIGH' && isCritical) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = threat.suspectName?.toLowerCase().includes(q);
        const matchHandle = threat.suspectHandle?.toLowerCase().includes(q);
        const matchPlatform = threat.platform?.toLowerCase().includes(q);
        if (!matchName && !matchHandle && !matchPlatform) return false;
      }

      return true;
    });
  }, [brandThreats, vectorFilter, severityFilter, searchQuery]);

  // Currently selected threat object
  const activeThreat = useMemo(() => {
    return brandThreats.find(t => t.id === selectedThreatId) || brandThreats[0] || INITIAL_THREATS[0];
  }, [brandThreats, selectedThreatId]);

  // Determine threat vector category
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

  return (
    <div className="p-4 sm:p-6 max-w-[1720px] mx-auto space-y-6 animate-in fade-in duration-300">
      
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
          <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
            Autonomous multi-signal detection stream ingesting deceptive customer support accounts, homoglyph phishing domains, and rogue APKs on third-party stores. Correlates indicators to unveil coordinated threat syndicates.
          </p>
        </div>

        {/* Real-time Telemetry Indicators */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-center min-w-[105px]">
            <div className="text-lg font-black text-cyan-400 font-mono">14 Alerts</div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold flex items-center justify-center gap-1">
              <Zap className="w-2.5 h-2.5 text-cyan-400" /> Active Queue
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-center min-w-[105px]">
            <div className="text-lg font-black text-emerald-400 font-mono">&lt; 2.4 min</div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold flex items-center justify-center gap-1">
              <Clock className="w-2.5 h-2.5 text-emerald-400" /> MTTD Speed
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-center min-w-[105px]">
            <div className="text-lg font-black text-amber-400 font-mono">2 Rings</div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold flex items-center justify-center gap-1">
              <Network className="w-2.5 h-2.5 text-amber-400" /> Syndicates
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-center min-w-[105px]">
            <div className="text-lg font-black text-purple-400 font-mono">96.8%</div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold flex items-center justify-center gap-1">
              <Sparkles className="w-2.5 h-2.5 text-purple-400" /> Diff Accuracy
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 3-PANE WORKSPACE LAYOUT                                       */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        
        {/* ========================================================== */}
        {/* PANE 1: MULTI-SIGNAL THREAT INGESTION FEED (Left, ~3.3/12) */}
        {/* ========================================================== */}
        <div className="xl:col-span-4 space-y-4">
          <div className="p-4 rounded-2xl bg-[#071120]/90 backdrop-blur-xl border border-blue-500/30 shadow-2xl">
            
            {/* Feed Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-cyan-400" />
                <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-300">
                  Multi-Signal Ingestion Feed
                </h2>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-400">
                {filteredThreats.length} matching
              </span>
            </div>

            {/* Search Input */}
            <div className="mt-3 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search handle, domain, APK package..."
                className="w-full bg-slate-950/90 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>

            {/* Vector & Severity Filter Pills */}
            <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[11px] font-medium">
              <button
                onClick={() => setVectorFilter('all')}
                className={`px-2.5 py-1 rounded-lg border transition-all ${
                  vectorFilter === 'all'
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-[0_0_8px_rgba(6,182,212,0.2)]'
                    : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                All Vectors
              </button>
              <button
                onClick={() => setVectorFilter('social')}
                className={`px-2.5 py-1 rounded-lg border transition-all ${
                  vectorFilter === 'social'
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                    : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                Social ({brandThreats.filter(t => t.channel === 'Social Profile').length})
              </button>
              <button
                onClick={() => setVectorFilter('domain')}
                className={`px-2.5 py-1 rounded-lg border transition-all ${
                  vectorFilter === 'domain'
                    ? 'bg-blue-500/20 text-blue-300 border-blue-500/50'
                    : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                Domains ({brandThreats.filter(t => t.channel === 'Phishing Website' || t.channel === 'Phishing Domain').length})
              </button>
              <button
                onClick={() => setVectorFilter('apk')}
                className={`px-2.5 py-1 rounded-lg border transition-all ${
                  vectorFilter === 'apk'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                    : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                APKs ({brandThreats.filter(t => t.channel === 'Rogue Mobile App').length})
              </button>
            </div>

            {/* Ingestion Stream Cards */}
            <div className="mt-4 space-y-2.5 max-h-[640px] overflow-y-auto pr-1">
              {filteredThreats.map((threat) => {
                const isSelected = threat.id === activeThreat.id;
                const isCritical = threat.logoMatchPercent >= 90 || threat.channel === 'Rogue Mobile App';

                return (
                  <div
                    key={threat.id}
                    onClick={() => setSelectedThreatId(threat.id)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-gradient-to-r from-blue-950/80 to-slate-900 border-cyan-500 shadow-[0_0_16px_rgba(6,182,212,0.25)] ring-1 ring-cyan-500/40'
                        : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-900/60 hover:border-slate-700'
                    }`}
                  >
                    {/* Card Header */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-lg border ${
                          isSelected ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300' : 'bg-slate-900 border-slate-800 text-slate-400'
                        }`}>
                          {renderPlatformIcon(threat.platform, "w-3.5 h-3.5")}
                        </div>
                        <span className="text-xs font-mono font-bold text-white truncate max-w-[150px]">
                          {threat.suspectHandle}
                        </span>
                      </div>

                      {/* Severity Pill */}
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                        isCritical
                          ? 'bg-red-950/80 text-red-300 border border-red-500/50'
                          : 'bg-amber-950/80 text-amber-300 border border-amber-500/50'
                      }`}>
                        {isCritical ? 'L4 CRITICAL' : 'L3 HIGH'}
                      </span>
                    </div>

                    {/* Threat Details */}
                    <div className="text-xs font-medium text-slate-200 line-clamp-1 mb-1.5">
                      {threat.suspectName}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-2 border-t border-slate-900">
                      <span className="flex items-center gap-1 text-cyan-400">
                        <Flame className="w-3 h-3 text-cyan-400" />
                        Logo Delta: {threat.logoMatchPercent}%
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {threat.channel}
                      </span>
                    </div>
                  </div>
                );
              })}

              {filteredThreats.length === 0 && (
                <div className="p-8 text-center text-slate-500 text-xs">
                  No threats matching selected filters.
                </div>
              )}
            </div>
          </div>

          {/* Quick Threat Velocity Chart in Left Strip */}
          <ThreatVelocityChart />
        </div>

        {/* ========================================================== */}
        {/* PANE 2: FORENSIC INVESTIGATION WORKBENCH (Center, ~5/12)   */}
        {/* ========================================================== */}
        <div className="xl:col-span-5 space-y-4">
          
          {/* Active Target Banner */}
          <div className="p-4 rounded-2xl bg-[#071120]/90 backdrop-blur-xl border border-blue-500/30 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <div className="px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/40 text-[10px] font-mono text-cyan-300 font-bold uppercase">
                  ACTIVE FORENSIC TARGET
                </div>
                <span className="text-xs font-mono text-slate-400">{activeThreat.id}</span>
              </div>
              <h3 className="text-lg font-black text-white mt-1">
                {activeThreat.suspectName}
              </h3>
              <div className="flex items-center gap-3 mt-1 text-xs text-slate-300 font-mono">
                <span className="text-cyan-400 font-bold">{activeThreat.suspectHandle}</span>
                <span>•</span>
                <span className="text-slate-400">{activeThreat.platform}</span>
                <span>•</span>
                <span className="text-amber-400 font-semibold">{activeThreat.channel}</span>
              </div>
            </div>

            {/* Workbench Tab Switcher */}
            <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-950/80 border border-slate-800 text-xs shrink-0">
              <button
                onClick={() => setWorkbenchTab('canvas')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  workbenchTab === 'canvas'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Unified Canvas
              </button>
              <button
                onClick={() => setWorkbenchTab('heatmap')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  workbenchTab === 'heatmap'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Pixel Diff
              </button>
              <button
                onClick={() => setWorkbenchTab('vector')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  workbenchTab === 'vector'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Deep Inspector
              </button>
              <button
                onClick={() => setWorkbenchTab('temporal')}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  workbenchTab === 'temporal'
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Temporal Matrix
              </button>
            </div>
          </div>

          {/* Workbench Dynamic View Switcher */}
          {workbenchTab === 'canvas' && (
            <div className="space-y-4">
              {/* Primary Visual Heatmap */}
              <LogoDiffHeatmap
                officialLogo={currentBrand.logoUrl}
                suspectAvatar={activeThreat.avatarUrl}
                matchPercent={activeThreat.logoMatchPercent || 92}
                suspectName={activeThreat.suspectName}
              />

              {/* Vector-Specific Deep Forensic Component */}
              {threatType === 'apk' && <ApkPermissionGauge threat={activeThreat} />}
              {threatType === 'domain' && <HomoglyphInspector threat={activeThreat} />}
              {threatType === 'social' && (
                <div className="rounded-2xl p-5 bg-[#071120]/90 backdrop-blur-xl border border-blue-500/30 shadow-2xl">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <AtSign className="w-4 h-4 text-cyan-400" />
                      <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-300">
                        Deceptive Social Handle &amp; Impersonation Telemetry
                      </span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-950/80 border border-red-500/40 text-red-300 font-bold">
                      UNAUTHORIZED HELPDESK
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Suspect Bio Claim:</span>
                      <span className="text-red-400 font-mono text-[11px] font-bold">HIGH DECEPTION</span>
                    </div>
                    <p className="text-slate-200 text-xs italic bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                      "{activeThreat.suspectBio}"
                    </p>
                    <div className="grid grid-cols-2 gap-2 pt-2 text-[11px] font-mono">
                      <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
                        <span className="text-slate-400 block text-[10px]">Follower Base</span>
                        <span className="text-white font-bold">{activeThreat.followersCount?.toLocaleString()}</span>
                      </div>
                      <div className="p-2 rounded bg-slate-900/60 border border-slate-800">
                        <span className="text-slate-400 block text-[10px]">Account Age</span>
                        <span className="text-amber-400 font-bold">{activeThreat.accountAgeDays} days (Fresh)</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Temporal Attack Matrix */}
              <TemporalThreatHeatmap />
            </div>
          )}

          {workbenchTab === 'heatmap' && (
            <LogoDiffHeatmap
              officialLogo={currentBrand.logoUrl}
              suspectAvatar={activeThreat.avatarUrl}
              matchPercent={activeThreat.logoMatchPercent || 92}
              suspectName={activeThreat.suspectName}
            />
          )}

          {workbenchTab === 'vector' && (
            <div className="space-y-4">
              {threatType === 'apk' && <ApkPermissionGauge threat={activeThreat} />}
              {threatType === 'domain' && <HomoglyphInspector threat={activeThreat} />}
              {threatType === 'social' && (
                <div className="space-y-4">
                  <div className="rounded-2xl p-5 bg-[#071120]/90 backdrop-blur-xl border border-blue-500/30 shadow-2xl">
                    <h4 className="text-sm font-bold text-white mb-2">Deceptive DM Keyword Extractor</h4>
                    <p className="text-xs text-slate-300 mb-3">Phrases matched against active phishing playbook:</p>
                    <div className="space-y-2">
                      {activeThreat.postCaptions?.map((caption, i) => (
                        <div key={i} className="p-3 rounded-xl bg-red-950/20 border border-red-500/30 text-xs text-red-200">
                          {caption}
                        </div>
                      ))}
                    </div>
                  </div>
                  <LogoDiffHeatmap
                    officialLogo={currentBrand.logoUrl}
                    suspectAvatar={activeThreat.avatarUrl}
                    matchPercent={activeThreat.logoMatchPercent || 92}
                    suspectName={activeThreat.suspectName}
                  />
                </div>
              )}
            </div>
          )}

          {workbenchTab === 'temporal' && (
            <div className="space-y-4">
              <TemporalThreatHeatmap />
              <ThreatVelocityChart />
            </div>
          )}
        </div>

        {/* ========================================================== */}
        {/* PANE 3: SYNDICATE NETWORK & ENFORCEMENT DOCK (Right, ~3.7/12)*/}
        {/* ========================================================== */}
        <div className="xl:col-span-3 space-y-4">
          
          {/* Threat Vector Distribution Pie Chart */}
          <ThreatVectorPieChart 
            activeFilter={vectorFilter} 
            onFilterChange={(v) => setVectorFilter(v)} 
          />

          {/* Coordinated Threat Syndicate Node Graph */}
          <SyndicateNodeGraph 
            onSelectThreat={(node) => {
              if (node.id === 'twitter') setSelectedThreatId('THREAT-102');
              if (node.id === 'domain') setSelectedThreatId('THREAT-106');
              if (node.id === 'apk') setSelectedThreatId('THREAT-103');
              if (node.id === 'telegram') setSelectedThreatId('THREAT-105');
            }} 
          />

          {/* 1-Click Legal Escalation Dock */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-[#0c1829] to-[#071120] border border-blue-500/40 shadow-2xl relative overflow-hidden">
            <div className="flex items-center gap-2 mb-2">
              <Scale className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-300">
                Statutory Escalation Dock
              </span>
            </div>

            <h4 className="text-sm font-bold text-white">
              Transfer to Legal Takedown Desk
            </h4>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Compile current forensic artifacts (Pixel Delta Heatmap, Unicode mapping, Manifest Permissions, Syndicate Map) into an immutable statutory takedown package.
            </p>

            <div className="my-3 p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5 text-[11px] font-mono text-slate-300">
              <div className="flex items-center justify-between">
                <span>• Pixel Diff Matrix:</span>
                <span className="text-emerald-400 font-bold">ATTACHED (144 cells)</span>
              </div>
              <div className="flex items-center justify-between">
                <span>• Keystore Certificate:</span>
                <span className="text-amber-400 font-bold">UNVERIFIED HASH</span>
              </div>
              <div className="flex items-center justify-between">
                <span>• Syndicate Cluster:</span>
                <span className="text-cyan-400 font-bold">KRAKEN-09 (5 Nodes)</span>
              </div>
            </div>

            <button
              onClick={() => loginAsRole('legal')}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.35)] transition-all cursor-pointer transform active:scale-[0.99]"
            >
              <Scale className="w-4 h-4" />
              <span>Escalate to Legal Takedown Desk</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
            
            <div className="mt-2 text-center text-[10px] text-slate-500 font-mono">
              Routes directly to Role 2: Legal Counsel (/legal)
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
