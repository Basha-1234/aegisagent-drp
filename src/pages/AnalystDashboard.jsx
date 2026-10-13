import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, Search, Layers, Activity, FileCheck } from 'lucide-react';

export default function AnalystDashboard() {
  const { user } = useAuth();

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl glass-panel border border-cyan-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/40 border border-cyan-500/30 text-cyan-400 text-xs font-semibold mb-2">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>ROLE 1: SECURITY ANALYST WORKSPACE (/analyst)</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">Threat Triage & Forensic Canvas</h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Logged in as <strong className="text-cyan-400">{user?.name}</strong>. Here you inspect incoming threat streams, perform homoglyph & logo diff analysis, and cluster coordinated accounts into attack syndicates.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-center min-w-[110px]">
            <div className="text-xl font-bold text-cyan-400 font-mono">14 Alerts</div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Active Queue</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-center min-w-[110px]">
            <div className="text-xl font-bold text-emerald-400 font-mono">{'< 2.4m'}</div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold">MTTD Speed</div>
          </div>
        </div>
      </div>

      {/* Grid Overview for Role 1 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-5 rounded-2xl glass-card border border-slate-800">
          <div className="flex items-center gap-2.5 mb-3 text-cyan-400 font-bold text-sm">
            <Search className="w-4 h-4" />
            <span>Multi-Signal Threat Radar</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Real-time feed ingesting social handles, typosquatted web domains, and rogue third-party Android APKs.
          </p>
          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-500">
            Ready for Step 2 Implementation
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-card border border-slate-800">
          <div className="flex items-center gap-2.5 mb-3 text-emerald-400 font-bold text-sm">
            <Layers className="w-4 h-4" />
            <span>Forensic Diff Canvas</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Side-by-side trademark logo comparison, normalized Levenshtein distance, and APK manifest permission auditor.
          </p>
          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-500">
            Ready for Step 2 Implementation
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-card border border-slate-800">
          <div className="flex items-center gap-2.5 mb-3 text-amber-400 font-bold text-sm">
            <Activity className="w-4 h-4" />
            <span>Attack Syndicate Graph</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Correlates distributed handles, rogue APKs, and phishing domains into a unified threat cluster.
          </p>
          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-500">
            Ready for Step 2 Implementation
          </div>
        </div>
      </div>
    </div>
  );
}
