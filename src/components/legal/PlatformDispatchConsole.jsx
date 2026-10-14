import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { Send, CheckCircle2, Clock, Globe, Smartphone, AtSign, Zap, ExternalLink, Terminal, ShieldAlert } from 'lucide-react';

export default function PlatformDispatchConsole({ threat, brand }) {
  const [targetPlatform, setTargetPlatform] = useState('meta');
  const [dispatchStatus, setDispatchStatus] = useState('idle'); // 'idle' | 'sending' | 'success'
  const [ticketId, setTicketId] = useState(null);
  const [showPayload, setShowPayload] = useState(false);

  const activeTarget = threat || {
    id: 'THREAT-101',
    suspectName: 'QuickPay Official Helpdesk',
    suspectHandle: '@QuickPay_Support_24x7',
    platform: 'Instagram',
    channel: 'Social Profile',
    suspectUrl: 'https://quickpay-refund-helpdesk.xyz/claim',
    logoMatchPercent: 92
  };

  const platforms = [
    {
      id: 'meta',
      name: 'Meta Content Protection API',
      channel: 'Instagram & Facebook',
      endpoint: 'POST /v19.0/brand_protection/disputes',
      auth: 'Bearer meta_sec_live_99f2...',
      sla: '24 Hours (IT Rules Priority)',
      icon: AtSign,
      color: '#38bdf8'
    },
    {
      id: 'google',
      name: 'Google Play Integrity & Policy Desk',
      channel: 'Android APK App Stores',
      endpoint: 'POST /playdeveloper/v3/abuse_reports',
      auth: 'Bearer goog_sa_token_a41...',
      sla: '12 Hours (High Risk Financial Trojan)',
      icon: Smartphone,
      color: '#f59e0b'
    },
    {
      id: 'registrar',
      name: 'Registrar Abuse Desk (ICANN / Cloudflare)',
      channel: 'Phishing Domains & DNS',
      endpoint: 'POST /abuse/v2/domain_takedown',
      auth: 'Bearer cf_abuse_key_882c...',
      sla: '6 Hours (Active Credential Harvester)',
      icon: Globe,
      color: '#3b82f6'
    },
    {
      id: 'telegram',
      name: 'Telegram Trust & Safety API',
      channel: 'Rogue Channels & Bots',
      endpoint: 'POST /api/v1/channel_takedown',
      auth: 'Bearer tg_bot_sec_519...',
      sla: '18 Hours (Impersonation Alert)',
      icon: Send,
      color: '#a855f7'
    }
  ];

  const currentPlatform = platforms.find(p => p.id === targetPlatform) || platforms[0];

  const handleDispatch = () => {
    setDispatchStatus('sending');
    setTimeout(() => {
      setDispatchStatus('success');
      setTicketId(`${currentPlatform.id.toUpperCase()}-CASE-${Math.floor(100000 + Math.random() * 900000)}`);
      try {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      } catch (e) {
        // Fallback
      }
    }, 1000);
  };

  return (
    <div className="rounded-2xl p-5 bg-[#071120]/90 backdrop-blur-xl border border-blue-500/30 shadow-2xl space-y-5">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Send className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-300">
              Automated 1-Click Platform API Dispatch Dock
            </h3>
          </div>
          <p className="text-xs text-slate-300 mt-0.5">
            Direct statutory takedown submission through platform partner APIs and registrar abuse webhooks.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowPayload(!showPayload)}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300 hover:text-white flex items-center gap-1.5 transition cursor-pointer"
          >
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            <span>{showPayload ? 'Hide API Payload' : 'Inspect API Payload'}</span>
          </button>
        </div>
      </div>

      {/* Platform Gateway Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {platforms.map((p) => {
          const Icon = p.icon;
          const isSelected = targetPlatform === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                setTargetPlatform(p.id);
                setDispatchStatus('idle');
                setTicketId(null);
              }}
              className={`p-3.5 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-blue-900/40 border-cyan-400 shadow-[0_0_15px_rgba(56,189,248,0.25)] text-white'
                  : 'bg-slate-950/70 border-slate-800/80 text-slate-400 hover:bg-slate-900/60 hover:text-white'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div 
                    className="p-1.5 rounded-lg text-slate-950"
                    style={{ backgroundColor: p.color }}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">
                    SLA: {p.sla.split(' ')[0]} {p.sla.split(' ')[1]}
                  </span>
                </div>

                <div className="text-xs font-bold text-slate-200 line-clamp-1">{p.name}</div>
                <div className="text-[10px] text-slate-500 mt-0.5">{p.channel}</div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-900 text-[10px] font-mono text-slate-400 truncate">
                {p.endpoint}
              </div>
            </button>
          );
        })}
      </div>

      {/* JSON Payload Inspection Drawer */}
      {showPayload && (
        <div className="p-4 rounded-xl bg-[#030812] border border-cyan-500/30 font-mono text-xs text-cyan-300 space-y-2 animate-in fade-in">
          <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800 pb-2">
            <span>HTTP Request Preview: {currentPlatform.endpoint}</span>
            <span className="text-emerald-400">Authenticated via API Gateway</span>
          </div>
          <pre className="text-[11px] text-slate-300 overflow-x-auto leading-relaxed">
{JSON.stringify({
  action: "SUBMIT_STATUTORY_TAKEDOWN",
  gateway: currentPlatform.name,
  respondent: {
    handle: activeTarget.suspectHandle,
    platform: activeTarget.platform,
    targetUrl: activeTarget.suspectUrl,
    channel: activeTarget.channel
  },
  evidentiarySeal: {
    statute: "Rule 3(2)(b) IT Rules 2021 & DMCA §512",
    logoMatchPercent: `${activeTarget.logoMatchPercent}%`,
    evidenceProofSha256: "8f4c2b9a71e3d085942f1a6c5e7b8921df047ca8391b4562098d7fe129ab3461",
    signatory: "Sarah Vance, Head of Legal & IP Compliance"
  },
  callbackWebhook: "https://api.aegisagent.io/v1/webhooks/takedown_receipt"
}, null, 2)}
          </pre>
        </div>
      )}

      {/* Active Dispatch Card */}
      <div className="p-5 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-white uppercase">
              Target for Platform Dispatch:
            </span>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40">
              {activeTarget.suspectHandle}
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Selected Platform: <strong className="text-slate-200">{currentPlatform.name}</strong> • Guaranteed SLA: <strong className="text-amber-400">{currentPlatform.sla}</strong>
          </p>
        </div>

        {/* Dispatch Action Button / Status State */}
        <div className="flex items-center gap-3">
          {dispatchStatus === 'idle' && (
            <button
              type="button"
              onClick={handleDispatch}
              className="py-3 px-6 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.35)] transition cursor-pointer transform active:scale-95"
            >
              <Send className="w-4 h-4" />
              <span>Dispatch Statutory Notice Now</span>
            </button>
          )}

          {dispatchStatus === 'sending' && (
            <div className="py-3 px-6 rounded-xl bg-cyan-950 border border-cyan-500/50 text-cyan-300 font-mono text-xs flex items-center gap-2 animate-pulse">
              <Zap className="w-4 h-4 text-cyan-400 animate-spin" />
              <span>Transmitting Authenticated Payload to {currentPlatform.name}...</span>
            </div>
          )}

          {dispatchStatus === 'success' && (
            <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/60 text-emerald-300 font-mono text-xs flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <div>
                <div className="font-bold text-white">Dispatched Successfully to Platform Desk</div>
                <div className="text-[11px] text-emerald-300">
                  Tracking ID: <strong>{ticketId}</strong> (SLA Timer Active: 23h 59m)
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
