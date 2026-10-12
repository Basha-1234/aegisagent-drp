import React from 'react';
import { FileCheck, ShieldAlert, CheckCircle2, Clock, ExternalLink, Download, FileText, Send } from 'lucide-react';

export default function TakedownDesk({ threats, selectedBrand, onOpenTakedownModal, onUpdateStatus }) {
  const brandThreats = threats.filter(t => t.brandId === selectedBrand.id);
  const activeCases = brandThreats.filter(t => t.calculatedRisk?.compositeScore >= 40);

  return (
    <div className="space-y-6">
      
      {/* Overview header */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white font-mono">Remediation & Legal Takedown Desk</h2>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono">
                DMCA Enforcement Active
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Automated platform abuse reporting & statutory infringement management for {selectedBrand.name}.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] uppercase text-slate-400 block font-semibold">Takedown Success Rate</span>
              <span className="text-lg font-bold font-mono text-emerald-400">98.4%</span>
            </div>
            <div className="w-px h-8 bg-slate-800" />
            <div className="text-right">
              <span className="text-[10px] uppercase text-slate-400 block font-semibold">Avg. Removal Time</span>
              <span className="text-lg font-bold font-mono text-cyan-400">3.8 Hours</span>
            </div>
          </div>
        </div>
      </div>

      {/* Case Management Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-cyan-400" />
            Active Impersonation Cases ({activeCases.length})
          </h3>
          <span className="text-xs text-slate-400">Click any case to generate or re-dispatch notice</span>
        </div>

        <div className="divide-y divide-slate-800">
          {activeCases.map((threat) => {
            const risk = threat.calculatedRisk;
            return (
              <div key={threat.id} className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-800/30 transition-colors">
                
                <div className="flex items-start gap-3.5">
                  <img
                    src={threat.avatarUrl}
                    alt="Suspect Avatar"
                    className="w-10 h-10 rounded-xl object-cover border border-slate-700"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white font-mono">{threat.suspectHandle}</span>
                      <span className="text-xs text-slate-400 font-sans">({threat.platform})</span>
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                        risk?.severity === 'CRITICAL'
                          ? 'bg-red-500/15 text-red-400 border-red-500/30'
                          : 'bg-orange-500/15 text-orange-400 border-orange-500/30'
                      }`}>
                        Score: {risk?.compositeScore}%
                      </span>
                    </div>

                    <div className="text-xs text-slate-400 mt-1 flex flex-wrap items-center gap-2">
                      <span>Channel: {threat.channel}</span>
                      <span>•</span>
                      <span>Detected: {new Date(threat.detectionDate).toLocaleDateString()}</span>
                      {threat.suspectUrl && (
                        <>
                          <span>•</span>
                          <span className="text-cyan-400 truncate max-w-xs">{threat.suspectUrl}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                  {/* Status toggle */}
                  <select
                    value={threat.status}
                    onChange={(e) => onUpdateStatus(threat.id, e.target.value)}
                    className="bg-slate-950 border border-slate-700 text-xs text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-cyan-500 cursor-pointer"
                  >
                    <option value="NEW">New Alert</option>
                    <option value="INVESTIGATING">Under Investigation</option>
                    <option value="TAKEDOWN_SENT">Takedown Dispatched</option>
                    <option value="RESOLVED">Resolved / Taken Down</option>
                  </select>

                  <button
                    onClick={() => onOpenTakedownModal(threat)}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-semibold border border-slate-700 transition-all flex items-center gap-1.5"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>View Notice</span>
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
