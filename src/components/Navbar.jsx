import React from 'react';
import { Shield, ShieldAlert, Activity, FileCheck, Database, Search, RefreshCw, BarChart3, ChevronDown } from 'lucide-react';

export default function Navbar({
  brands,
  selectedBrand,
  onSelectBrand,
  activeTab,
  setActiveTab,
  onTriggerScan,
  isScanning,
  onOpenLiveScanner
}) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand Identity */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('feed')}>
              <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/20">
                <Shield className="w-5 h-5 text-white" />
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold tracking-tight text-white font-mono">BrandGuard<span className="text-cyan-400">.AI</span></span>
                  <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800/60">DRP Engine v2.4</span>
                </div>
                <p className="text-[11px] text-slate-400 hidden sm:block">Digital Risk Protection & Impersonation Defense</p>
              </div>
            </div>

            {/* Brand Switcher */}
            <div className="relative hidden md:block">
              <label className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5 tracking-wider">Active Protected Brand</label>
              <div className="relative">
                <select
                  value={selectedBrand.id}
                  onChange={(e) => onSelectBrand(brands.find(b => b.id === e.target.value))}
                  className="appearance-none bg-slate-900 border border-slate-700/80 text-white text-xs rounded-lg pl-3 pr-8 py-1.5 focus:outline-none focus:ring-1 focus:ring-cyan-500 cursor-pointer font-medium"
                >
                  {brands.map((brand) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name} ({brand.officialHandle})
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('feed')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'feed'
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              Threat Feed
            </button>

            <button
              onClick={() => setActiveTab('vault')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'vault'
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              Brand Vault
            </button>

            <button
              onClick={() => setActiveTab('takedowns')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'takedowns'
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <FileCheck className="w-3.5 h-3.5" />
              Takedown Desk
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'analytics'
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              Analytics
            </button>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={onOpenLiveScanner}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-all shadow-sm"
              title="Test custom suspect profile or URL"
            >
              <Search className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Live Inspector</span>
            </button>

            <button
              onClick={onTriggerScan}
              disabled={isScanning}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white transition-all shadow-md ${
                isScanning
                  ? 'bg-cyan-800 cursor-not-allowed opacity-80'
                  : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-cyan-500/20 active:scale-95'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
              <span>{isScanning ? 'Surveillance Active...' : 'Simulate Feed Scan'}</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}
