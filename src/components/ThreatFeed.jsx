import React, { useState } from 'react';
import { 
  Smartphone, 
  Globe, 
  Send, 
  ShieldAlert, 
  Search, 
  Filter, 
  ArrowUpRight, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  FileText
} from 'lucide-react';

// Custom platform SVGs
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
  onOpenTakedownModal 
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('ALL');
  const [filterChannel, setFilterChannel] = useState('ALL');

  const brandThreats = threats.filter(t => t.brandId === selectedBrand.id);

  // Apply search and filter
  const filteredThreats = brandThreats.filter(t => {
    const matchesSearch = 
      t.suspectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.suspectHandle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.suspectBio.toLowerCase().includes(searchQuery.toLowerCase());

    const risk = t.calculatedRisk;
    const matchesSeverity = 
      filterSeverity === 'ALL' || 
      risk?.severity === filterSeverity;

    const matchesChannel = 
      filterChannel === 'ALL' || 
      t.channel === filterChannel;

    return matchesSearch && matchesSeverity && matchesChannel;
  });

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
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold font-mono bg-red-500/15 text-red-400 border border-red-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse"></span>
            CRITICAL ({score}%)
          </span>
        );
      case 'HIGH':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold font-mono bg-orange-500/15 text-orange-400 border border-orange-500/30">
            HIGH ({score}%)
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium font-mono bg-amber-500/15 text-amber-300 border border-amber-500/30">
            MEDIUM ({score}%)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium font-mono bg-slate-500/15 text-slate-300 border border-slate-500/30">
            LOW ({score}%)
          </span>
        );
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'TAKEDOWN_SENT':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Takedown Dispatched
          </span>
        );
      case 'INVESTIGATING':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-amber-950 text-amber-400 border border-amber-800 flex items-center gap-1">
            <Clock className="w-3 h-3" /> Under Review
          </span>
        );
      case 'RESOLVED':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-800 text-slate-400 border border-slate-700">
            Resolved / Removed
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-red-950 text-red-300 border border-red-800 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> Action Required
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      
      {/* Controls Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
        
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by suspect handle, scam phrase, or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl pl-9 pr-4 py-2 focus:outline-none focus:ring-1 focus:ring-cyan-500 placeholder-slate-500"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <span className="text-[10px] uppercase font-bold text-slate-500 px-2">Severity:</span>
            {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'].map(sev => (
              <button
                key={sev}
                onClick={() => setFilterSeverity(sev)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  filterSeverity === sev
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <span className="text-[10px] uppercase font-bold text-slate-500 px-2">Channel:</span>
            {['ALL', 'Social Profile', 'Rogue Mobile App', 'Phishing Website'].map(chan => (
              <button
                key={chan}
                onClick={() => setFilterChannel(chan)}
                className={`px-2 py-1 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                  filterChannel === chan
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {chan === 'ALL' ? 'All' : chan}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Threat List */}
      <div className="space-y-3">
        {filteredThreats.length === 0 ? (
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-12 text-center">
            <ShieldAlert className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-white">No Threat Incidents Found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              No suspect profiles match your current search query or filter parameters. Click "Simulate Feed Scan" to ingest new endpoints.
            </p>
          </div>
        ) : (
          filteredThreats.map((threat) => {
            const risk = threat.calculatedRisk;
            return (
              <div 
                key={threat.id} 
                className="bg-slate-900/60 border border-slate-800/90 hover:border-slate-700/80 rounded-2xl p-4 sm:p-5 transition-all shadow-sm group hover:shadow-cyan-950/10"
              >
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                  
                  {/* Left Identity & Platform */}
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    <div className="relative shrink-0">
                      <img 
                        src={threat.avatarUrl} 
                        alt="Suspect Avatar" 
                        className="w-12 h-12 rounded-xl object-cover border border-slate-700/80" 
                      />
                      <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-slate-950 border border-slate-800 shadow">
                        {getPlatformIcon(threat.platform)}
                      </div>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-sm font-bold text-white truncate group-hover:text-cyan-300 transition-colors">
                          {threat.suspectName}
                        </h4>
                        <span className="text-xs font-mono text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/40 font-semibold">
                          {threat.suspectHandle}
                        </span>
                        {getStatusBadge(threat.status)}
                      </div>

                      <p className="text-xs text-slate-400 mt-1.5 line-clamp-2">
                        {threat.suspectBio}
                      </p>

                      {/* Multi-Signal Indicators */}
                      <div className="flex flex-wrap items-center gap-2 mt-2.5">
                        <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                          Handle Match: <strong className="text-cyan-300">{risk?.breakdown?.handleScore}%</strong>
                        </span>
                        <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                          Logo Similarity: <strong className="text-cyan-300">{threat.logoMatchPercent}%</strong>
                        </span>
                        {risk?.breakdown?.scamScore > 0 && (
                          <span className="text-[11px] px-2 py-0.5 rounded bg-red-950/60 text-red-300 border border-red-800/60 font-mono">
                            Scam Intent: <strong className="text-red-400">{risk.breakdown.scamScore}%</strong>
                          </span>
                        )}
                        {threat.suspectUrl && (
                          <span className="text-[11px] px-2 py-0.5 rounded bg-amber-950/50 text-amber-300 border border-amber-800/50 font-mono truncate max-w-xs">
                            URL: {threat.suspectUrl}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right Actions & Risk Score */}
                  <div className="flex lg:flex-col items-center lg:items-end justify-between w-full lg:w-auto gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-800/80">
                    <div>
                      {getSeverityBadge(risk?.severity, risk?.compositeScore)}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onSelectThreat(threat)}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-all flex items-center gap-1.5"
                      >
                        <span>Deep Dive AI</span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-cyan-400" />
                      </button>

                      <button
                        onClick={() => onOpenTakedownModal(threat)}
                        className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white text-xs font-semibold shadow-md shadow-red-900/20 transition-all flex items-center gap-1.5 active:scale-95"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>1-Click Takedown</span>
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
