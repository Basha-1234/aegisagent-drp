import React, { useState } from 'react';
import { useAuth, DEMO_PERSONAS } from '../../context/AuthContext';
import { BRANDS } from '../../data/mockData';
import AegisShieldLogo from './AegisShieldLogo';
import { 
  ShieldAlert, 
  Scale, 
  Search, 
  BarChart3, 
  LogOut, 
  ChevronDown, 
  Building2, 
  Sparkles
} from 'lucide-react';

export default function AppHeader() {
  const { user, logout, loginAsRole, activeBrandId, setActiveBrandId } = useAuth();
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isBrandDropdownOpen, setIsBrandDropdownOpen] = useState(false);

  const activeBrand = BRANDS.find(b => b.id === activeBrandId) || BRANDS[0];

  const roleMeta = {
    analyst: {
      label: 'Security Analyst',
      route: '/analyst',
      badgeColor: 'border-cyan-500/40 bg-cyan-950/40 text-cyan-400',
      icon: ShieldAlert
    },
    legal: {
      label: 'Legal Counsel',
      route: '/legal',
      badgeColor: 'border-amber-500/40 bg-amber-950/40 text-amber-400',
      icon: Scale
    },
    support: {
      label: 'Customer Support',
      route: '/support',
      badgeColor: 'border-blue-500/40 bg-blue-950/40 text-blue-400',
      icon: Search
    },
    ciso: {
      label: 'CISO / Executive',
      route: '/executive',
      badgeColor: 'border-emerald-500/40 bg-emerald-950/40 text-emerald-400',
      icon: BarChart3
    }
  };

  const currentRole = roleMeta[user?.role] || roleMeta.analyst;
  const CurrentRoleIcon = currentRole.icon;

  return (
    <header className="sticky top-0 z-40 border-b border-blue-500/20 bg-[#050a14]/90 backdrop-blur-md px-4 sm:px-6 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Left: Brand Identity & Active Monitored Entity */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <AegisShieldLogo size={36} />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-sm text-white tracking-tight">AegisAgent</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-400 border border-blue-500/40 font-mono font-bold">DRP</span>
              </div>
              <div className="text-[10px] text-slate-400 hidden sm:block">Autonomous Threat Command</div>
            </div>
          </div>

          <div className="h-5 w-px bg-slate-800 hidden md:block" />

          {/* Monitored Brand Selector Dropdown */}
          <div className="relative hidden md:block">
            <button
              onClick={() => setIsBrandDropdownOpen(!isBrandDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-blue-500/20 hover:border-blue-500/45 text-xs text-slate-200 transition"
            >
              <Building2 className="w-3.5 h-3.5 text-blue-400" />
              <span className="font-semibold">{activeBrand.name}</span>
              <ChevronDown className="w-3 h-3 text-slate-400 ml-1" />
            </button>

            {isBrandDropdownOpen && (
              <div className="absolute left-0 mt-1.5 w-60 rounded-xl bg-slate-950 border border-blue-500/30 shadow-2xl p-1.5 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="text-[10px] font-mono text-slate-400 px-2 py-1 uppercase tracking-wider">
                  Active Monitored Entity
                </div>
                {BRANDS.map(brand => (
                  <button
                    key={brand.id}
                    onClick={() => {
                      setActiveBrandId(brand.id);
                      setIsBrandDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-lg text-xs text-left transition ${
                      brand.id === activeBrandId ? 'bg-blue-600/20 text-blue-300 font-bold' : 'text-slate-300 hover:bg-slate-900'
                    }`}
                  >
                    <span>{brand.name}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 text-slate-400">
                      {brand.activeThreats} alerts
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Center: Active Role Badge */}
        <div className="hidden lg:flex items-center gap-2">
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold ${currentRole.badgeColor}`}>
            <CurrentRoleIcon className="w-3.5 h-3.5" />
            <span>{currentRole.label.toUpperCase()} WORKSPACE</span>
            <span className="text-[10px] font-mono opacity-70">({currentRole.route})</span>
          </div>
        </div>

        {/* Right: Demo Role Switcher & User Controls */}
        <div className="flex items-center gap-3">
          
          {/* 1-Click Role Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-950/40 border border-blue-500/35 hover:border-blue-500/60 text-blue-300 text-xs font-semibold shadow-sm transition"
              title="Quickly switch operational roles for evaluation"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">Role Switcher:</span>
              <span className="text-white font-bold">{currentRole.label}</span>
              <ChevronDown className="w-3.5 h-3.5 text-blue-400" />
            </button>

            {isRoleDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-64 rounded-xl bg-slate-950 border border-blue-500/35 shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="text-[10px] font-mono text-slate-400 px-2 py-1 uppercase tracking-wider flex items-center justify-between">
                  <span>Switch Operational Persona</span>
                  <span className="text-blue-400">Demo Mode</span>
                </div>

                <div className="space-y-1 mt-1">
                  {Object.entries(DEMO_PERSONAS).map(([key, persona]) => {
                    const isSelected = user?.role === key;
                    const meta = roleMeta[key];
                    const Icon = meta.icon;
                    return (
                      <button
                        key={key}
                        onClick={() => {
                          loginAsRole(key);
                          setIsRoleDropdownOpen(false);
                        }}
                        className={`w-full flex items-center gap-2.5 p-2 rounded-lg text-left transition ${
                          isSelected ? 'bg-blue-600/20 text-blue-300 font-bold' : 'text-slate-300 hover:bg-slate-900'
                        }`}
                      >
                        <div className={`p-1.5 rounded-md border ${meta.badgeColor}`}>
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs truncate">{meta.label}</div>
                          <div className="text-[10px] text-slate-400 truncate">{persona.name}</div>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">{meta.route}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Chip */}
          <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-800">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/40 text-blue-400 text-xs font-bold flex items-center justify-center">
              {user?.avatar || 'AC'}
            </div>
            <div className="hidden xl:block text-left">
              <div className="text-xs font-bold text-white truncate">{user?.name}</div>
              <div className="text-[10px] text-slate-400 truncate">{user?.title}</div>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={logout}
            className="p-2 rounded-xl border border-slate-800 bg-slate-950 text-slate-400 hover:text-red-400 hover:border-red-500/40 transition"
            title="Sign out of enterprise workspace"
          >
            <LogOut className="w-4 h-4" />
          </button>

        </div>

      </div>
    </header>
  );
}
