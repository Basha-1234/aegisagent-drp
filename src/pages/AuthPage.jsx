import React, { useState } from 'react';
import { useAuth, DEMO_PERSONAS } from '../context/AuthContext';
import { BRANDS } from '../data/mockData';
import { Sparkles, Shield, UserCheck, ChevronDown, Check } from 'lucide-react';

export default function AuthPage() {
  const { login, loginAsRole, activeBrandId, setActiveBrandId } = useAuth();
  
  // Interactive credentials matching reference image defaults
  const [email, setEmail] = useState('alex.chen@quickpay.com');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState('');
  
  // Discreet Demo Switcher drawer state
  const [isDemoMenuOpen, setIsDemoMenuOpen] = useState(false);
  const [isBrandMenuOpen, setIsBrandMenuOpen] = useState(false);

  const activeBrand = BRANDS.find(b => b.id === activeBrandId) || BRANDS[0];

  const handleSignIn = (e) => {
    if (e) e.preventDefault();
    setAuthError('');
    setIsAuthenticating(true);

    setTimeout(() => {
      // Intelligent matching: if email matches a persona, log in as that persona
      const lower = email.toLowerCase();
      if (lower.includes('legal') || lower.includes('vance')) {
        loginAsRole('legal');
      } else if (lower.includes('support') || lower.includes('brooks')) {
        loginAsRole('support');
      } else if (lower.includes('ciso') || lower.includes('elena') || lower.includes('admin')) {
        loginAsRole('ciso');
      } else {
        // Default to Security Analyst
        loginAsRole('analyst');
      }
    }, 400);
  };

  const handleQuickRole = (roleKey) => {
    const persona = DEMO_PERSONAS[roleKey];
    if (persona) {
      setEmail(persona.email);
      setIsAuthenticating(true);
      setTimeout(() => {
        loginAsRole(roleKey);
      }, 300);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#060a12] flex items-center justify-center p-2 sm:p-6 relative overflow-hidden select-none font-sans">
      
      {/* Background Radial Glow Matching the Cobalt Sapphire Atmosphere */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-blue-600/15 rounded-full blur-[140px]" />
        <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] bg-sky-400/10 rounded-full blur-[100px]" />
      </div>

      {/* Main 16:9 Presentation Stage (Matches Reference Image Exactly) */}
      <div className="w-full max-w-[1240px] aspect-[1376/768] relative rounded-2xl overflow-hidden shadow-[0_25px_70px_-15px_rgba(0,0,0,0.8)] border border-blue-500/20 bg-[#070b14]">
        
        {/* Exact 3D Cobalt Shield & Card Master Render */}
        <img 
          src="/aegis_shield_3d_cobalt.jpg" 
          alt="AegisAgent DRP - Enterprise Threat Command" 
          className="w-full h-full object-cover pointer-events-none" 
        />

        {/* INTERACTIVE OVERLAYS: Perfectly Mapped to the Reference Card Elements */}

        {/* 1. Interactive Tenant Capsule Dropdown (Positioned over "Tenant: QuickPay Technologies") */}
        <div 
          className="absolute"
          style={{
            left: '54.8%',
            top: '50.6%',
            width: '26.4%',
            height: '5.2%',
          }}
        >
          <button
            type="button"
            onClick={() => setIsBrandMenuOpen(!isBrandMenuOpen)}
            className="w-full h-full rounded-full bg-[#0a1324]/80 border border-blue-500/30 hover:border-blue-400/70 text-slate-300 hover:text-white px-4 flex items-center justify-between text-[11px] sm:text-xs transition cursor-pointer backdrop-blur-sm shadow-inner group"
            title="Click to switch protected brand tenant"
          >
            <span className="flex items-center gap-1.5 truncate">
              <span className="text-slate-400 font-normal">Tenant:</span>
              <strong className="text-white font-semibold group-hover:text-blue-300 transition truncate">
                {activeBrand.name}
              </strong>
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-blue-400 shrink-0 ml-1 group-hover:translate-y-0.5 transition-transform" />
          </button>

          {/* Tenant Selector Dropdown Menu */}
          {isBrandMenuOpen && (
            <div className="absolute left-0 bottom-full mb-2 w-full rounded-xl bg-[#091120] border border-blue-500/40 shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 backdrop-blur-xl">
              <div className="px-2 py-1 text-[10px] font-mono text-blue-400 uppercase tracking-wider">
                Select Monitored Organization
              </div>
              {BRANDS.map((brand) => (
                <button
                  key={brand.id}
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

        {/* 2. Interactive Corporate Email Input (Positioned exactly over the input box) */}
        <form 
          onSubmit={handleSignIn}
          className="absolute"
          style={{
            left: '55.08%',
            top: '63.15%',
            width: '25.95%',
            height: '6.90%',
          }}
        >
          <div className="relative w-full h-full">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Corporate email"
              required
              className="w-full h-full px-3.5 sm:px-4 rounded-xl sm:rounded-2xl bg-[#0b162b] border border-blue-500/60 focus:border-blue-400 text-white placeholder-slate-400 text-xs sm:text-sm font-sans focus:outline-none focus:ring-2 focus:ring-blue-400/40 transition shadow-[inset_0_2px_8px_rgba(0,0,0,0.6)]"
            />
          </div>
        </form>

        {/* 3. Interactive Primary SSO Action Button (Positioned exactly over the blue button) */}
        <button
          type="button"
          onClick={handleSignIn}
          disabled={isAuthenticating}
          style={{
            left: '55.08%',
            top: '72.40%',
            width: '25.95%',
            height: '6.51%',
          }}
          className="absolute rounded-xl sm:rounded-2xl bg-[#0066ff] hover:bg-[#1a75ff] active:scale-[0.98] text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer transition shadow-[0_0_25px_rgba(0,102,255,0.45)] hover:shadow-[0_0_35px_rgba(0,102,255,0.7)] z-10"
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

      </div>

      {/* DISCREET BOTTOM CONTROLS: 1-Click Evaluation Switcher for Presentation Ease */}
      {/* Kept out of the central artboard so the visual matches the reference image 100% */}
      <div className="fixed bottom-4 right-4 z-50">
        <div className="relative">
          <button
            onClick={() => setIsDemoMenuOpen(!isDemoMenuOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-950/85 hover:bg-slate-900 border border-blue-500/30 hover:border-blue-400 text-[11px] text-slate-300 hover:text-white backdrop-blur-md transition shadow-lg cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span className="font-medium">1-Click Evaluation Personas</span>
            <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isDemoMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Floating Persona Popover */}
          {isDemoMenuOpen && (
            <div className="absolute right-0 bottom-full mb-2 w-64 rounded-2xl bg-[#091120]/95 border border-blue-500/40 p-3 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 space-y-1.5">
              <div className="text-[10px] font-mono text-blue-400 uppercase tracking-wider px-1 pb-1 border-b border-slate-800">
                Switch Evaluation Role
              </div>
              
              <button
                onClick={() => { handleQuickRole('analyst'); setIsDemoMenuOpen(false); }}
                className="w-full p-2 rounded-xl bg-slate-950/60 hover:bg-cyan-950/40 border border-slate-800/80 hover:border-cyan-500/50 text-left transition flex items-center justify-between group"
              >
                <div>
                  <div className="text-xs font-semibold text-slate-200 group-hover:text-cyan-400">1. Security Analyst</div>
                  <div className="text-[10px] text-slate-400">Alex Chen (alex.chen@quickpay.com)</div>
                </div>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 font-mono">SOC</span>
              </button>

              <button
                onClick={() => { handleQuickRole('legal'); setIsDemoMenuOpen(false); }}
                className="w-full p-2 rounded-xl bg-slate-950/60 hover:bg-amber-950/40 border border-slate-800/80 hover:border-amber-500/50 text-left transition flex items-center justify-between group"
              >
                <div>
                  <div className="text-xs font-semibold text-slate-200 group-hover:text-amber-400">2. Legal Counsel</div>
                  <div className="text-[10px] text-slate-400">Sarah Vance (sarah.vance@quickpay.com)</div>
                </div>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800 font-mono">DMCA</span>
              </button>

              <button
                onClick={() => { handleQuickRole('support'); setIsDemoMenuOpen(false); }}
                className="w-full p-2 rounded-xl bg-slate-950/60 hover:bg-blue-950/40 border border-slate-800/80 hover:border-blue-500/50 text-left transition flex items-center justify-between group"
              >
                <div>
                  <div className="text-xs font-semibold text-slate-200 group-hover:text-blue-400">3. Customer Support</div>
                  <div className="text-[10px] text-slate-400">Marcus Brooks (marcus.brooks@quickpay.com)</div>
                </div>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800 font-mono">Radar</span>
              </button>

              <button
                onClick={() => { handleQuickRole('ciso'); setIsDemoMenuOpen(false); }}
                className="w-full p-2 rounded-xl bg-slate-950/60 hover:bg-emerald-950/40 border border-slate-800/80 hover:border-emerald-500/50 text-left transition flex items-center justify-between group"
              >
                <div>
                  <div className="text-xs font-semibold text-slate-200 group-hover:text-emerald-400">4. CISO / Exec</div>
                  <div className="text-[10px] text-slate-400">Elena Rostova (elena.rostova@quickpay.com)</div>
                </div>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono">Admin</span>
              </button>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
