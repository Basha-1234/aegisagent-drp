import React, { useState } from 'react';
import { 
  X, 
  CheckCircle, 
  AlertTriangle, 
  Fingerprint, 
  Sparkles, 
  FileText,
  Copy,
  Check,
  ShieldAlert
} from 'lucide-react';

export default function ThreatInspectorModal({
  threat,
  brand,
  onClose,
  onOpenTakedown
}) {
  const [copied, setCopied] = useState(false);

  if (!threat) return null;
  const risk = threat.calculatedRisk;

  const copyEvidence = () => {
    const text = `EVIDENCE DOSSIER — BRANDGUARD AI
Brand: ${brand.name} (${brand.officialHandle})
Suspect: ${threat.suspectName} (${threat.suspectHandle})
Platform: ${threat.platform}
Risk Score: ${risk?.compositeScore}/100 (${risk?.severity})
Reasons:
${risk?.reasons?.map((r, i) => `${i + 1}. ${r}`).join('\n') || 'Direct impersonation'}
Suspect URL: ${threat.suspectUrl || 'N/A'}
Timestamp: ${threat.detectionDate}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-150">
      <div className="theme-card rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-[var(--border-strong)] shadow-2xl">
        
        {/* Header */}
        <div className="sticky top-0 bg-[var(--bg-surface-glass)] backdrop-blur-md border-b border-[var(--border-subtle)] p-5 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[var(--accent-light)] text-[var(--accent-primary)] border border-[var(--border-accent)]">
              <Fingerprint className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-[var(--text-main)] font-mono">
                  Explainable AI Threat Inspector
                </h3>
                <span className="text-[10px] font-mono uppercase bg-[var(--accent-light)] text-[var(--accent-primary)] border border-[var(--border-accent)] px-2 py-0.5 rounded-full font-bold">
                  Forensic Audit
                </span>
              </div>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Incident ID: {threat.id} • Monitored Brand: {brand.name}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface-hover)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">

          {/* Top Score Banner */}
          <div className="p-4 rounded-2xl bg-[var(--bg-input)] border border-[var(--border-subtle)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] font-bold block">
                Composite Risk Grade
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-black font-mono text-[var(--text-main)]">
                  {risk?.compositeScore}/100
                </span>
                <span className={`text-xs font-bold font-mono px-2.5 py-0.5 rounded-full border ${
                  risk?.severity === 'CRITICAL'
                    ? 'bg-red-500/20 text-red-400 border-red-500/40'
                    : risk?.severity === 'HIGH'
                    ? 'bg-orange-500/20 text-orange-400 border-orange-500/40'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                }`}>
                  {risk?.severity} SEVERITY
                </span>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 text-center text-xs w-full sm:w-auto font-mono">
              <div className="bg-[var(--bg-surface)] p-2 rounded-xl border border-[var(--border-subtle)]">
                <div className="text-[10px] text-[var(--text-muted)]">Handle</div>
                <div className="font-bold text-[var(--accent-primary)] mt-0.5">{risk?.breakdown?.handleScore}%</div>
              </div>
              <div className="bg-[var(--bg-surface)] p-2 rounded-xl border border-[var(--border-subtle)]">
                <div className="text-[10px] text-[var(--text-muted)]">Logo</div>
                <div className="font-bold text-[var(--accent-primary)] mt-0.5">{threat.logoMatchPercent}%</div>
              </div>
              <div className="bg-[var(--bg-surface)] p-2 rounded-xl border border-[var(--border-subtle)]">
                <div className="text-[10px] text-[var(--text-muted)]">Scam NLP</div>
                <div className="font-bold text-red-400 mt-0.5">{risk?.breakdown?.scamScore}%</div>
              </div>
              <div className="bg-[var(--bg-surface)] p-2 rounded-xl border border-[var(--border-subtle)]">
                <div className="text-[10px] text-[var(--text-muted)]">Domain</div>
                <div className="font-bold text-amber-400 mt-0.5">{risk?.breakdown?.domainScore}%</div>
              </div>
            </div>
          </div>

          {/* Visual Side-by-Side Avatar Audit */}
          <div className="p-4 rounded-2xl bg-[var(--bg-input)] border border-[var(--border-subtle)]">
            <h4 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
              Visual Trademark & Handle Overlap Audit
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Official */}
              <div className="p-3.5 bg-emerald-950/20 border border-emerald-800/40 rounded-xl">
                <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-emerald-400">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Official Legitimate Identity
                </div>
                <div className="flex items-center gap-3">
                  <img src={brand.logoUrl} alt="Official Logo" className="w-12 h-12 rounded-xl object-cover border border-emerald-600/40" />
                  <div>
                    <div className="text-sm font-bold text-[var(--text-main)]">{brand.name}</div>
                    <div className="text-xs font-mono text-emerald-300 font-semibold">{brand.officialHandle}</div>
                    <div className="text-[11px] text-[var(--text-muted)] mt-0.5 font-mono">{brand.officialDomain}</div>
                  </div>
                </div>
              </div>

              {/* Suspect */}
              <div className="p-3.5 bg-red-950/20 border border-red-800/40 rounded-xl">
                <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-red-400">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Flagged Impersonator Identity
                </div>
                <div className="flex items-center gap-3">
                  <img src={threat.avatarUrl} alt="Suspect Avatar" className="w-12 h-12 rounded-xl object-cover border border-red-600/40" />
                  <div>
                    <div className="text-sm font-bold text-[var(--text-main)]">{threat.suspectName}</div>
                    <div className="text-xs font-mono text-red-300 font-semibold">{threat.suspectHandle}</div>
                    <div className="text-[11px] text-[var(--text-muted)] mt-0.5">Platform: {threat.platform}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-3 p-2.5 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-between text-xs">
              <span className="text-[var(--text-muted)]">Perceptual Image Hash Match:</span>
              <span className="font-mono font-bold text-[var(--accent-primary)]">{threat.logoMatchPercent}% Visual Similarity</span>
            </div>
          </div>

          {/* Kampus.VC Bonus: Lookalike */}
          {risk?.lookalike && risk.lookalike.isLookalike && (
            <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-800/40">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5 font-mono">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  Kampus.VC Look-alike Character Detection ({risk.lookalike.confidenceScore}%)
                </h4>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-900 text-purple-200">
                  BONUS EVALUATION READY
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-mono">
                <div className="p-2.5 rounded-xl bg-[var(--bg-input)] border border-purple-900/50">
                  <div className="text-[10px] text-[var(--text-muted)]">Character Swaps:</div>
                  <div className="text-purple-300 font-bold mt-0.5">
                    {risk.lookalike.hasCharacterSwap ? risk.lookalike.swappedCharacters.join(', ') : 'None'}
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-[var(--bg-input)] border border-purple-900/50">
                  <div className="text-[10px] text-[var(--text-muted)]">Squatting Words:</div>
                  <div className="text-purple-300 font-bold mt-0.5">
                    {risk.lookalike.hasAddedWords ? risk.lookalike.detectedAddedWords.join(', ') : 'None'}
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-[var(--bg-input)] border border-purple-900/50">
                  <div className="text-[10px] text-[var(--text-muted)]">Spacing / Delimiters:</div>
                  <div className="text-purple-300 font-bold mt-0.5">
                    {risk.lookalike.hasDelimiterChanges ? `"${risk.lookalike.delimitersFound.join('", "')}"` : 'Standard'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Signal 3: NLP Content & Bio Analysis */}
          <div className="p-4 rounded-2xl bg-[var(--bg-input)] border border-[var(--border-subtle)] space-y-2">
            <h4 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
              Signal 3: Social Engineering & Scam Intent Extraction
            </h4>
            
            <p className="text-xs text-[var(--text-main)] leading-relaxed bg-[var(--bg-surface)] p-3 rounded-xl border border-[var(--border-subtle)] font-sans">
              {threat.suspectBio}
            </p>
          </div>

          {/* Explainable Reasons Summary */}
          <div className="p-4 rounded-2xl bg-[var(--bg-input)] border border-[var(--border-subtle)]">
            <h4 className="text-xs font-bold text-[var(--text-secondary)] uppercase tracking-wider mb-2">
              Explainable Forensic Findings ({risk?.reasons?.length || 0} Triggers)
            </h4>
            <div className="space-y-1.5">
              {risk?.reasons?.map((reason, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-[var(--text-secondary)] p-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)]">
                  <span className="text-[var(--accent-primary)] font-bold font-mono">0{idx + 1}.</span>
                  <span>{reason}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-[var(--bg-surface-glass)] backdrop-blur-md border-t border-[var(--border-subtle)] p-5 flex items-center justify-between z-10">
          <button
            onClick={copyEvidence}
            className="px-3.5 py-2 rounded-xl border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface-hover)] text-xs font-medium transition-all flex items-center gap-1.5"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied Dossier!' : 'Copy Evidence Dossier'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-main)] text-xs font-medium"
            >
              Close
            </button>
            <button
              onClick={() => {
                onClose();
                onOpenTakedown(threat);
              }}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white text-xs font-bold shadow-md shadow-red-900/20 transition-all flex items-center gap-2 active:scale-95"
            >
              <FileText className="w-4 h-4" />
              <span>Launch 1-Click Takedown</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
