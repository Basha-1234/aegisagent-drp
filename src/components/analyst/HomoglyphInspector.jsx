import React, { useState, useEffect } from 'react';
import { Globe, ShieldAlert, AlertTriangle, Check, X, Lock, Search, RefreshCw, Info } from 'lucide-react';
import api from '../../utils/apiClient';

export default function HomoglyphInspector({ threat, brand }) {
  const brandName = brand?.name || 'Razorpay';
  const officialDomain = brand?.officialDomain || brand?.official_domain || 'razorpay.com';

  // Extract initial suspect URL from active threat
  const defaultSuspectUrl = threat?.suspect_url || threat?.suspectUrl || threat?.landingUrl || 'https://raz0rpay.com/merchant/verify';
  const [inputUrl, setInputUrl] = useState(defaultSuspectUrl);
  const [comparisonResult, setComparisonResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // Synchronize when active threat or brand changes
  useEffect(() => {
    const newDefault = threat?.suspect_url || threat?.suspectUrl || threat?.landingUrl || `https://raz0rpay.com/${brand?.id || 'verify'}`;
    setInputUrl(newDefault);
    runComparison(newDefault);
  }, [threat?.id, brand?.id]);

  const runComparison = async (urlToTest) => {
    const target = urlToTest || inputUrl;
    if (!target || !target.trim()) return;

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const result = await api.compareUrl({
        suspicious_url: target.trim(),
        official_url: officialDomain,
        brand_name: brandName,
      });
      setComparisonResult(result);
    } catch (err) {
      console.warn('[URL Comparison] API call failed, generating deterministic fallback:', err);
      // Fallback display if backend is offline
      setErrorMsg('Comparison service error: ' + (err.message || 'Network error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    runComparison(inputUrl);
  };

  const status = comparisonResult?.status || 'SUSPICIOUS';
  const isMatch = status === 'MATCH';
  const isSuspicious = status === 'SUSPICIOUS';
  const isInconclusive = status === 'INCONCLUSIVE';

  const regComp = comparisonResult?.registrable_domain_comparison || {};
  const signals = comparisonResult?.signals || [];
  const similarity = comparisonResult?.heuristic_similarity_ratio ?? 0;

  return (
    <div className="rounded-2xl p-5 bg-[#071120]/90 backdrop-blur-xl border border-blue-500/30 shadow-2xl relative overflow-hidden space-y-4">
      
      {/* Header with Comparison Status Badge */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-300">
            Deterministic URL &amp; Domain Comparison Engine
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isMatch && (
            <div className="px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-[10px] font-mono text-emerald-300 font-bold flex items-center gap-1">
              <Check className="w-3 h-3" /> OFFICIAL DOMAIN MATCH
            </div>
          )}
          {isSuspicious && (
            <div className="px-2.5 py-0.5 rounded-full bg-rose-950/80 border border-rose-500/50 text-[10px] font-mono text-rose-300 font-bold flex items-center gap-1 animate-pulse">
              <AlertTriangle className="w-3 h-3" /> SUSPICIOUS DOMAIN DISCREPANCY
            </div>
          )}
          {isInconclusive && (
            <div className="px-2.5 py-0.5 rounded-full bg-amber-950/80 border border-amber-500/50 text-[10px] font-mono text-amber-300 font-bold flex items-center gap-1">
              <Info className="w-3 h-3" /> INCONCLUSIVE COMPARISON
            </div>
          )}
        </div>
      </div>

      {/* On-Demand URL Input Bar */}
      <form onSubmit={handleFormSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            placeholder="Enter suspicious URL or hostname to compare..."
            className="w-full pl-8 pr-3 py-1.5 text-xs font-mono rounded-lg bg-slate-950/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-xs font-mono font-bold flex items-center gap-1.5 transition cursor-pointer"
        >
          <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Compare</span>
        </button>
      </form>

      {errorMsg && (
        <div className="text-[11px] font-mono text-rose-400 bg-rose-950/40 p-2 rounded border border-rose-800">
          {errorMsg}
        </div>
      )}

      {/* Side-by-Side Domain Structure Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Authoritative Official Domain Box */}
        <div className="p-3.5 rounded-xl bg-slate-950/70 border border-emerald-500/30">
          <div className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
            <span>Authoritative Trademark Domain</span>
            <span className="flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-600">
              <Check className="w-3 h-3" /> OFFICIAL BENCHMARK
            </span>
          </div>

          <div className="font-mono text-sm font-bold text-white bg-slate-900/80 p-2 rounded-lg border border-slate-800 flex items-center gap-1 truncate">
            <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="text-emerald-300 truncate">{comparisonResult?.official_hostname || officialDomain}</span>
          </div>

          <div className="mt-2 text-[10.5px] font-mono text-slate-400 space-y-0.5">
            <div>Registrable (PSL): <strong className="text-slate-200">{regComp.official_registrable_domain || officialDomain}</strong></div>
            <div>Subdomain: <span className="text-slate-400">{regComp.official_subdomain || '(none - apex domain)'}</span></div>
          </div>
        </div>

        {/* Suspect Impersonator Domain Box */}
        <div className={`p-3.5 rounded-xl bg-slate-950/70 border ${
          isMatch ? 'border-emerald-500/40' : 'border-rose-500/40 shadow-[0_0_15px_rgba(244,63,94,0.15)]'
        }`}>
          <div className="text-[10px] font-mono text-rose-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
            <span>Submitted Target URL</span>
            <span className={`flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded border ${
              isMatch
                ? 'bg-emerald-950 text-emerald-300 border-emerald-600'
                : 'bg-rose-950 text-rose-300 border-rose-600'
            }`}>
              {isMatch ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
              {status}
            </span>
          </div>

          <div className="font-mono text-sm font-bold text-white bg-slate-900/80 p-2 rounded-lg border border-slate-800 flex items-center gap-1 truncate">
            <AlertTriangle className={`w-3.5 h-3.5 shrink-0 ${isMatch ? 'text-emerald-400' : 'text-rose-400'}`} />
            <span className="text-slate-200 truncate">{comparisonResult?.suspicious_hostname || inputUrl}</span>
          </div>

          <div className="mt-2 text-[10.5px] font-mono text-slate-400 space-y-0.5">
            <div>Registrable (PSL): <strong className={isMatch ? 'text-emerald-300' : 'text-rose-300'}>
              {regComp.suspicious_registrable_domain || '(unresolved)'}
            </strong></div>
            <div>Lexical Similarity: <strong className="text-cyan-300">{similarity}%</strong> <span className="text-[9.5px] text-slate-500">(heuristic metric)</span></div>
          </div>
        </div>

      </div>

      {/* Signals List Breakdown */}
      {signals.length > 0 && (
        <div className="space-y-2">
          <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
            Detected Comparison Signals ({signals.length})
          </div>
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {signals.map((sig, idx) => {
              const isCrit = sig.severity === 'CRITICAL';
              const isHigh = sig.severity === 'HIGH';
              const isMed = sig.severity === 'MEDIUM';
              const isSafe = sig.severity === 'SAFE';

              return (
                <div
                  key={idx}
                  className={`p-2.5 rounded-lg border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                    isCrit ? 'bg-rose-950/40 border-rose-500/40 text-rose-200' :
                    isHigh ? 'bg-amber-950/40 border-amber-500/40 text-amber-200' :
                    isMed  ? 'bg-yellow-950/30 border-yellow-500/30 text-yellow-200' :
                    isSafe ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200' :
                    'bg-slate-900 border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="font-bold flex items-center gap-1.5 font-mono">
                      <span>{sig.name}</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded border bg-slate-950/80 font-mono">
                        {sig.id}
                      </span>
                    </div>
                    <div className="text-[11px] opacity-90 leading-relaxed">
                      {sig.explanation}
                    </div>
                  </div>
                  <span className={`shrink-0 self-start sm:self-center px-2 py-0.5 rounded text-[9px] font-mono font-bold border uppercase ${
                    isCrit ? 'bg-rose-900 text-rose-100 border-rose-400' :
                    isHigh ? 'bg-amber-900 text-amber-100 border-amber-400' :
                    isMed  ? 'bg-yellow-900 text-yellow-100 border-yellow-400' :
                    isSafe ? 'bg-emerald-900 text-emerald-100 border-emerald-400' :
                    'bg-slate-800 text-slate-300 border-slate-600'
                  }`}>
                    {sig.severity}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Summary and Limitations Callout */}
      <div className="p-3 rounded-xl bg-blue-950/30 border border-blue-500/20 text-xs space-y-1.5">
        <div className="text-cyan-300 font-bold font-mono text-[11px]">
          Deterministic Assessment Summary:
        </div>
        <p className="text-[11px] text-slate-300 leading-relaxed">
          {comparisonResult?.summary || 'Deterministic URL analysis completed.'}
        </p>

        <div className="pt-1.5 border-t border-blue-900/40 text-[10px] text-slate-400 space-y-0.5">
          <div className="font-semibold text-slate-300">Operational Limitations &amp; Disclaimers:</div>
          <ul className="list-disc pl-4 space-y-0.5 text-slate-400">
            <li>Matching domain does not guarantee safety (e.g. open redirect, application compromise).</li>
            <li>Differing domain does not prove malicious intent without corroborating threat signals.</li>
            <li>URL comparison operates purely offline on lexical structure without DNS or TLS inspection.</li>
          </ul>
        </div>
      </div>

    </div>
  );
}
