import React from 'react';
import { BarChart3, ShieldCheck, AlertTriangle, TrendingUp, Shield, Activity, Smartphone, Globe } from 'lucide-react';

export default function AnalyticsView({ threats, selectedBrand }) {
  const brandThreats = threats.filter(t => t.brandId === selectedBrand.id);

  const platforms = {};
  brandThreats.forEach(t => {
    platforms[t.platform] = (platforms[t.platform] || 0) + 1;
  });

  const criticalCount = brandThreats.filter(t => t.calculatedRisk?.severity === 'CRITICAL' || t.calculatedRisk?.compositeScore >= 75).length;
  const highCount = brandThreats.filter(t => t.calculatedRisk?.severity === 'HIGH' || (t.calculatedRisk?.compositeScore >= 50 && t.calculatedRisk?.compositeScore < 75)).length;
  const mediumCount = brandThreats.filter(t => t.calculatedRisk?.severity === 'MEDIUM' || (t.calculatedRisk?.compositeScore >= 30 && t.calculatedRisk?.compositeScore < 50)).length;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="theme-card rounded-3xl p-6">
        <h2 className="text-xl font-black text-[var(--text-main)] font-mono flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-[var(--accent-primary)]" />
          Executive Threat Intelligence & Attack Surface
        </h2>
        <p className="text-xs text-[var(--text-muted)] mt-1">
          Forensic telemetries, attack vector distributions, and mitigation posture for <strong className="text-[var(--text-main)]">{selectedBrand.name}</strong>.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Dominant Attack Vectors */}
        <div className="theme-card rounded-3xl p-6 space-y-4">
          <h3 className="text-xs uppercase font-extrabold text-[var(--text-main)] tracking-wider font-mono">
            Dominant Impersonation Vectors
          </h3>

          <div className="space-y-3.5">
            <div>
              <div className="flex justify-between text-xs mb-1.5 font-medium">
                <span className="text-[var(--text-secondary)]">Handle Typosquatting & Homoglyphs</span>
                <span className="font-mono text-[var(--accent-primary)] font-bold">42%</span>
              </div>
              <div className="w-full bg-[var(--bg-input)] h-2 rounded-full overflow-hidden border border-[var(--border-subtle)]">
                <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500" style={{ width: '42%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1.5 font-medium">
                <span className="text-[var(--text-secondary)]">Visual Trademark & Logo Hijacking</span>
                <span className="font-mono text-[var(--accent-primary)] font-bold">35%</span>
              </div>
              <div className="w-full bg-[var(--bg-input)] h-2 rounded-full overflow-hidden border border-[var(--border-subtle)]">
                <div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500" style={{ width: '35%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1.5 font-medium">
                <span className="text-[var(--text-secondary)]">Lookalike Phishing Domains</span>
                <span className="font-mono text-amber-400 font-bold">15%</span>
              </div>
              <div className="w-full bg-[var(--bg-input)] h-2 rounded-full overflow-hidden border border-[var(--border-subtle)]">
                <div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500" style={{ width: '15%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1.5 font-medium">
                <span className="text-[var(--text-secondary)]">Rogue Mobile Applications (App Stores)</span>
                <span className="font-mono text-red-400 font-bold">8%</span>
              </div>
              <div className="w-full bg-[var(--bg-input)] h-2 rounded-full overflow-hidden border border-[var(--border-subtle)]">
                <div className="h-full rounded-full bg-gradient-to-r from-red-500 to-rose-600" style={{ width: '8%' }}></div>
              </div>
            </div>
          </div>

          {/* Severity bar */}
          <div className="pt-4 border-t border-[var(--border-subtle)]">
            <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider block mb-2">
              Incident Severity Telemetry
            </span>
            <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
              <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20">
                <div className="text-[10px] text-red-400 font-bold">Critical</div>
                <div className="text-lg font-black text-red-400 mt-0.5">{criticalCount}</div>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <div className="text-[10px] text-amber-400 font-bold">High</div>
                <div className="text-lg font-black text-amber-400 mt-0.5">{highCount}</div>
              </div>
              <div className="p-2.5 rounded-xl bg-[var(--bg-input)] border border-[var(--border-subtle)]">
                <div className="text-[10px] text-[var(--text-muted)] font-bold">Medium</div>
                <div className="text-lg font-black text-[var(--text-main)] mt-0.5">{mediumCount}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Platform Exposure Breakdown */}
        <div className="theme-card rounded-3xl p-6 space-y-4">
          <h3 className="text-xs uppercase font-extrabold text-[var(--text-main)] tracking-wider font-mono">
            Platform Threat Concentration
          </h3>

          <div className="grid grid-cols-2 gap-3">
            {Object.entries(platforms).map(([plat, count]) => (
              <div key={plat} className="p-3.5 rounded-2xl bg-[var(--bg-input)] border border-[var(--border-subtle)]">
                <div className="text-[11px] text-[var(--text-muted)] truncate">{plat}</div>
                <div className="text-xl font-black font-mono text-[var(--text-main)] mt-1">{count} Alerts</div>
                <div className="text-[10px] text-[var(--accent-primary)] mt-0.5 font-mono">Active Infiltration</div>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-2xl bg-[var(--bg-input)] border border-[var(--border-subtle)] text-xs text-[var(--text-secondary)] leading-relaxed">
            <span className="font-bold text-[var(--text-main)]">AI Triage Recommendation:</span> BrandGuard autonomous surveillance should prioritize social support handles on X and Instagram where 77% of customer fraud originates, followed by APK monitoring for unauthorized wallet clones.
          </div>
        </div>

      </div>

    </div>
  );
}
