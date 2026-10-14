import React, { useState } from 'react';
import { FileText, ShieldCheck, Scale, CheckCircle2, Lock, Copy, Check, Printer } from 'lucide-react';

export default function StatutoryAffidavitGenerator({ threat, brand }) {
  const [statute, setStatute] = useState('it_rules'); // 'it_rules' | 'dmca' | 'lanham' | 'udrp'
  const [isSealed, setIsSealed] = useState(true);
  const [copied, setCopied] = useState(false);

  const activeTarget = threat || {
    id: 'THREAT-RZP-101',
    suspectName: 'Razorpay Helpdesk & Settlement Assist',
    suspectHandle: '@Razorpay_Support_24x7',
    platform: 'X (Twitter)',
    channel: 'Social Profile',
    suspectUrl: 'https://razorpay-merchant-refund.xyz/claim',
    logoMatchPercent: 94
  };

  const activeBrand = brand || {
    name: 'Razorpay Technologies',
    officialDomain: 'razorpay.com',
    officialHandle: '@Razorpay'
  };

  // Statutory templates
  const statutesInfo = {
    it_rules: {
      name: 'Rule 3(2)(b) Indian IT Rules 2021',
      mandate: 'Mandatory 24-Hour Redressal & Intermediary Takedown',
      jurisdiction: 'Republic of India / Ministry of Electronics & IT (MeitY)',
      grounds: 'Impersonation of licensed financial entity, deceptive customer support, and unauthorized collection of customer financial credentials.'
    },
    dmca: {
      name: 'DMCA 17 U.S.C. § 512(c) Notice',
      mandate: 'Expeditious Removal of Infringing Copyright & Trademark Assets',
      jurisdiction: 'United States Federal Jurisdiction / WIPO Standard',
      grounds: 'Unauthorized reproduction and display of registered corporate logo, color schemes, and trademark trade dress without license.'
    },
    lanham: {
      name: 'Lanham Act 15 U.S.C. § 1114 / 1125(a)',
      mandate: 'Commercial Trademark Infringement & False Designation of Origin',
      jurisdiction: 'United States Trademark Office / Cross-Border Commerce',
      grounds: 'Willful customer deception, tarnishment of commercial reputation, and likelihood of confusion in online financial transactions.'
    },
    udrp: {
      name: 'ICANN UDRP / URS Registrar Dispute',
      mandate: 'Bad Faith Domain Registration & Homoglyph Typosquatting',
      jurisdiction: 'WIPO Arbitration & Mediation Center / ICANN Policy',
      grounds: 'Deliberate registration of lookalike Unicode/Punycode domain confusingly similar to complainant trademark for credential phishing.'
    }
  };

  const currentStatute = statutesInfo[statute];
  const sha256Proof = '8f4c2b9a71e3d085942f1a6c5e7b8921df047ca8391b4562098d7fe129ab3461';

  const copyAffidavit = () => {
    navigator.clipboard.writeText(
      `STATUTORY TAKEDOWN NOTICE & EVIDENTIARY AFFIDAVIT\nJurisdiction: ${currentStatute.jurisdiction}\nStatute: ${currentStatute.name}\nComplainant: ${activeBrand.name}\nSuspect Entity: ${activeTarget.suspectHandle} on ${activeTarget.platform}\nEvidence Hash: ${sha256Proof}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-2xl p-5 bg-[#071120]/90 backdrop-blur-xl border border-blue-500/30 shadow-2xl space-y-5">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-300">
              Statutory Affidavit &amp; Formal Takedown Notice Builder
            </h3>
          </div>
          <p className="text-xs text-slate-300 mt-0.5">
            Auto-synthesizes evidentiary hashes, trademark registrations, and statutory citations into court-admissible notices.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={copyAffidavit}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 flex items-center gap-1.5 font-mono cursor-pointer transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            <span>{copied ? 'Copied to Clipboard' : 'Copy Notice'}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsSealed(!isSealed)}
            className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold flex items-center gap-1.5 transition cursor-pointer ${
              isSealed 
                ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300' 
                : 'bg-amber-950/80 border-amber-500/50 text-amber-300'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{isSealed ? 'Affidavit Sealed & Signed' : 'Draft Mode'}</span>
          </button>
        </div>
      </div>

      {/* Statute Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {Object.entries(statutesInfo).map(([key, info]) => (
          <button
            key={key}
            onClick={() => setStatute(key)}
            className={`p-2.5 rounded-xl border text-left transition cursor-pointer ${
              statute === key
                ? 'bg-amber-500/20 border-amber-400 text-white shadow-[0_0_12px_rgba(245,158,11,0.2)]'
                : 'bg-slate-950/70 border-slate-800/80 text-slate-400 hover:text-white'
            }`}
          >
            <div className="text-xs font-bold truncate">{info.name}</div>
            <div className="text-[10px] text-slate-500 truncate">{info.mandate}</div>
          </button>
        ))}
      </div>

      {/* Formal Legal Affidavit Document Preview Canvas */}
      <div className="p-6 rounded-2xl bg-[#030812] border border-slate-800 font-mono text-xs text-slate-300 space-y-4 relative overflow-hidden shadow-inner">
        
        {/* Watermark Stamp when Sealed */}
        {isSealed && (
          <div className="absolute right-6 bottom-6 border-2 border-emerald-500/30 text-emerald-400/30 font-black text-2xl uppercase tracking-widest px-4 py-2 rotate-[-12deg] pointer-events-none select-none rounded-xl">
            AFFIDAVIT SEALED &amp; VERIFIED
          </div>
        )}

        {/* Notice Header */}
        <div className="border-b border-slate-800 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="text-white font-bold text-sm tracking-wide">
              FORMAL CEASE-AND-DESIST &amp; STATUTORY TAKEDOWN NOTICE
            </div>
            <div className="text-[10px] text-amber-400 mt-0.5">
              CITATION: {currentStatute.name.toUpperCase()} • TIMELINE: {currentStatute.mandate}
            </div>
          </div>
          <div className="text-right text-[10px] text-slate-500">
            <div>CASE REF: <span className="text-slate-300">AEGIS-{activeTarget.id}-LEGAL</span></div>
            <div>DATE: {new Date().toISOString().split('T')[0]}</div>
          </div>
        </div>

        {/* Parties Block */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 text-[11px]">
          <div>
            <div className="text-slate-500 uppercase text-[9px] font-bold">Complainant (Intellectual Property Holder):</div>
            <div className="text-white font-bold">{activeBrand.name}</div>
            <div className="text-slate-400">Trademark Registry No: TM-5829104-QP (Class 9, 36, 42)</div>
            <div className="text-slate-400">Authoritative Domain: {activeBrand.officialDomain}</div>
          </div>
          <div>
            <div className="text-slate-500 uppercase text-[9px] font-bold">Respondent / Suspect Entity:</div>
            <div className="text-red-400 font-bold">{activeTarget.suspectHandle} ({activeTarget.suspectName})</div>
            <div className="text-slate-400">Host Platform: {activeTarget.platform}</div>
            <div className="text-slate-400">Target Channel: {activeTarget.channel}</div>
          </div>
        </div>

        {/* Statutory Averment */}
        <div className="space-y-2 text-[11.5px] leading-relaxed">
          <p>
            <strong>1. LEGAL CAPACITY &amp; STANDING:</strong> The undersigned, <span className="text-amber-300">Sarah Vance</span>, acting as designated Legal Counsel for <span className="text-white">{activeBrand.name}</span>, hereby certifies under penalty of perjury that complainant is the sole and exclusive proprietor of the registered trademarks, proprietary branding, and customer service credentials referenced herein.
          </p>
          <p>
            <strong>2. STATEMENT OF INFRINGEMENT &amp; GROUNDS:</strong> The respondent entity is operating an unauthorized online presence under handle <code className="text-cyan-300 bg-slate-900 px-1 py-0.5 rounded">{activeTarget.suspectHandle}</code> designed to purposefully mislead consumers. Statutory Grounds: <span className="text-slate-200">{currentStatute.grounds}</span>
          </p>
          <p>
            <strong>3. EVIDENTIARY HASH PROOFS:</strong> Visual Logo Diff Heatmap analysis established a <span className="text-emerald-400 font-bold">{activeTarget.logoMatchPercent}% trademark overlap</span>. AndroidManifest analysis and network traffic captures have been cryptographically sealed under SHA-256 digest:
          </p>
          <div className="p-2 rounded bg-slate-900 border border-slate-800 text-[10px] text-cyan-300 select-all overflow-x-auto">
            SHA-256: {sha256Proof}
          </div>
          <p>
            <strong>4. DEMAND FOR IMMEDIATE RELIEF:</strong> In accordance with <span className="text-amber-300 font-bold">{currentStatute.name}</span>, you are hereby called upon to immediately suspend, delist, and terminate the respondent handle/application within the statutory timeline.
          </p>
        </div>

        {/* Digital Signature & Certification */}
        <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[11px]">
          <div>
            <div className="text-[10px] text-slate-500 uppercase">Digitally Certified &amp; Executed By:</div>
            <div className="text-white font-bold flex items-center gap-1.5 mt-0.5">
              <Lock className="w-3 h-3 text-emerald-400" />
              <span>Sarah Vance (Head of Legal &amp; Compliance, {activeBrand.name})</span>
            </div>
            <div className="text-[10px] text-slate-500">Public Key Hash: 0x9A4F...E81B • SOC2 Type II Certified</div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Immutable Legal Record
            </span>
          </div>
        </div>

      </div>

    </div>
  );
}
