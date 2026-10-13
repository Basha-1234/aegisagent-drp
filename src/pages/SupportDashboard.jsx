import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Search, ShieldCheck, HelpCircle, Check, AlertTriangle } from 'lucide-react';

export default function SupportDashboard() {
  const { user } = useAuth();

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl glass-panel border border-blue-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/40 border border-blue-500/30 text-blue-400 text-xs font-semibold mb-2">
            <Search className="w-3.5 h-3.5" />
            <span>ROLE 3: CUSTOMER SUPPORT & OPS (/support)</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">Customer Verification Radar</h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Logged in as <strong className="text-blue-400">{user?.name}</strong>. Fast-lookup verifier allowing frontline customer service agents to instantly check handles, links, or apps to answer: <em>"Is this official or a scam?"</em>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-center min-w-[110px]">
            <div className="text-xl font-bold text-blue-400 font-mono">Instant</div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Lookup Speed</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-center min-w-[110px]">
            <div className="text-xl font-bold text-emerald-400 font-mono">Read-Only</div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Safe Access</div>
          </div>
        </div>
      </div>

      {/* Grid Overview for Role 3 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-5 rounded-2xl glass-card border border-slate-800">
          <div className="flex items-center gap-2.5 mb-3 text-blue-400 font-bold text-sm">
            <Search className="w-4 h-4" />
            <span>Instant Handle & Link Checker</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Enter any suspicious URL or social handle to receive an instant green/red authenticity verdict.
          </p>
          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-500">
            Ready for Step 4 Implementation
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-card border border-slate-800">
          <div className="flex items-center gap-2.5 mb-3 text-emerald-400 font-bold text-sm">
            <ShieldCheck className="w-4 h-4" />
            <span>Official Brand Registry</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Read-only directory of verified company handles, official app package IDs, and authorized customer support emails.
          </p>
          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-500">
            Ready for Step 4 Implementation
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-card border border-slate-800">
          <div className="flex items-center gap-2.5 mb-3 text-amber-400 font-bold text-sm">
            <HelpCircle className="w-4 h-4" />
            <span>Customer Advisory Scripts</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Pre-approved customer safety responses explaining why an account is fake and how to stay protected.
          </p>
          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-500">
            Ready for Step 4 Implementation
          </div>
        </div>
      </div>
    </div>
  );
}
