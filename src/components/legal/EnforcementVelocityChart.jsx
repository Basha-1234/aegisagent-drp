import React, { useState } from 'react';
import { Activity, Clock, TrendingDown, ShieldCheck, Zap } from 'lucide-react';

export default function EnforcementVelocityChart() {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // 7-day MTTD/MTTR data showing takedown velocity dropping from 14.8h to 3.8h
  const timelineData = [
    { day: 'Day 1', hours: 14.8, delisted: 3 },
    { day: 'Day 2', hours: 12.4, delisted: 5 },
    { day: 'Day 3', hours: 9.6, delisted: 8 },
    { day: 'Day 4', hours: 7.2, delisted: 12 },
    { day: 'Day 5', hours: 5.4, delisted: 16 },
    { day: 'Day 6', hours: 4.1, delisted: 22 },
    { day: 'Day 7', hours: 3.8, delisted: 28 } // Current optimal
  ];

  // Platform resolution speed benchmarks (hours)
  const platformBenchmarks = [
    { name: 'Meta Content API', hours: 2.8, color: '#38bdf8', sla: '24h statutory' },
    { name: 'Google Play Integrity', hours: 4.1, color: '#f59e0b', sla: '12h critical' },
    { name: 'Web Registrars (DNS)', hours: 6.2, color: '#3b82f6', sla: '6h phishing' },
    { name: 'Telegram Abuse Desk', hours: 7.4, color: '#a855f7', sla: '18h advisory' }
  ];

  const width = 500;
  const height = 130;
  const maxHours = 16;

  const points = timelineData.map((d, idx) => {
    const x = (idx / (timelineData.length - 1)) * (width - 60) + 30;
    const y = height - (d.hours / maxHours) * (height - 35) - 20;
    return { ...d, x, y };
  });

  const pathD = points.reduce((acc, pt, idx) => {
    if (idx === 0) return `M ${pt.x} ${pt.y}`;
    const prev = points[idx - 1];
    const cpx1 = prev.x + (pt.x - prev.x) / 2;
    const cpy1 = prev.y;
    const cpx2 = prev.x + (pt.x - prev.x) / 2;
    const cpy2 = pt.y;
    return `${acc} C ${cpx1} ${cpy1}, ${cpx2} ${cpy2}, ${pt.x} ${pt.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - 10} L ${points[0].x} ${height - 10} Z`;

  return (
    <div className="rounded-2xl p-5 bg-[#071120]/90 backdrop-blur-xl border border-blue-500/30 shadow-2xl space-y-5">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-300">
              Takedown Resolution Velocity (MTTR) &amp; Cumulative Delistings
            </h3>
          </div>
          <p className="text-xs text-slate-300 mt-0.5">
            Automated statutory evidence reduced Mean-Time-To-Resolve from 14.8 hours down to 3.8 hours.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-base font-black font-mono text-emerald-400">3.8 Hours</div>
            <div className="text-[10px] text-slate-400 font-mono">Current Platform MTTR</div>
          </div>
        </div>
      </div>

      {/* Main Charts Grid: Velocity Area Chart (Left) + Platform Benchmark Bars (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
        
        {/* SVG Area Chart (7 cols) */}
        <div className="lg:col-span-7 relative p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
            <span>7-Day MTTR Compression Curve</span>
            <span className="text-emerald-400 font-bold">-74.3% Resolution Latency</span>
          </div>

          <svg className="w-full h-36 overflow-visible" viewBox={`0 0 ${width} ${height}`}>
            <defs>
              <linearGradient id="mttrGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Gridlines */}
            {[0.25, 0.5, 0.75].map((ratio, i) => (
              <line
                key={i}
                x1="20"
                y1={height * ratio}
                x2={width - 20}
                y2={height * ratio}
                stroke="#1e293b"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
            ))}

            {/* Area */}
            <path d={areaD} fill="url(#mttrGradient)" />

            {/* Smooth Curve */}
            <path d={pathD} fill="none" stroke="#10b981" strokeWidth="3" />

            {/* Interactive Points */}
            {points.map((pt, i) => (
              <g key={i}>
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r="5"
                  fill="#022c22"
                  stroke="#34d399"
                  strokeWidth="2.5"
                  className="cursor-pointer hover:r-7 transition-all"
                  onMouseEnter={() => setHoveredPoint(pt)}
                  onMouseLeave={() => setHoveredPoint(null)}
                />
                <text
                  x={pt.x}
                  y={height - 2}
                  textAnchor="middle"
                  className="fill-slate-500 text-[10px] font-mono"
                >
                  {pt.day}
                </text>
              </g>
            ))}
          </svg>

          {/* Hover Tooltip */}
          {hoveredPoint && (
            <div className="absolute top-2 right-4 p-2 rounded-lg bg-slate-900 border border-emerald-500/50 text-[11px] font-mono text-white shadow-xl animate-in fade-in">
              <span className="text-emerald-400 font-bold">{hoveredPoint.day}:</span> {hoveredPoint.hours}h avg resolution ({hoveredPoint.delisted} delisted)
            </div>
          )}
        </div>

        {/* Platform Resolution Benchmark Bars (5 cols) */}
        <div className="lg:col-span-5 p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-3">
          <div className="text-[11px] font-mono text-slate-300 font-bold flex items-center justify-between">
            <span>Platform Speed Benchmarks</span>
            <span className="text-slate-500 text-[10px]">Avg Time to Delist</span>
          </div>

          <div className="space-y-2.5">
            {platformBenchmarks.map((b) => (
              <div key={b.name} className="space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-300 font-medium truncate">{b.name}</span>
                  <span className="font-mono text-xs font-bold text-white">{b.hours} hrs</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden flex">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${(b.hours / 10) * 100}%`,
                      backgroundColor: b.color
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-900 text-[10px] font-mono text-slate-400 flex items-center justify-between">
            <span>Meta API fastest response</span>
            <span className="text-emerald-400">Rule 3(2)(b) Priority</span>
          </div>
        </div>

      </div>

    </div>
  );
}
