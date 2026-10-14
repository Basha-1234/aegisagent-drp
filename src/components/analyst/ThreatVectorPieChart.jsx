import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { PieChart, Radio, Globe, Smartphone, AtSign } from 'lucide-react';

export default function ThreatVectorPieChart({ activeFilter, onFilterChange }) {
  const { isDark } = useTheme();
  const [hoveredSegment, setHoveredSegment] = useState(null);

  // High-contrast, saturated colors in light mode; glowing cobalt cyan in dark mode
  const vectors = [
    {
      id: 'social',
      label: 'Deceptive Social Handles',
      sublabel: 'X/Twitter, IG, Telegram',
      count: 8,
      percentage: 44.4,
      color: isDark ? '#38bdf8' : '#0284c7', // Saturated Ocean Blue
      glowColor: isDark ? 'rgba(56, 189, 248, 0.4)' : 'rgba(2, 132, 199, 0.25)',
      icon: AtSign
    },
    {
      id: 'domain',
      label: 'Homoglyph Phishing Domains',
      sublabel: 'Lookalikes, Punycode, Typos',
      count: 6,
      percentage: 33.3,
      color: isDark ? '#3b82f6' : '#2563eb', // Rich Royal Blue
      glowColor: isDark ? 'rgba(59, 130, 246, 0.4)' : 'rgba(37, 99, 235, 0.25)',
      icon: Globe
    },
    {
      id: 'apk',
      label: 'Rogue Mobile APK Stores',
      sublabel: 'Trojan APKs, Permissions',
      count: 4,
      percentage: 22.3,
      color: isDark ? '#f59e0b' : '#ea580c', // High-Contrast Coral Orange
      glowColor: isDark ? 'rgba(245, 158, 11, 0.4)' : 'rgba(234, 88, 12, 0.25)',
      icon: Smartphone
    }
  ];

  const totalThreats = vectors.reduce((acc, v) => acc + v.count, 0);

  // SVG Donut calculation
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
    <div className="rounded-2xl p-5 bg-[#071120]/90 backdrop-blur-xl border border-blue-500/30 shadow-2xl relative overflow-hidden transition-colors">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <PieChart className={`w-4 h-4 ${isDark ? 'text-cyan-400' : 'text-blue-700'}`} />
          <span className={`text-xs font-mono font-bold uppercase tracking-wider ${
            isDark ? 'text-cyan-300' : 'text-blue-800'
          }`}>
            Threat Vector Distribution
          </span>
        </div>
        
        {/* Solid, non-muddy pill */}
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold border transition ${
          isDark 
            ? 'bg-blue-950/80 border-blue-500/40 text-blue-300' 
            : 'bg-blue-100 border-blue-300 text-blue-900 shadow-xs'
        }`}>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span>Live Sensor Telemetry</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
        
        {/* SVG Donut Chart Canvas */}
        <div className="relative w-44 h-44 flex items-center justify-center shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
            {/* Background ring: Solid #e2e8f0 in Light Mode, #0f172a in Dark */}
            <circle
              cx="80"
              cy="80"
              r={radius}
              fill="transparent"
              stroke={isDark ? "#0f172a" : "#e2e8f0"}
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
                    opacity: activeFilter && activeFilter !== seg.id ? 0.35 : 1
                  }}
                  onMouseEnter={() => setHoveredSegment(seg.id)}
                  onMouseLeave={() => setHoveredSegment(null)}
                  onClick={() => onFilterChange && onFilterChange(activeFilter === seg.id ? null : seg.id)}
                />
              );
            })}
          </svg>

          {/* Center Metric */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
            <span className={`text-2xl font-black font-mono tracking-tight ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              {hoveredSegment 
                ? `${vectors.find(v => v.id === hoveredSegment)?.percentage}%`
                : totalThreats}
            </span>
            <span className={`text-xs font-mono uppercase tracking-wider font-semibold ${
              isDark ? 'text-slate-400' : 'text-slate-600'
            }`}>
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
                className={`w-full p-3 rounded-xl border text-left transition flex items-center justify-between cursor-pointer ${
                  isSelected
                    ? isDark 
                      ? 'bg-blue-900/40 border-cyan-400 shadow-[0_0_15px_rgba(56,189,248,0.2)]' 
                      : 'bg-blue-50 border-blue-600 shadow-sm ring-1 ring-blue-500'
                    : isHovered
                    ? isDark ? 'bg-slate-900/80 border-slate-700' : 'bg-slate-100 border-slate-300'
                    : isDark ? 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700' : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1 mr-3">
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0 shadow-xs"
                    style={{ backgroundColor: v.color }}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className={`text-sm font-bold truncate ${
                      isDark ? 'text-slate-100' : 'text-slate-900'
                    }`}>
                      {v.label}
                    </div>
                    <div className={`text-xs truncate ${
                      isDark ? 'text-slate-400' : 'text-slate-600'
                    }`}>
                      {v.sublabel}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className={`font-mono text-sm font-bold whitespace-nowrap ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}>
                    {v.count} signals
                  </div>
                  <div className={`font-mono text-xs ${
                    isDark ? 'text-slate-400' : 'text-slate-600'
                  }`}>
                    {v.percentage}%
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
}
