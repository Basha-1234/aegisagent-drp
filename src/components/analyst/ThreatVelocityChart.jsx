import React, { useState } from 'react';
import { Activity, Zap, TrendingUp, ShieldAlert } from 'lucide-react';

export default function ThreatVelocityChart() {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // Hourly threat ingestion counts over 24 hours (00h to 23h)
  const hourlyData = [
    { hour: '00:00', count: 1 },
    { hour: '02:00', count: 0 },
    { hour: '04:00', count: 1 },
    { hour: '06:00', count: 2 },
    { hour: '08:00', count: 4 },
    { hour: '10:00', count: 7 }, // Peak
    { hour: '12:00', count: 5 },
    { hour: '14:00', count: 6 },
    { hour: '16:00', count: 8 }, // Peak
    { hour: '18:00', count: 9 }, // Maximum peak
    { hour: '20:00', count: 6 },
    { hour: '22:00', count: 3 }
  ];

  // SVG Chart Coordinates
  const width = 460;
  const height = 110;
  const maxCount = 10;

  const points = hourlyData.map((d, idx) => {
    const x = (idx / (hourlyData.length - 1)) * (width - 40) + 20;
    const y = height - (d.count / maxCount) * (height - 30) - 15;
    return { ...d, x, y };
  });

  // Construct smooth curve path
  const pathD = points.reduce((acc, pt, idx) => {
    if (idx === 0) return `M ${pt.x} ${pt.y}`;
    const prev = points[idx - 1];
    const cpx1 = prev.x + (pt.x - prev.x) / 2;
    const cpy1 = prev.y;
    const cpx2 = prev.x + (pt.x - prev.x) / 2;
    const cpy2 = pt.y;
    return `${acc} C ${cpx1} ${cpy1}, ${cpx2} ${cpy2}, ${pt.x} ${pt.y}`;
  }, '');

  // Closed area path for gradient
  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - 5} L ${points[0].x} ${height - 5} Z`;

  return (
    <div className="rounded-2xl p-5 bg-[#071120]/90 backdrop-blur-xl border border-blue-500/30 shadow-2xl relative overflow-hidden">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-300">
            24-Hour Threat Ingestion Velocity
          </span>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-mono text-cyan-300">
          <TrendingUp className="w-3.5 h-3.5 text-red-400" />
          <span>+28% Ingestion Surge Today</span>
        </div>
      </div>

      {/* SVG Trend Graph Canvas */}
      <div className="relative w-full h-[120px] rounded-xl bg-slate-950/70 border border-slate-800 p-2 flex items-center justify-center">
        <svg className="w-full h-full" viewBox={`0 0 ${width} ${height}`}>
          <defs>
            <linearGradient id="areaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="lineGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="70%" stopColor="#60a5fa" />
              <stop offset="100%" stopColor="#ef4444" />
            </linearGradient>
          </defs>

          {/* Area Fill */}
          <path d={areaD} fill="url(#areaGrad)" />

          {/* Smooth Trend Line */}
          <path
            d={pathD}
            fill="none"
            stroke="url(#lineGrad2)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Data Points */}
          {points.map((pt, idx) => (
            <g
              key={idx}
              className="cursor-pointer"
              onMouseEnter={() => setHoveredPoint(pt)}
              onMouseLeave={() => setHoveredPoint(null)}
            >
              <circle
                cx={pt.x}
                cy={pt.y}
                r={hoveredPoint?.hour === pt.hour ? "5" : "3"}
                fill="#030816"
                stroke={pt.count >= 8 ? "#ef4444" : "#38bdf8"}
                strokeWidth="2"
                className="transition-all"
              />
            </g>
          ))}
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredPoint && (
          <div 
            className="absolute top-2 right-4 px-2.5 py-1 rounded-lg bg-slate-900 border border-cyan-500/50 text-[10px] font-mono text-white shadow-xl animate-in fade-in"
          >
            <strong>{hoveredPoint.hour}:</strong> {hoveredPoint.count} Ingested Signals
          </div>
        )}
      </div>

      {/* Metric Pills Below Graph */}
      <div className="grid grid-cols-3 gap-2 mt-3 text-center">
        <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
          <div className="text-sm font-bold font-mono text-cyan-400">18 Signals</div>
          <div className="text-[9.5px] font-mono text-slate-400 uppercase">Total Ingested</div>
        </div>
        <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
          <div className="text-sm font-bold font-mono text-emerald-400">&lt; 1.8s</div>
          <div className="text-[9.5px] font-mono text-slate-400 uppercase">Detection Speed</div>
        </div>
        <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
          <div className="text-sm font-bold font-mono text-amber-400">96.4%</div>
          <div className="text-[9.5px] font-mono text-slate-400 uppercase">AI Confidence</div>
        </div>
      </div>

    </div>
  );
}
