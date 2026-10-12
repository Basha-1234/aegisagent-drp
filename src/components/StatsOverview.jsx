import React from 'react';
import { AlertTriangle, ShieldCheck, Clock, Zap, ExternalLink } from 'lucide-react';

export default function StatsOverview({ threats, selectedBrand }) {
  const brandThreats = threats.filter(t => t.brandId === selectedBrand.id);
  const criticalCount = brandThreats.filter(t => t.calculatedRisk?.severity === 'CRITICAL' || t.calculatedRisk?.compositeScore >= 75).length;
  const highCount = brandThreats.filter(t => t.calculatedRisk?.severity === 'HIGH' || (t.calculatedRisk?.compositeScore >= 50 && t.calculatedRisk?.compositeScore < 75)).length;
  const takedownsCount = brandThreats.filter(t => t.status === 'TAKEDOWN_SENT' || t.status === 'RESOLVED').length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      
      {/* Metric 1: Active Threats */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4.5 relative overflow-hidden group hover:border-slate-700 transition-all">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-slate-400">Total Impersonation Alerts</span>
          <div className="p-2 bg-red-500/10 text-red-400 rounded-xl border border-red-500/20">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono text-white">{brandThreats.length}</span>
          <span className="text-xs text-red-400 font-medium">({criticalCount} Critical)</span>
        </div>
        <div className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-400">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
          <span>{highCount} high severity under review</span>
        </div>
      </div>

      {/* Metric 2: Brand Impersonation Exposure */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4.5 relative overflow-hidden group hover:border-slate-700 transition-all">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-slate-400">Brand Risk Exposure</span>
          <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
            <Zap className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono text-white">
            {criticalCount > 0 ? 'HIGH' : highCount > 0 ? 'ELEVATED' : 'MODERATE'}
          </span>
          <span className="text-xs text-amber-400 font-medium font-mono">Index: 78/100</span>
        </div>
        <div className="mt-3 text-[11px] text-slate-400 flex justify-between items-center">
          <span>Official: {selectedBrand.officialHandle}</span>
          <span className="text-cyan-400 font-mono text-[10px]">{selectedBrand.officialDomain}</span>
        </div>
      </div>

      {/* Metric 3: MTTD (Mean Time to Detect) */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4.5 relative overflow-hidden group hover:border-slate-700 transition-all">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-slate-400">Mean Time to Detect (MTTD)</span>
          <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-xl border border-cyan-500/20">
            <Clock className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono text-white">2.4 mins</span>
          <span className="text-xs text-emerald-400 font-medium">94% faster than manual</span>
        </div>
        <div className="mt-3 text-[11px] text-slate-400">
          Continuous autonomous stream surveillance
        </div>
      </div>

      {/* Metric 4: Takedown Actions */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4.5 relative overflow-hidden group hover:border-slate-700 transition-all">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-slate-400">Remediation & Takedowns</span>
          <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono text-white">{takedownsCount}</span>
          <span className="text-xs text-emerald-400 font-medium">Notices Dispatched</span>
        </div>
        <div className="mt-3 text-[11px] text-slate-400">
          98.2% Platform Compliance Resolution
        </div>
      </div>

    </div>
  );
}
