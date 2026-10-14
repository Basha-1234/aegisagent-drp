import React from 'react';
import { Globe, ShieldAlert, AlertTriangle, ArrowRight, Check, X, Lock } from 'lucide-react';

export default function HomoglyphInspector({ threat, brand }) {
  const brandId = brand?.id || 'razorpay';
  const officialDomain = brand?.officialDomain || 'razorpay.com';

  // Dynamic configuration per brand
  const homoglyphConfigs = {
    razorpay: {
      official: 'razorpay.com',
      suspectPrefix: 'raz',
      charExploit: 'ø',
      charDescription: 'Unicode U+00F8 (LATIN SMALL LETTER O WITH STROKE)',
      suspectSuffix: 'rpay-verification.net',
      punycode: 'xn--razrpay-verification-d1b.net',
      standardChar: 'o (U+006F)',
      spoofChar: 'ø (U+00F8)',
      explanation: 'Attacker substituted Latin "o" with Nordic slashed "ø" (U+00F8) to clone Razorpay\'s merchant settlement portal while hosting an offshore phishing kit.'
    },
    phonepe: {
      official: 'phonepe.com',
      suspectPrefix: 'ph',
      charExploit: 'ø',
      charDescription: 'Unicode U+00F8 (LATIN SMALL LETTER O WITH STROKE)',
      suspectSuffix: 'nepe-kyc-update.xyz',
      punycode: 'xn--phnepe-kyc-update-2qb.xyz',
      standardChar: 'o (U+006F)',
      spoofChar: 'ø (U+00F8)',
      explanation: 'Attacker substituted Latin "o" with Nordic slashed "ø" (U+00F8) to clone PhonePe\'s KYC resolution interface, harvesting UPI MPIN and netbanking passwords.'
    },
    revolut: {
      official: 'revolut.com',
      suspectPrefix: 'revo',
      charExploit: 'I',
      charDescription: 'Unicode U+0049 (LATIN CAPITAL LETTER I replacing lowercase l)',
      suspectSuffix: 'ut-auth.com',
      punycode: 'revoIut-auth.com',
      standardChar: 'l (U+006C)',
      spoofChar: 'I (U+0049)',
      explanation: 'Attacker substituted lowercase Latin "l" with uppercase Latin "I" (U+0049) to spoof Revolut Web login on mobile displays where fonts render both identically.'
    }
  };

  const config = homoglyphConfigs[brandId] || homoglyphConfigs.razorpay;

  return (
    <div className="rounded-2xl p-5 bg-[#071120]/90 backdrop-blur-xl border border-blue-500/30 shadow-2xl relative overflow-hidden">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-300">
            Unicode Homoglyph &amp; Typosquatting Inspector
          </span>
        </div>
        <div className="px-2.5 py-0.5 rounded-full bg-red-950/80 border border-red-500/50 text-[10px] font-mono text-red-300 font-bold animate-pulse">
          CONFIRMED HOMOGLYPH SPOOF
        </div>
      </div>

      {/* Visual Character-by-Character Comparison Box */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-2">
        
        {/* Official Domain */}
        <div className="p-3.5 rounded-xl bg-slate-950/70 border border-emerald-500/30">
          <div className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
            <span>Authoritative Trademark Domain</span>
            <span className="flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-600">
              <Check className="w-3 h-3" /> OFFICIAL
            </span>
          </div>

          <div className="font-mono text-base font-bold text-white bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 flex items-center gap-1">
            <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="text-slate-400">https://</span>
            <span className="text-emerald-300">{officialDomain}</span>
          </div>

          <div className="mt-2 text-[10.5px] font-mono text-slate-400 space-y-0.5">
            <div>Registrar: MarkMonitor Inc. (Corporate)</div>
            <div>SSL: DigiCert EV TLS (Active 9 Years)</div>
          </div>
        </div>

        {/* Suspect Impersonator Domain */}
        <div className="p-3.5 rounded-xl bg-slate-950/70 border border-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.15)]">
          <div className="text-[10px] font-mono text-red-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
            <span>Detected Homoglyph Lure</span>
            <span className="flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded bg-red-950 text-red-300 border border-red-600 animate-pulse">
              <X className="w-3 h-3" /> MALICIOUS
            </span>
          </div>

          <div className="font-mono text-base font-bold text-white bg-slate-900/80 p-2.5 rounded-lg border border-red-500/50 flex items-center gap-0.5">
            <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0 mr-1" />
            <span className="text-slate-400">https://</span>
            <span className="text-white">{config.suspectPrefix}</span>
            <span 
              className="bg-red-500/40 text-red-200 border-b-2 border-red-400 px-1 rounded font-black text-lg" 
              title={config.charDescription}
            >
              {config.charExploit}
            </span>
            <span className="text-white">{config.suspectSuffix}</span>
          </div>

          <div className="mt-2 text-[10.5px] font-mono text-red-300 space-y-0.5">
            <div>Punycode: <code className="text-amber-300">{config.punycode}</code></div>
            <div>Domain Age: <strong>2 Days Old</strong> • Namecheap Anonymous</div>
          </div>
        </div>

      </div>

      {/* Unicode Forensic Decryption Callout */}
      <div className="mt-3 p-3 rounded-xl bg-blue-950/40 border border-blue-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="space-y-0.5">
          <div className="text-cyan-300 font-bold font-mono">
            Forensic Glyph Translation:
          </div>
          <p className="text-[11px] text-slate-300">
            {config.explanation}
          </p>
        </div>
        <div className="shrink-0 px-2.5 py-1 rounded-lg bg-red-950/70 border border-red-500 text-red-300 text-[10px] font-mono font-bold">
          DNS SPOOF CONFIRMED
        </div>
      </div>

    </div>
  );
}
