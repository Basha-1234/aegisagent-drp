import React, { useState, useMemo } from 'react';
import Navbar from './components/Navbar';
import StatsOverview from './components/StatsOverview';
import ThreatFeed from './components/ThreatFeed';
import ThreatInspectorModal from './components/ThreatInspectorModal';
import TakedownModal from './components/TakedownModal';
import LiveScanModal from './components/LiveScanModal';
import BrandVault from './components/BrandVault';
import TakedownDesk from './components/TakedownDesk';
import AnalyticsView from './components/AnalyticsView';

import { BRANDS, INITIAL_THREATS } from './data/mockData';
import { calculateExplainableRisk } from './utils/detectionEngine';

export default function App() {
  const [brands, setBrands] = useState(BRANDS);
  const [selectedBrand, setSelectedBrand] = useState(BRANDS[0]);
  const [activeTab, setActiveTab] = useState('feed');
  const [isScanning, setIsScanning] = useState(false);
  const [scanToast, setScanToast] = useState(null);

  // Modals state
  const [selectedThreatForModal, setSelectedThreatForModal] = useState(null);
  const [selectedThreatForTakedown, setSelectedThreatForTakedown] = useState(null);
  const [isLiveScannerOpen, setIsLiveScannerOpen] = useState(false);

  // Initialize threats with calculated risks
  const [threats, setThreats] = useState(() => {
    return INITIAL_THREATS.map(t => {
      const brand = BRANDS.find(b => b.id === t.brandId) || BRANDS[0];
      const risk = calculateExplainableRisk({
        suspectHandle: t.suspectHandle,
        officialHandle: brand.officialHandle,
        suspectBio: t.suspectBio,
        postCaptions: t.postCaptions,
        suspectUrl: t.suspectUrl,
        officialDomain: brand.officialDomain,
        logoMatchPercent: t.logoMatchPercent
      });
      return { ...t, calculatedRisk: risk };
    });
  });

  // Trigger simulated surveillance sweep
  const handleTriggerScan = () => {
    setIsScanning(true);
    setScanToast('Autonomous sweep initiated across X, Instagram, and App Store APIs...');

    setTimeout(() => {
      // Simulate finding a fresh suspicious handle
      const freshThreat = {
        id: `THREAT-SWEEP-${Date.now().toString().slice(-4)}`,
        brandId: selectedBrand.id,
        platform: 'X (Twitter)',
        platformIcon: 'twitter',
        suspectName: `${selectedBrand.name} Emergency Relief`,
        suspectHandle: `${selectedBrand.officialHandle}_HelpDesk_Instant`,
        avatarUrl: selectedBrand.logoUrl,
        suspectBio: 'Direct support line for urgent refund claims and frozen account verification. DM account ID.',
        suspectUrl: `https://${selectedBrand.officialDomain.split('.')[0]}-resolution.xyz`,
        postCaptions: ['Replying to customers: DM for instant refund processing.'],
        followersCount: 840,
        accountAgeDays: 1,
        status: 'NEW',
        logoMatchPercent: 94,
        detectionDate: new Date().toISOString(),
        channel: 'Social Profile'
      };

      const risk = calculateExplainableRisk({
        suspectHandle: freshThreat.suspectHandle,
        officialHandle: selectedBrand.officialHandle,
        suspectBio: freshThreat.suspectBio,
        postCaptions: freshThreat.postCaptions,
        suspectUrl: freshThreat.suspectUrl,
        officialDomain: selectedBrand.officialDomain,
        logoMatchPercent: freshThreat.logoMatchPercent
      });

      freshThreat.calculatedRisk = risk;

      setThreats(prev => [freshThreat, ...prev]);
      setIsScanning(false);
      setScanToast('Sweep complete! 1 new high-priority impersonation threat detected.');
      setTimeout(() => setScanToast(null), 4000);
    }, 1800);
  };

  const handleUpdateStatus = (threatId, newStatus) => {
    setThreats(prev => prev.map(t => t.id === threatId ? { ...t, status: newStatus } : t));
  };

  const handleConfirmTakedown = (threatId) => {
    setThreats(prev => prev.map(t => t.id === threatId ? { ...t, status: 'TAKEDOWN_SENT' } : t));
  };

  const handleAddCustomThreat = (threatObj) => {
    setThreats(prev => [threatObj, ...prev]);
    setScanToast(`Live incident "${threatObj.suspectHandle}" ingested into active feed.`);
    setTimeout(() => setScanToast(null), 3500);
  };

  const handleAddNewBrand = (brandObj) => {
    setBrands(prev => [...prev, brandObj]);
    setSelectedBrand(brandObj);
    setActiveTab('feed');
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/20 selection:text-cyan-300">
      
      {/* Toast Alert */}
      {scanToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-cyan-500/50 text-cyan-300 text-xs px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
          <span>{scanToast}</span>
        </div>
      )}

      {/* Navigation */}
      <Navbar
        brands={brands}
        selectedBrand={selectedBrand}
        onSelectBrand={setSelectedBrand}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onTriggerScan={handleTriggerScan}
        isScanning={isScanning}
        onOpenLiveScanner={() => setIsLiveScannerOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* KPI Summary Cards */}
        <StatsOverview threats={threats} selectedBrand={selectedBrand} />

        {/* Dynamic Tab Views */}
        {activeTab === 'feed' && (
          <ThreatFeed
            threats={threats}
            selectedBrand={selectedBrand}
            onSelectThreat={(threat) => setSelectedThreatForModal(threat)}
            onUpdateStatus={handleUpdateStatus}
            onOpenTakedownModal={(threat) => setSelectedThreatForTakedown(threat)}
          />
        )}

        {activeTab === 'vault' && (
          <BrandVault
            selectedBrand={selectedBrand}
            brands={brands}
            onAddNewBrand={handleAddNewBrand}
          />
        )}

        {activeTab === 'takedowns' && (
          <TakedownDesk
            threats={threats}
            selectedBrand={selectedBrand}
            onOpenTakedownModal={(threat) => setSelectedThreatForTakedown(threat)}
            onUpdateStatus={handleUpdateStatus}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsView
            threats={threats}
            selectedBrand={selectedBrand}
          />
        )}

      </main>

      {/* Modals */}
      {selectedThreatForModal && (
        <ThreatInspectorModal
          threat={selectedThreatForModal}
          brand={selectedBrand}
          onClose={() => setSelectedThreatForModal(null)}
          onOpenTakedown={(threat) => setSelectedThreatForTakedown(threat)}
        />
      )}

      {selectedThreatForTakedown && (
        <TakedownModal
          threat={selectedThreatForTakedown}
          brand={selectedBrand}
          onClose={() => setSelectedThreatForTakedown(null)}
          onConfirmTakedown={handleConfirmTakedown}
        />
      )}

      {isLiveScannerOpen && (
        <LiveScanModal
          brand={selectedBrand}
          onClose={() => setIsLiveScannerOpen(false)}
          onAddCustomThreat={handleAddCustomThreat}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/60 py-6 text-center text-xs text-slate-500">
        <p>BrandGuard AI • HacXLerate 2026 byteXL Hackathon Solution • Problem Statement #3</p>
      </footer>

    </div>
  );
}
