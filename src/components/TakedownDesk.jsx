import React, { useState } from 'react';
import { 
  FileCheck, 
  FileText
} from 'lucide-react';

export default function TakedownDesk({ 
  threats, 
  selectedBrand, 
  onOpenTakedownModal, 
  onUpdateStatus 
}) {
  const [filterStatus, setFilterStatus] = useState('ALL');

  const brandThreats = threats.filter(t => t.brandId === selectedBrand.id);
  const activeCases = brandThreats.filter(t => t.calculatedRisk?.compositeScore >= 40);

  const filteredCases = activeCases.filter(t => {
    if (filterStatus === 'ALL') return true;
    if (filterStatus === 'DISPATCHED') return t.status === 'TAKEDOWN_SENT';
    if (filterStatus === 'REVIEW') return t.status === 'INVESTIGATING';
    if (filterStatus === 'NEW') return t.status === 'NEW';
    if (filterStatus === 'RESOLVED') return t.status === 'RESOLVED';
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Overview Header Banner */}
      <div className="theme-card rounded-3xl p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-black text-[var(--text-main)] font-mono">
                Remediation & Legal Takedown Desk
              </h2>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono">
                DMCA 512 & Platform Webhooks Active
              </span>
            </div>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Automated platform abuse reporting & statutory trademark infringement management for {selectedBrand.name}.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-[var(--bg-input)] px-4 py-2.5 rounded-2xl border border-[var(--border-subtle)] shrink-0">
            <div className="text-right">
              <span className="text-[10px] uppercase text-[var(--text-muted)] block font-bold">Success Rate</span>
              <span className="text-base font-black font-mono text-emerald-400">98.4%</span>
            </div>
            <div className="w-px h-7 bg-[var(--border-subtle)]" />
            <div className="text-right">
              <span className="text-[10px] uppercase text-[var(--text-muted)] block font-bold">Avg. Removal Time</span>
              <span className="text-base font-black font-mono text-[var(--accent-primary)]">3.8 Hours</span>
            </div>
          </div>
        </div>
      </div>

      {/* Case Management Table */}
      <div className="theme-card rounded-3xl overflow-hidden shadow-xl">
        
        {/* Table Filter Header */}
        <div className="p-4 sm:p-5 border-b border-[var(--border-subtle)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-[var(--accent-primary)]" />
            <h3 className="text-xs uppercase font-extrabold text-[var(--text-main)] tracking-wider font-mono">
              Enforcement Pipeline ({filteredCases.length} Cases)
            </h3>
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1 text-xs">
            {[
              { id: 'ALL', label: 'All Cases' },
              { id: 'NEW', label: 'Action Needed' },
              { id: 'REVIEW', label: 'Under Review' },
              { id: 'DISPATCHED', label: 'Dispatched' },
              { id: 'RESOLVED', label: 'Resolved' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterStatus(tab.id)}
                className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-all ${
                  filterStatus === tab.id
                    ? 'theme-btn-primary'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Case List */}
        <div className="divide-y divide-[var(--border-subtle)]">
          {filteredCases.length === 0 ? (
            <div className="p-12 text-center text-xs text-[var(--text-muted)]">
              No cases matching the current status filter.
            </div>
          ) : (
            filteredCases.map((threat) => {
              const risk = threat.calculatedRisk;
              return (
                <div 
                  key={threat.id} 
                  className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-[var(--bg-surface-hover)] transition-colors"
                >
                  <div className="flex items-start gap-3.5 min-w-0 flex-1">
                    <img
                      src={threat.avatarUrl}
                      alt="Suspect Avatar"
                      className="w-10 h-10 rounded-xl object-cover border border-[var(--border-subtle)] shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs sm:text-sm font-bold text-[var(--text-main)] font-mono truncate">
                          {threat.suspectHandle}
                        </span>
                        <span className="text-xs text-[var(--text-muted)] font-sans">
                          ({threat.platform})
                        </span>
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.2 rounded-full border ${
                          risk?.severity === 'CRITICAL'
                            ? 'bg-red-500/15 text-red-400 border-red-500/30'
                            : 'bg-orange-500/15 text-orange-400 border-orange-500/30'
                        }`}>
                          Risk Score: {risk?.compositeScore}%
                        </span>
                      </div>

                      <div className="text-[11px] text-[var(--text-muted)] mt-1 flex flex-wrap items-center gap-2">
                        <span>Channel: {threat.channel}</span>
                        <span>•</span>
                        <span>Detected: {new Date(threat.detectionDate).toLocaleDateString()}</span>
                        {threat.suspectUrl && (
                          <>
                            <span>•</span>
                            <span className="text-[var(--accent-primary)] truncate max-w-xs font-mono">
                              {threat.suspectUrl}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end shrink-0">
                    {/* Status dropdown */}
                    <select
                      value={threat.status}
                      onChange={(e) => onUpdateStatus(threat.id, e.target.value)}
                      className="theme-input text-xs rounded-xl px-2.5 py-1.5 cursor-pointer font-mono text-[var(--text-main)]"
                    >
                      <option value="NEW">New Alert</option>
                      <option value="INVESTIGATING">Under Investigation</option>
                      <option value="TAKEDOWN_SENT">Takedown Dispatched</option>
                      <option value="RESOLVED">Resolved / Taken Down</option>
                    </select>

                    <button
                      onClick={() => onOpenTakedownModal(threat)}
                      className="px-3.5 py-1.5 rounded-xl theme-btn-primary text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>{threat.status === 'TAKEDOWN_SENT' ? 'View Notice' : 'Dispatch Notice'}</span>
                    </button>
                  </div>

                </div>
              );
            })
          )}
        </div>

      </div>

    </div>
  );
}
