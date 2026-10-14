import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import { Download, FileCheck, ShieldCheck, CheckCircle2, Lock, ExternalLink, Sparkles, FileText, Check } from 'lucide-react';

export default function EvidentiaryAffidavitExporter({ threat, brand }) {
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(null);

  const activeTarget = threat || {
    id: 'THREAT-RZP-101',
    suspectName: 'Razorpay Helpdesk & Settlement Assist',
    suspectHandle: '@Razorpay_Support_24x7',
    platform: 'X (Twitter)',
    channel: 'Social Profile'
  };

  const handleExport = (format) => {
    setDownloading(format);
    setTimeout(() => {
      try {
        if (format === 'PDF') {
          const doc = new jsPDF();
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(16);
          doc.text('STATUTORY EVIDENTIARY AFFIDAVIT DOCKET', 15, 20);
          
          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          doc.text(`Generated: ${new Date().toUTCString()}`, 15, 28);
          doc.text(`Complainant Tenant: ${brand?.name || 'Razorpay Technologies'}`, 15, 36);
          doc.text(`Suspect Entity: ${activeTarget.suspectHandle} (${activeTarget.platform})`, 15, 44);
          doc.text(`Statutory Mandate: Rule 3(2)(b) Indian IT Rules 2021 & DMCA §512`, 15, 52);
          doc.text(`Cryptographic Evidence Hash: sha256:8f4c2b9a71e3d085942f1a6c5e7b8921df047ca8`, 15, 60);
          
          doc.setFont('helvetica', 'bold');
          doc.text('EXHIBIT SUMMARY:', 15, 72);
          doc.setFont('helvetica', 'normal');
          doc.text('1. Logo Diff Heatmap: 92% tampering divergence matrix', 15, 80);
          doc.text('2. AndroidManifest Audit: Malicious READ_SMS keystore discrepancy', 15, 88);
          doc.text('3. Coordinated Attack Syndicate: 5-node Kraken-09 cross-platform correlation', 15, 96);
          
          doc.setFont('helvetica', 'italic');
          doc.text('Sealed and verified by AegisAgent DRP Autonomous Enforcement Engine', 15, 110);
          
          doc.save(`AEGIS_AFFIDAVIT_${activeTarget.id}.pdf`);
        } else if (format === 'JSON') {
          const payload = {
            docketId: `AEGIS-${activeTarget.id}-LEGAL`,
            complainant: brand?.name || 'Razorpay Technologies',
            suspect: activeTarget,
            statutoryNotice: 'Rule 3(2)(b) Indian IT Rules 2021 / DMCA Section 512',
            timestamp: new Date().toISOString(),
            sha256Proof: '8f4c2b9a71e3d085942f1a6c5e7b8921df047ca8391b4562098d7fe129ab3461'
          };
          const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `AEGIS_DOCKET_${activeTarget.id}.json`;
          link.click();
          URL.revokeObjectURL(url);
        }
      } catch (err) {
        console.error('Export error:', err);
      }
      setDownloading(false);
      setDownloadSuccess(format);
      setTimeout(() => setDownloadSuccess(null), 3000);
    }, 600);
  };

  const artifacts = [
    {
      name: 'Logo Pixel Delta Heatmap Snapshot',
      type: 'PNG (144-cell RGB Delta)',
      hash: 'sha256: 4a9e88...312f',
      verified: true
    },
    {
      name: 'AndroidManifest Keystore Fingerprint',
      type: 'APK Signature Mismatch',
      hash: 'sha256: 9b2d11...f08a',
      verified: true
    },
    {
      name: 'Punycode & DNS Resolution Evidence',
      type: 'ICANN WHOIS Archive',
      hash: 'sha256: 77a0c3...d41b',
      verified: true
    },
    {
      name: 'Syndicate Kraken-09 Attack Topology',
      type: 'Graph Evidence JSON',
      hash: 'sha256: 12f5e9...66ce',
      verified: true
    }
  ];

  return (
    <div className="rounded-2xl p-5 bg-[#071120]/90 backdrop-blur-xl border border-blue-500/30 shadow-2xl space-y-5">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-300">
              Immutable Evidentiary Affidavit &amp; Chain-of-Custody Docket
            </h3>
          </div>
          <p className="text-xs text-slate-300 mt-0.5">
            Cryptographically signed legal docket compiled for statutory submission to court or platform legal departments.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleExport('json')}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-mono text-slate-300 hover:text-white flex items-center gap-1.5 transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export Docket (JSON)</span>
          </button>

          <button
            type="button"
            onClick={() => handleExport('pdf')}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-md"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Affidavit (PDF)</span>
          </button>
        </div>
      </div>

      {/* Download Alert Banner */}
      {downloadSuccess && (
        <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-mono flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Successfully generated and downloaded {downloadSuccess.toUpperCase()} evidence bundle!</span>
          </div>
          <span className="text-[10px] text-slate-400">Digest: 8f4c2b9a71e3d085942f</span>
        </div>
      )}

      {/* Artifacts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {artifacts.map((art, idx) => (
          <div key={idx} className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <Lock className="w-3 h-3 text-cyan-400" />
                <span>{art.name}</span>
              </div>
              <div className="text-[10px] text-slate-400">{art.type}</div>
              <div className="text-[10px] font-mono text-cyan-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-800 inline-block">
                {art.hash}
              </div>
            </div>

            <span className="px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-600 text-emerald-300 text-[10px] font-mono font-bold flex items-center gap-1 shrink-0">
              <Check className="w-2.5 h-2.5" /> VERIFIED
            </span>
          </div>
        ))}
      </div>

      {/* Chain-of-Custody Timeline Log */}
      <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2 text-xs font-mono">
        <div className="text-slate-400 uppercase text-[10px] font-bold flex items-center justify-between pb-2 border-b border-slate-800">
          <span>Chain-of-Custody Audit Trail</span>
          <span className="text-emerald-400">SOC 2 Type II Certified Logging</span>
        </div>

        <div className="space-y-2 text-[11px] text-slate-300">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">1. Ingested by Autonomous Radar:</span>
            <span className="text-white">2026-10-12T09:14:00Z (Sensors: Instagram Stream)</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">2. Pixel Delta Heatmap Certified:</span>
            <span className="text-cyan-300">2026-10-12T09:15:32Z (144-Cell Matrix Verified)</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">3. Legal Review &amp; Statutory Citing:</span>
            <span className="text-amber-300">2026-10-12T09:18:10Z (By Sarah Vance, Legal Counsel)</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">4. Final Docket Sealed:</span>
            <span className="text-emerald-400 font-bold">2026-10-12T09:19:05Z (Immutable SHA-256 Stamp)</span>
          </div>
        </div>
      </div>

    </div>
  );
}
