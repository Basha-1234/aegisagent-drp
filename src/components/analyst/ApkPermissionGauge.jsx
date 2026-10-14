import React from 'react';
import { Smartphone, ShieldAlert, AlertTriangle, Key, Download, CheckCircle, XCircle } from 'lucide-react';

export default function ApkPermissionGauge({ threat, brand }) {
  // Exploit Risk Score (0-100)
  const riskScore = 94; // Critical for banking Trojan APKs

  // Permissions extracted from AndroidManifest.xml
  const permissions = [
    {
      name: 'android.permission.READ_SMS',
      risk: 'CRITICAL',
      reason: 'Intercepts 2FA OTP tokens and bank transaction confirmation SMS',
      exploited: true
    },
    {
      name: 'android.permission.SYSTEM_ALERT_WINDOW',
      risk: 'CRITICAL',
      reason: 'Draws fraudulent overlay login screen over genuine banking apps',
      exploited: true
    },
    {
      name: 'android.permission.REQUEST_INSTALL_PACKAGES',
      risk: 'HIGH',
      reason: 'Drops secondary unverified payloads from rogue external servers',
      exploited: true
    },
    {
      name: 'android.permission.READ_CONTACTS',
      risk: 'MEDIUM',
      reason: 'Exfiltrates victim address book to expand social phishing ring',
      exploited: false
    }
  ];

  // SVG Gauge calculations (Semi-circle from 180deg to 0deg)
  const radius = 55;
  const strokeWidth = 12;
  const normalizedScore = Math.min(100, Math.max(0, riskScore));
  const dashOffset = Math.PI * radius * (1 - normalizedScore / 100);

  return (
    <div className="rounded-2xl p-5 bg-[#071120]/90 backdrop-blur-xl border border-blue-500/30 shadow-2xl relative overflow-hidden">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-300">
            Rogue APK Manifest &amp; Permission Auditor
          </span>
        </div>
        <div className="px-2.5 py-0.5 rounded-full bg-red-950/80 border border-red-500/50 text-[10px] font-mono text-red-300 font-bold animate-pulse">
          MALICIOUS BANKING TROJAN
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
        
        {/* Left: Semi-Circular Radial Threat Gauge */}
        <div className="md:col-span-4 flex flex-col items-center justify-center p-3 rounded-xl bg-slate-950/70 border border-slate-800">
          <div className="relative w-36 h-24 flex items-center justify-center">
            <svg className="w-full h-full" viewBox="0 0 140 85">
              {/* Background Arc */}
              <path
                d="M 15 75 A 55 55 0 0 1 125 75"
                fill="none"
                stroke="#1e293b"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
              />
              {/* Progress Arc */}
              <path
                d="M 15 75 A 55 55 0 0 1 125 75"
                fill="none"
                stroke="#ef4444"
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={Math.PI * radius}
                strokeDashoffset={dashOffset}
                className="transition-all duration-1000 ease-out"
                style={{ filter: 'drop-shadow(0 0 8px rgba(239, 68, 68, 0.6))' }}
              />
            </svg>

            {/* Score Text in Center */}
            <div className="absolute bottom-1 flex flex-col items-center">
              <span className="text-3xl font-black font-mono text-red-400">
                {riskScore}
              </span>
              <span className="text-[9px] font-mono text-slate-400 uppercase">
                / 100 RISK INDEX
              </span>
            </div>
          </div>

          <div className="text-center mt-2">
            <div className="text-xs font-bold text-red-300">Level 4: Critical Severity</div>
            <div className="text-[10px] text-slate-400 font-mono mt-0.5">Automated Kill-Switch Urgency</div>
          </div>
        </div>

        {/* Right: Manifest Permissions Audit Table */}
        <div className="md:col-span-8 space-y-2">
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
            <span>Decompiled AndroidManifest.xml Capabilities</span>
            <span className="text-red-400 font-bold">3 Critical Vectors Flagged</span>
          </div>

          {permissions.map((perm) => (
            <div
              key={perm.name}
              className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-start justify-between gap-3 text-xs"
            >
              <div className="space-y-0.5">
                <div className="font-mono text-slate-200 font-bold text-[11px] flex items-center gap-1.5">
                  {perm.exploited ? (
                    <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                  ) : (
                    <CheckCircle className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  )}
                  <span className={perm.exploited ? 'text-red-300' : 'text-slate-300'}>
                    {perm.name}
                  </span>
                </div>
                <p className="text-[10.5px] text-slate-400 leading-snug">{perm.reason}</p>
              </div>

              <span
                className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded shrink-0 ${
                  perm.risk === 'CRITICAL'
                    ? 'bg-red-950/80 border border-red-500 text-red-300'
                    : perm.risk === 'HIGH'
                    ? 'bg-amber-950/80 border border-amber-500 text-amber-300'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {perm.risk}
              </span>
            </div>
          ))}
        </div>

      </div>

      {/* Certificate Mismatch Banner */}
      <div className="mt-4 p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <Key className="w-4 h-4 text-amber-400 shrink-0" />
          <div className="text-[11px] text-slate-200">
            <strong>Developer Keystore Mismatch:</strong> Official APK Signed by <code className="text-cyan-300">CN={brand?.name || 'Razorpay Technologies'}</code>. Suspect APK Signed by Self-Signed Debug Cert: <code className="text-amber-400">CN=Android Debug, O=Android</code>.
          </div>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-600 font-bold shrink-0">
          FORGERY CONFIRMED
        </span>
      </div>

    </div>
  );
}
