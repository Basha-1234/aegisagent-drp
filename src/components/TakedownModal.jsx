import React, { useState } from 'react';
import { 
  X, 
  Send, 
  Download, 
  Copy, 
  Check, 
  FileCheck2, 
  ShieldAlert, 
  Scale, 
  Sparkles 
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function TakedownModal({
  threat,
  brand,
  onClose,
  onConfirmTakedown
}) {
  const [copied, setCopied] = useState(false);
  const [isDispatching, setIsDispatching] = useState(false);
  const [dispatched, setDispatched] = useState(threat?.status === 'TAKEDOWN_SENT');

  if (!threat) return null;
  const risk = threat.calculatedRisk;

  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const generateReportText = () => {
    return `LEGAL NOTICE OF TRADEMARK INFRINGEMENT & BRAND IMPERSONATION
DATE OF NOTICE: ${currentDate}
REFERENCE ID: BG-TAKEDOWN-${threat.id}

TO: TRUST & SAFETY / PLATFORM ABUSE TEAM (${threat.platform.toUpperCase()})

1. COMPLAINANT IDENTIFICATION (TRADEMARK OWNER)
--------------------------------------------------
Brand Entity: ${brand.name}
Official Verified Handle: ${brand.officialHandle}
Authorized Domain: https://${brand.officialDomain}
Primary Industry: ${brand.industry}
Contact: legal-ops@${brand.officialDomain}

2. INFRINGING ENTITY DETAILS
--------------------------------------------------
Suspect Account / Entity: ${threat.suspectName}
Suspect Handle / Package: ${threat.suspectHandle}
Channel: ${threat.channel}
Evidence URL: ${threat.suspectUrl || 'https://' + threat.platform.toLowerCase() + '.com/' + threat.suspectHandle}
Reported Status: Active Unauthorized Impersonation

3. MULTI-SIGNAL FORENSIC EVIDENCE (BRANDGUARD AI AUDIT)
--------------------------------------------------
Composite Risk Grade: ${risk?.compositeScore}/100 (${risk?.severity})
* Handle Squatting Match: ${risk?.breakdown?.handleScore}% similarity to ${brand.officialHandle}
* Visual Logo Imitation: ${threat.logoMatchPercent}% overlap with registered trademark assets
* Fraud Intent Indicators: ${risk?.breakdown?.scamScore}% detected in profile bio/captions
* Detected Deceptive Phrases: ${risk?.reasons?.join(' | ') || 'Direct trademark cloning'}

4. INFRINGEMENT STATEMENT & STATUTORY REQUEST
--------------------------------------------------
The reported entity is engaged in bad-faith deception, unauthorized trademark misappropriation, and active customer fraud by masquerading as official representatives of ${brand.name}.

Pursuant to Section 512 of the Digital Millennium Copyright Act (DMCA) and platform terms of service against impersonation and phishing, we hereby formally request the IMMEDIATE SUSPENSION and REMOVAL of the suspect entity.

Executed by: BrandGuard AI Automated Remediation Engine
On behalf of: ${brand.name} Legal Defense Operations`;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generateReportText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const downloadReport = () => {
    const element = document.createElement('a');
    const file = new Blob([generateReportText()], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `Takedown_Notice_${threat.id}_${brand.name.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleDispatch = () => {
    setIsDispatching(true);
    setTimeout(() => {
      setIsDispatching(false);
      setDispatched(true);
      onConfirmTakedown(threat.id);
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl shadow-cyan-950/30">
        
        {/* Header */}
        <div className="sticky top-0 bg-slate-900/95 backdrop-blur border-b border-slate-800 p-5 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">One-Click Platform Takedown Generator</h3>
                <span className="text-[10px] font-mono uppercase bg-red-950 text-red-300 border border-red-800 px-2 py-0.5 rounded-full font-semibold">
                  DMCA & Abuse Notice
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Target: {threat.suspectHandle} on {threat.platform}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          
          {/* Status banner */}
          {dispatched ? (
            <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <FileCheck2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <span className="font-bold text-white block">Takedown Notice Successfully Dispatched!</span>
                  <span>Notice submitted to {threat.platform} Trust & Safety Desk via automated webhook protocol.</span>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded bg-emerald-900/60 font-mono text-[11px] font-bold text-emerald-200">
                STATUS: DISPATCHED
              </span>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ShieldAlert className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>
                  This legal dossier combines all multi-signal forensic proof to guarantee rapid account suspension under platform terms of service.
                </span>
              </div>
            </div>
          )}

          {/* Generated Document Preview */}
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase font-bold text-slate-400 tracking-wider">
                Statutory Notice of Infringement (Ready to Submit)
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={copyToClipboard}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 flex items-center gap-1.5 transition-all"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
                <button
                  onClick={downloadReport}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 flex items-center gap-1.5 transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .txt</span>
                </button>
              </div>
            </div>

            <pre className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-slate-300 font-mono text-[11px] leading-relaxed overflow-x-auto whitespace-pre-wrap max-h-80 selection:bg-cyan-900 selection:text-white">
              {generateReportText()}
            </pre>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-slate-900/95 backdrop-blur border-t border-slate-800 p-5 flex items-center justify-between z-10">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-medium"
          >
            Close
          </button>

          <button
            onClick={handleDispatch}
            disabled={isDispatching || dispatched}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white transition-all flex items-center gap-2 shadow-lg ${
              dispatched
                ? 'bg-emerald-700 cursor-default shadow-emerald-950/20'
                : isDispatching
                ? 'bg-cyan-800 cursor-not-allowed opacity-80'
                : 'bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 hover:from-red-500 hover:to-pink-500 shadow-red-900/30 active:scale-95'
            }`}
          >
            {isDispatching ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin text-cyan-300" />
                <span>Dispatching Notice to {threat.platform}...</span>
              </>
            ) : dispatched ? (
              <>
                <Check className="w-4 h-4 text-emerald-200" />
                <span>Notice Filed with {threat.platform}</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Transmit Official Takedown Notice</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
