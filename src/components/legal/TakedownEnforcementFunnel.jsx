import React, { useState } from 'react';
import { Filter, CheckCircle2, Clock, AlertTriangle, ShieldCheck, ArrowRight, Zap, RefreshCw } from 'lucide-react';

export default function TakedownEnforcementFunnel({ onSelectStage, selectedStage = 'all', cases = [] }) {
  // Compute dynamic stage counts if live cases are provided
  const liveCount = (stageId) => {
    if (!cases || cases.length === 0) return null;
    switch (stageId) {
      case 'triaged':
        return cases.filter(c => c.status === 'NEW' || c.status === 'INVESTIGATING').length;
      case 'drafted':
        return cases.filter(c => c.status === 'CONFIRMED_THREAT').length;
      case 'dispatched':
        return cases.filter(c => c.status === 'TAKEDOWN_REQUESTED' || c.status === 'TAKEDOWN_SENT').length;
      case 'review':
        return cases.filter(c => c.status === 'TAKEDOWN_REQUESTED').length;
      case 'delisted':
        return cases.filter(c => c.status === 'RESOLVED').length;
      default:
        return cases.length;
    }
  };

  const stages = [
    {
      id: 'triaged',
      label: '1. Forensic Ingestion',
      count: liveCount('triaged') ?? 14,
      sublabel: 'New & Investigating',
      color: '#38bdf8', // Cyan
      conversion: '100%',
      avgTime: '0.4h'
    },
    {
      id: 'drafted',
      label: '2. Statutory Drafted',
      count: liveCount('drafted') ?? 11,
      sublabel: 'Confirmed True Positives',
      color: '#60a5fa', // Blue
      conversion: '78.5%',
      avgTime: '1.2h'
    },
    {
      id: 'dispatched',
      label: '3. API Dispatched',
      count: liveCount('dispatched') ?? 8,
      sublabel: 'Takedowns Sent/Requested',
      color: '#f59e0b', // Amber
      conversion: '57.1%',
      avgTime: '2.1h'
    },
    {
      id: 'review',
      label: '4. Platform Review',
      count: liveCount('review') ?? 5,
      sublabel: 'Host SLA Awaiting',
      color: '#a855f7', // Purple
      conversion: '35.7%',
      avgTime: '3.4h'
    },
    {
      id: 'delisted',
      label: '5. Delisted & Suspended',
      count: liveCount('delisted') ?? 12,
      sublabel: 'Resolved & Terminated',
      color: '#10b981', // Emerald
      conversion: '85.7%',
      avgTime: '4.2h'
    }
  ];

  return (
    <div className="rounded-2xl p-5 bg-[#071120]/90 backdrop-blur-xl border border-blue-500/30 shadow-2xl space-y-5">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-300">
              Statutory Takedown Enforcement Funnel
            </h3>
            {selectedStage !== 'all' && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 border border-amber-500/40 text-amber-300 font-bold">
                Filtered: {selectedStage.toUpperCase()}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-300 mt-0.5">
            Stage-gate legal lifecycle tracking takedowns from analyst handover to confirmed entity delisting. Click any stage to filter docket.
          </p>
        </div>

        {/* Aggregate Telemetry */}
        <div className="flex items-center gap-2">
          {selectedStage !== 'all' && onSelectStage && (
            <button
              type="button"
              onClick={() => onSelectStage('all')}
              className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-mono font-bold cursor-pointer"
            >
              Reset Filter
            </button>
          )}
          <div className="px-3 py-1 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
            <div className="text-xs font-mono text-emerald-400 font-bold">91.4%</div>
            <div className="text-[9px] font-mono text-slate-400 uppercase">Success Rate</div>
          </div>
          <div className="px-3 py-1 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
            <div className="text-xs font-mono text-cyan-400 font-bold">3.8h avg</div>
            <div className="text-[9px] font-mono text-slate-400 uppercase">Resolution MTTR</div>
          </div>
        </div>
      </div>

      {/* Visual Pipeline Funnel SVG & Stepper */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
        {stages.map((stage, idx) => {
          const isSelected = selectedStage === stage.id;
          return (
            <div
              key={stage.id}
              onClick={() => {
                const next = isSelected ? 'all' : stage.id;
                onSelectStage && onSelectStage(next);
              }}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                isSelected
                  ? 'bg-gradient-to-b from-blue-900/60 to-slate-950 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.25)] ring-1 ring-amber-400/50'
                  : 'bg-slate-950/70 border-slate-800/90 hover:bg-slate-900/60 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-1 mb-2">
                  <span className="text-[10px] font-mono font-bold text-slate-400">
                    STEP 0{idx + 1}
                  </span>
                  <span 
                    className="text-xs font-mono font-bold px-2 py-0.5 rounded-full border"
                    style={{ 
                      backgroundColor: `${stage.color}15`, 
                      color: stage.color, 
                      borderColor: `${stage.color}40` 
                    }}
                  >
                    {stage.count} Cases
                  </span>
                </div>

                <div className="text-xs font-bold text-white mb-1">
                  {stage.label}
                </div>
                <div className="text-[10px] text-slate-400 leading-snug">
                  {stage.sublabel}
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-900 flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span>Avg SLA: <strong className="text-slate-200">{stage.avgTime}</strong></span>
                <span className="text-emerald-400 font-semibold">{stage.conversion}</span>
              </div>

              {/* Progress Connector Indicator */}
              <div 
                className="absolute bottom-0 left-0 right-0 h-1 rounded-b-xl"
                style={{ backgroundColor: stage.color }}
              />
            </div>
          );
        })}
      </div>

      {/* SVG Flow Progression Bar */}
      <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-300 mb-2">
          <span className="flex items-center gap-1.5 text-cyan-400 font-bold">
            <Zap className="w-3.5 h-3.5" /> Enforcement Pipeline Throughput
          </span>
          <span className="text-slate-400">{cases.length > 0 ? `${cases.length} Live Cases Monitored` : '50 Total Threat Entities Processed This Month'}</span>
        </div>

        <div className="w-full h-3 rounded-full bg-slate-900 overflow-hidden flex p-0.5 border border-slate-800">
          <div style={{ width: '28%' }} className="h-full bg-cyan-400 rounded-l-full" title="Forensic Ingestion" />
          <div style={{ width: '22%' }} className="h-full bg-blue-500" title="Statutory Drafted" />
          <div style={{ width: '16%' }} className="h-full bg-amber-400" title="API Dispatched" />
          <div style={{ width: '10%' }} className="h-full bg-purple-500" title="Platform Review" />
          <div style={{ width: '24%' }} className="h-full bg-emerald-500 rounded-r-full" title="Delisted & Suspended" />
        </div>

        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mt-2">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-cyan-400" /> Triage (28%)</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" /> Drafted (22%)</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400" /> Dispatched (16%)</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500" /> Review (10%)</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Delisted (24%)</span>
        </div>
      </div>

    </div>
  );
}
