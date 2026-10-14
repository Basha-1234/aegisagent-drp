import React, { useState } from 'react';
import { useAuth, DEMO_PERSONAS } from '../context/AuthContext';
import { BRANDS } from '../data/mockData';
import { Sparkles, Shield, ChevronDown, Check, ArrowRight, Lock, AlertCircle } from 'lucide-react';

export default function AuthPage() {
  const { login, loginAsRole, activeBrandId, setActiveBrandId } = useAuth();
  
  // Interactive state
  const [email, setEmail] = useState('alex.chen@quickpay.com');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState('');
  const [isBrandMenuOpen, setIsBrandMenuOpen] = useState(false);

  const activeBrand = BRANDS.find(b => b.id === activeBrandId) || BRANDS[0];

  const handleSignIn = (e) => {
    if (e) e.preventDefault();
    setAuthError('');
    setIsAuthenticating(true);

    setTimeout(() => {
      const lower = email.toLowerCase();
      if (lower.includes('legal') || lower.includes('vance')) {
        loginAsRole('legal');
      } else if (lower.includes('support') || lower.includes('brooks')) {
        loginAsRole('support');
      } else if (lower.includes('ciso') || lower.includes('elena') || lower.includes('admin')) {
        loginAsRole('ciso');
      } else {
        loginAsRole('analyst');
      }
    }, 350);
  };

  const handleQuickRole = (roleKey) => {
    const persona = DEMO_PERSONAS[roleKey];
    if (persona) {
      setEmail(persona.email);
      setIsAuthenticating(true);
      setTimeout(() => {
        loginAsRole(roleKey);
      }, 250);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#070b14] flex items-center justify-center p-4 sm:p-8 relative overflow-hidden select-none font-sans">
      
      {/* Ambient Cobalt Radial Glows */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/12 rounded-full blur-[160px]" />
        <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-sky-400/10 rounded-full blur-[120px]" />
      </div>

      {/* Main 2-Column Responsive Layout: Left 3D Shield + Right Frosted Glass Card */}
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 items-center relative z-10 my-auto">
        
        {/* LEFT COLUMN: 3D Cobalt Crystal Shield with Radiant Flare */}
        <div className="lg:col-span-5 flex items-center justify-center relative">
          <div className="relative w-full max-w-[380px] sm:max-w-[420px] lg:max-w-none transition-transform duration-500 hover:scale-[1.02]">
            {/* Ambient blue flare behind shield */}
            <div className="absolute -inset-4 bg-blue-500/20 rounded-full blur-2xl pointer-events-none" />
            <img 
              src="/aegis_shield_isolated.jpg" 
              alt="AegisAgent DRP 3D Cobalt Shield" 
              className="w-full h-auto object-contain relative z-10 drop-shadow-[0_20px_45px_rgba(0,102,255,0.35)]" 
            />
          </div>
        </div>

        {/* RIGHT COLUMN: The Frosted Glass Card with Form & Demo Section */}
        <div className="lg:col-span-7 w-full max-w-lg mx-auto lg:max-w-none">
          <div className="relative rounded-3xl p-6 sm:p-8 bg-[#091322]/85 backdrop-blur-2xl border border-blue-500/30 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)]">
            
            {/* Subtle inner top-left glass highlight */}
            <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-blue-400/40 to-transparent pointer-events-none" />

            {/* Card Header matching reference image typography */}
            <div>
              <div className="text-xs font-semibold text-slate-300 tracking-wide font-sans mb-1">
                AegisAgent DRP
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-snug">
                Enterprise Threat Command
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1 leading-relaxed">
                Autonomous Digital Risk Protection: <br className="hidden sm:inline" />Social &amp; App Monitoring
              </p>

              {/* Active Tenant Capsule with Dropdown */}
              <div className="relative inline-block mt-3.5">
                <button
                  type="button"
                  onClick={() => setIsBrandMenuOpen(!isBrandMenuOpen)}
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0a1426]/90 border border-blue-500/35 hover:border-blue-400 text-xs transition cursor-pointer group shadow-sm"
                  title="Switch protected organization tenant"
                >
                  <span className="text-slate-400">Tenant:</span>
                  <strong className="text-white font-medium group-hover:text-blue-300 transition">
                    {activeBrand.name}
                  </strong>
                  <ChevronDown className={`w-3.5 h-3.5 text-blue-400 transition-transform ${isBrandMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Tenant Switcher Dropdown */}
                {isBrandMenuOpen && (
                  <div className="absolute left-0 top-full mt-2 w-56 rounded-2xl bg-[#091120] border border-blue-500/40 shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 backdrop-blur-xl">
                    <div className="px-2 py-1 text-[10px] font-mono text-blue-400 uppercase tracking-wider">
                      Select Monitored Organization
                    </div>
                    {BRANDS.map((brand) => (
                      <button
                        key={brand.id}
                        type="button"
                        onClick={() => {
                          setActiveBrandId(brand.id);
                          setIsBrandMenuOpen(false);
                        }}
                        className={`w-full px-2.5 py-1.5 rounded-lg text-left text-xs flex items-center justify-between transition ${
                          brand.id === activeBrandId
                            ? 'bg-blue-600/30 text-blue-200 font-semibold'
                            : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                        }`}
                      >
                        <span className="truncate">{brand.name}</span>
                        {brand.id === activeBrandId && <Check className="w-3.5 h-3.5 text-blue-400 shrink-0" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Interactive SSO Login Form */}
            <form onSubmit={handleSignIn} className="mt-5 space-y-3">
              {authError && (
                <div className="p-2.5 rounded-xl bg-red-950/50 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{authError}</span>
                </div>
              )}

              {/* Corporate email input with electric blue glow border */}
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Corporate email"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-[#091428]/95 border border-blue-500/60 focus:border-blue-400 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-400/50 shadow-[0_0_15px_rgba(37,99,235,0.25)] transition font-sans"
                />
              </div>

              {/* Solid Vibrant Electric Blue SSO Button */}
              <button
                type="submit"
                disabled={isAuthenticating}
                className="w-full py-3 px-4 rounded-xl bg-[#0066ff] hover:bg-[#1a75ff] active:scale-[0.99] text-white font-semibold text-sm transition shadow-[0_0_25px_rgba(0,102,255,0.45)] hover:shadow-[0_0_35px_rgba(0,102,255,0.7)] flex items-center justify-center gap-2 cursor-pointer"
              >
                {isAuthenticating ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Verifying SSO...</span>
                  </span>
                ) : (
                  <span>Sign in with Corporate SSO</span>
                )}
              </button>
            </form>

            {/* DEMO SECTION BELOW (As previously provided) */}
            <div className="mt-6 pt-5 border-t border-slate-800/80">
              
              {/* Demo Section Header */}
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                  1-CLICK EVALUATION PERSONAS
                </span>
                <span className="text-[10px] text-blue-400 font-mono px-2 py-0.5 rounded-full bg-blue-950/60 border border-blue-800/50">
                  Demo Mode
                </span>
              </div>

              {/* Explanatory Popup Banner */}
              <div className="p-2.5 rounded-xl bg-blue-950/40 border border-blue-500/25 text-[11px] text-blue-200/90 flex items-start gap-2 mb-3">
                <Sparkles className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                <span className="leading-snug">
                  <strong className="text-white font-semibold">Evaluation Quick-Access:</strong> Click any role below to instantly log in as that employee and test their dedicated dashboard without typing credentials.
                </span>
              </div>

              {/* 4 Role Buttons in 2x2 Grid */}
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                
                {/* 1. Security Analyst */}
                <button
                  type="button"
                  onClick={() => handleQuickRole('analyst')}
                  className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-cyan-500/60 hover:bg-slate-900 text-left transition group cursor-pointer"
                >
                  <div className="font-bold text-slate-200 group-hover:text-cyan-400 flex items-center justify-between">
                    <span>1. Analyst</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 font-mono">SOC</span>
                  </div>
                  <div className="text-[10px] text-slate-400 truncate mt-0.5">Alex Chen</div>
                </button>

                {/* 2. Legal Counsel */}
                <button
                  type="button"
                  onClick={() => handleQuickRole('legal')}
                  className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-amber-500/60 hover:bg-slate-900 text-left transition group cursor-pointer"
                >
                  <div className="font-bold text-slate-200 group-hover:text-amber-400 flex items-center justify-between">
                    <span>2. Legal</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800 font-mono">DMCA</span>
                  </div>
                  <div className="text-[10px] text-slate-400 truncate mt-0.5">Sarah Vance</div>
                </button>

                {/* 3. Customer Support */}
                <button
                  type="button"
                  onClick={() => handleQuickRole('support')}
                  className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-blue-500/60 hover:bg-slate-900 text-left transition group cursor-pointer"
                >
                  <div className="font-bold text-slate-200 group-hover:text-blue-400 flex items-center justify-between">
                    <span>3. Support</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800 font-mono">Radar</span>
                  </div>
                  <div className="text-[10px] text-slate-400 truncate mt-0.5">Marcus Brooks</div>
                </button>

                {/* 4. CISO / Executive */}
                <button
                  type="button"
                  onClick={() => handleQuickRole('ciso')}
                  className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-emerald-500/60 hover:bg-slate-900 text-left transition group cursor-pointer"
                >
                  <div className="font-bold text-slate-200 group-hover:text-emerald-400 flex items-center justify-between">
                    <span>4. CISO</span>
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono">Admin</span>
                  </div>
                  <div className="text-[10px] text-slate-400 truncate mt-0.5">Elena Rostova</div>
                </button>

              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
