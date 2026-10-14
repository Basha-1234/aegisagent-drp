import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
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

  // Dashboard Toggle Navigation Items
  const legalModules = [
    {
      id: 'funnel',
      name: 'Enforcement Stage Funnel',
      sublabel: 'Stage-Gate Pipeline & SLA',
      icon: Filter,
      badge: '91.4% Rate',
      badgeColor: 'border-emerald-500/40 bg-emerald-950/60 text-emerald-300'
    },
    {
      id: 'affidavit',
      name: 'Statutory Affidavit Builder',
      sublabel: 'DMCA & IT Rules Generator',
      icon: FileText,
      badge: 'Sealed',
      badgeColor: 'border-amber-500/40 bg-amber-950/60 text-amber-300'
    },
    {
      id: 'dispatch',
      name: 'Platform API Dispatch Dock',
      sublabel: '1-Click Submission Gateways',
      icon: Send,
      badge: '4 Gateways',
      badgeColor: 'border-cyan-500/40 bg-cyan-950/60 text-cyan-300'
    },
    {
      id: 'velocity',
      name: 'Takedown MTTR & Velocity',
      sublabel: '7-Day Resolution Curve',
      icon: TrendingDown,
      badge: '3.8h Avg',
      badgeColor: 'border-purple-500/40 bg-purple-950/60 text-purple-300'
    },
    {
      id: 'donut',
      name: 'Platform Distribution (Donut)',
      sublabel: 'Enforcement Breakdown',
      icon: PieChartIcon,
      badge: '48% / 28% / 24%',
      badgeColor: 'border-blue-500/40 bg-blue-950/60 text-blue-300'
    },
    {
      id: 'exporter',
      name: 'Evidentiary Docket & Seals',
      sublabel: 'Court-Admissible PDF & JSON',
      icon: FileCheck,
      badge: '4 Artifacts',
      badgeColor: 'border-emerald-500/40 bg-emerald-950/60 text-emerald-300'
    },
    {
      id: 'all',
      name: 'Unified Legal Command',
      sublabel: 'All-in-One Master View',
      icon: LayoutGrid,
      badge: 'Full Canvas',
      badgeColor: 'border-slate-600 bg-slate-900 text-slate-300'
    }
  ];

  return (
    <div className="p-4 sm:p-6 max-w-[1740px] mx-auto space-y-5 animate-in fade-in duration-300 font-sans">
      
      {/* ============================================================ */}
      {/* TOP COMMAND HEADER & TELEMETRY STRIP                          */}
      {/* ============================================================ */}
      <div className="p-5 rounded-2xl bg-[#071120]/90 backdrop-blur-xl border border-amber-500/30 shadow-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/60 border border-amber-500/40 text-amber-300 text-xs font-mono font-bold mb-2 shadow-[0_0_12px_rgba(245,158,11,0.2)]">
            <Scale className="w-3.5 h-3.5 text-amber-400" />
            <span>ROLE 2: LEGAL COUNSEL &amp; TAKEDOWN DESK (/legal)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <span>Statutory Enforcement &amp; Platform Takedown Command</span>
            <span className="text-xs px-2.5 py-1 rounded-full bg-amber-950/60 border border-amber-500/40 text-amber-300 font-mono font-semibold">
              Tenant: {currentBrand.name}
            </span>
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
            Logged in as <strong>{user?.name || 'Sarah Vance'}</strong> (Head of Legal). Review pre-compiled statutory affidavits citing Rule 3(2)(b) of the Indian IT Rules (2021) and DMCA §512 for 1-click platform API dispatch.
          </p>
        </div>

        {/* Legal Telemetry Indicators */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-center min-w-[105px]">
            <div className="text-lg font-black text-amber-400 font-mono">12 Cases</div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold flex items-center justify-center gap-1">
              <FileText className="w-2.5 h-2.5 text-amber-400" /> Active Docket
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-center min-w-[105px]">
            <div className="text-lg font-black text-emerald-400 font-mono">3.8 Hours</div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold flex items-center justify-center gap-1">
              <Clock className="w-2.5 h-2.5 text-emerald-400" /> MTTR Velocity
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-center min-w-[105px]">
            <div className="text-lg font-black text-cyan-400 font-mono">91.4%</div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold flex items-center justify-center gap-1">
              <CheckCircle2 className="w-2.5 h-2.5 text-cyan-400" /> Delist Rate
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-center min-w-[105px]">
            <div className="text-lg font-black text-purple-400 font-mono">&lt; 60 sec</div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold flex items-center justify-center gap-1">
              <Zap className="w-2.5 h-2.5 text-purple-400" /> API Dispatch
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2-SECTION WORKSPACE: DASHBOARD TOGGLE (LEFT) + WORKSPACE (RIGHT) */}
      {/* ============================================================ */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        
        {/* ========================================================== */}
        {/* LEFT: LEGAL DASHBOARD MODULE TOGGLE DRAWER (~330px)        */}
        {/* ========================================================== */}
        <div className="w-full lg:w-[330px] shrink-0 space-y-4">
          
          <div className="p-4 rounded-2xl bg-[#071120]/90 backdrop-blur-xl border border-amber-500/30 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-amber-400" />
                <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-300">
                  Legal Desk Modules
                </h2>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-400">
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
                        ? 'bg-gradient-to-r from-amber-950/60 to-slate-900 border-amber-400 shadow-[0_0_16px_rgba(245,158,11,0.25)] text-white'
                        : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:bg-slate-900/60 hover:text-slate-200 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`p-2 rounded-lg border shrink-0 transition-colors ${
                        isActive
                          ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                          : 'bg-slate-900 border-slate-800 text-slate-400 group-hover:text-amber-400'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className={`text-xs font-bold truncate ${isActive ? 'text-white' : 'text-slate-300'}`}>
                          {mod.name}
                        </div>
                        <div className="text-[10px] text-slate-500 truncate">
                          {mod.sublabel}
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 flex items-center gap-1.5 ml-2">
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border font-semibold ${mod.badgeColor}`}>
                        {mod.badge}
                      </span>
                      <ChevronRight className={`w-3.5 h-3.5 transition-transform ${
                        isActive ? 'text-amber-400 translate-x-0.5' : 'text-slate-600'
                      }`} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ACTIVE CASE SELECTOR QUICK CARD */}
          <div className="p-4 rounded-2xl bg-[#071120]/90 backdrop-blur-xl border border-amber-500/30 shadow-2xl space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-amber-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-amber-400" /> Active Legal Docket
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-bold">
                {activeCase.id}
              </span>
            </div>

            <select
              value={selectedCaseId}
              onChange={(e) => setSelectedCaseId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 cursor-pointer font-mono"
            >
              {brandCases.map((t) => (
                <option key={t.id} value={t.id}>
                  [{t.id}] {t.suspectHandle} ({t.channel})
                </option>
              ))}
            </select>

            <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-[11px] font-mono space-y-1">
              <div className="text-white font-bold truncate">{activeCase.suspectName}</div>
              <div className="text-slate-400 flex items-center justify-between text-[10px]">
                <span>Platform: {activeCase.platform}</span>
                <span className="text-emerald-400 font-bold">Evidence: Sealed</span>
              </div>
            </div>
          </div>

          {/* QUICK ROLE JUMP BAR */}
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">Other Roles:</span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => loginAsRole('analyst')}
                className="px-2 py-1 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-900 transition cursor-pointer text-[10px]"
              >
                Analyst
              </button>
              <button
                type="button"
                onClick={() => loginAsRole('support')}
                className="px-2 py-1 rounded bg-blue-950 text-blue-300 border border-blue-500/40 hover:bg-blue-900 transition cursor-pointer text-[10px]"
              >
                Support
              </button>
              <button
                type="button"
                onClick={() => loginAsRole('ciso')}
                className="px-2 py-1 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-900 transition cursor-pointer text-[10px]"
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
          <div className="p-3.5 rounded-xl bg-[#071120]/90 backdrop-blur-xl border border-amber-500/20 shadow-md flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-2 text-slate-300">
              <span className="text-slate-500">Legal Enforcement</span>
              <span>/</span>
              <span className="text-amber-400 font-bold">
                {legalModules.find(m => m.id === activeModule)?.name}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-slate-400">
                <span>Active Target:</span>
                <span className="text-white font-bold bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                  {activeCase.suspectHandle}
                </span>
              </div>
              <div className="h-4 w-px bg-slate-800" />
              <button
                type="button"
                onClick={() => loginAsRole('analyst')}
                className="px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30 transition flex items-center gap-1 cursor-pointer font-bold"
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
