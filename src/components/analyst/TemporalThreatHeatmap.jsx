import React, { useState } from 'react';
import { Calendar, Clock, Flame, Info } from 'lucide-react';

export default function TemporalThreatHeatmap() {
  const [hoveredCell, setHoveredCell] = useState(null);

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const timeBlocks = [
    { id: 't0', label: '00:00 - 06:00 (Night)' },
    { id: 't1', label: '06:00 - 12:00 (Morning)' },
    { id: 't2', label: '12:00 - 18:00 (Afternoon)' },
    { id: 't3', label: '18:00 - 24:00 (Evening)' }
  ];

  // Threat count matrix: [DayIndex][TimeBlockIndex]
  // Higher on Friday evening through Sunday night (weekend scam surge)
  const heatmapData = [
    [1, 2, 3, 2], // Mon
    [0, 1, 2, 2], // Tue
    [1, 2, 4, 3], // Wed
    [2, 3, 3, 4], // Thu
    [3, 4, 6, 9], // Fri (Spike in evening)
    [7, 8, 9, 8], // Sat (Major attack surge)
    [6, 7, 8, 5]  // Sun (Weekend impersonation)
  ];

  const getColor = (count) => {
    if (count === 0) return { bg: 'bg-slate-900/60', text: 'text-slate-600', border: 'border-slate-800' };
    if (count <= 2) return { bg: 'bg-blue-900/50', text: 'text-blue-300', border: 'border-blue-700/50' };
    if (count <= 4) return { bg: 'bg-cyan-600/50', text: 'text-cyan-200', border: 'border-cyan-500/60' };
    if (count <= 6) return { bg: 'bg-amber-600/60', text: 'text-amber-100', border: 'border-amber-500/70' };
    return { bg: 'bg-red-600/80', text: 'text-white font-bold', border: 'border-red-400 shadow-[0_0_10px_rgba(239,68,68,0.5)]' };
  };

  return (
    <div className="rounded-2xl p-5 bg-[#071120]/90 backdrop-blur-xl border border-blue-500/30 shadow-2xl relative overflow-hidden">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-300">
              Temporal Ingestion Heatmap (7-Day Attack Cycle)
            </span>
          </div>
          <p className="text-[11px] text-slate-300 mt-0.5">
            Shows hourly surge patterns: Deceptive accounts peak <strong>Fri 18:00 &ndash; Sun 23:00</strong> during corporate support downtime.
          </p>
        </div>

        <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
          <span>Less</span>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-sm bg-slate-900 border border-slate-800" />
            <span className="w-3 h-3 rounded-sm bg-blue-900/60 border border-blue-700" />
            <span className="w-3 h-3 rounded-sm bg-cyan-600/60 border border-cyan-500" />
            <span className="w-3 h-3 rounded-sm bg-amber-600/70 border border-amber-500" />
            <span className="w-3 h-3 rounded-sm bg-red-600/80 border border-red-400" />
          </div>
          <span>Critical Surge</span>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-[420px]">
          {/* Column Headers (Timeblocks) */}
          <div className="grid grid-cols-5 gap-1.5 mb-1.5 text-center text-[10px] font-mono text-slate-400">
            <div className="text-left pl-2">Day</div>
            <div>00 - 06h</div>
            <div>06 - 12h</div>
            <div>12 - 18h</div>
            <div>18 - 24h</div>
          </div>

          {/* Matrix Rows */}
          {days.map((day, dIdx) => (
            <div key={day} className="grid grid-cols-5 gap-1.5 mb-1.5 items-center">
              <div className="text-xs font-mono font-bold text-slate-300 pl-2">
                {day}
              </div>
              {timeBlocks.map((tb, tIdx) => {
                const count = heatmapData[dIdx][tIdx];
                const style = getColor(count);
                const isHovered = hoveredCell?.d === dIdx && hoveredCell?.t === tIdx;

                return (
                  <div
                    key={tb.id}
                    onMouseEnter={() => setHoveredCell({ d: dIdx, t: tIdx, day, time: tb.label, count })}
                    onMouseLeave={() => setHoveredCell(null)}
                    className={`h-9 rounded-lg border ${style.bg} ${style.border} ${style.text} flex items-center justify-center font-mono text-xs transition duration-200 cursor-pointer ${
                      isHovered ? 'ring-2 ring-white scale-105 z-10' : ''
                    }`}
                  >
                    <span>{count}</span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Tooltip Footer */}
      <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono">
        {hoveredCell ? (
          <div className="text-cyan-300">
            <strong>{hoveredCell.day} ({hoveredCell.time}):</strong> {hoveredCell.count} new threat vectors ingested
          </div>
        ) : (
          <div className="text-slate-400 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-blue-400" />
            <span>Hover any cell to inspect incident volume and operational risk rating</span>
          </div>
        )}
        <div className="text-amber-400 font-bold">Peak Risk: Saturday Evening (9 Attacks/hr)</div>
      </div>

    </div>
  );
}
