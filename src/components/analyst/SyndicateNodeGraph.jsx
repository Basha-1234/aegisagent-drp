import React, { useState } from 'react';
import { Network, Server, Globe, Smartphone, AtSign, AlertOctagon, Send, ShieldAlert } from 'lucide-react';

export default function SyndicateNodeGraph({ onSelectThreat, brand }) {
  const [selectedNodeId, setSelectedNodeId] = useState('hub');
  const [hoveredNodeId, setHoveredNodeId] = useState(null);

  const brandId = brand?.id || 'razorpay';

  // Per-tenant syndicate topology configurations
  const syndicateConfigs = {
    razorpay: {
      hubLabel: 'Syndicate Kraken-09',
      hubTitle: 'Razorpay Merchant Gateway Ring',
      hubDetails: 'Organized campaign ring operating 5 cross-platform vectors simultaneously against Razorpay merchant accounts and settlement webhooks.',
      twitterLabel: '@Razorpay_Support_24x7',
      twitterDetails: 'Replied to 42 merchant refund tweets within 90 seconds using deceptive lookalike handle. Directs merchants to fake credential verification.',
      domainLabel: 'razørpay-verification.net',
      domainDetails: 'Nordic "ø" homoglyph. Punycode: xn--razrpay-verification-d1b.net. Cloned merchant dashboard harvesting API keys.',
      apkLabel: 'com.razorpay.pos.payment.quick',
      apkDetails: 'Trojan APK posing as Razorpay POS terminal. Requests READ_SMS and BIND_ACCESSIBILITY_SERVICE.',
      telegramLabel: '@Razorpay_Gateway_VIP',
      telegramDetails: 'Automated channel distributing leaked merchant API keys, testing credentials, and selling fake payment gateway scripts.',
      c2Label: '185.220.101.42 (C2 Server)',
      c2Details: 'Bulletproof hosting ASN 49581. Common backend receiving exfiltrated credentials from both domain and APK.'
    },
    phonepe: {
      hubLabel: 'Syndicate Garuda-X',
      hubTitle: 'PhonePe UPI Scratch Fraud Ring',
      hubDetails: 'Cross-platform syndicate broadcasting viral ₹2,999 cashback scratch cards on Instagram and deceptive UPI dispute desks on X.',
      twitterLabel: '@PhonePe_HeIp_24x7',
      twitterDetails: 'Deceptive helpdesk with capital "I" for "l". Targets users with pending UPI recharge transactions to harvest UPI MPIN.',
      domainLabel: 'phønepe-kyc-update.xyz',
      domainDetails: 'Homoglyph "ø" spoofing PhonePe KYC verification. Punycode: xn--phnepe-kyc-update-2qb.xyz.',
      apkLabel: 'com.phonepe.rewards.gold.bonus',
      apkDetails: 'Malicious Android APK promising free 24K gold rewards. Intercepts incoming SMS OTPs and exfiltrates to C2 server.',
      telegramLabel: '@PhonePe_UPI_Mod',
      telegramDetails: 'Telegram syndicate channel sharing modded APKs and automated scripts to exploit UPI reward tokens.',
      c2Label: '194.26.29.112 (C2 Server)',
      c2Details: 'Command and control server receiving intercepted SMS tokens and victim contact lists from trojanized APK.'
    },
    revolut: {
      hubLabel: 'Syndicate Cerberus-EU',
      hubTitle: 'Revolut Account Unlock Ring',
      hubDetails: 'Coordinated European threat ring targeting suspended or locked Revolut users on social channels with fake identity verification lures.',
      twitterLabel: '@Revolut_HeIpDesk',
      twitterDetails: 'Phishing support desk intercepting #revolutblocked tweets. Requests users to submit their 6-digit passcode in DM.',
      domainLabel: 'revoIut-auth.com',
      domainDetails: 'Capital "I" homoglyph clone of the Revolut Web App login portal. Captures international IBAN credentials.',
      apkLabel: 'com.revolut.security.authenticator.pro',
      apkDetails: 'Trojanized security authenticator APK sideloaded via SMS smishing lures. Bypasses 2FA via window overlays.',
      telegramLabel: '@Revolut_KYC_BlackMarket',
      telegramDetails: 'Underground channel trading compromised Revolut personal accounts, bypass scripts, and documents.',
      c2Label: '91.215.85.19 (C2 Server)',
      c2Details: 'Encrypted relay node routing phishing submissions from mobile app clones to dark web drop services.'
    }
  };

  const currentSyn = syndicateConfigs[brandId] || syndicateConfigs.razorpay;

  // Nodes in the coordinated syndicate cluster
  const nodes = [
    {
      id: 'hub',
      x: 240,
      y: 160,
      label: currentSyn.hubLabel,
      category: 'Campaign Operator Hub',
      type: 'hub',
      severity: 'CRITICAL',
      color: '#ef4444',
      details: currentSyn.hubDetails,
      indicators: '18 Shared IOCs • Automated DRP Alert'
    },
    {
      id: 'twitter',
      x: 90,
      y: 70,
      label: currentSyn.twitterLabel,
      category: 'Social Platform Impersonator',
      type: 'social',
      severity: 'HIGH',
      color: '#38bdf8',
      icon: AtSign,
      details: currentSyn.twitterDetails,
      indicators: 'Active Handle • Shared Bio Redirect'
    },
    {
      id: 'domain',
      x: 390,
      y: 70,
      label: currentSyn.domainLabel,
      category: 'Homoglyph Phishing Domain',
      type: 'domain',
      severity: 'CRITICAL',
      color: '#3b82f6',
      icon: Globe,
      details: currentSyn.domainDetails,
      indicators: 'Nameserver: Cloudflare Spoof • Port 443'
    },
    {
      id: 'apk',
      x: 80,
      y: 250,
      label: currentSyn.apkLabel,
      category: 'Trojan Android APK',
      type: 'apk',
      severity: 'CRITICAL',
      color: '#f59e0b',
      icon: Smartphone,
      details: currentSyn.apkDetails,
      indicators: 'Cert Hash: Self-signed Debug Keystore'
    },
    {
      id: 'telegram',
      x: 400,
      y: 250,
      label: currentSyn.telegramLabel,
      category: 'Messaging Syndicate Channel',
      type: 'messaging',
      severity: 'HIGH',
      color: '#818cf8',
      icon: Send,
      details: currentSyn.telegramDetails,
      indicators: 'Automated Bot Token • Underground Ring'
    },
    {
      id: 'c2',
      x: 240,
      y: 300,
      label: currentSyn.c2Label,
      category: 'Bulletproof Infrastructure',
      type: 'infra',
      severity: 'CRITICAL',
      color: '#ec4899',
      icon: Server,
      details: currentSyn.c2Details,
      indicators: 'Shared C2 Controller • Unified Drop'
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
          <span>{currentSyn.hubLabel}: 5 Linked Vectors</span>
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
                onClick={() => {
                  setSelectedNodeId(node.id);
                  if (onSelectThreat) onSelectThreat(node);
                }}
                onMouseEnter={() => setHoveredNodeId(node.id)}
                onMouseLeave={() => setHoveredNodeId(null)}
                className="cursor-pointer transition-all duration-200"
              >
                {/* Node Outer Pulse Ring if selected or critical */}
                {(isSelected || isHub) && (
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={isHub ? 32 : 22}
                    fill="none"
                    stroke={node.color}
                    strokeWidth="1.5"
                    strokeOpacity={isSelected ? 0.8 : 0.3}
                    className="animate-ping"
                    style={{ animationDuration: isHub ? '2.5s' : '3.5s' }}
                  />
                )}

                {/* Node Main Circle */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={isHub ? 24 : 16}
                  fill="#071120"
                  stroke={isSelected ? '#38bdf8' : node.color}
                  strokeWidth={isSelected ? 3 : 2}
                  style={{ filter: isSelected ? 'url(#glow)' : 'none' }}
                />

                {/* Inner Icon / Dot */}
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={isHub ? 8 : 5}
                  fill={node.color}
                />

                {/* Node Label */}
                <text
                  x={node.x}
                  y={node.y + (isHub ? 38 : 26)}
                  textAnchor="middle"
                  fill={isSelected ? '#38bdf8' : '#94a3b8'}
                  fontSize={isHub ? '11px' : '9.5px'}
                  fontFamily="monospace"
                  fontWeight={isSelected ? 'bold' : 'normal'}
                  className="select-none pointer-events-none"
                >
                  {node.label}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Legend */}
        <div className="absolute bottom-2 left-3 flex items-center gap-3 text-[10px] font-mono text-slate-400 bg-slate-950/80 px-2.5 py-1 rounded-lg border border-slate-800">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500 inline-block"/> Hub</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-sky-400 inline-block"/> Social</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block"/> Domain</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block"/> APK</span>
        </div>
      </div>

      {/* Selected Node Forensic Card */}
      {selectedNode && (
        <div className="mt-3 p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white font-mono text-sm">{selectedNode.label}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                {selectedNode.category}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-800 font-bold">
                {selectedNode.severity}
              </span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed max-w-2xl">
              {selectedNode.details}
            </p>
          </div>

          <div className="text-right shrink-0">
            <div className="text-[10px] text-slate-400 font-mono mb-1">{selectedNode.indicators}</div>
            <button
              onClick={() => onSelectThreat && onSelectThreat(selectedNode)}
              className="px-3 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-[11px] font-mono font-bold transition cursor-pointer"
            >
              Isolate In Evidence Canvas
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
