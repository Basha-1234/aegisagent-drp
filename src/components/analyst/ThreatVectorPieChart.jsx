import React, { useState } from 'react';
import { PieChart, Radio, Globe, Smartphone, AtSign } from 'lucide-react';

export default function ThreatVectorPieChart({ activeFilter, onFilterChange }) {
  const [hoveredSegment, setHoveredSegment] = useState(null);

  // Vector data aligned with Kampus.VC Problem Statement #3
  const vectors = [
    {
      id: 'social',
      label: 'Deceptive Social Handles',
      sublabel: 'X/Twitter, IG, Telegram',
      count: 8,
      percentage: 44.4,
      color: '#38bdf8', // Electric Cyan
      glowColor: 'rgba(56, 189, 248, 0.4)',
      icon: AtSign
    },
    {
      id: 'domain',
      label: 'Homoglyph Phishing Domains',
      sublabel: 'Lookalikes, Punycode, Typos',
      count: 6,
      percentage: 33.3,
      color: '#3b82f6', // Sapphire Blue
      glowColor: 'rgba(59, 130, 246, 0.4)',
      icon: Globe
    },
    {
      id: 'apk',
      label: 'Rogue Mobile APK Stores',
      sublabel: 'Trojan APKs, Permissions',
      count: 4,
      percentage: 22.3,
      color: '#f59e0b', // Amber Warning
      glowColor: 'rgba(245, 158, 11, 0.4)',
      icon: Smartphone
    }
  ];

  const totalThreats = vectors.reduce((acc, v) => acc + v.count, 0);

  // SVG Donut calculation
  // Radius = 65, Circumference = 2 * PI * 65 = 408.407
  const radius = 65;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;
  const segments = vectors.map((v) => {
    const strokeDasharray = `${(v.percentage / 100) * circumference} ${circumference}`;
    const strokeDashoffset = -((accumulatedPercent / 100) * circumference);
    accumulatedPercent += v.percentage;
    return {
      ...v,
      strokeDasharray,
      strokeDashoffset
    };
  });

  return (
    <div className="rounded-2xl p-5 bg-[#071120]/90 backdrop-blur-xl border border-blue-500/30 shadow-2xl relative overflow-hidden">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <PieChart className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-300">
            Threat Vector Distribution
          </span>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-950/80 border border-blue-500/40 text-[10px] font-mono text-blue-300">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          <span>Live Sensor Telemetry</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
        
        {/* SVG Donut Chart Canvas */}
        <div className="relative w-44 h-44 flex items-center justify-center shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
            {/* Background ring */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              fill="transparent"
              stroke="#0f172a"
              strokeWidth="20"
            />

            {/* Interactive Donut Segments */}
            {segments.map((seg) => {
              const isHovered = hoveredSegment === seg.id;
              const isFiltered = activeFilter === seg.id;
              return (
                <circle
                  key={seg.id}
                  cx="80"
                  cy="80"
                  r={radius}
                  fill="transparent"
                  stroke={seg.color}
                  strokeWidth={isHovered || isFiltered ? "24" : "18"}
                  strokeDasharray={seg.strokeDasharray}
                  strokeDashoffset={seg.strokeDashoffset}
                  className="transition-all duration-300 cursor-pointer"
                  style={{
                    filter: isHovered || isFiltered ? `drop-shadow(0 0 8px ${seg.color})` : 'none',
                    opacity: activeFilter && activeFilter !== seg.id ? 0.4 : 1
                  }}
                  onMouseEnter={() => setHoveredSegment(seg.id)}
                  onMouseLeave={() => setHoveredSegment(null)}
                  onClick={() => onFilterChange && onFilterChange(activeFilter === seg.id ? null : seg.id)}
                />
              );
            })}
          </svg>

          {/* Center Holographic Metric */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
            <span className="text-2xl font-black font-mono text-white tracking-tight">
              {hoveredSegment 
                ? `${vectors.find(v => v.id === hoveredSegment)?.percentage}%`
                : totalThreats}
            </span>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
              {hoveredSegment 
                ? vectors.find(v => v.id === hoveredSegment)?.id.toUpperCase()
                : 'TOTAL SIGNALS'}
            </span>
          </div>
        </div>

        {/* Interactive Legend & Filter Toggles */}
        <div className="w-full space-y-2">
          {vectors.map((v) => {
            const Icon = v.icon;
            const isHovered = hoveredSegment === v.id;
            const isSelected = activeFilter === v.id;
            return (
              <button
                key={v.id}
                type="button"
                onClick={() => onFilterChange && onFilterChange(isSelected ? null : v.id)}
                onMouseEnter={() => setHoveredSegment(v.id)}
                onMouseLeave={() => setHoveredSegment(null)}
                className={`w-full p-2.5 rounded-xl border text-left transition flex items-center justify-between cursor-pointer ${
                  isSelected
                    ? 'bg-blue-900/40 border-cyan-400 shadow-[0_0_15px_rgba(56,189,248,0.2)]'
                    : isHovered
                    ? 'bg-slate-900/80 border-slate-700'
                    : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div 
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-950"
                    style={{ backgroundColor: v.color }}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-200">{v.label}</div>
                    <div className="text-[10px] text-slate-400">{v.sublabel}</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-mono text-xs font-bold text-white">{v.count} signals</div>
                  <div className="font-mono text-[10px] text-slate-400">{v.percentage}%</div>
                </div>
              </button>
            );
          })}
        </div>

      </div>

    </div>
  );
}
