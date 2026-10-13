import React, { useState, useEffect } from 'react';
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

  // Multi-Theme State (Midnight Obsidian, Cyber Emerald, High-Tech Cyan, Clean Enterprise Light)
  const [currentTheme, setCurrentTheme] = useState(() => {
    return localStorage.getItem('brandguard_theme') || 'midnight';
  });

  const handleThemeChange = (newTheme) => {
    setCurrentTheme(newTheme);
    localStorage.setItem('brandguard_theme', newTheme);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', currentTheme);
  }, [currentTheme]);

  // Feed severity filter driven by StatsOverview or filters bar
  const [activeFilterSeverity, setActiveFilterSeverity] = useState('ALL');

  // Modals state
  const [selectedThreatForModal, setSelectedThreatForModal] = useState(null);
  const [selectedThreatForTakedown, setSelectedThreatForTakedown] = useState(null);
  const [isLiveScannerOpen, setIsLiveScannerOpen] = useState(false);

  // Initialize threats with calculated explainable risks
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
        logoMatchPercent: t.logoMatchPercent,
        channel: t.channel,
        suspectPublisher: t.suspectPublisher,
        officialApps: brand.officialApps,
        brand
      });
      return { ...t, calculatedRisk: risk };
    });
  });

  // Simulated autonomous surveillance sweep
  const handleTriggerScan = () => {
    setIsScanning(true);
    setScanToast('Autonomous sweep initiated across X, Instagram, Telegram, and App Store APIs...');

    setTimeout(() => {
      const freshThreat = {
        id: `THREAT-SWEEP-${Date.now().toString().slice(-4)}`,
        brandId: selectedBrand.id,
        platform: 'X (Twitter)',
        platformIcon: 'twitter',
        suspectName: `${selectedBrand.name} Emergency Relief Desk`,
        suspectHandle: `${selectedBrand.officialHandle}_InstantHelp`,
        avatarUrl: selectedBrand.logoUrl,
        suspectBio: 'Direct verification line for urgent refund claims, freeze appeals, and transaction dispute support. DM account ID.',
        suspectUrl: `https://${selectedBrand.officialDomain.split('.')[0]}-resolution.xyz`,
        postCaptions: ['Replying to customers: Send phone number in DM for instant ticket resolution.'],
        followersCount: 1150,
        accountAgeDays: 1,
        status: 'NEW',
        logoMatchPercent: 95,
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
        logoMatchPercent: freshThreat.logoMatchPercent,
        channel: freshThreat.channel,
        brand: selectedBrand
      });

      freshThreat.calculatedRisk = risk;

      setThreats(prev => [freshThreat, ...prev]);
      setIsScanning(false);
      setScanToast('Sweep complete: 1 new high-priority impersonation incident flagged!');
      setTimeout(() => setScanToast(null), 4000);
    }, 1600);
  };

  const handleUpdateStatus = (threatId, newStatus) => {
    setThreats(prev => prev.map(t => t.id === threatId ? { ...t, status: newStatus } : t));
  };

  const handleConfirmTakedown = (threatId) => {
    setThreats(prev => prev.map(t => t.id === threatId ? { ...t, status: 'TAKEDOWN_SENT' } : t));
    setScanToast('Notice officially dispatched! Platform webhook confirmed receipt.');
    setTimeout(() => setScanToast(null), 4000);
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
    setScanToast(`Brand "${brandObj.name}" registered and protected in Brand Vault!`);
    setTimeout(() => setScanToast(null), 3500);
  };

  return (
    <div 
      data-theme={currentTheme}
      className="min-h-screen flex flex-col font-sans transition-colors duration-200 selection:bg-[var(--accent-primary)] selection:text-white"
    >
      
      {/* Toast Notification Alert */}
      {scanToast && (
        <div className="fixed bottom-6 right-6 z-50 theme-glass text-[var(--text-main)] text-xs px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-[var(--border-accent)] animate-in fade-in slide-in-from-bottom-3 duration-200">
          <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent-primary)] animate-ping shrink-0"></span>
          <span className="font-medium">{scanToast}</span>
        </div>
      )}

      {/* Navigation Bar */}
      <Navbar
        brands={brands}
        selectedBrand={selectedBrand}
        onSelectBrand={setSelectedBrand}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onTriggerScan={handleTriggerScan}
        isScanning={isScanning}
        onOpenLiveScanner={() => setIsLiveScannerOpen(true)}
        currentTheme={currentTheme}
        onChangeTheme={handleThemeChange}
        threats={threats}
        onOpenAddBrand={() => setActiveTab('vault')}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* Dynamic Tab Views */}
        {activeTab === 'feed' && (
          <div>
            {/* Contextual Executive KPI Cards */}
            <StatsOverview 
              threats={threats} 
              selectedBrand={selectedBrand} 
              activeFilterSeverity={activeFilterSeverity}
              onFilterSeverityChange={setActiveFilterSeverity}
            />

            {/* Two-Column Threat Operations Stream & Live Forensics */}
            <ThreatFeed
              threats={threats}
              selectedBrand={selectedBrand}
              onSelectThreat={(threat) => setSelectedThreatForModal(threat)}
              onUpdateStatus={handleUpdateStatus}
              onOpenTakedownModal={(threat) => setSelectedThreatForTakedown(threat)}
              activeFilterSeverity={activeFilterSeverity}
              onFilterSeverityChange={setActiveFilterSeverity}
            />
          </div>
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

      {/* Executive Footer */}
      <footer className="border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] py-6 text-center text-xs text-[var(--text-muted)] transition-colors">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-extrabold font-mono text-[var(--text-main)]">BrandGuard.AI</span>
            <span>•</span>
            <span>Autonomous Digital Risk Protection & Remediation Console</span>
          </div>
          <p className="text-[11px] font-mono">
            HacXLerate 2026 byteXL Hackathon Solution • Problem Statement #3
          </p>
        </div>
      </footer>

    </div>
  );
}
