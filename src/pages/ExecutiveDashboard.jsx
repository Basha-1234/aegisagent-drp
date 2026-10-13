import React from 'react';
import { useAuth } from '../context/AuthContext';
import { BarChart3, Users, DollarSign, Clock, ShieldCheck, Check, UserPlus } from 'lucide-react';

export default function ExecutiveDashboard() {
  const { user, accessRequests, approveAccessRequest } = useAuth();

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl glass-panel border border-emerald-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-2">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>ROLE 4: CISO & EXECUTIVE COMMAND (/executive)</span>
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">Enterprise Risk Posture & Team Administration</h2>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl">
            Logged in as <strong className="text-emerald-400">{user?.name}</strong> (Supreme Administrator). Here you monitor high-level MTTD/MTTR metrics, financial fraud loss avoidance, export SOC 2 audit logs, and approve employee workspace access requests.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-center min-w-[120px]">
            <div className="text-xl font-bold text-emerald-400 font-mono">$480,000</div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold">Fraud Loss Avoided</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-center min-w-[110px]">
            <div className="text-xl font-bold text-cyan-400 font-mono">100%</div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold">SOC 2 Audit Trail</div>
          </div>
        </div>
      </div>

      {/* CISO Team Access Management (Addresses user's specific question!) */}
      <div className="p-5 rounded-2xl glass-card border border-emerald-500/30 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-400" />
            <h3 className="font-bold text-sm text-white">Employee Workspace Access Requests (CISO Authorization)</h3>
          </div>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            {accessRequests.length} Pending Approval
          </span>
        </div>

        {accessRequests.length === 0 ? (
          <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800 text-center text-xs text-slate-400">
            Zero pending access requests. All organization employees provisioned.
          </div>
        ) : (
          <div className="space-y-2">
            {accessRequests.map((req) => (
              <div 
                key={req.id}
                className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <strong className="text-white">{req.name}</strong>
                    <span className="text-slate-400">({req.email})</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Department: <span className="text-slate-300 font-medium">{req.department}</span> • Requested Role: <span className="text-cyan-400 font-mono uppercase">{req.requestedRole}</span> • {req.submittedAt}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => approveAccessRequest(req.id, req.requestedRole)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400 transition flex items-center gap-1.5 text-xs"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Approve & Grant {req.requestedRole.toUpperCase()}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Grid Overview for Role 4 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-5 rounded-2xl glass-card border border-slate-800">
          <div className="flex items-center gap-2.5 mb-3 text-emerald-400 font-bold text-sm">
            <DollarSign className="w-4 h-4" />
            <span>Financial Fraud Loss Avoidance</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Algorithmic calculation of averted customer fraud based on neutralised phishing syndicates and prevented OTP breaches.
          </p>
          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-500">
            Ready for Step 5 Implementation
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-card border border-slate-800">
          <div className="flex items-center gap-2.5 mb-3 text-cyan-400 font-bold text-sm">
            <Clock className="w-4 h-4" />
            <span>Mean Time to Respond (MTTR)</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Real-time telemetry showing sub-60-second takedown dispatch times vs 48-hour industry averages.
          </p>
          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-500">
            Ready for Step 5 Implementation
          </div>
        </div>

        <div className="p-5 rounded-2xl glass-card border border-slate-800">
          <div className="flex items-center gap-2.5 mb-3 text-purple-400 font-bold text-sm">
            <ShieldCheck className="w-4 h-4" />
            <span>SOC 2 Type II Immutable Audit Export</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            One-click cryptographically signed audit log exports for enterprise compliance auditors.
          </p>
          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-500">
            Ready for Step 5 Implementation
          </div>
        </div>
      </div>
    </div>
  );
}
