import React, { useState } from 'react';
import { 
  Shield, 
  ShieldAlert, 
  Database, 
  FileCheck, 
  BarChart3, 
  Search, 
  RefreshCw, 
  ChevronDown, 
  Palette, 
  Check, 
  Menu, 
  X,
  Plus,
  Sun,
  Moon,
  Zap
} from 'lucide-react';

export default function Navbar({
  brands,
  selectedBrand,
  onSelectBrand,
  activeTab,
  setActiveTab,
  onTriggerScan,
  isScanning,
  onOpenLiveScanner,
  currentTheme = 'midnight',
  onChangeTheme,
  threats = [],
  onOpenAddBrand
}) {
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const [isBrandMenuOpen, setIsBrandMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Active counts for the current brand
  const brandThreats = threats.filter(t => t.brandId === selectedBrand.id);
  const activeAlertsCount = brandThreats.filter(t => t.status === 'NEW' || t.status === 'INVESTIGATING').length;
  const takedownsCount = brandThreats.filter(t => t.status === 'TAKEDOWN_SENT' || t.status === 'RESOLVED').length;

  const themes = [
    { id: 'midnight', name: 'Midnight Obsidian', icon: Moon, desc: 'Deep OLED black with violet & cyber glow' },
    { id: 'emerald', name: 'Cyber Emerald', icon: Shield, desc: 'Tactical SOC dark with emerald accents' },
    { id: 'cyan', name: 'High-Tech Cyan', icon: Zap, desc: 'Electric aerospace blue & cyan defense' },
    { id: 'light', name: 'Enterprise Light', icon: Sun, desc: 'Pristine, high-contrast modern SaaS' }
  ];

  const currentThemeObj = themes.find(t => t.id === currentTheme) || themes[0];
  const CurrentThemeIcon = currentThemeObj.icon;

  return (
    <header className="sticky top-0 z-40 w-full theme-glass border-b transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* Left: Brand Identity & Active Brand Quick-Switcher */}
          <div className="flex items-center gap-3 md:gap-5 min-w-0">
            {/* Logo */}
            <div 
              className="flex items-center gap-2.5 cursor-pointer shrink-0 group" 
              onClick={() => setActiveTab('feed')}
            >
              <div className="relative flex items-center justify-center w-9 h-9 rounded-xl theme-btn-primary shadow-lg transition-transform group-hover:scale-105">
                <Shield className="w-4.5 h-4.5 text-white" />
                <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
                </span>
              </div>
              <div className="hidden sm:block">
                <div className="flex items-center gap-2">
                  <span className="text-base font-extrabold tracking-tight font-mono text-[var(--text-main)]">
                    BrandGuard<span className="text-[var(--accent-primary)]">.AI</span>
                  </span>
                  <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-full theme-badge-accent font-mono">
                    SOC v2.5
                  </span>
                </div>
              </div>
            </div>

            {/* Vertical Divider */}
            <div className="hidden md:block w-px h-6 bg-[var(--border-subtle)]" />

            {/* Brand Switcher Popover */}
            <div className="relative">
              <button
                onClick={() => setIsBrandMenuOpen(!isBrandMenuOpen)}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-[var(--border-strong)] transition-all text-left group"
              >
                <img 
                  src={selectedBrand.logoUrl} 
                  alt={selectedBrand.name} 
                  className="w-5 h-5 rounded-lg object-cover border border-[var(--border-subtle)] shrink-0" 
                />
                <div className="hidden sm:block max-w-[130px] lg:max-w-[160px] truncate">
                  <div className="text-xs font-bold text-[var(--text-main)] truncate leading-tight">
                    {selectedBrand.name}
                  </div>
                  <div className="text-[10px] text-[var(--text-muted)] font-mono truncate leading-none mt-0.5">
                    {selectedBrand.officialHandle}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-[var(--text-muted)] group-hover:text-[var(--text-main)] transition-colors shrink-0" />
              </button>

              {/* Brand Dropdown Menu */}
              {isBrandMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsBrandMenuOpen(false)} />
                  <div className="absolute left-0 top-full mt-2 w-72 rounded-2xl theme-card border border-[var(--border-strong)] p-2 z-50 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-2 text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider border-b border-[var(--border-subtle)] mb-1 flex items-center justify-between">
                      <span>Monitored Brand Vault</span>
                      <span className="font-mono text-[var(--accent-primary)]">{brands.length} Protected</span>
                    </div>

                    <div className="space-y-1 max-h-64 overflow-y-auto">
                      {brands.map((b) => {
                        const isCurrent = b.id === selectedBrand.id;
                        const bThreats = threats.filter(t => t.brandId === b.id);
                        return (
                          <button
                            key={b.id}
                            onClick={() => {
                              onSelectBrand(b);
                              setIsBrandMenuOpen(false);
                            }}
                            className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-all ${
                              isCurrent 
                                ? 'bg-[var(--accent-light)] border border-[var(--border-accent)]' 
                                : 'hover:bg-[var(--bg-surface-hover)]'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <img 
                                src={b.logoUrl} 
                                alt={b.name} 
                                className="w-8 h-8 rounded-lg object-cover border border-[var(--border-subtle)] shrink-0" 
                              />
                              <div className="min-w-0">
                                <div className="text-xs font-bold text-[var(--text-main)] truncate">
                                  {b.name}
                                </div>
                                <div className="text-[10px] text-[var(--text-muted)] font-mono truncate">
                                  {b.officialHandle}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0 pl-2">
                              {bThreats.length > 0 && (
                                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/30">
                                  {bThreats.length}
                                </span>
                              )}
                              {isCurrent && <Check className="w-4 h-4 text-[var(--accent-primary)]" />}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {onOpenAddBrand && (
                      <div className="pt-1 mt-1 border-t border-[var(--border-subtle)]">
                        <button
                          onClick={() => {
                            setIsBrandMenuOpen(false);
                            onOpenAddBrand();
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-[var(--accent-primary)] hover:bg-[var(--accent-light)] transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Register New Brand Identity</span>
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Center: Navigation Tabs (Desktop & Tablet) */}
          <nav className="hidden lg:flex items-center gap-1 bg-[var(--bg-input)] p-1 rounded-2xl border border-[var(--border-subtle)]">
            <button
              onClick={() => setActiveTab('feed')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'feed'
                  ? 'theme-btn-primary'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface-hover)]'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Threat Ops</span>
              {activeAlertsCount > 0 && (
                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full ${
                  activeTab === 'feed' 
                    ? 'bg-white/20 text-white' 
                    : 'bg-red-500/20 text-red-400 border border-red-500/30'
                }`}>
                  {activeAlertsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('vault')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'vault'
                  ? 'theme-btn-primary'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface-hover)]'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>Asset Vault</span>
            </button>

            <button
              onClick={() => setActiveTab('takedowns')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'takedowns'
                  ? 'theme-btn-primary'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface-hover)]'
              }`}
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>Takedown Desk</span>
              {takedownsCount > 0 && (
                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full ${
                  activeTab === 'takedowns'
                    ? 'bg-white/20 text-white'
                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                }`}>
                  {takedownsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'analytics'
                  ? 'theme-btn-primary'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-surface-hover)]'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Intelligence</span>
            </button>
          </nav>

          {/* Right: Theme Selector, Sandbox & Scan CTAs */}
          <div className="flex items-center gap-2">
            
            {/* Theme Switcher Button */}
            <div className="relative">
              <button
                onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-[var(--border-strong)] text-[var(--text-secondary)] text-xs font-medium transition-all"
                title={`Active Theme: ${currentThemeObj.name}`}
              >
                <CurrentThemeIcon className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
                <span className="hidden xl:inline text-[11px] font-medium">{currentThemeObj.name}</span>
                <ChevronDown className="w-3 h-3 text-[var(--text-muted)]" />
              </button>

              {/* Theme Dropdown Menu */}
              {isThemeMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsThemeMenuOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl theme-card border border-[var(--border-strong)] p-2 z-50 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-3 py-1.5 text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider border-b border-[var(--border-subtle)] mb-1 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Palette className="w-3 h-3 text-[var(--accent-primary)]" />
                        Theme System
                      </span>
                      <span className="font-mono text-[10px]">4 Presets</span>
                    </div>

                    <div className="space-y-1">
                      {themes.map((t) => {
                        const Icon = t.icon;
                        const isSelected = t.id === currentTheme;
                        return (
                          <button
                            key={t.id}
                            onClick={() => {
                              onChangeTheme(t.id);
                              setIsThemeMenuOpen(false);
                            }}
                            className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-all ${
                              isSelected 
                                ? 'bg-[var(--accent-light)] border border-[var(--border-accent)]' 
                                : 'hover:bg-[var(--bg-surface-hover)]'
                            }`}
                          >
                            <div className="flex items-start gap-2.5">
                              <div className="p-1.5 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] mt-0.5">
                                <Icon className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
                              </div>
                              <div>
                                <div className="text-xs font-bold text-[var(--text-main)]">
                                  {t.name}
                                </div>
                                <div className="text-[10px] text-[var(--text-muted)] leading-tight">
                                  {t.desc}
                                </div>
                              </div>
                            </div>
                            {isSelected && <Check className="w-4 h-4 text-[var(--accent-primary)] shrink-0 ml-2" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Live Sandbox Trigger */}
            <button
              onClick={onOpenLiveScanner}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-[var(--border-strong)] text-[var(--text-secondary)] hover:text-[var(--text-main)] text-xs font-medium transition-all shadow-sm"
              title="Test custom suspect profile or URL"
            >
              <Search className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
              <span>Live Sandbox</span>
            </button>

            {/* Simulated Surveillance Sweep Trigger */}
            <button
              onClick={onTriggerScan}
              disabled={isScanning}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 ${
                isScanning
                  ? 'bg-slate-700/60 cursor-not-allowed opacity-80 text-white'
                  : 'theme-btn-primary'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{isScanning ? 'Sweeping...' : 'Surveillance Sweep'}</span>
              <span className="sm:hidden">{isScanning ? 'Scan...' : 'Scan'}</span>
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-1.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-muted)] hover:text-[var(--text-main)]"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 py-3 space-y-2 animate-in slide-in-from-top-2 duration-150">
          <div className="grid grid-cols-2 gap-1.5 pb-2 border-b border-[var(--border-subtle)]">
            <button
              onClick={() => {
                setActiveTab('feed');
                setIsMobileMenuOpen(false);
              }}
              className={`flex items-center gap-2 p-2 rounded-xl text-xs font-semibold ${
                activeTab === 'feed' ? 'theme-btn-primary' : 'hover:bg-[var(--bg-surface-hover)] text-[var(--text-secondary)]'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Threat Ops ({activeAlertsCount})</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('vault');
                setIsMobileMenuOpen(false);
              }}
              className={`flex items-center gap-2 p-2 rounded-xl text-xs font-semibold ${
                activeTab === 'vault' ? 'theme-btn-primary' : 'hover:bg-[var(--bg-surface-hover)] text-[var(--text-secondary)]'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>Asset Vault</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('takedowns');
                setIsMobileMenuOpen(false);
              }}
              className={`flex items-center gap-2 p-2 rounded-xl text-xs font-semibold ${
                activeTab === 'takedowns' ? 'theme-btn-primary' : 'hover:bg-[var(--bg-surface-hover)] text-[var(--text-secondary)]'
              }`}
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>Takedowns ({takedownsCount})</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('analytics');
                setIsMobileMenuOpen(false);
              }}
              className={`flex items-center gap-2 p-2 rounded-xl text-xs font-semibold ${
                activeTab === 'analytics' ? 'theme-btn-primary' : 'hover:bg-[var(--bg-surface-hover)] text-[var(--text-secondary)]'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Intelligence</span>
            </button>
          </div>

          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              onOpenLiveScanner();
            }}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-[var(--border-subtle)] text-xs font-semibold text-[var(--text-main)]"
          >
            <Search className="w-3.5 h-3.5 text-[var(--accent-primary)]" />
            <span>Open Live Sandbox Inspector</span>
          </button>
        </div>
      )}
    </header>
  );
}
