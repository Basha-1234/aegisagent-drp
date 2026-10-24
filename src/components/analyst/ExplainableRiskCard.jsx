import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { calculateExplainableRisk } from '../../utils/detectionEngine';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Sliders,
  Sparkles,
  Info,
  Smartphone,
  Globe,
  AtSign,
  Flame,
  ArrowRight,
  Database,
  ExternalLink,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export default function ExplainableRiskCard({ threat, brand, onNavigateLegal }) {
  const { isDark } = useTheme();
  const [showTechnicalAudit, setShowTechnicalAudit] = useState(false);

  if (!threat) return null;

  // Derive explanation from threat object or compute deterministically via detectionEngine
  const explanation = threat.explanation || (
    threat.breakdown?.signals ? {
      finalScore: threat.compositeScore ?? 0,
      severity: threat.severity || 'LOW',
      isOfficialExcluded: Boolean(threat.isOfficialExcluded),
      isCapped: Boolean(threat.breakdown.is_capped),
      capReason: threat.breakdown.cap_reason,
      signals: threat.breakdown.signals || [],
      recommendedAction: threat.breakdown.recommended_action || 'Review threat details and evaluate operational impact.',
      summary: threat.breakdown.summary || threat.reasons?.join('. ') || 'Risk assessed from multi-signal forensic indicators.'
    } : null
  ) || calculateExplainableRisk({
    suspectHandle: threat.suspectHandle || threat.suspect_handle,
    officialHandle: brand?.officialHandle || brand?.official_handle,
    suspectBio: threat.suspectBio || threat.suspect_bio || '',
    postCaptions: threat.postCaptions || threat.post_captions || [],
    suspectUrl: threat.suspectUrl || threat.suspect_url || '',
    officialDomain: brand?.officialDomain || brand?.official_domain || '',
    logoMatchPercent: threat.logoMatchPercent ?? threat.logo_match_percent ?? 50,
    channel: threat.channel || 'Social Profile',
    suspectPublisher: threat.suspectPublisher || threat.suspect_publisher,
    officialApps: brand?.officialApps || brand?.official_apps || [],
    brand
  }).explanation;

  const finalScore = explanation?.finalScore ?? threat.compositeScore ?? 0;
  const severity = explanation?.severity || threat.severity || 'LOW';
  const signals = explanation?.signals || [];
  const isCapped = Boolean(explanation?.isCapped);
  const capReason = explanation?.capReason;
  const recommendedAction = explanation?.recommendedAction;
  const summary = explanation?.summary;

  const isCritical = severity === 'CRITICAL';
  const isHigh = severity === 'HIGH';
  const isMedium = severity === 'MEDIUM';
  const isSafe = severity === 'OFFICIAL_WHITELISTED' || severity === 'SAFE';

  const getSignalIcon = (id) => {
    switch (id) {
      case 'app_store':
      case 'permissions_scam':
        return <Smartphone className="w-4 h-4 text-amber-400 shrink-0" />;
      case 'domain_risk':
        return <Globe className="w-4 h-4 text-blue-400 shrink-0" />;
      case 'visual_logo':
        return <Flame className="w-4 h-4 text-cyan-400 shrink-0" />;
      case 'handle_lookalike':
      case 'app_naming':
      default:
        return <AtSign className="w-4 h-4 text-purple-400 shrink-0" />;
    }
  };

  return (
    <div className={`p-5 rounded-2xl border transition-all duration-300 space-y-4 ${
      isDark
        ? 'bg-[#071120]/95 backdrop-blur-xl border-blue-500/35 shadow-2xl'
        : 'bg-white border-slate-300 shadow-md'
    }`}>
      
      {/* 1. Header with Badge & Data Provenance */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b ${
        isDark ? 'border-slate-800' : 'border-slate-200'
      }`}>
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-xl border ${
            isCritical
              ? isDark ? 'bg-red-500/20 border-red-500/40 text-red-400' : 'bg-rose-100 border-rose-300 text-rose-900'
              : isHigh
              ? isDark ? 'bg-amber-500/20 border-amber-500/40 text-amber-400' : 'bg-amber-100 border-amber-300 text-amber-900'
              : isSafe
              ? isDark ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' : 'bg-emerald-100 border-emerald-300 text-emerald-900'
              : isDark ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-400' : 'bg-sky-100 border-sky-300 text-sky-900'
          }`}>
            {isSafe ? <ShieldCheck className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className={`text-sm sm:text-base font-mono font-bold uppercase tracking-wider ${
                isDark ? 'text-white' : 'text-slate-900'
              }`}>
                Explainable Risk Attribution &amp; Audit
              </h3>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-semibold flex items-center gap-1 ${
                threat.provenance === 'live_connector'
                  ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                  : isDark ? 'bg-slate-900 border-slate-700 text-slate-300' : 'bg-slate-100 border-slate-300 text-slate-700'
              }`}>
                <Database className="w-2.5 h-2.5" />
                {threat.provenance === 'live_connector' ? 'Live Stream' : 'Demo Fixture (Synthetic)'}
              </span>
            </div>
            <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
              Deterministic evidence attribution for <strong className="font-mono text-cyan-400">{threat.suspectHandle}</strong>
            </p>
          </div>
        </div>

        {/* Score & Severity Indicator */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-[10px] font-mono uppercase text-slate-400">Composite Score</div>
            <div className={`text-2xl font-black font-mono leading-none ${
              isCritical ? 'text-red-400' : isHigh ? 'text-amber-400' : isSafe ? 'text-emerald-400' : 'text-cyan-400'
            }`}>
              {finalScore}<span className="text-xs text-slate-500 font-normal">/100</span>
            </div>
          </div>
          <span className={`px-2.5 py-1.5 rounded-xl font-mono text-xs font-bold border uppercase ${
            isCritical
              ? isDark ? 'bg-red-950/80 text-red-300 border-red-500/60 shadow-[0_0_12px_rgba(239,68,68,0.3)]' : 'bg-rose-100 text-rose-950 border-rose-300'
              : isHigh
              ? isDark ? 'bg-amber-950/80 text-amber-300 border-amber-500/60 shadow-[0_0_12px_rgba(245,158,11,0.3)]' : 'bg-amber-100 text-amber-950 border-amber-300'
              : isSafe
              ? isDark ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/60' : 'bg-emerald-100 text-emerald-950 border-emerald-300'
              : isDark ? 'bg-blue-950/80 text-blue-300 border-blue-500/60' : 'bg-blue-100 text-blue-950 border-blue-300'
          }`}>
            {severity}
          </span>
        </div>
      </div>

      {/* 2. Anti-False-Positive Policy Cap Notice (If Applicable) */}
      {isCapped && (
        <div className="p-3 rounded-xl bg-amber-950/50 border border-amber-500/50 text-amber-200 text-xs flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="text-amber-300 font-semibold font-mono">Anti-False-Positive Safety Policy: </strong>
            {capReason || 'Score capped at 28/100 (LOW) because name similarity alone without corroborating rogue signals cannot establish malicious intent.'}
          </div>
        </div>
      )}

      {/* 3. Plain-English Forensic Synthesis */}
      <div className={`p-3.5 rounded-xl border text-xs sm:text-sm font-sans flex items-start gap-2.5 ${
        isDark ? 'bg-slate-950/80 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
      }`}>
        <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-bold text-cyan-300 font-mono text-[11px] uppercase mr-1">Forensic Synopsis:</span>
          {summary}
        </div>
      </div>

      {/* 4. Contributing Signal Attribution Table */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className={`text-xs font-mono font-bold uppercase tracking-wider ${
            isDark ? 'text-slate-300' : 'text-slate-800'
          }`}>
            Contributing Signal Decomposition
          </span>
          <button
            type="button"
            onClick={() => setShowTechnicalAudit(!showTechnicalAudit)}
            className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
          >
            <span>{showTechnicalAudit ? 'Hide Weights' : 'Show Weight Model'}</span>
            {showTechnicalAudit ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>

        <div className={`rounded-xl border overflow-hidden ${
          isDark ? 'border-slate-800 bg-slate-950/60' : 'border-slate-200 bg-white'
        }`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className={`border-b font-mono text-[10px] uppercase tracking-wider ${
                isDark ? 'bg-slate-900/90 text-slate-400 border-slate-800' : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}>
                <tr>
                  <th className="py-2.5 px-3">Signal Category</th>
                  <th className="py-2.5 px-3">Observed Forensic Evidence</th>
                  {showTechnicalAudit && <th className="py-2.5 px-3 text-right">Raw Index</th>}
                  <th className="py-2.5 px-3 text-right">Attribution</th>
                  <th className="py-2.5 px-3 text-center">Threat Level</th>
                </tr>
              </thead>
              <tbody className={`divide-y font-mono ${
                isDark ? 'divide-slate-800/80 text-slate-200' : 'divide-slate-200 text-slate-800'
              }`}>
                {signals.map((sig, idx) => {
                  const pts = sig.weightedPoints ?? sig.weighted_points ?? 0;
                  const weight = sig.weightPercent ?? sig.weight_percent ?? 0;
                  const raw = sig.rawScore ?? sig.raw_score ?? 0;
                  const sev = sig.severity || 'LOW';

                  return (
                    <tr key={idx} className={`transition-colors ${
                      isDark ? 'hover:bg-slate-900/40' : 'hover:bg-slate-50'
                    }`}>
                      <td className="py-2.5 px-3 font-semibold whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {getSignalIcon(sig.id)}
                          <span>{sig.name}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 font-sans text-xs max-w-md">
                        <div className="line-clamp-2" title={sig.evidence}>
                          {sig.evidence}
                        </div>
                      </td>
                      {showTechnicalAudit && (
                        <td className="py-2.5 px-3 text-right font-mono text-slate-400">
                          {raw}/100
                        </td>
                      )}
                      <td className="py-2.5 px-3 text-right font-mono font-bold whitespace-nowrap">
                        <span className={pts > 0 ? (isDark ? 'text-cyan-300' : 'text-blue-700') : 'text-slate-500'}>
                          +{pts.toFixed(1)} pts
                        </span>
                        <span className="text-[10px] text-slate-500 ml-1 font-normal">
                          ({weight}%)
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${
                          sev === 'CRITICAL'
                            ? isDark ? 'bg-red-950/70 text-red-300 border-red-500/50' : 'bg-rose-100 text-rose-950 border-rose-300'
                            : sev === 'HIGH'
                            ? isDark ? 'bg-amber-950/70 text-amber-300 border-amber-500/50' : 'bg-amber-100 text-amber-950 border-amber-300'
                            : sev === 'MEDIUM'
                            ? isDark ? 'bg-blue-950/70 text-blue-300 border-blue-500/50' : 'bg-blue-100 text-blue-950 border-blue-300'
                            : isDark ? 'bg-slate-900 text-slate-400 border-slate-700' : 'bg-slate-100 text-slate-600 border-slate-300'
                        }`}>
                          {sev}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 5. Recommended Human Analyst Next Action */}
      {recommendedAction && (
        <div className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
          isCritical || isHigh
            ? isDark ? 'bg-amber-950/30 border-amber-500/40 text-amber-200' : 'bg-amber-50 border-amber-300 text-amber-950'
            : isDark ? 'bg-blue-950/30 border-blue-500/30 text-blue-200' : 'bg-blue-50 border-blue-200 text-blue-950'
        }`}>
          <div className="flex items-start gap-2.5 min-w-0">
            <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${
              isCritical || isHigh ? 'text-amber-400' : 'text-blue-500'
            }`} />
            <div className="text-xs leading-relaxed">
              <strong className="font-mono uppercase font-bold mr-1">Recommended Analyst Action:</strong>
              {recommendedAction}
            </div>
          </div>

          {(isCritical || isHigh) && onNavigateLegal && (
            <button
              type="button"
              onClick={onNavigateLegal}
              className="py-1.5 px-3 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs font-mono flex items-center justify-center gap-1.5 transition cursor-pointer shrink-0 shadow-sm"
            >
              <span>Escalate to Legal Desk</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

    </div>
  );
}
