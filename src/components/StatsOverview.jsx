import React from 'react';
import { AlertTriangle, ShieldCheck, Clock, Zap } from 'lucide-react';

export default function StatsOverview({ 
  threats, 
  selectedBrand, 
  activeFilterSeverity = 'ALL', 
  onFilterSeverityChange 
}) {
  const brandThreats = threats.filter(t => t.brandId === selectedBrand.id);
  const criticalThreats = brandThreats.filter(
    t => t.calculatedRisk?.severity === 'CRITICAL' || (t.calculatedRisk?.compositeScore >= 75)
  );
  const highThreats = brandThreats.filter(
    t => t.calculatedRisk?.severity === 'HIGH' || (t.calculatedRisk?.compositeScore >= 50 && t.calculatedRisk?.compositeScore < 75)
  );
  const takedownsCount = brandThreats.filter(
    t => t.status === 'TAKEDOWN_SENT' || t.status === 'RESOLVED'
  ).length;

  const exposureLevel = criticalThreats.length > 0 ? 'CRITICAL EXPOSURE' : highThreats.length > 0 ? 'ELEVATED EXPOSURE' : 'CONTROLLED';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mb-6">
      
      {/* Metric 1: Impersonation Incidents */}
      <div 
        onClick={() => onFilterSeverityChange && onFilterSeverityChange(activeFilterSeverity === 'CRITICAL' ? 'ALL' : 'CRITICAL')}
        className={`theme-card rounded-2xl p-4.5 cursor-pointer relative overflow-hidden group transition-all ${
          activeFilterSeverity === 'CRITICAL' 
            ? 'ring-2 ring-red-500/60 bg-[var(--bg-surface-elevated)]' 
            : 'hover:border-red-500/40'
        }`}
      >
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-semibold text-[var(--text-muted)]">Active Threat Alerts</span>
          <div className="p-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 group-hover:scale-105 transition-transform">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-black font-mono text-[var(--text-main)]">{brandThreats.length}</span>
          <span className="text-xs text-red-400 font-semibold font-mono">({criticalThreats.length} Critical)</span>
        </div>
        <div className="mt-2.5 flex items-center justify-between text-[11px] text-[var(--text-muted)]">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            <span>{highThreats.length} high priority</span>
          </div>
          <span className="text-[10px] text-[var(--text-faint)] group-hover:text-[var(--text-main)] transition-colors">
            {activeFilterSeverity === 'CRITICAL' ? 'Filtered' : 'Click to filter'}
          </span>
        </div>
      </div>

      {/* Metric 2: Brand Exposure Index */}
      <div className="theme-card rounded-2xl p-4.5 relative overflow-hidden group">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-semibold text-[var(--text-muted)]">Brand Vulnerability Index</span>
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 group-hover:scale-105 transition-transform">
            <Zap className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className={`text-xl font-black font-mono ${
            criticalThreats.length > 0 ? 'text-red-400' : 'text-amber-400'
          }`}>
            {exposureLevel}
          </span>
        </div>
        <div className="mt-2.5 flex items-center justify-between text-[11px] text-[var(--text-muted)]">
          <span className="truncate max-w-[130px] font-mono">{selectedBrand.officialHandle}</span>
          <span className="font-mono text-[10px] text-[var(--accent-primary)]">{selectedBrand.officialDomain}</span>
        </div>
      </div>

      {/* Metric 3: MTTD (Mean Time to Detect) */}
      <div className="theme-card rounded-2xl p-4.5 relative overflow-hidden group">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-semibold text-[var(--text-muted)]">Autonomous MTTD</span>
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 group-hover:scale-105 transition-transform">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-black font-mono text-[var(--text-main)]">2.4 min</span>
          <span className="text-xs text-emerald-400 font-semibold font-mono">98% faster</span>
        </div>
        <div className="mt-2.5 text-[11px] text-[var(--text-muted)] flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>Continuous multi-channel sweep</span>
        </div>
      </div>

      {/* Metric 4: Takedown Remediation */}
      <div className="theme-card rounded-2xl p-4.5 relative overflow-hidden group">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-semibold text-[var(--text-muted)]">Remediation Takedowns</span>
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-black font-mono text-[var(--text-main)]">{takedownsCount}</span>
          <span className="text-xs text-emerald-400 font-semibold font-mono">Dispatched</span>
        </div>
        <div className="mt-2.5 text-[11px] text-[var(--text-muted)] flex items-center justify-between">
          <span>Resolution rate:</span>
          <span className="font-mono font-bold text-emerald-400">98.4%</span>
        </div>
      </div>

    </div>
  );
}
