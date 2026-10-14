import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { BRANDS, INITIAL_THREATS } from '../data/mockData';
import TakedownEnforcementFunnel from '../components/legal/TakedownEnforcementFunnel';
import StatutoryAffidavitGenerator from '../components/legal/StatutoryAffidavitGenerator';
import PlatformDispatchConsole from '../components/legal/PlatformDispatchConsole';
import EnforcementVelocityChart from '../components/legal/EnforcementVelocityChart';
import PlatformDistributionDonut from '../components/legal/PlatformDistributionDonut';
import EvidentiaryAffidavitExporter from '../components/legal/EvidentiaryAffidavitExporter';
import { 
  Scale, 
  FileText, 
  Send, 
  CheckCircle2, 
  Clock, 
  TrendingDown, 
  PieChart as PieChartIcon, 
  FileCheck, 
  ShieldCheck, 
  LayoutGrid, 
  ChevronRight, 
  ArrowRight, 
  Zap, 
  Filter, 
  Smartphone, 
  Globe, 
  AtSign, 
  Lock, 
  ShieldAlert
} from 'lucide-react';

export default function LegalDashboard() {
  const { user, activeBrandId, loginAsRole } = useAuth();
  const { isDark } = useTheme();

  // Active brand entity
  const currentBrand = BRANDS.find(b => b.id === activeBrandId) || BRANDS[0];

  // Dashboard Module Toggle State
  // Options: 'funnel' | 'affidavit' | 'dispatch' | 'velocity' | 'donut' | 'exporter' | 'all'
  const [activeModule, setActiveModule] = useState('funnel');

  // Active case selection
  const [selectedCaseId, setSelectedCaseId] = useState('THREAT-101');

  // Brand-specific threats as legal cases
  const brandCases = useMemo(() => {
    return INITIAL_THREATS.filter(t => t.brandId === currentBrand.id);
  }, [currentBrand.id]);

  // Currently selected case object
  const activeCase = useMemo(() => {
    return brandCases.find(t => t.id === selectedCaseId) || brandCases[0] || INITIAL_THREATS[0];
  }, [brandCases, selectedCaseId]);

  // Dashboard Toggle Navigation Items - High Contrast Solid Badges
  const legalModules = [
    {
      id: 'funnel',
      name: 'Enforcement Stage Funnel',
      sublabel: 'Stage-Gate Pipeline & SLA',
      icon: Filter,
      badge: '91.4% Rate',
      badgeColor: isDark 
        ? 'border-emerald-500/40 bg-emerald-950/60 text-emerald-300' 
        : 'border-emerald-300 bg-emerald-100 text-emerald-900 font-bold shadow-xs'
    },
    {
      id: 'affidavit',
      name: 'Statutory Affidavit Builder',
      sublabel: 'DMCA & IT Rules Generator',
      icon: FileText,
      badge: 'Sealed',
      badgeColor: isDark 
        ? 'border-amber-500/40 bg-amber-950/60 text-amber-300' 
        : 'border-amber-300 bg-amber-100 text-amber-900 font-bold shadow-xs'
    },
    {
      id: 'dispatch',
      name: 'Platform API Dispatch Dock',
      sublabel: '1-Click Submission Gateways',
      icon: Send,
      badge: '4 Gateways',
      badgeColor: isDark 
        ? 'border-cyan-500/40 bg-cyan-950/60 text-cyan-300' 
        : 'border-sky-300 bg-sky-100 text-sky-900 font-bold shadow-xs'
    },
    {
      id: 'velocity',
      name: 'Takedown MTTR & Velocity',
      sublabel: '7-Day Resolution Curve',
      icon: TrendingDown,
      badge: '3.8h Avg',
      badgeColor: isDark 
        ? 'border-purple-500/40 bg-purple-950/60 text-purple-300' 
        : 'border-purple-300 bg-purple-100 text-purple-900 font-bold shadow-xs'
    },
    {
      id: 'donut',
      name: 'Platform Distribution (Donut)',
      sublabel: 'Enforcement Breakdown',
      icon: PieChartIcon,
      badge: '48% / 28% / 24%',
      badgeColor: isDark 
        ? 'border-blue-500/40 bg-blue-950/60 text-blue-300' 
        : 'border-blue-300 bg-blue-100 text-blue-900 font-bold shadow-xs'
    },
    {
      id: 'exporter',
      name: 'Evidentiary Docket & Seals',
      sublabel: 'Court-Admissible PDF & JSON',
      icon: FileCheck,
      badge: '4 Artifacts',
      badgeColor: isDark 
        ? 'border-emerald-500/40 bg-emerald-950/60 text-emerald-300' 
        : 'border-emerald-300 bg-emerald-100 text-emerald-900 font-bold shadow-xs'
    },
    {
      id: 'all',
      name: 'Unified Legal Command',
      sublabel: 'All-in-One Master View',
      icon: LayoutGrid,
      badge: 'Full Canvas',
      badgeColor: isDark 
        ? 'border-slate-600 bg-slate-900 text-slate-300' 
        : 'border-slate-300 bg-slate-100 text-slate-800 font-bold shadow-xs'
    }
  ];

  return (
    <div className="p-4 sm:p-6 max-w-[1740px] mx-auto space-y-5 animate-in fade-in duration-300 font-sans">
      
      {/* ============================================================ */}
      {/* TOP COMMAND HEADER & TELEMETRY STRIP                          */}
      {/* ============================================================ */}
      <div className={`p-5 rounded-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-4 transition-all duration-300 ${
        isDark 
          ? 'bg-[#071120]/90 backdrop-blur-xl border border-amber-500/30 shadow-2xl' 
          : 'bg-white border border-slate-300 shadow-sm'
      }`}>
        <div>
          <div className={`inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-mono font-bold mb-2 transition ${
            isDark 
              ? 'bg-amber-950/60 border border-amber-500/40 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.2)]'
              : 'bg-amber-100 border border-amber-300 text-amber-950 shadow-xs'
          }`}>
            <Scale className={`w-3.5 h-3.5 ${isDark ? 'text-amber-400' : 'text-amber-700'}`} />
            <span>ROLE 2: LEGAL COUNSEL &amp; TAKEDOWN DESK (/legal)</span>
          </div>
          <h1 className={`text-2xl sm:text-3xl font-black tracking-tight flex items-center gap-3 ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}>
            <span>Statutory Enforcement &amp; Platform Takedown Command</span>
            <span className={`text-xs px-2.5 py-1 rounded-full font-mono font-semibold transition ${
              isDark 
                ? 'bg-amber-950/60 border border-amber-500/40 text-amber-300' 
                : 'bg-amber-100 border border-amber-300 text-amber-950 shadow-xs font-bold'
            }`}>
              Tenant: {currentBrand.name}
            </span>
          </h1>
          <p className={`text-sm sm:text-base mt-1.5 max-w-3xl leading-relaxed ${
            isDark ? 'text-slate-300' : 'text-slate-600'
          }`}>
            Logged in as <strong>{user?.name || 'Sarah Vance'}</strong> (Head of Legal). Review pre-compiled statutory affidavits citing Rule 3(2)(b) of the Indian IT Rules (2021) and DMCA §512 for 1-click platform API dispatch.
          </p>
        </div>

        {/* Legal Telemetry Indicators */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
          <div className={`p-3.5 rounded-xl border text-center min-w-[110px] transition ${
            isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200 shadow-xs'
          }`}>
            <div className={`text-xl font-bold font-mono ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>12 Cases</div>
            <div className={`text-xs uppercase font-bold flex items-center justify-center gap-1.5 mt-0.5 ${
              isDark ? 'text-slate-400' : 'text-slate-600'
            }`}>
              <FileText className={`w-3 h-3 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} /> Active Docket
            </div>
          </div>

          <div className={`p-3.5 rounded-xl border text-center min-w-[110px] transition ${
            isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200 shadow-xs'
          }`}>
            <div className={`text-xl font-bold font-mono ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>3.8 Hours</div>
            <div className={`text-xs uppercase font-bold flex items-center justify-center gap-1.5 mt-0.5 ${
              isDark ? 'text-slate-400' : 'text-slate-600'
            }`}>
              <Clock className={`w-3 h-3 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`} /> MTTR Velocity
            </div>
          </div>

          <div className={`p-3.5 rounded-xl border text-center min-w-[110px] transition ${
            isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200 shadow-xs'
          }`}>
            <div className={`text-xl font-bold font-mono ${isDark ? 'text-cyan-400' : 'text-blue-700'}`}>91.4%</div>
            <div className={`text-xs uppercase font-bold flex items-center justify-center gap-1.5 mt-0.5 ${
              isDark ? 'text-slate-400' : 'text-slate-600'
            }`}>
              <CheckCircle2 className={`w-3 h-3 ${isDark ? 'text-cyan-400' : 'text-blue-600'}`} /> Delist Rate
            </div>
          </div>

          <div className={`p-3.5 rounded-xl border text-center min-w-[110px] transition ${
            isDark ? 'bg-slate-950/80 border-slate-800' : 'bg-slate-50 border-slate-200 shadow-xs'
          }`}>
            <div className={`text-xl font-bold font-mono ${isDark ? 'text-purple-400' : 'text-purple-700'}`}>&lt; 60 sec</div>
            <div className={`text-xs uppercase font-bold flex items-center justify-center gap-1.5 mt-0.5 ${
              isDark ? 'text-slate-400' : 'text-slate-600'
            }`}>
              <Zap className={`w-3 h-3 ${isDark ? 'text-purple-400' : 'text-purple-600'}`} /> API Dispatch
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2-SECTION WORKSPACE: DASHBOARD TOGGLE (LEFT) + WORKSPACE (RIGHT) */}
      {/* ============================================================ */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        
        {/* ========================================================== */}
        {/* LEFT: LEGAL DASHBOARD MODULE TOGGLE DRAWER (~390px - NO TRUNCATION) */}
        {/* ========================================================== */}
        <div className="w-full lg:w-[390px] shrink-0 space-y-4">
          
          <div className={`p-4 rounded-2xl transition-all duration-300 ${
            isDark 
              ? 'bg-[#071120]/90 backdrop-blur-xl border border-amber-500/30 shadow-2xl' 
              : 'bg-white border border-slate-300 shadow-sm'
          }`}>
            <div className={`flex items-center justify-between pb-3 border-b mb-3 ${
              isDark ? 'border-slate-800/80' : 'border-slate-200'
            }`}>
              <div className="flex items-center gap-2">
                <Scale className={`w-4 h-4 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
                <h2 className={`text-xs font-mono font-bold uppercase tracking-wider ${
                  isDark ? 'text-amber-300' : 'text-slate-900'
                }`}>
                  Legal Desk Modules
                </h2>
              </div>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold border ${
                isDark 
                  ? 'bg-slate-900 border-slate-800 text-slate-400' 
                  : 'bg-slate-100 border-slate-300 text-slate-700'
              }`}>
                7 Views
              </span>
            </div>

            {/* Navigation Toggle Buttons List */}
            <div className="space-y-1.5">
              {legalModules.map((mod) => {
                const Icon = mod.icon;
                const isActive = activeModule === mod.id;

                return (
                  <button
                    key={mod.id}
                    type="button"
                    onClick={() => setActiveModule(mod.id)}
                    className={`w-full p-3 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer group ${
                      isActive
                        ? isDark
                          ? 'bg-gradient-to-r from-amber-950/60 to-slate-900 border-amber-400 shadow-[0_0_16px_rgba(245,158,11,0.25)] text-white'
                          : 'bg-amber-50 border-amber-600 text-amber-950 shadow-xs ring-1 ring-amber-500/50'
                        : isDark
                        ? 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:bg-slate-900/60 hover:text-slate-200 hover:border-slate-700'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`p-2 rounded-lg border shrink-0 transition-colors ${
                        isActive
                          ? isDark
                            ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                            : 'bg-amber-600 border-amber-600 text-white shadow-xs'
                          : isDark
                          ? 'bg-slate-900 border-slate-800 text-slate-400 group-hover:text-amber-400'
                          : 'bg-slate-100 border-slate-200 text-slate-600 group-hover:text-amber-600'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className={`text-xs font-bold ${
                          isActive 
                            ? isDark ? 'text-white' : 'text-amber-950' 
                            : isDark ? 'text-slate-300' : 'text-slate-800'
                        }`}>
                          {mod.name}
                        </div>
                        <div className={`text-[10px] ${
                          isDark ? 'text-slate-500' : 'text-slate-500 font-medium'
                        }`}>
                          {mod.sublabel}
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-1.5 ml-2">
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border font-semibold ${mod.badgeColor}`}>
                        {mod.badge}
                      </span>
                      <ChevronRight className={`w-3.5 h-3.5 transition-transform ${
                        isActive 
                          ? isDark ? 'text-amber-400 translate-x-0.5' : 'text-amber-600 translate-x-0.5' 
                          : 'text-slate-400'
                      }`} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ACTIVE CASE SELECTOR QUICK CARD */}
          <div className={`p-4 rounded-2xl transition-all duration-300 space-y-2.5 ${
            isDark 
              ? 'bg-[#071120]/90 backdrop-blur-xl border border-amber-500/30 shadow-2xl' 
              : 'bg-white border border-slate-300 shadow-sm'
          }`}>
            <div className="flex items-center justify-between">
              <span className={`text-[11px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                isDark ? 'text-amber-300' : 'text-slate-900'
              }`}>
                <FileText className={`w-3.5 h-3.5 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} /> Active Legal Docket
              </span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold border ${
                isDark 
                  ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-300' 
                  : 'bg-emerald-100 border-emerald-300 text-emerald-950 shadow-xs'
              }`}>
                {activeCase.id}
              </span>
            </div>

            <select
              value={selectedCaseId}
              onChange={(e) => setSelectedCaseId(e.target.value)}
              className={`w-full rounded-xl px-3 py-2 text-xs focus:outline-none cursor-pointer font-mono border transition ${
                isDark 
                  ? 'bg-slate-950 border-slate-800 text-white focus:border-amber-500' 
                  : 'bg-white border-slate-300 text-slate-900 focus:border-amber-600 shadow-xs font-semibold'
              }`}
            >
              {brandCases.map((t) => (
                <option key={t.id} value={t.id}>
                  [{t.id}] {t.suspectHandle} ({t.channel})
                </option>
              ))}
            </select>

            <div className={`p-2.5 rounded-xl border text-[11px] font-mono space-y-1 ${
              isDark ? 'bg-slate-950/70 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
            }`}>
              <div className={`font-bold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{activeCase.suspectName}</div>
              <div className={`flex items-center justify-between text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                <span>Platform: {activeCase.platform}</span>
                <span className={`font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>Evidence: Sealed</span>
              </div>
            </div>
          </div>

          {/* QUICK ROLE JUMP BAR */}
          <div className={`p-3.5 rounded-xl border flex items-center justify-between text-xs font-mono transition ${
            isDark ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <span className={isDark ? 'text-slate-400' : 'text-slate-600'}>Other Roles:</span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => loginAsRole('analyst')}
                className={`px-2 py-1 rounded border transition cursor-pointer text-[10px] font-bold ${
                  isDark ? 'bg-cyan-950 text-cyan-300 border-cyan-500/40 hover:bg-cyan-900' : 'bg-sky-100 text-sky-950 border-sky-300 hover:bg-sky-200 shadow-xs'
                }`}
              >
                Analyst
              </button>
              <button
                type="button"
                onClick={() => loginAsRole('support')}
                className={`px-2 py-1 rounded border transition cursor-pointer text-[10px] font-bold ${
                  isDark ? 'bg-blue-950 text-blue-300 border-blue-500/40 hover:bg-blue-900' : 'bg-blue-100 text-blue-950 border-blue-300 hover:bg-blue-200 shadow-xs'
                }`}
              >
                Support
              </button>
              <button
                type="button"
                onClick={() => loginAsRole('ciso')}
                className={`px-2 py-1 rounded border transition cursor-pointer text-[10px] font-bold ${
                  isDark ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40 hover:bg-emerald-900' : 'bg-emerald-100 text-emerald-950 border-emerald-300 hover:bg-emerald-200 shadow-xs'
                }`}
              >
                CISO
              </button>
            </div>
          </div>

        </div>

        {/* ========================================================== */}
        {/* RIGHT: DYNAMIC WORKSPACE CANVAS (FLEX-1)                    */}
        {/* ========================================================== */}
        <div className="flex-1 w-full min-w-0 space-y-4">
          
          {/* Breadcrumb / Context Ribbon */}
          <div className={`p-3.5 rounded-xl border shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs font-mono transition ${
            isDark 
              ? 'bg-[#071120]/90 backdrop-blur-xl border-amber-500/20' 
              : 'bg-white border-slate-300'
          }`}>
            <div className="flex items-center gap-2">
              <span className={isDark ? 'text-slate-500' : 'text-slate-400'}>Legal Enforcement</span>
              <span className={isDark ? 'text-slate-600' : 'text-slate-300'}>/</span>
              <span className={`font-bold ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>
                {legalModules.find(m => m.id === activeModule)?.name}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className={`flex items-center gap-1.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                <span>Active Target:</span>
                <span className={`font-bold px-2 py-0.5 rounded border font-mono ${
                  isDark ? 'text-white bg-slate-900 border-slate-800' : 'text-slate-900 bg-slate-100 border-slate-300'
                }`}>
                  {activeCase.suspectHandle}
                </span>
              </div>
              <div className={`h-4 w-px ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />
              <button
                type="button"
                onClick={() => loginAsRole('analyst')}
                className={`px-2.5 py-1 rounded-lg border transition flex items-center gap-1 cursor-pointer font-bold ${
                  isDark 
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 hover:bg-cyan-500/30' 
                    : 'bg-sky-100 text-sky-950 border-sky-300 hover:bg-sky-200 shadow-xs'
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Return to SOC Analyst</span>
              </button>
            </div>
          </div>

          {/* DYNAMIC VIEW ROUTING: SHOW ONLY THE SELECTED COMPONENT */}
          <div className="transition-all duration-300">
            
            {/* 1. ENFORCEMENT STAGE FUNNEL */}
            {activeModule === 'funnel' && (
              <div className="space-y-4">
                <TakedownEnforcementFunnel />
              </div>
            )}

            {/* 2. STATUTORY AFFIDAVIT BUILDER */}
            {activeModule === 'affidavit' && (
              <div className="space-y-4">
                <StatutoryAffidavitGenerator threat={activeCase} brand={currentBrand} />
              </div>
            )}

            {/* 3. PLATFORM API DISPATCH DOCK */}
            {activeModule === 'dispatch' && (
              <div className="space-y-4">
                <PlatformDispatchConsole threat={activeCase} brand={currentBrand} />
              </div>
            )}

            {/* 4. TAKEDOWN MTTR & VELOCITY */}
            {activeModule === 'velocity' && (
              <div className="space-y-4">
                <EnforcementVelocityChart />
              </div>
            )}

            {/* 5. PLATFORM DISTRIBUTION (DONUT) */}
            {activeModule === 'donut' && (
              <div className="space-y-4">
                <PlatformDistributionDonut />
              </div>
            )}

            {/* 6. EVIDENTIARY DOCKET & SEALS */}
            {activeModule === 'exporter' && (
              <div className="space-y-4">
                <EvidentiaryAffidavitExporter threat={activeCase} brand={currentBrand} />
              </div>
            )}

            {/* 7. UNIFIED LEGAL COMMAND MATRIX */}
            {activeModule === 'all' && (
              <div className="space-y-6">
                <TakedownEnforcementFunnel />
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                  <StatutoryAffidavitGenerator threat={activeCase} brand={currentBrand} />
                  <PlatformDispatchConsole threat={activeCase} brand={currentBrand} />
                </div>
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                  <EnforcementVelocityChart />
                  <PlatformDistributionDonut />
                </div>
                <EvidentiaryAffidavitExporter threat={activeCase} brand={currentBrand} />
              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}
