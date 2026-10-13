import React from 'react';

/**
 * 3D Faceted Aegis Shield Emblem
 * Handcrafted SVG matching our confirmed 3D Jade Emerald theme with multi-angle bevel facets.
 */
export default function AegisShieldLogo({ size = 72, className = '' }) {
  return (
    <div 
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: size, height: size * 1.15 }}
    >
      {/* Ambient Emerald Backlight Glow */}
      <div 
        className="absolute inset-0 rounded-full blur-xl pointer-events-none opacity-60"
        style={{
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.45) 0%, rgba(52, 211, 153, 0.15) 50%, transparent 80%)'
        }}
      />

      <svg 
        viewBox="0 0 100 115" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 w-full h-full drop-shadow-[0_12px_24px_rgba(0,0,0,0.6)]"
      >
        <defs>
          {/* Beveled Edge Chrome Rim Gradient */}
          <linearGradient id="rimGrad" x1="10" y1="5" x2="90" y2="105" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#d1fae5" />
            <stop offset="25%" stopColor="#6ee7b7" />
            <stop offset="50%" stopColor="#10b981" />
            <stop offset="80%" stopColor="#047857" />
            <stop offset="100%" stopColor="#022c22" />
          </linearGradient>

          {/* Facet Gradients for 3D Diamond / Crystal Refraction */}
          <linearGradient id="facetTopLeft" x1="50" y1="12" x2="22" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#a7f3d0" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>

          <linearGradient id="facetTopRight" x1="50" y1="12" x2="78" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#6ee7b7" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>

          <linearGradient id="facetCenterLeft" x1="50" y1="48" x2="22" y2="52" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#047857" />
          </linearGradient>

          <linearGradient id="facetCenterRight" x1="50" y1="48" x2="78" y2="52" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#064e3b" />
          </linearGradient>

          <linearGradient id="facetBottomLeft" x1="50" y1="58" x2="30" y2="85" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#059669" />
            <stop offset="100%" stopColor="#022c22" />
          </linearGradient>

          <linearGradient id="facetBottomRight" x1="50" y1="58" x2="70" y2="85" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#047857" />
            <stop offset="100%" stopColor="#011812" />
          </linearGradient>

          {/* Center Gem Crystal Highlight */}
          <linearGradient id="centerGem" x1="50" y1="28" x2="50" y2="68" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ecfdf5" stopOpacity="0.9" />
            <stop offset="40%" stopColor="#34d399" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#047857" stopOpacity="0.8" />
          </linearGradient>
        </defs>

        {/* Outer Shield Silver-Emerald Rim */}
        <path 
          d="M50 4L14 18V54C14 78 29 98 50 110C71 98 86 78 86 54V18L50 4Z" 
          fill="url(#rimGrad)" 
          stroke="#34d399" 
          strokeWidth="1.5"
        />

        {/* Inner Shield Body */}
        <path 
          d="M50 8L18 21V53C18 75 31 93 50 104C69 93 82 75 82 53V21L50 8Z" 
          fill="#061f17" 
        />

        {/* 3D Facets Geometry */}
        {/* Top-Left Facet */}
        <path d="M50 8L20 22L36 46L50 36V8Z" fill="url(#facetTopLeft)" />
        
        {/* Top-Right Facet */}
        <path d="M50 8L80 22L64 46L50 36V8Z" fill="url(#facetTopRight)" />

        {/* Mid-Left Flank */}
        <path d="M20 22V52L36 68L36 46L20 22Z" fill="url(#facetCenterLeft)" />

        {/* Mid-Right Flank */}
        <path d="M80 22V52L64 68L64 46L80 22Z" fill="url(#facetCenterRight)" />

        {/* Bottom-Left Keel */}
        <path d="M36 68L50 102V76L36 68Z" fill="url(#facetBottomLeft)" />

        {/* Bottom-Right Keel */}
        <path d="M64 68L50 102V76L64 68Z" fill="url(#facetBottomRight)" />

        {/* Center Diamond Gem Core */}
        <polygon points="50,36 64,54 50,76 36,54" fill="url(#centerGem)" stroke="#a7f3d0" strokeWidth="0.8" />
        
        {/* Specular Glint Highlight */}
        <polygon points="50,37 58,52 50,56 42,52" fill="#ffffff" fillOpacity="0.45" />
      </svg>
    </div>
  );
}
