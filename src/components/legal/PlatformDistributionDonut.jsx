import React, { useState } from 'react';
import { PieChart, Shield, Smartphone, Globe, AtSign, CheckCircle2 } from 'lucide-react';

export default function PlatformDistributionDonut({ onSelectPlatform }) {
  const [hoveredSegment, setHoveredSegment] = useState(null);
  const [selectedPlatform, setSelectedPlatform] = useState(null);

  const platforms = [
    {
      id: 'social',
      label: 'Deceptive Social Profiles',
      sublabel: 'Meta / Instagram, X/Twitter, Telegram',
      count: 12,
      percentage: 48.0,
      successRate: '94.2%',
      color: '#38bdf8', // Cyan
      icon: AtSign
    },
    {
      id: 'apk',
      label: 'Rogue Android APK Stores',
      sublabel: 'Third-party APK repos & Google Play',
      count: 7,
      percentage: 28.0,
      successRate: '91.0%',
      color: '#f59e0b', // Amber
      icon: Smartphone
    },
    {
      id: 'domains',
      label: 'Phishing Web Registrars',
      sublabel: 'Lookalike domains & Host abusive DNS',
      count: 6,
      percentage: 24.0,
      successRate: '88.5%',
      color: '#3b82f6', // Sapphire Blue
      icon: Globe
    }
  ];

  const totalCases = platforms.reduce((acc, p) => acc + p.count, 0);

  // SVG Donut coordinates
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  let accumulatedPercent = 0;

  const segments = platforms.map((p) => {
    const strokeDasharray = `${(p.percentage / 100) * circumference} ${circumference}`;
    const strokeDashoffset = -((accumulatedPercent / 100) * circumference);
    accumulatedPercent += p.percentage;
    return { ...p, strokeDasharray, strokeDashoffset };
  });

  return (
    <div className="rounded-2xl p-5 bg-[#071120]/90 backdrop-blur-xl border border-blue-500/30 shadow-2xl space-y-5">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <PieChart className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-300">
              Enforcement Channel Distribution &amp; Takedown Success Rates
            </h3>
          </div>
          <p className="text-xs text-slate-300 mt-0.5">
            Breakdown of active takedowns across Social, Mobile Stores, and Phishing Registrars.
          </p>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-[10px] font-mono text-emerald-300">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>91.4% Aggregate Success Rate</span>
        </div>
      </div>

      {/* Main Layout: Donut SVG + Interactive Legend */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* SVG Donut */}
        <div className="relative w-48 h-48 flex items-center justify-center shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
            <circle
              cx="80"
              cy="80"
              r={radius}
              fill="transparent"
              stroke="#0f172a"
              strokeWidth="22"
            />
            {segments.map((seg) => {
              const isHovered = hoveredSegment === seg.id;
              const isSelected = selectedPlatform === seg.id;
              return (
                <circle
                  key={seg.id}
                  cx="80"
                  cy="80"
                  r={radius}
                  fill="transparent"
                  stroke={seg.color}
                  strokeWidth={isHovered || isSelected ? "26" : "20"}
                  strokeDasharray={seg.strokeDasharray}
                  strokeDashoffset={seg.strokeDashoffset}
                  className="transition-all duration-300 cursor-pointer"
                  style={{
                    filter: isHovered || isSelected ? `drop-shadow(0 0 10px ${seg.color})` : 'none',
                    opacity: selectedPlatform && selectedPlatform !== seg.id ? 0.35 : 1
                  }}
                  onMouseEnter={() => setHoveredSegment(seg.id)}
                  onMouseLeave={() => setHoveredSegment(null)}
                  onClick={() => {
                    const next = selectedPlatform === seg.id ? null : seg.id;
                    setSelectedPlatform(next);
                    onSelectPlatform && onSelectPlatform(next);
                  }}
                />
              );
            })}
          </svg>

          {/* Central Donut Readout */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
            <span className="text-2xl font-black font-mono text-white tracking-tight">
              {hoveredSegment
                ? `${platforms.find(p => p.id === hoveredSegment)?.percentage}%`
                : totalCases}
            </span>
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
              {hoveredSegment
                ? platforms.find(p => p.id === hoveredSegment)?.id.toUpperCase()
                : 'TOTAL CASES'}
            </span>
          </div>
        </div>

        {/* Legend Cards */}
        <div className="w-full space-y-2.5">
          {platforms.map((p) => {
            const Icon = p.icon;
            const isHovered = hoveredSegment === p.id;
            const isSelected = selectedPlatform === p.id;

            return (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  const next = selectedPlatform === p.id ? null : p.id;
                  setSelectedPlatform(next);
                  onSelectPlatform && onSelectPlatform(next);
                }}
                onMouseEnter={() => setHoveredSegment(p.id)}
                onMouseLeave={() => setHoveredSegment(null)}
                className={`w-full p-3 rounded-xl border text-left transition flex items-center justify-between cursor-pointer ${
                  isSelected
                    ? 'bg-blue-900/40 border-cyan-400 shadow-[0_0_15px_rgba(56,189,248,0.25)]'
                    : isHovered
                    ? 'bg-slate-900/80 border-slate-700'
                    : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1 mr-3">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-950 shrink-0"
                    style={{ backgroundColor: p.color }}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-bold text-slate-200 truncate">{p.label}</div>
                    <div className="text-[10px] text-slate-400 truncate">{p.sublabel}</div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="font-mono text-xs font-bold text-white whitespace-nowrap">
                    {p.count} cases ({p.percentage}%)
                  </div>
                  <div className="font-mono text-[10px] text-emerald-400 font-semibold">
                    {p.successRate} resolved
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
