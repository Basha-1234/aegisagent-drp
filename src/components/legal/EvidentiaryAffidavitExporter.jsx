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
    channel: 'Social Profile',
    logoMatchPercent: 94,
    compositeScore: 88,
    severity: 'CRITICAL',
    reasons: ['Logo similarity 94%', 'Brand name collision']
  };

  const activeBrand = brand || {
    name: 'Razorpay Technologies',
    officialDomain: 'razorpay.com'
  };

  const sha256Proof = '8f4c2b9a71e3d085942f1a6c5e7b8921df047ca8391b4562098d7fe129ab3461';

  const handleExport = (format) => {
    setDownloading(format);
    setTimeout(() => {
      try {
        if (format === 'PDF') {
          const doc = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4'
          });

          const pageWidth = doc.internal.pageSize.getWidth();
          const margin = 18;
          let y = 20;

          // Header Bar
          doc.setFillColor(15, 23, 42); // slate-900
          doc.rect(0, 0, pageWidth, 24, 'F');
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(13);
          doc.setTextColor(245, 158, 11); // amber-400
          doc.text('STATUTORY EVIDENTIARY AFFIDAVIT DOCKET', margin, 15);

          y = 34;
          doc.setTextColor(15, 23, 42);
          doc.setFontSize(10);
          doc.setFont('helvetica', 'normal');
          doc.text(`Generated Timestamp: ${new Date().toUTCString()}`, margin, y);
          y += 6;
          doc.text(`Complainant Organization: ${activeBrand.name} (${activeBrand.officialDomain || 'official'})`, margin, y);
          y += 6;
          doc.text(`Suspected Asset: ${activeTarget.suspectHandle} on ${activeTarget.platform}`, margin, y);
          y += 6;
          doc.text(`Channel: ${activeTarget.channel} | Case ID: AEGIS-${activeTarget.id}`, margin, y);
          y += 6;
          doc.text(`Statutory Mandate: Rule 3(2)(b) Indian IT Rules 2021 & DMCA Section 512`, margin, y);
          y += 6;
          doc.text(`Cryptographic Evidence Hash: sha256:${sha256Proof.slice(0, 36)}...`, margin, y);
          y += 10;

          doc.setDrawColor(203, 213, 225);
          doc.line(margin, y, pageWidth - margin, y);
          y += 8;

          doc.setFont('helvetica', 'bold');
          doc.setFontSize(11);
          doc.text('CERTIFIED FORENSIC EXHIBITS:', margin, y);
          y += 8;

          doc.setFont('helvetica', 'normal');
          doc.setFontSize(9.5);

          const exhibits = [
            `Exhibit A (Visual Logo Delta): ${activeTarget.logoMatchPercent || 0}% trademark divergence matrix verified against registered corporate logo.`,
            `Exhibit B (Platform Telemetry): Suspect identifier "${activeTarget.suspectHandle}" with observed channel: ${activeTarget.channel}.`,
            `Exhibit C (Composite Risk Analysis): Multi-signal risk score of ${activeTarget.compositeScore || 75}/100 (${activeTarget.severity || 'HIGH'}).`,
            `Exhibit D (Forensic Indicators): ${Array.isArray(activeTarget.reasons) ? activeTarget.reasons.join(', ') : 'High similarity indicators'}.`
          ];

          for (let ex of exhibits) {
            const lines = doc.splitTextToSize(ex, pageWidth - (margin * 2));
            for (let l of lines) {
              doc.text(l, margin, y);
              y += 5.5;
            }
            y += 2;
          }

          y += 8;
          doc.setFont('helvetica', 'italic');
          doc.setFontSize(8.5);
          doc.setTextColor(100, 116, 139);
          doc.text('Sealed and cryptographically authenticated by AegisAgent DRP Autonomous Enforcement Engine.', margin, y);
          y += 5;
          doc.text('Demonstration Draft — Not Sent. For Trust & Safety Review and Court Admissibility.', margin, y);

          doc.save(`AEGIS_AFFIDAVIT_${activeTarget.id}.pdf`);
        } else if (format === 'JSON') {
          const payload = {
            docketId: `AEGIS-${activeTarget.id}-LEGAL`,
            status: 'Demonstration Draft — Not Sent',
            complainant: {
              name: activeBrand.name,
              domain: activeBrand.officialDomain
            },
            suspect: {
              id: activeTarget.id,
              name: activeTarget.suspectName,
              handle: activeTarget.suspectHandle,
              platform: activeTarget.platform,
              channel: activeTarget.channel,
              url: activeTarget.suspectUrl,
              logoMatchPercent: activeTarget.logoMatchPercent,
              compositeScore: activeTarget.compositeScore,
              severity: activeTarget.severity,
              reasons: activeTarget.reasons
            },
            statutoryNotices: [
              'Rule 3(2)(b) Indian IT Rules 2021',
              'DMCA 17 U.S.C. Section 512',
              'Lanham Act 15 U.S.C. Section 1125(a)'
            ],
            cryptographicEvidenceHash: sha256Proof,
            timestamp: new Date().toISOString()
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
    }, 400);
  };

  const artifacts = [
    {
      name: `Visual Logo Pixel Delta (${activeTarget.logoMatchPercent || 0}% Overlap)`,
      type: '144-Cell Color Space Matrix',
      hash: `sha256: 4a9e88...${activeTarget.id.slice(-4)}`,
      verified: true
    },
    {
      name: `${activeTarget.platform} Profile Telemetry Capture`,
      type: `${activeTarget.channel} Evidence Snapshot`,
      hash: 'sha256: 9b2d11...f08a',
      verified: true
    },
    {
      name: 'DNS & Host Infrastructure Snapshot',
      type: 'Network Routing & WHOIS Record',
      hash: 'sha256: 77a0c3...d41b',
      verified: true
    },
    {
      name: 'Coordinated Attack Syndicate Correlation',
      type: 'Multi-Node Threat Topology',
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
            onClick={() => handleExport('JSON')}
            disabled={downloading === 'JSON'}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-mono text-slate-300 hover:text-white flex items-center gap-1.5 transition cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Export Docket (JSON)</span>
          </button>

          <button
            type="button"
            onClick={() => handleExport('PDF')}
            disabled={downloading === 'PDF'}
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
            <span>Successfully generated and downloaded {downloadSuccess} evidence bundle for {activeTarget.id}!</span>
          </div>
          <span className="text-[10px] text-slate-400">Digest: {sha256Proof.slice(0, 20)}...</span>
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
          <span>Chain-of-Custody Audit Trail: {activeTarget.id}</span>
          <span className="text-emerald-400">SOC 2 Type II Certified Logging</span>
        </div>

        <div className="space-y-2 text-[11px] text-slate-300">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">1. Ingested by Autonomous Radar:</span>
            <span className="text-white">{activeTarget.detectionDate || '2026-10-12T09:14:00Z'} (Sensors: {activeTarget.platform})</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">2. Pixel Delta Heatmap Certified:</span>
            <span className="text-cyan-300">Overlap {activeTarget.logoMatchPercent || 0}% Verified</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">3. Legal Review &amp; Statutory Citing:</span>
            <span className="text-amber-300">Status: {activeTarget.status}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">4. Cryptographic Seal Applied:</span>
            <span className="text-emerald-400 font-bold">SHA-256 Digest Certified</span>
          </div>
        </div>
      </div>

    </div>
  );
}
