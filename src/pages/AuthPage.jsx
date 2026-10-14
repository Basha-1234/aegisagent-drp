import React, { useState } from 'react';
import { useAuth, DEMO_PERSONAS } from '../context/AuthContext';
import { BRANDS } from '../data/mockData';
import { Sparkles, ChevronDown, Check, AlertCircle } from 'lucide-react';

export default function AuthPage() {
  const { loginAsRole, activeBrandId, setActiveBrandId } = useAuth();
  
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
    <div className="min-h-screen w-full bg-[#030813] flex items-center justify-center p-2 sm:p-6 lg:p-8 relative overflow-hidden select-none font-sans">
      
      {/* Outer ambient deep oceanic vignette */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 50%, #061122 0%, #030814 65%, #01040a 100%)',
        }}
      />

      {/* Main 16:9 High-Tech Command Canvas with Authentic 3D Shield & Clear Background */}
      <div 
        className="w-full max-w-[1240px] aspect-[16/9] min-h-[580px] h-auto relative rounded-3xl overflow-hidden shadow-[0_30px_90px_-20px_rgba(0,0,0,0.95)] border border-blue-500/25 flex items-center justify-end p-4 sm:p-8 lg:pr-14"
        style={{
          backgroundImage: 'url(/aegis_drp_login_stage_bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        
        {/* Subtle vignette layer inside the canvas to keep contrast razor-sharp */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#030814]/30 to-[#030814]/65 pointer-events-none" />

        {/* RIGHT COLUMN: The Frosted Glass Card with Sign-In & Demo Personas */}
        <div className="w-full max-w-[430px] relative z-20">
          <div className="relative rounded-3xl p-5 sm:p-7 bg-[#071120]/85 backdrop-blur-2xl border border-blue-500/35 shadow-[0_20px_60px_-10px_rgba(0,0,0,0.9)]">
            
            {/* Subtle top edge glass specular highlight */}
            <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-blue-400/50 to-transparent pointer-events-none" />

            {/* Card Header Typography */}
            <div>
              <div className="text-[11px] font-semibold text-slate-300 tracking-wider uppercase font-mono mb-0.5">
                AegisAgent DRP
              </div>
              <h1 className="text-2xl sm:text-[26px] font-extrabold text-white tracking-tight leading-snug">
                Enterprise Threat Command
              </h1>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed font-normal">
                Autonomous Digital Risk Protection: <br />Social &amp; App Monitoring
              </p>

              {/* Active Tenant Capsule with Dropdown */}
              <div className="relative inline-block mt-3">
                <button
                  type="button"
                  onClick={() => setIsBrandMenuOpen(!isBrandMenuOpen)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0a1528]/95 border border-blue-500/40 hover:border-blue-400 text-xs transition cursor-pointer group shadow-sm"
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
                  <div className="absolute left-0 top-full mt-2 w-56 rounded-2xl bg-[#081224] border border-blue-500/40 shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 backdrop-blur-xl">
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
            <form onSubmit={handleSignIn} className="mt-4 space-y-2.5">
              {authError && (
                <div className="p-2 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 text-red-400" />
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
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a1528]/95 border border-blue-500/60 focus:border-blue-400 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-400/50 shadow-[0_0_12px_rgba(37,99,235,0.2)] transition font-sans"
                />
              </div>

              {/* Solid Vibrant Electric Blue SSO Button */}
              <button
                type="submit"
                disabled={isAuthenticating}
                className="w-full py-2.5 px-4 rounded-xl bg-[#0066ff] hover:bg-[#1a75ff] active:scale-[0.99] text-white font-semibold text-xs sm:text-sm transition shadow-[0_0_20px_rgba(0,102,255,0.45)] hover:shadow-[0_0_30px_rgba(0,102,255,0.7)] flex items-center justify-center gap-2 cursor-pointer"
              >
                {isAuthenticating ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Verifying SSO...</span>
                  </span>
                ) : (
                  <span>Sign in with Corporate SSO</span>
                )}
              </button>
            </form>

            {/* DEMO SECTION BELOW (1-Click Evaluation Personas) */}
            <div className="mt-4 pt-3.5 border-t border-slate-800/80">
              
              {/* Header */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
                  <Sparkles className="w-3 h-3 text-blue-400" />
                  1-CLICK EVALUATION PERSONAS
                </span>
                <span className="text-[9px] text-blue-400 font-mono px-2 py-0.5 rounded-full bg-blue-950/70 border border-blue-800/50">
                  Demo Mode
                </span>
              </div>

              {/* Explanatory Popup Banner */}
              <div className="p-2 rounded-xl bg-blue-950/40 border border-blue-500/25 text-[10.5px] text-blue-200/90 flex items-start gap-1.5 mb-2.5">
                <Sparkles className="w-3 h-3 text-blue-400 shrink-0 mt-0.5" />
                <span className="leading-snug">
                  <strong className="text-white font-semibold">Evaluation Quick-Access:</strong> Click any role below to instantly log in and test their dedicated dashboard without typing credentials.
                </span>
              </div>

              {/* 4 Role Buttons in 2x2 Grid */}
              <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                
                {/* 1. Security Analyst */}
                <button
                  type="button"
                  onClick={() => handleQuickRole('analyst')}
                  className="p-2 rounded-xl bg-slate-950/75 border border-slate-800/90 hover:border-cyan-500/60 hover:bg-slate-900/90 text-left transition group cursor-pointer"
                >
                  <div className="font-bold text-slate-200 group-hover:text-cyan-400 flex items-center justify-between">
                    <span>1. Analyst</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 font-mono">SOC</span>
                  </div>
                  <div className="text-[10px] text-slate-400 truncate mt-0.5">Alex Chen</div>
                </button>

                {/* 2. Legal Counsel */}
                <button
                  type="button"
                  onClick={() => handleQuickRole('legal')}
                  className="p-2 rounded-xl bg-slate-950/75 border border-slate-800/90 hover:border-amber-500/60 hover:bg-slate-900/90 text-left transition group cursor-pointer"
                >
                  <div className="font-bold text-slate-200 group-hover:text-amber-400 flex items-center justify-between">
                    <span>2. Legal</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-950 text-amber-400 border border-amber-800 font-mono">DMCA</span>
                  </div>
                  <div className="text-[10px] text-slate-400 truncate mt-0.5">Sarah Vance</div>
                </button>

                {/* 3. Customer Support */}
                <button
                  type="button"
                  onClick={() => handleQuickRole('support')}
                  className="p-2 rounded-xl bg-slate-950/75 border border-slate-800/90 hover:border-blue-500/60 hover:bg-slate-900/90 text-left transition group cursor-pointer"
                >
                  <div className="font-bold text-slate-200 group-hover:text-blue-400 flex items-center justify-between">
                    <span>3. Support</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-950 text-blue-400 border border-blue-800 font-mono">Radar</span>
                  </div>
                  <div className="text-[10px] text-slate-400 truncate mt-0.5">Marcus Brooks</div>
                </button>

                {/* 4. CISO / Executive */}
                <button
                  type="button"
                  onClick={() => handleQuickRole('ciso')}
                  className="p-2 rounded-xl bg-slate-950/75 border border-slate-800/90 hover:border-emerald-500/60 hover:bg-slate-900/90 text-left transition group cursor-pointer"
                >
                  <div className="font-bold text-slate-200 group-hover:text-emerald-400 flex items-center justify-between">
                    <span>4. CISO</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono">Admin</span>
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
