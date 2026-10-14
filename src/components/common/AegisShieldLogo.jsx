import React from 'react';

/**
 * 3D Faceted Cobalt Crystal Aegis Shield
 * Handcrafted SVG matching the confirmed 3D Cobalt & Electric Sapphire Blue theme
 * with metallic beveled chrome rim and central triangular apex prism.
 */
export default function AegisShieldLogo({ size = 96, className = '' }) {
  return (
    <div 
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: size, height: size * 1.15 }}
    >
      {/* Ambient Cobalt Glow Backlight */}
      <div 
        className="absolute inset-0 rounded-full blur-2xl pointer-events-none opacity-80"
        style={{
          background: 'radial-gradient(circle, rgba(37, 99, 235, 0.6) 0%, rgba(56, 189, 248, 0.25) 50%, transparent 80%)'
        }}
      />

      <svg 
        viewBox="0 0 100 115" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 w-full h-full drop-shadow-[0_16px_32px_rgba(0,0,0,0.8)]"
      >
        <defs>
          {/* Outer Chrome Beveled Rim Gradient */}
          <linearGradient id="chromeRim" x1="10" y1="4" x2="90" y2="108" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="20%" stopColor="#93c5fd" />
            <stop offset="45%" stopColor="#3b82f6" />
            <stop offset="70%" stopColor="#1e3a8a" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>

          {/* Faceted Crystal Blue Gradient Shaders */}
          <linearGradient id="facetBlueTopLeft" x1="50" y1="10" x2="18" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#93c5fd" />
            <stop offset="50%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#1d4ed8" />
          </linearGradient>

          <linearGradient id="facetBlueTopRight" x1="50" y1="10" x2="82" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#bfdbfe" />
            <stop offset="50%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#1e40af" />
          </linearGradient>

          <linearGradient id="facetBlueMidLeft" x1="18" y1="36" x2="50" y2="60" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1e40af" />
            <stop offset="100%" stopColor="#172554" />
          </linearGradient>

          <linearGradient id="facetBlueMidRight" x1="82" y1="36" x2="50" y2="60" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#1e3a8a" />
          </linearGradient>

          <linearGradient id="facetBlueBottomLeft" x1="50" y1="60" x2="28" y2="95" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1d4ed8" />
            <stop offset="100%" stopColor="#0b1329" />
          </linearGradient>

          <linearGradient id="facetBlueBottomRight" x1="50" y1="60" x2="72" y2="95" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#030712" />
          </linearGradient>

          {/* Center Triangular Delta Core Gradient */}
          <linearGradient id="deltaPrism" x1="50" y1="26" x2="50" y2="78" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="35%" stopColor="#60a5fa" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0.9" />
          </linearGradient>

          <linearGradient id="deltaPrismInner" x1="50" y1="42" x2="50" y2="72" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
        </defs>

        {/* Outer Shield Beveled Chrome Rim */}
        <path 
          d="M50 3L12 18V54C12 79 28 100 50 112C72 100 88 79 88 54V18L50 3Z" 
          fill="url(#chromeRim)" 
          stroke="#60a5fa" 
          strokeWidth="1.2"
        />

        {/* Inner Shield Cavity */}
        <path 
          d="M50 7L16 21V53C16 76 30 96 50 106C70 96 84 76 84 53V21L50 7Z" 
          fill="#060e21" 
        />

        {/* Faceted Geometry */}
        {/* Top-Left Facet */}
        <path d="M50 7L16 21L34 46L50 34V7Z" fill="url(#facetBlueTopLeft)" />
        
        {/* Top-Right Facet */}
        <path d="M50 7L84 21L66 46L50 34V7Z" fill="url(#facetBlueTopRight)" />

        {/* Mid-Left Flank */}
        <path d="M16 21V53L34 70L34 46L16 21Z" fill="url(#facetBlueMidLeft)" />

        {/* Mid-Right Flank */}
        <path d="M84 21V53L66 70L66 46L84 21Z" fill="url(#facetBlueMidRight)" />

        {/* Bottom-Left Keel */}
        <path d="M34 70L50 104V78L34 70Z" fill="url(#facetBlueBottomLeft)" />

        {/* Bottom-Right Keel */}
        <path d="M66 70L50 104V78L66 70Z" fill="url(#facetBlueBottomRight)" />

        {/* Iconic Central Triangular Delta / Apex Prism (Matching Reference Image) */}
        {/* Outer Triangular Apex Frame */}
        <path 
          d="M50 24L74 74H26L50 24Z" 
          fill="none" 
          stroke="url(#deltaPrism)" 
          strokeWidth="3.2" 
          strokeLinejoin="round" 
        />

        {/* Inner Faceted Prism Spokes */}
        <path d="M50 24L50 56L26 74" stroke="#93c5fd" strokeWidth="1.8" />
        <path d="M50 24L50 56L74 74" stroke="#60a5fa" strokeWidth="1.8" />
        <path d="M50 56L50 74" stroke="#bfdbfe" strokeWidth="1.8" />

        {/* Inner Solid Prismatic Fills */}
        <polygon points="50,26 49,55 28,72" fill="#38bdf8" fillOpacity="0.45" />
        <polygon points="50,26 51,55 72,72" fill="#1d4ed8" fillOpacity="0.65" />
        <polygon points="28,72 50,56 72,72" fill="#0b1736" fillOpacity="0.8" />

        {/* Top Specular Glint */}
        <polygon points="50,25 54,34 50,37 46,34" fill="#ffffff" fillOpacity="0.9" />
      </svg>
    </div>
  );
}
