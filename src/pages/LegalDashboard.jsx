import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Scale, FileText, Send, CheckCircle2, Shield } from 'lucide-react';

export default function LegalDashboard() {
  const { user } = useAuth();

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl glass-panel border border-amber-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/40 border border-amber-500/30 text-amber-400 text-xs font-semibold mb-2">
            <Scale className="w-3.5 h-3.5" />
            <span>ROLE 2: LEGAL COUNSEL WORKSPACE (/legal)</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">Statutory Enforcement & Takedown Desk</h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Logged in as <strong className="text-amber-400">{user?.name}</strong>. Here you review pre-compiled legal affidavits citing Rule 3(2)(b) of the Indian IT Rules (2021) and DMCA §512 for 1-click platform API dispatch.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-center min-w-[110px]">
            <div className="text-xl font-bold text-amber-400 font-mono">5 Pending</div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Takedown Desk</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-center min-w-[110px]">
            <div className="text-xl font-bold text-emerald-400 font-mono">{'< 60s'}</div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold">MTTR Speed</div>
          </div>
        </div>
      </div>

      {/* Grid Overview for Role 2 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-5 rounded-2xl glass-card border border-slate-800">
          <div className="flex items-center gap-2.5 mb-3 text-amber-400 font-bold text-sm">
            <FileText className="w-4 h-4" />
            <span>Automated Statutory Affidavits</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Pre-assembled evidence packages with exact post URLs, homoglyph character mappings, and statutory citations.
          </p>
          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-500">
            Ready for Step 3 Implementation
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-card border border-slate-800">
          <div className="flex items-center gap-2.5 mb-3 text-emerald-400 font-bold text-sm">
            <Send className="w-4 h-4" />
            <span>1-Click Platform API Dispatch</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Programmatic webhooks to Meta Content Protection, Google Play Integrity, and Grievance Desks.
          </p>
          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-500">
            Ready for Step 3 Implementation
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-card border border-slate-800">
          <div className="flex items-center gap-2.5 mb-3 text-cyan-400 font-bold text-sm">
            <CheckCircle2 className="w-4 h-4" />
            <span>Legal Takedown Receipts & Audit</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Immutable chain-of-custody logging with timestamped PDF evidence exports.
          </p>
          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-500">
            Ready for Step 3 Implementation
          </div>
        </div>
      </div>
    </div>
  );
}
