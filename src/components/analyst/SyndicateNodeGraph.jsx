import React, { useState } from 'react';
import { Network, Server, Globe, Smartphone, AtSign, AlertOctagon, Send, ShieldAlert } from 'lucide-react';

export default function SyndicateNodeGraph({ onSelectThreat }) {
  const [selectedNodeId, setSelectedNodeId] = useState('hub');
  const [hoveredNodeId, setHoveredNodeId] = useState(null);

  // Nodes in the coordinated syndicate cluster
  const nodes = [
    {
      id: 'hub',
      x: 240,
      y: 160,
      label: 'Syndicate Kraken-09',
      category: 'Campaign Operator Hub',
      type: 'hub',
      severity: 'CRITICAL',
      color: '#ef4444',
      details: 'Organized campaign ring operating 5 cross-platform vectors simultaneously against QuickPay customer base.',
      indicators: '18 Shared IOCs • Automated DRP Alert'
    },
    {
      id: 'twitter',
      x: 90,
      y: 70,
      label: '@QuickPay_HeIp',
      category: 'Twitter/X Impersonator',
      type: 'social',
      severity: 'HIGH',
      color: '#38bdf8',
      icon: AtSign,
      details: 'Replied to 42 customer complaints within 90 seconds using capital "I" for "l". Same bio link as C2 host.',
      indicators: 'Active Handle • 3,890 Followers'
    },
    {
      id: 'domain',
      x: 390,
      y: 70,
      label: 'quıckpay-kyc.top',
      category: 'Homoglyph Phishing Domain',
      type: 'domain',
      severity: 'CRITICAL',
      color: '#3b82f6',
      icon: Globe,
      details: 'Turkish dotless "ı" (U+0131). Punycode: xn--quckpay-kyc-8rb.top. Cloned banking auth portal.',
      indicators: 'Nameserver: Cloudflare Spoof • Port 443'
    },
    {
      id: 'apk',
      x: 80,
      y: 250,
      label: 'com.quickpay.wallet.loans.fast',
      category: 'Trojan Android APK',
      type: 'apk',
      severity: 'CRITICAL',
      color: '#f59e0b',
      icon: Smartphone,
      details: 'Sideloaded from apk-pure-clone.net. Contains READ_SMS & SYSTEM_ALERT_WINDOW to intercept banking OTPs.',
      indicators: 'Cert Hash: SHA256:4a8f9... (Self-signed)'
    },
    {
      id: 'telegram',
      x: 400,
      y: 250,
      label: '@quickpay_support_bot',
      category: 'Automated Phishing Bot',
      type: 'messaging',
      severity: 'HIGH',
      color: '#818cf8',
      icon: Send,
      details: 'Automated script asking users to paste 6-digit verification codes to "unfreeze account balance".',
      indicators: 'API Token linked to Russian IP block'
    },
    {
      id: 'c2',
      x: 240,
      y: 300,
      label: '185.220.101.42 (C2 Server)',
      category: 'Bulletproof Infrastructure',
      type: 'infra',
      severity: 'CRITICAL',
      color: '#ec4899',
      icon: Server,
      details: 'Bulletproof hosting ASN 49581. Common backend receiving exfiltrated credentials from both domain and APK.',
      indicators: 'IP Geo: Seychelles • Shared Backend'
    }
  ];

  // Links connecting hub to child nodes
  const links = [
    { source: 'hub', target: 'twitter', label: 'Lure Distribution' },
    { source: 'hub', target: 'domain', label: 'Credential Harvesting' },
    { source: 'hub', target: 'apk', label: 'Trojan Sideloading' },
    { source: 'hub', target: 'telegram', label: 'OTP Exfiltration' },
    { source: 'hub', target: 'c2', label: 'C2 Control Channel' },
    { source: 'domain', target: 'c2', label: 'Shared Host' },
    { source: 'apk', target: 'c2', label: 'Exfiltration API' }
  ];

  const selectedNode = nodes.find(n => n.id === selectedNodeId) || nodes[0];

  return (
    <div className="rounded-2xl p-5 bg-[#071120]/90 backdrop-blur-xl border border-blue-500/30 shadow-2xl relative overflow-hidden">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <Network className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-300">
              Coordinated Threat Syndicate Graph
            </span>
          </div>
          <p className="text-[11px] text-slate-300 mt-0.5">
            Cross-platform infrastructure clustering connecting social handles, homoglyph domains, and Trojan APKs
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/70 border border-red-500/40 text-xs text-red-300 font-mono">
          <AlertOctagon className="w-3.5 h-3.5 text-red-400 animate-pulse" />
          <span>Syndicate Alpha: 5 Linked Vectors</span>
        </div>
      </div>

      {/* SVG Interactive Graph Canvas */}
      <div className="relative w-full h-[320px] rounded-xl bg-slate-950/80 border border-slate-800 overflow-hidden flex items-center justify-center">
        
        {/* Subtle grid background inside canvas */}
        <div 
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(#38bdf8 1px, transparent 1px)`,
            backgroundSize: '24px 24px'
          }}
        />

        <svg className="w-full h-full" viewBox="0 0 480 340">
          <defs>
            <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#ef4444" stopOpacity="0.8" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* Connection Lines */}
          {links.map((link, idx) => {
            const s = nodes.find(n => n.id === link.source);
            const t = nodes.find(n => n.id === link.target);
            if (!s || !t) return null;
            const isHighlighted = selectedNodeId === s.id || selectedNodeId === t.id;
            return (
              <g key={idx}>
                <line
                  x1={s.x}
                  y1={s.y}
                  x2={t.x}
                  y2={t.y}
                  stroke={isHighlighted ? "#38bdf8" : "#1e293b"}
                  strokeWidth={isHighlighted ? "2.5" : "1.2"}
                  strokeDasharray={isHighlighted ? "5,5" : "none"}
                  className={isHighlighted ? "animate-[dash_1s_linear_infinite]" : ""}
                  style={{ filter: isHighlighted ? 'url(#glow)' : 'none' }}
                />
              </g>
            );
          })}

          {/* Nodes */}
          {nodes.map((node) => {
            const isSelected = selectedNodeId === node.id;
            const isHovered = hoveredNodeId === node.id;
            const isHub = node.type === 'hub';

            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                className="cursor-pointer transition-transform duration-200"
                onClick={() => setSelectedNodeId(node.id)}
                onMouseEnter={() => setHoveredNodeId(node.id)}
                onMouseLeave={() => setHoveredNodeId(null)}
              >
                {/* Outer Pulsating Ring */}
                {(isHub || isSelected) && (
                  <circle
                    r={isHub ? "32" : "24"}
                    fill="none"
                    stroke={node.color}
                    strokeWidth="1.5"
                    className="animate-ping opacity-40"
                  />
                )}

                {/* Node Solid Circle */}
                <circle
                  r={isHub ? "22" : "16"}
                  fill="#030816"
                  stroke={node.color}
                  strokeWidth={isSelected || isHovered ? "3" : "2"}
                  style={{
                    filter: isSelected || isHovered ? `drop-shadow(0 0 10px ${node.color})` : 'none'
                  }}
                />

                {/* Node Icon or Center Dot */}
                {isHub ? (
                  <circle r="6" fill="#ef4444" className="animate-pulse" />
                ) : (
                  <circle r="4" fill={node.color} />
                )}

                {/* Node Text Label */}
                <text
                  y={isHub ? 36 : 28}
                  textAnchor="middle"
                  fill={isSelected ? "#ffffff" : "#94a3b8"}
                  fontSize={isHub ? "11" : "9.5"}
                  fontFamily="monospace"
                  fontWeight={isSelected ? "bold" : "normal"}
                  className="pointer-events-none select-none"
                >
                  {node.label.length > 18 ? node.label.substring(0, 16) + '...' : node.label}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Legend Overlay in top-left */}
        <div className="absolute top-2 left-2 px-2.5 py-1 rounded-lg bg-slate-950/90 border border-slate-800 text-[10px] font-mono text-slate-400 pointer-events-none">
          Click any node to inspect infrastructure ties
        </div>
      </div>

      {/* Selected Node Forensic Inspection Panel */}
      <div className="mt-3 p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white font-mono">{selectedNode.label}</span>
            <span 
              className="text-[9px] px-2 py-0.5 rounded font-mono font-bold"
              style={{ backgroundColor: `${selectedNode.color}25`, color: selectedNode.color, border: `1px solid ${selectedNode.color}50` }}
            >
              {selectedNode.category}
            </span>
          </div>
          <p className="text-[11px] text-slate-300 leading-snug">{selectedNode.details}</p>
          <div className="text-[10px] font-mono text-cyan-400">{selectedNode.indicators}</div>
        </div>

        <button
          type="button"
          onClick={() => onSelectThreat && onSelectThreat(selectedNode.id)}
          className="px-3 py-1.5 rounded-lg bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500/60 text-blue-200 text-xs font-mono font-semibold transition shrink-0 cursor-pointer"
        >
          View Full Evidence Pack →
        </button>
      </div>

    </div>
  );
}
