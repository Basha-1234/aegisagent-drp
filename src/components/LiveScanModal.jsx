import React, { useState } from 'react';
import { 
  X, 
  Search, 
  Sparkles, 
  ShieldCheck, 
  ShieldAlert, 
  Sliders, 
  CheckCircle2, 
  AlertTriangle,
  Fingerprint
} from 'lucide-react';
import { calculateExplainableRisk } from '../utils/detectionEngine';

export default function LiveScanModal({ brand, onClose, onAddCustomThreat }) {
  const [suspectHandle, setSuspectHandle] = useState(`${brand.officialHandle}_support_refund`);
  const [suspectBio, setSuspectBio] = useState('Official 24x7 customer support helpline. DM for instant refund or stuck UPI payment resolution.');
  const [suspectUrl, setSuspectUrl] = useState(`https://${brand.officialDomain.split('.')[0]}-support-portal.xyz`);
  const [logoMatch, setLogoMatch] = useState(88);
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditResult, setAuditResult] = useState(null);

  const runAudit = () => {
    setIsAuditing(true);
    setTimeout(() => {
      const result = calculateExplainableRisk({
        suspectHandle,
        officialHandle: brand.officialHandle,
        suspectBio,
        suspectUrl,
        officialDomain: brand.officialDomain,
        logoMatchPercent: logoMatch
      });
      setAuditResult(result);
      setIsAuditing(false);
    }, 600);
  };

  const handleAddIncident = () => {
    if (!auditResult) return;
    const newThreat = {
      id: `THREAT-LIVE-${Date.now().toString().slice(-4)}`,
      brandId: brand.id,
      platform: 'Instagram',
      platformIcon: 'instagram',
      suspectName: suspectHandle.replace('@', '') + ' (Live Ingested)',
      suspectHandle,
      avatarUrl: brand.logoUrl,
      suspectBio,
      suspectUrl,
      postCaptions: ['Live ingested scan sample detected via analyst search console.'],
      followersCount: 1200,
      accountAgeDays: 1,
      status: 'NEW',
      logoMatchPercent: logoMatch,
      detectionDate: new Date().toISOString(),
      channel: 'Social Profile',
      calculatedRisk: auditResult
    };

    onAddCustomThreat(newThreat);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl shadow-cyan-950/30">
        
        {/* Header */}
        <div className="sticky top-0 bg-slate-900/95 backdrop-blur border-b border-slate-800 p-5 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Fingerprint className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Live Suspect Profile Analyzer</h3>
                <span className="text-[10px] font-mono uppercase bg-cyan-950 text-cyan-300 border border-cyan-800 px-2 py-0.5 rounded-full font-semibold">
                  Sandbox Engine
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Test any handle or URL against {brand.name}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Inputs */}
        <div className="p-6 space-y-4">
          
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Candidate / Suspect Handle
            </label>
            <input
              type="text"
              value={suspectHandle}
              onChange={(e) => setSuspectHandle(e.target.value)}
              placeholder="@suspect_brand_support"
              className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-cyan-500 font-mono"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Profile Bio / Social Media Text
            </label>
            <textarea
              rows={2}
              value={suspectBio}
              onChange={(e) => setSuspectBio(e.target.value)}
              placeholder="e.g. DM for instant refund support..."
              className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl px-3.5 py-2 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Bio Link / Domain
              </label>
              <input
                type="text"
                value={suspectUrl}
                onChange={(e) => setSuspectUrl(e.target.value)}
                placeholder="https://brand-refund.xyz"
                className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl px-3.5 py-2 focus:outline-none focus:ring-1 focus:ring-cyan-500 font-mono text-[11px]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-300">
                  Logo Visual Overlap
                </label>
                <span className="text-xs font-mono font-bold text-cyan-300">{logoMatch}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={logoMatch}
                onChange={(e) => setLogoMatch(Number(e.target.value))}
                className="w-full accent-cyan-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
              />
            </div>
          </div>

          <button
            onClick={runAudit}
            disabled={isAuditing}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold shadow-md shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 active:scale-98"
          >
            <Sparkles className={`w-4 h-4 ${isAuditing ? 'animate-spin' : ''}`} />
            <span>{isAuditing ? 'Calculating Forensic Signals...' : 'Run Live Multi-Signal Audit'}</span>
          </button>

          {/* Result Card */}
          {auditResult && (
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 uppercase">Audit Assessment</span>
                <span className={`text-xs font-bold font-mono px-2.5 py-0.5 rounded-full border ${
                  auditResult.severity === 'CRITICAL'
                    ? 'bg-red-500/20 text-red-400 border-red-500/40'
                    : auditResult.severity === 'HIGH'
                    ? 'bg-orange-500/20 text-orange-400 border-orange-500/40'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                }`}>
                  {auditResult.severity} RISK ({auditResult.compositeScore}%)
                </span>
              </div>

              {/* Signals bar */}
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-400">Handle</div>
                  <div className="font-bold font-mono text-cyan-300 text-sm mt-0.5">{auditResult.breakdown.handleScore}%</div>
                </div>
                <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-400">Logo</div>
                  <div className="font-bold font-mono text-cyan-300 text-sm mt-0.5">{auditResult.breakdown.logoScore}%</div>
                </div>
                <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-400">Scam Intent</div>
                  <div className="font-bold font-mono text-red-400 text-sm mt-0.5">{auditResult.breakdown.scamScore}%</div>
                </div>
                <div className="bg-slate-900 p-2 rounded-xl border border-slate-800">
                  <div className="text-[10px] text-slate-400">Domain</div>
                  <div className="font-bold font-mono text-amber-300 text-sm mt-0.5">{auditResult.breakdown.domainScore}%</div>
                </div>
              </div>

              {/* Triggers list */}
              <div className="space-y-1">
                {auditResult.reasons.map((r, i) => (
                  <div key={i} className="text-[11px] text-slate-300 flex items-start gap-1.5">
                    <span className="text-cyan-400">•</span>
                    <span>{r}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={handleAddIncident}
                className="w-full mt-2 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all"
              >
                + Add Incident to Active Surveillance Feed
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
