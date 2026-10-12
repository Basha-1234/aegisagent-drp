import React from 'react';
import { BarChart3, ShieldCheck, AlertTriangle, TrendingUp, Shield, Activity } from 'lucide-react';

export default function AnalyticsView({ threats, selectedBrand }) {
  const brandThreats = threats.filter(t => t.brandId === selectedBrand.id);

  const platforms = {};
  brandThreats.forEach(t => {
    platforms[t.platform] = (platforms[t.platform] || 0) + 1;
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6">
        <h2 className="text-xl font-bold text-white font-mono flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-cyan-400" />
          Executive Threat Intelligence & Attack Surface
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Forensic telemetries and threat vector distributions for {selectedBrand.name}.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Attack Vector Distribution */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-white">Dominant Impersonation Vectors</h3>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300">Handle Typosquatting & Homoglyphs</span>
                <span className="font-mono text-cyan-400 font-bold">42%</span>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                <div className="bg-cyan-500 h-full rounded-full" style={{ width: '42%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300">Visual Trademark & Logo Hijacking</span>
                <span className="font-mono text-cyan-400 font-bold">35%</span>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-full rounded-full" style={{ width: '35%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300">Lookalike Phishing Domains</span>
                <span className="font-mono text-cyan-400 font-bold">15%</span>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full" style={{ width: '15%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300">Rogue Mobile Applications</span>
                <span className="font-mono text-cyan-400 font-bold">8%</span>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                <div className="bg-red-500 h-full rounded-full" style={{ width: '8%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Platform Exposure Breakdown */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-white">Platform Threat Concentration</h3>

          <div className="grid grid-cols-2 gap-3">
            {Object.entries(platforms).map(([plat, count]) => (
              <div key={plat} className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <div className="text-[11px] text-slate-400">{plat}</div>
                <div className="text-2xl font-bold font-mono text-white mt-1">{count} Alerts</div>
                <div className="text-[10px] text-cyan-400 mt-1">High Risk Infiltration</div>
              </div>
            ))}
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-400">
            <span className="font-bold text-slate-200">Security Recommendation:</span> BrandGuard AI automated surveillance should prioritize social support handles on X and Instagram where 77% of customer fraud originates.
          </div>
        </div>

      </div>

    </div>
  );
}
