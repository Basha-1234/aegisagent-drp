import React, { useState, useMemo } from 'react';
import { 
  Smartphone, 
  Globe, 
  Send, 
  ShieldAlert, 
  Search, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  FileText,
  Sparkles,
  AlertTriangle,
  Fingerprint,
  CheckCircle,
  Copy,
  Check,
  ChevronRight,
  Maximize2,
  X,
  RotateCcw
} from 'lucide-react';

function InstagramIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
    </svg>
  );
}

function TwitterIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
    </svg>
  );
}

export default function ThreatFeed({ 
  threats, 
  selectedBrand, 
  onSelectThreat, 
  onUpdateStatus, 
  onOpenTakedownModal,
  activeFilterSeverity = 'ALL',
  onFilterSeverityChange
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterChannel, setFilterChannel] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [copiedId, setCopiedId] = useState(null);

  const brandThreats = useMemo(() => {
    return threats.filter(t => t.brandId === selectedBrand.id);
  }, [threats, selectedBrand.id]);

  // Selected threat for the Live Side Inspector in the 2-column layout
  const [inspectedThreatId, setInspectedThreatId] = useState(() => {
    return brandThreats.length > 0 ? brandThreats[0].id : null;
  });

  // Keep inspected threat valid if brand switches
  const inspectedThreat = useMemo(() => {
    const found = brandThreats.find(t => t.id === inspectedThreatId);
    return found || (brandThreats.length > 0 ? brandThreats[0] : null);
  }, [brandThreats, inspectedThreatId]);

  // Apply search and filter
  const filteredThreats = useMemo(() => {
    return brandThreats.filter(t => {
      const matchesSearch = 
        t.suspectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.suspectHandle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.suspectBio.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.suspectPublisher && t.suspectPublisher.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (t.suspectUrl && t.suspectUrl.toLowerCase().includes(searchQuery.toLowerCase()));

      const risk = t.calculatedRisk;
      const matchesSeverity = 
        activeFilterSeverity === 'ALL' || 
        risk?.severity === activeFilterSeverity;

      let matchesChannel = true;
      if (filterChannel === 'SOCIAL') matchesChannel = t.channel === 'Social Profile';
      else if (filterChannel === 'APP_STORE') matchesChannel = t.channel === 'Rogue Mobile App';
      else if (filterChannel === 'WEB') matchesChannel = t.channel === 'Phishing Website' || t.channel === 'Messaging Channel';

      let matchesStatus = true;
      if (filterStatus === 'NEW') matchesStatus = t.status === 'NEW';
      else if (filterStatus === 'INVESTIGATING') matchesStatus = t.status === 'INVESTIGATING';
      else if (filterStatus === 'TAKEDOWN') matchesStatus = t.status === 'TAKEDOWN_SENT';
      else if (filterStatus === 'RESOLVED') matchesStatus = t.status === 'RESOLVED';

      return matchesSearch && matchesSeverity && matchesChannel && matchesStatus;
    });
  }, [brandThreats, searchQuery, activeFilterSeverity, filterChannel, filterStatus]);

  const getPlatformIcon = (platform) => {
    switch (platform.toLowerCase()) {
      case 'instagram': return <InstagramIcon className="w-4 h-4 text-pink-400" />;
      case 'x (twitter)':
      case 'twitter': return <TwitterIcon className="w-4 h-4 text-sky-400" />;
      case 'google play store': return <Smartphone className="w-4 h-4 text-emerald-400" />;
      case 'telegram': return <Send className="w-4 h-4 text-blue-400" />;
      default: return <Globe className="w-4 h-4 text-amber-400" />;
    }
  };

  const getSeverityBadge = (severity, score) => {
    switch (severity) {
      case 'CRITICAL':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold font-mono bg-red-500/15 text-red-400 border border-red-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse"></span>
            CRITICAL {score}%
          </span>
        );
      case 'HIGH':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold font-mono bg-orange-500/15 text-orange-400 border border-orange-500/30">
            HIGH {score}%
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium font-mono bg-amber-500/15 text-amber-300 border border-amber-500/30">
            MED {score}%
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium font-mono bg-slate-500/15 text-slate-300 border border-slate-500/30">
            LOW {score}%
          </span>
        );
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'TAKEDOWN_SENT':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800/80 flex items-center gap-1 font-mono">
            <CheckCircle2 className="w-3 h-3" /> Dispatched
          </span>
        );
      case 'INVESTIGATING':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-950 text-amber-300 border border-amber-800/80 flex items-center gap-1 font-mono">
            <Clock className="w-3 h-3" /> Under Review
          </span>
        );
      case 'RESOLVED':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700 font-mono">
            Resolved
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-red-950 text-red-300 border border-red-800/80 flex items-center gap-1 font-mono">
            <AlertCircle className="w-3 h-3" /> Action Required
          </span>
        );
    }
  };

  const handleCopyDossier = (threat) => {
    const risk = threat.calculatedRisk;
    const text = `EVIDENCE DOSSIER — BRANDGUARD AI\nBrand: ${selectedBrand.name} (${selectedBrand.officialHandle})\nSuspect: ${threat.suspectName} (${threat.suspectHandle})\nPlatform: ${threat.platform}\nRisk Score: ${risk?.compositeScore}/100 (${risk?.severity})\nSuspect URL/App: ${threat.suspectUrl || 'N/A'}\nReasons:\n${risk?.reasons?.map((r, i) => `${i + 1}. ${r}`).join('\n') || 'Direct impersonation'}\nDetection Timestamp: ${threat.detectionDate}`;
    navigator.clipboard.writeText(text);
    setCopiedId(threat.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const resetFilters = () => {
    setSearchQuery('');
    setFilterChannel('ALL');
    setFilterStatus('ALL');
    if (onFilterSeverityChange) onFilterSeverityChange('ALL');
  };

  return (
    <div className="space-y-4">
      
      {/* Top Filter & Triage Control Bar */}
      <div className="theme-card rounded-2xl p-3 sm:p-4 space-y-3">
        
        {/* Row 1: Search & Reset */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-2.5" />
            <input
              type="text"
              placeholder="Filter threat incidents by handle, scam phrase, publisher, or URL..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full theme-input text-xs rounded-xl pl-9.5 pr-4 py-2 placeholder-[var(--text-faint)]"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-[var(--text-muted)] hover:text-[var(--text-main)]"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {(searchQuery || filterChannel !== 'ALL' || activeFilterSeverity !== 'ALL' || filterStatus !== 'ALL') && (
              <button
                onClick={resetFilters}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-[var(--border-subtle)] text-[11px] font-medium text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface-hover)] transition-all shrink-0"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Filters</span>
              </button>
            )}

            <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] font-mono px-2 py-1 rounded-xl bg-[var(--bg-input)] border border-[var(--border-subtle)] shrink-0">
              <span className="font-bold text-[var(--text-main)]">{filteredThreats.length}</span>
              <span>/</span>
              <span>{brandThreats.length} Active</span>
            </div>
          </div>
        </div>

        {/* Row 2: Channel Rubric & Severity Filters */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-[var(--border-subtle)]">
          
          {/* Channel Selector */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] px-1 tracking-wider hidden sm:inline">
              Channel:
            </span>
            <button
              onClick={() => setFilterChannel('ALL')}
              className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-all ${
                filterChannel === 'ALL'
                  ? 'theme-btn-primary'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface-hover)]'
              }`}
            >
              All Channels
            </button>
            <button
              onClick={() => setFilterChannel('SOCIAL')}
              className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                filterChannel === 'SOCIAL'
                  ? 'theme-btn-primary'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface-hover)]'
              }`}
            >
              <span>Social Media</span>
              <span className="text-[10px] font-mono opacity-80">30%</span>
            </button>
            <button
              onClick={() => setFilterChannel('APP_STORE')}
              className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                filterChannel === 'APP_STORE'
                  ? 'theme-btn-primary'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface-hover)]'
              }`}
            >
              <Smartphone className="w-3 h-3" />
              <span>App Store</span>
              <span className="text-[10px] font-mono opacity-80">30%</span>
            </button>
            <button
              onClick={() => setFilterChannel('WEB')}
              className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-all ${
                filterChannel === 'WEB'
                  ? 'theme-btn-primary'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface-hover)]'
              }`}
            >
              Web & Messaging
            </button>
          </div>

          {/* Severity Chips */}
          <div className="flex items-center gap-1 text-xs">
            <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] px-1 tracking-wider">
              Severity:
            </span>
            {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'].map(sev => (
              <button
                key={sev}
                onClick={() => onFilterSeverityChange && onFilterSeverityChange(sev)}
                className={`px-2 py-0.5 rounded-lg text-[11px] font-mono font-semibold transition-all ${
                  activeFilterSeverity === sev
                    ? 'bg-[var(--accent-light)] text-[var(--accent-primary)] border border-[var(--border-accent)]'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>

        </div>

      </div>

      {/* Two-Column SOC Command Center Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* Left Column (7 of 12 cols): Threat Incident Queue */}
        <div className="lg:col-span-7 space-y-3">
          {filteredThreats.length === 0 ? (
            <div className="theme-card rounded-2xl p-12 text-center">
              <ShieldAlert className="w-12 h-12 text-[var(--text-faint)] mx-auto mb-3" />
              <h3 className="text-sm font-bold text-[var(--text-main)]">No Impersonation Incidents Found</h3>
              <p className="text-xs text-[var(--text-muted)] mt-1 max-w-sm mx-auto">
                No suspect entries match the current filter parameters. Try resetting your search or trigger a fresh Surveillance Sweep.
              </p>
              <button
                onClick={resetFilters}
                className="mt-4 px-3.5 py-1.5 rounded-xl border border-[var(--border-subtle)] text-xs font-semibold text-[var(--accent-primary)] hover:bg-[var(--accent-light)]"
              >
                Clear Filter Criteria
              </button>
            </div>
          ) : (
            filteredThreats.map((threat) => {
              const risk = threat.calculatedRisk;
              const lookalike = risk?.lookalike;
              const isInspected = inspectedThreat?.id === threat.id;

              return (
                <div 
                  key={threat.id} 
                  onClick={() => setInspectedThreatId(threat.id)}
                  className={`theme-card rounded-2xl p-4 sm:p-4.5 cursor-pointer transition-all relative ${
                    isInspected 
                      ? 'ring-2 ring-[var(--accent-primary)] bg-[var(--bg-surface-elevated)] shadow-lg' 
                      : 'hover:border-[var(--border-strong)]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    
                    {/* Suspect Identity & Avatar */}
                    <div className="flex items-start gap-3 min-w-0 flex-1">
                      <div className="relative shrink-0">
                        <img 
                          src={threat.avatarUrl} 
                          alt="Suspect Avatar" 
                          className="w-11 h-11 rounded-xl object-cover border border-[var(--border-subtle)]" 
                        />
                        <div className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow">
                          {getPlatformIcon(threat.platform)}
                        </div>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-xs sm:text-sm font-bold text-[var(--text-main)] truncate">
                            {threat.suspectName}
                          </h4>
                          <span className="text-[11px] font-mono text-[var(--accent-primary)] bg-[var(--accent-light)] px-1.5 py-0.2 rounded border border-[var(--border-accent)] font-semibold truncate">
                            {threat.suspectHandle}
                          </span>
                          {getStatusBadge(threat.status)}
                        </div>

                        {/* Kampus.VC Bonus: Lookalike pill */}
                        {lookalike?.isLookalike && (
                          <div className="mt-1 flex items-center gap-1.5">
                            <span className="text-[10px] font-semibold bg-purple-950/80 text-purple-300 border border-purple-800/80 px-2 py-0.5 rounded-full flex items-center gap-1 font-mono">
                              <Sparkles className="w-3 h-3 text-purple-400" />
                              Look-alike Variation ({lookalike.confidenceScore}%)
                            </span>
                          </div>
                        )}

                        {/* Rogue Mobile App Warning */}
                        {threat.suspectPublisher && (
                          <div className="mt-1 text-[11px] text-amber-400 flex items-center gap-1.5 font-medium">
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                            <span>Unverified Publisher: <strong>{threat.suspectPublisher}</strong></span>
                          </div>
                        )}

                        <p className="text-xs text-[var(--text-secondary)] mt-1.5 line-clamp-2 leading-relaxed">
                          {threat.suspectBio}
                        </p>

                        {/* Quick Forensic Badges */}
                        <div className="flex flex-wrap items-center gap-1.5 mt-2.5 text-[10px] font-mono">
                          <span className="px-1.5 py-0.5 rounded bg-[var(--bg-input)] border border-[var(--border-subtle)] text-[var(--text-muted)]">
                            Handle: <strong className="text-[var(--text-main)]">{risk?.breakdown?.handleScore}%</strong>
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-[var(--bg-input)] border border-[var(--border-subtle)] text-[var(--text-muted)]">
                            Logo: <strong className="text-[var(--text-main)]">{threat.logoMatchPercent}%</strong>
                          </span>
                          {risk?.breakdown?.scamScore > 0 && (
                            <span className="px-1.5 py-0.5 rounded bg-red-500/10 border border-red-500/20 text-red-400 font-bold">
                              Scam NLP: {risk.breakdown.scamScore}%
                            </span>
                          )}
                          {threat.suspectUrl && (
                            <span className="px-1.5 py-0.5 rounded bg-[var(--bg-input)] border border-[var(--border-subtle)] text-[var(--accent-primary)] truncate max-w-[180px]">
                              {threat.suspectUrl}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right Severity & Action indicator */}
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <div>
                        {getSeverityBadge(risk?.severity, risk?.compositeScore)}
                      </div>

                      <div className="flex items-center gap-1.5 mt-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenTakedownModal(threat);
                          }}
                          className="px-2.5 py-1 rounded-xl bg-red-600/90 hover:bg-red-500 text-white text-[11px] font-bold shadow-sm transition-all flex items-center gap-1 active:scale-95"
                          title="1-Click Platform & Legal Takedown"
                        >
                          <FileText className="w-3 h-3" />
                          <span>Takedown</span>
                        </button>
                        
                        <div className="p-1 rounded-lg text-[var(--text-muted)]">
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column (5 of 12 cols): Sticky Live Forensics Inspector */}
        <div className="lg:col-span-5 lg:sticky lg:top-20 space-y-4">
          {inspectedThreat ? (
            <div className="theme-card rounded-3xl p-5 space-y-4 shadow-xl border border-[var(--border-strong)]">
              
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border-subtle)]">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-[var(--accent-light)] text-[var(--accent-primary)] border border-[var(--border-accent)]">
                    <Fingerprint className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h3 className="text-xs uppercase font-extrabold tracking-wider text-[var(--text-main)] font-mono">
                      Live Forensic Inspector
                    </h3>
                    <p className="text-[10px] text-[var(--text-muted)] font-mono">
                      {inspectedThreat.id} • {inspectedThreat.platform}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onSelectThreat(inspectedThreat)}
                    className="p-1.5 rounded-lg border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface-hover)]"
                    title="Open Fullscreen Modal Dossier"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Composite Grade Bar */}
              <div className="p-3.5 rounded-2xl bg-[var(--bg-input)] border border-[var(--border-subtle)] flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider">
                    Risk Assessment Grade
                  </span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-2xl font-black font-mono text-[var(--text-main)]">
                      {inspectedThreat.calculatedRisk?.compositeScore}/100
                    </span>
                    <span className="text-xs font-mono font-bold text-red-400">
                      {inspectedThreat.calculatedRisk?.severity}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  {getStatusBadge(inspectedThreat.status)}
                  <div className="mt-1">
                    <select
                      value={inspectedThreat.status}
                      onChange={(e) => onUpdateStatus(inspectedThreat.id, e.target.value)}
                      className="text-[10px] theme-input rounded-lg px-2 py-0.5 cursor-pointer font-mono"
                    >
                      <option value="NEW">New Alert</option>
                      <option value="INVESTIGATING">Under Review</option>
                      <option value="TAKEDOWN_SENT">Takedown Dispatched</option>
                      <option value="RESOLVED">Resolved</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Side-by-Side Visual Trademark Comparison */}
              <div>
                <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider block mb-2">
                  Visual & Brand Identity Audit
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {/* Official */}
                  <div className="p-2.5 rounded-xl bg-emerald-950/20 border border-emerald-800/40">
                    <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-semibold mb-1">
                      <CheckCircle className="w-3 h-3" />
                      <span>Legitimate Entity</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <img 
                        src={selectedBrand.logoUrl} 
                        alt="Official Logo" 
                        className="w-8 h-8 rounded-lg object-cover border border-emerald-700/60" 
                      />
                      <div className="min-w-0">
                        <div className="text-[11px] font-bold text-[var(--text-main)] truncate">{selectedBrand.name}</div>
                        <div className="text-[10px] font-mono text-emerald-400 truncate">{selectedBrand.officialHandle}</div>
                      </div>
                    </div>
                  </div>

                  {/* Suspect */}
                  <div className="p-2.5 rounded-xl bg-red-950/20 border border-red-800/40">
                    <div className="flex items-center gap-1.5 text-[10px] text-red-400 font-semibold mb-1">
                      <AlertTriangle className="w-3 h-3" />
                      <span>Flagged Suspect</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <img 
                        src={inspectedThreat.avatarUrl} 
                        alt="Suspect Logo" 
                        className="w-8 h-8 rounded-lg object-cover border border-red-700/60" 
                      />
                      <div className="min-w-0">
                        <div className="text-[11px] font-bold text-[var(--text-main)] truncate">{inspectedThreat.suspectName}</div>
                        <div className="text-[10px] font-mono text-red-400 truncate">{inspectedThreat.suspectHandle}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 4-Signal Breakdown Meters */}
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider block">
                  4-Signal Forensic Breakdown
                </span>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2 rounded-xl bg-[var(--bg-input)] border border-[var(--border-subtle)]">
                    <div className="text-[10px] text-[var(--text-muted)]">Handle Distance</div>
                    <div className="font-bold text-[var(--accent-primary)] mt-0.5">
                      {inspectedThreat.calculatedRisk?.breakdown?.handleScore}% Match
                    </div>
                  </div>

                  <div className="p-2 rounded-xl bg-[var(--bg-input)] border border-[var(--border-subtle)]">
                    <div className="text-[10px] text-[var(--text-muted)]">Logo Similarity</div>
                    <div className="font-bold text-[var(--accent-primary)] mt-0.5">
                      {inspectedThreat.logoMatchPercent}% Overlap
                    </div>
                  </div>

                  <div className="p-2 rounded-xl bg-[var(--bg-input)] border border-[var(--border-subtle)]">
                    <div className="text-[10px] text-[var(--text-muted)]">Scam NLP</div>
                    <div className="font-bold text-red-400 mt-0.5">
                      {inspectedThreat.calculatedRisk?.breakdown?.scamScore}% Intent
                    </div>
                  </div>

                  <div className="p-2 rounded-xl bg-[var(--bg-input)] border border-[var(--border-subtle)]">
                    <div className="text-[10px] text-[var(--text-muted)]">Domain / Package</div>
                    <div className="font-bold text-amber-400 mt-0.5">
                      {inspectedThreat.calculatedRisk?.breakdown?.domainScore}% Risk
                    </div>
                  </div>
                </div>
              </div>

              {/* Kampus.VC Bonus: Lookalike details */}
              {inspectedThreat.calculatedRisk?.lookalike?.isLookalike && (
                <div className="p-3 rounded-2xl bg-purple-950/20 border border-purple-800/40 text-xs">
                  <div className="flex items-center gap-1.5 text-purple-300 font-bold mb-1">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    <span>Kampus.VC Look-alike Character Analysis</span>
                  </div>
                  <div className="text-[11px] text-[var(--text-secondary)] space-y-1">
                    {inspectedThreat.calculatedRisk.lookalike.hasCharacterSwap && (
                      <div>Swapped glyphs: <strong className="text-purple-300 font-mono">{inspectedThreat.calculatedRisk.lookalike.swappedCharacters.join(', ')}</strong></div>
                    )}
                    {inspectedThreat.calculatedRisk.lookalike.hasAddedWords && (
                      <div>Squatted keywords: <strong className="text-purple-300 font-mono">{inspectedThreat.calculatedRisk.lookalike.detectedAddedWords.join(', ')}</strong></div>
                    )}
                  </div>
                </div>
              )}

              {/* Forensic Reasons List */}
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider block">
                  Forensic Triggers ({inspectedThreat.calculatedRisk?.reasons?.length || 0})
                </span>
                <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                  {inspectedThreat.calculatedRisk?.reasons?.map((reason, idx) => (
                    <div key={idx} className="flex items-start gap-1.5 text-[11px] text-[var(--text-secondary)] p-1.5 rounded-lg bg-[var(--bg-input)] border border-[var(--border-subtle)]">
                      <span className="text-[var(--accent-primary)] font-bold font-mono">0{idx + 1}.</span>
                      <span>{reason}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center gap-2">
                <button
                  onClick={() => handleCopyDossier(inspectedThreat)}
                  className="flex-1 py-2 rounded-xl border border-[var(--border-subtle)] text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface-hover)] transition-all flex items-center justify-center gap-1.5"
                >
                  {copiedId === inspectedThreat.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Dossier</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => onOpenTakedownModal(inspectedThreat)}
                  className="flex-1 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white text-xs font-bold shadow-md shadow-red-900/20 transition-all flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>1-Click Takedown</span>
                </button>
              </div>

            </div>
          ) : (
            <div className="theme-card rounded-3xl p-6 text-center text-xs text-[var(--text-muted)]">
              Select an incident from the feed to view real-time forensic proof.
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
