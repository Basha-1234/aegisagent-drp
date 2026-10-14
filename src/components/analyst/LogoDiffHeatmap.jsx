import React, { useState } from 'react';
import { Layers, Flame, Sliders, ShieldCheck, AlertTriangle, Eye, Crosshair } from 'lucide-react';

export default function LogoDiffHeatmap({ officialLogo, suspectAvatar, matchPercent = 92, suspectName, brandName }) {
  // Modes: 'side-by-side' | 'heatmap' | 'overlay'
  const [viewMode, setViewMode] = useState('heatmap');
  const [deltaTolerance, setDeltaTolerance] = useState(85);
  const [overlayOpacity, setOverlayOpacity] = useState(50);
  const [isScanning, setIsScanning] = useState(true);

  // Generate 12x12 heatmap grid cells with deterministic variance based on matchPercent
  const gridRows = 12;
  const gridCols = 12;
  
  // Create heatmap delta matrix
  const getCellColor = (r, c) => {
    // Center regions are closer to 100% match; edges and specific altered zones show high delta variance
    const distFromCenter = Math.sqrt(Math.pow(r - 5.5, 2) + Math.pow(c - 5.5, 2));
    const noise = Math.sin(r * 2.3 + c * 3.7) * 0.5 + 0.5;
    
    // Simulate trademark tampering in specific sector (e.g. altered corner badge or skewed geometry)
    const isTamperedZone = (r >= 2 && r <= 5 && c >= 7 && c <= 10) || (r >= 8 && c >= 8);
    let delta = isTamperedZone ? 45 + noise * 30 : 88 + (1 - distFromCenter / 8) * 12;
    
    // Clamp
    delta = Math.max(20, Math.min(100, Math.round(delta)));

    if (delta < deltaTolerance) {
      // Divergence / Tampering detected: Fiery Red / Amber
      if (delta < 55) {
        return { bg: 'bg-red-500/80', border: 'border-red-400', label: 'CRITICAL DELTA', delta };
      }
      return { bg: 'bg-amber-500/70', border: 'border-amber-300', label: 'MODERATE SHIFT', delta };
    }
    // High match zone: Cyan / Emerald
    if (delta > 94) {
      return { bg: 'bg-cyan-500/40', border: 'border-cyan-400/60', label: 'EXACT MATCH', delta };
    }
    return { bg: 'bg-blue-600/30', border: 'border-blue-500/40', label: 'CANONICAL ALIGNMENT', delta };
  };

  return (
    <div className="rounded-2xl p-5 bg-[#071120]/90 backdrop-blur-xl border border-blue-500/30 shadow-2xl relative overflow-hidden">
      
      {/* Header & Mode Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-400 animate-pulse" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-300">
              Visual Logo Diff &amp; Pixel Delta Heatmap
            </span>
          </div>
          <p className="text-[11px] text-slate-300 mt-0.5">
            Comparing Registered Brand Trademark against Suspect Avatar
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => setViewMode('heatmap')}
            className={`px-2.5 py-1 rounded-lg font-mono font-semibold transition flex items-center gap-1.5 ${
              viewMode === 'heatmap'
                ? 'bg-amber-500/25 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Heatmap</span>
          </button>
          
          <button
            type="button"
            onClick={() => setViewMode('side-by-side')}
            className={`px-2.5 py-1 rounded-lg font-mono font-semibold transition flex items-center gap-1.5 ${
              viewMode === 'side-by-side'
                ? 'bg-blue-600/30 text-blue-300 border border-blue-500/50 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Side-by-Side</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('overlay')}
            className={`px-2.5 py-1 rounded-lg font-mono font-semibold transition flex items-center gap-1.5 ${
              viewMode === 'overlay'
                ? 'bg-cyan-600/30 text-cyan-300 border border-cyan-500/50 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Overlay Diff</span>
          </button>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center my-3">
        
        {/* Left Visual: Official Brand Trademark */}
        <div className="md:col-span-4 flex flex-col items-center">
          <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Official Trademark</span>
          </div>
          <div className="relative w-36 h-36 rounded-2xl overflow-hidden border-2 border-emerald-500/40 bg-slate-950 p-2 shadow-[0_0_20px_rgba(16,185,129,0.15)] group">
            <img 
              src={officialLogo || '/aegis_shield_3d_emblem.jpg'} 
              alt="Official Logo" 
              className="w-full h-full object-cover rounded-xl"
            />
            <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-emerald-950/90 border border-emerald-500 text-[9px] font-mono text-emerald-300 font-bold">
              VERIFIED
            </div>
          </div>
          <div className="text-[11px] font-mono text-emerald-400 mt-2 font-medium">{brandName ? `${brandName} Trademark` : 'Official Trademark'}</div>
        </div>

        {/* Center: Comparison Canvas (Switches based on mode) */}
        <div className="md:col-span-4 flex flex-col items-center justify-center">
          
          {/* MODE 1: Pixel Delta Heatmap Grid */}
          {viewMode === 'heatmap' && (
            <div className="flex flex-col items-center">
              <div className="text-[11px] font-mono text-amber-300 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Crosshair className="w-3.5 h-3.5" />
                <span>Pixel Delta Matrix (144 Sectors)</span>
              </div>
              
              <div className="relative w-36 h-36 rounded-2xl overflow-hidden border-2 border-amber-500/40 bg-slate-950 p-1 shadow-[0_0_25px_rgba(245,158,11,0.2)]">
                {/* 12x12 Heatmap Grid Overlay */}
                <div className="grid grid-cols-12 grid-rows-12 w-full h-full gap-[1px]">
                  {Array.from({ length: gridRows }).map((_, r) =>
                    Array.from({ length: gridCols }).map((_, c) => {
                      const cell = getCellColor(r, c);
                      return (
                        <div
                          key={`${r}-${c}`}
                          className={`w-full h-full rounded-[1px] ${cell.bg} transition-colors duration-300 cursor-pointer hover:ring-1 hover:ring-white`}
                          title={`Sector [${r},${c}] Similarity: ${cell.delta}% (${cell.label})`}
                        />
                      );
                    })
                  )}
                </div>

                {/* Animated Laser Scanning Line */}
                {isScanning && (
                  <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_8px_#38bdf8] animate-[bounce_2.5s_infinite]" />
                )}
              </div>

              <div className="text-[10px] font-mono text-slate-400 mt-2 flex items-center gap-2">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" /> Tampered</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> Delta</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-cyan-400" /> Match</span>
              </div>
            </div>
          )}

          {/* MODE 2: Side-by-Side Comparison with Delta Arrow */}
          {viewMode === 'side-by-side' && (
            <div className="flex flex-col items-center">
              <div className="text-[11px] font-mono text-cyan-300 uppercase tracking-wider mb-2">
                Geometric Variance
              </div>
              <div className="w-36 h-36 rounded-2xl bg-slate-950 border border-blue-500/40 p-4 flex flex-col items-center justify-center text-center">
                <div className="text-3xl font-black font-mono text-cyan-400">
                  {matchPercent}%
                </div>
                <div className="text-[11px] font-bold text-slate-300 mt-1">Logo Similarity</div>
                <div className="text-[10px] text-amber-400 font-mono mt-1">
                  8% Geometric Skew
                </div>
                <div className="text-[9px] text-slate-400 mt-1 font-mono">
                  Hue Shift: +14&deg; Cyan
                </div>
              </div>
            </div>
          )}

          {/* MODE 3: Interactive Crossfade Overlay */}
          {viewMode === 'overlay' && (
            <div className="flex flex-col items-center">
              <div className="text-[11px] font-mono text-cyan-300 uppercase tracking-wider mb-2">
                Crossfade Overlay ({overlayOpacity}%)
              </div>
              <div className="relative w-36 h-36 rounded-2xl overflow-hidden border-2 border-cyan-500/40 bg-slate-950 p-2">
                <img 
                  src={officialLogo || '/aegis_shield_3d_emblem.jpg'} 
                  alt="Official Base" 
                  className="absolute inset-2 w-[calc(100%-16px)] h-[calc(100%-16px)] object-cover rounded-xl"
                />
                <img 
                  src={suspectAvatar || officialLogo || '/aegis_shield_3d_emblem.jpg'} 
                  alt="Suspect Overlay" 
                  style={{ opacity: overlayOpacity / 100 }}
                  className="absolute inset-2 w-[calc(100%-16px)] h-[calc(100%-16px)] object-cover rounded-xl filter contrast-125"
                />
              </div>
              <div className="w-36 mt-2">
                <input 
                  type="range"
                  min="0"
                  max="100"
                  value={overlayOpacity}
                  onChange={(e) => setOverlayOpacity(Number(e.target.value))}
                  className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
              </div>
            </div>
          )}

        </div>

        {/* Right Visual: Suspect Avatar */}
        <div className="md:col-span-4 flex flex-col items-center">
          <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>Suspect Impersonator</span>
          </div>
          <div className="relative w-36 h-36 rounded-2xl overflow-hidden border-2 border-amber-500/50 bg-slate-950 p-2 shadow-[0_0_20px_rgba(245,158,11,0.2)] group">
            <img 
              src={suspectAvatar || officialLogo || '/aegis_shield_3d_emblem.jpg'} 
              alt="Suspect Logo" 
              className="w-full h-full object-cover rounded-xl filter contrast-110"
            />
            <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-red-950/90 border border-red-500 text-[9px] font-mono text-red-300 font-bold animate-pulse">
              UNAUTHORIZED
            </div>
          </div>
          <div className="text-[11px] font-mono text-amber-300 mt-2 font-medium truncate max-w-[160px]">
            {suspectName || '@Suspect_Lookalike'}
          </div>
        </div>

      </div>

      {/* Interactive Controls & Sensitivity Slider */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <Sliders className="w-4 h-4 text-blue-400" />
          <span className="text-[11px] font-mono text-slate-300">Delta Sensitivity Threshold:</span>
          <span className="font-mono font-bold text-amber-400 text-xs">{deltaTolerance}%</span>
          <input 
            type="range"
            min="50"
            max="98"
            value={deltaTolerance}
            onChange={(e) => setDeltaTolerance(Number(e.target.value))}
            className="w-28 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-slate-400">Forensic Confidence:</span>
          <span className="px-2 py-0.5 rounded-full bg-red-950/60 border border-red-500/50 text-[10px] font-mono font-bold text-red-300">
            96.4% INFRINGEMENT CERTAINTY
          </span>
        </div>
      </div>

    </div>
  );
}
