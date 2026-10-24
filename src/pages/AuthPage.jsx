import React, { useState, useEffect } from 'react';
import { useAuth, DEMO_PERSONAS } from '../context/AuthContext';
import { BRANDS } from '../data/mockData';
import { Sparkles, ChevronDown, Check, AlertCircle, Shield } from 'lucide-react';
import ThemeToggle from '../components/common/ThemeToggle';

const DRP_QUOTES = [
  {
    text: "Safeguarding enterprise brand integrity across deceptive social handles, homoglyph domains, and rogue mobile app stores.",
    source: "Autonomous Brand Defense Directive",
    context: "Problem Statement #3"
  },
  {
    text: "Autonomous cross-platform radar detecting brand abuse and orchestrating statutory legal takedowns in minutes, not weeks.",
    source: "Digital Risk Protection Standard",
    context: "Enforcement Desk"
  },
  {
    text: "Continuous forensic logo diffing, Unicode spoof detection, and APK permission auditing before customer trust is breached.",
    source: "Zero-Trust Threat Radar",
    context: "Threat Radar"
  }
];

export default function AuthPage() {
  const { login, loginAsRole, activeBrandId, setActiveBrandId } = useAuth();

  // Interactive credentials state
  const [email, setEmail] = useState('alex.chen@razorpay.com');
  const [password, setPassword] = useState('AegisDemo2026!');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState('');
  const [isBrandMenuOpen, setIsBrandMenuOpen] = useState(false);

  // Rotating quotations below logo
  const [activeQuoteIdx, setActiveQuoteIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveQuoteIdx((prev) => (prev + 1) % DRP_QUOTES.length);
    }, 6500);
    return () => clearInterval(timer);
  }, []);

  const activeBrand = BRANDS.find(b => b.id === activeBrandId) || BRANDS[0];

  const handleSignIn = async (e) => {
    if (e) e.preventDefault();
    setAuthError('');
    setIsAuthenticating(true);

    try {
      const result = await login(email, password);
      if (!result.success) {
        setAuthError(result.message || 'Invalid corporate credentials.');
      }
    } catch (err) {
      setAuthError(err.message || 'Unable to connect to authentication server.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleQuickRole = async (roleKey) => {
    const persona = DEMO_PERSONAS[roleKey];
    if (persona) {
      setEmail(persona.email);
      setPassword('AegisDemo2026!');
      setIsAuthenticating(true);
      setAuthError('');
      try {
        const result = await loginAsRole(roleKey);
        if (!result.success) {
          setAuthError(result.message || 'Demo authentication failed.');
        }
      } catch (err) {
        setAuthError(err.message || 'Authentication error.');
      } finally {
        setIsAuthenticating(false);
      }
    }
  };

  return (
    <div
      className="min-h-screen w-full relative flex flex-col justify-between overflow-x-hidden selection:bg-blue-500 selection:text-white font-sans bg-[#030814]"
      style={{
        zoom: '90%',
      }}
    >

      {/* 1. Full-Screen Edge-to-Edge Desktop Background of the Shield */}
      <div
        className="fixed inset-0 pointer-events-none bg-cover bg-center sm:bg-[center_left_20%] lg:bg-center"
        style={{
          backgroundImage: 'url(/aegis_drp_login_stage_bg.jpg)',
        }}
      />

      {/* Ambient gradient layer to maintain razor-sharp text contrast */}
      <div className="fixed inset-0 pointer-events-none bg-gradient-to-r from-transparent via-[#030814]/15 to-[#030814]/55" />

      {/* Top Corporate Ribbon */}
      <header className="relative z-20 w-full px-6 sm:px-12 pt-5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_10px_rgba(34,211,238,0.9)]" />
          <span
            className="text-xs sm:text-sm font-mono font-bold tracking-wider text-cyan-200 uppercase"
            style={{ textShadow: '0 2px 4px #000000, 0 0 10px rgba(0,0,0,1)' }}
          >
            AegisAgent DRP Core v2.0 • Security Gateway
          </span>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <span
            className="text-xs font-mono text-slate-300 font-semibold hidden sm:inline-block"
            style={{ textShadow: '0 2px 4px #000000, 0 0 8px rgba(0,0,0,1)' }}
          >
            Autonomous Brand Defense System
          </span>
        </div>
      </header>

      {/* Center Hero Grid (Two Columns: Brand Identity on Left, Card on Right) */}
      <div className="relative z-20 max-w-7xl mx-auto w-full px-6 sm:px-12 py-6 my-auto grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">

        {/* LEFT COLUMN: Brand Identity & Autonomous Defense Directives */}
        <div className="space-y-4 max-w-xl">

          {/* Glowing Badge Capsule */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/80 border border-blue-500/40 text-blue-300 text-xs font-mono font-bold shadow-[0_0_20px_rgba(59,130,246,0.5)] backdrop-blur-md">
            <Shield className="w-3.5 h-3.5 text-cyan-400" />
            <span>ENTERPRISE DIGITAL RISK PROTECTION</span>
          </div>

          {/* Massive Display Title */}
          <h2
            className="text-4xl sm:text-5xl lg:text-[54px] font-black text-white tracking-tight leading-[1.08]"
            style={{
              textShadow: '0 4px 16px #000000, 0 0 30px rgba(0,0,0,1), 0 0 45px rgba(2,6,23,1), 0 2px 4px #000000'
            }}
          >
            AI-Driven <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-300">
              Brand Protection
            </span>
          </h2>

          {/* Subtitle Statement */}
          <p
            className="text-base sm:text-lg text-slate-100 font-medium leading-relaxed"
            style={{
              textShadow: '0 2px 8px #000000, 0 0 20px rgba(0,0,0,1), 0 0 35px rgba(2,6,23,1), 0 1px 2px #000000'
            }}
          >
            Autonomous radar continuously diffing deceptive social profiles, rogue APK stores, and homoglyphs with statutory legal dispatch.
          </p>

          {/* Interactive DRP Directive Indicators (3 Dots) */}
          <div className="pt-2 flex items-center gap-3">
            <span
              className="text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold"
              style={{ textShadow: '0 2px 6px #000000, 0 0 12px rgba(0,0,0,1)' }}
            >
              Directives:
            </span>
            <div className="flex gap-2">
              {DRP_QUOTES.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveQuoteIdx(idx)}
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    activeQuoteIdx === idx
                      ? 'w-7 bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.9)]'
                      : 'w-2 bg-slate-400 hover:bg-slate-300 shadow-[0_0_6px_rgba(0,0,0,0.8)]'
                  }`}
                  aria-label={`Go to quote ${idx + 1}`}
                />
              ))}
            </div>
          </div>

          {/* High-Visibility Larger Quotation Text */}
          <p
            className="text-sm sm:text-base lg:text-[18px] text-white font-bold italic leading-relaxed min-h-[56px] flex items-center tracking-wide"
            style={{
              textShadow: '0 2px 8px #000000, 0 0 16px rgba(0,0,0,1), 0 0 24px rgba(2,6,23,1), 0 1px 3px #000000'
            }}
          >
            "{DRP_QUOTES[activeQuoteIdx].text}"
          </p>

          {/* Citation & Context in Bright Cyan / Crisp Slate */}
          <div
            className="mt-2.5 text-xs sm:text-[13.5px] font-mono flex items-center gap-2.5 flex-wrap"
            style={{ textShadow: '0 2px 6px #000000, 0 0 12px rgba(0,0,0,1)' }}
          >
            <span className="text-cyan-300 font-bold tracking-wide">
              — {DRP_QUOTES[activeQuoteIdx].source}
            </span>
            <span className="text-slate-400 font-bold">•</span>
            <span className="text-slate-200 font-semibold">
              {DRP_QUOTES[activeQuoteIdx].context}
            </span>
          </div>

        </div>

        {/* RIGHT COLUMN: The Frosted Glass Login Card with SSO & Demo Section */}
        <div className="w-full max-w-[500px] lg:max-w-[530px]">
          <div className="relative rounded-3xl p-6 sm:p-8 lg:p-9 bg-[#071120]/88 backdrop-blur-2xl border border-blue-500/35 shadow-[0_30px_70px_-10px_rgba(0,0,0,0.95)]">

            {/* Top edge glass specular highlight */}
            <div className="absolute top-0 left-8 right-8 h-px bg-gradient-to-r from-transparent via-blue-400/50 to-transparent pointer-events-none" />

            {/* Card Header Typography */}
            <div>
              <div className="text-xs sm:text-sm font-bold text-slate-300 tracking-wider uppercase font-mono mb-1">
                AegisAgent DRP
              </div>
              <h1 className="text-3xl sm:text-[32px] lg:text-[34px] font-black text-white tracking-tight leading-tight">
                Enterprise Threat Command
              </h1>
              <p className="text-sm sm:text-[15px] text-slate-300 mt-1.5 leading-relaxed font-normal">
                Autonomous Digital Risk Protection: <br />Social &amp; App Monitoring
              </p>

              {/* Active Tenant Capsule with Dropdown */}
              <div className="relative inline-block mt-3.5">
                <button
                  type="button"
                  onClick={() => setIsBrandMenuOpen(!isBrandMenuOpen)}
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0a1528]/95 border border-blue-500/40 hover:border-blue-400 text-xs sm:text-sm transition cursor-pointer group shadow-sm"
                  title="Switch protected organization tenant"
                >
                  <span className="text-slate-400">Tenant:</span>
                  <strong className="text-white font-semibold group-hover:text-blue-300 transition">
                    {activeBrand.name}
                  </strong>
                  <ChevronDown className={`w-4 h-4 text-blue-400 transition-transform ${isBrandMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Tenant Switcher Dropdown */}
                {isBrandMenuOpen && (
                  <div className="absolute left-0 top-full mt-2 w-64 rounded-2xl bg-[#081224] border border-blue-500/40 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 backdrop-blur-xl">
                    <div className="px-2.5 py-1 text-[11px] font-mono text-blue-400 uppercase tracking-wider font-semibold">
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
                        className={`w-full px-3 py-2 rounded-xl text-left text-xs sm:text-sm flex items-center justify-between transition ${
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

            {/* Interactive Real SSO Login Form */}
            <form onSubmit={handleSignIn} className="mt-5 space-y-3.5">
              {authError && (
                <div className="p-2.5 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs sm:text-sm flex items-center gap-2">
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
                  placeholder="Corporate email (e.g. alex.chen@razorpay.com)"
                  required
                  className="w-full px-4 py-3.5 rounded-2xl bg-[#0a1528]/95 border border-blue-500/60 focus:border-blue-400 text-sm sm:text-base text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-400/50 shadow-[0_0_15px_rgba(37,99,235,0.25)] transition font-sans"
                />
              </div>

              {/* Password input */}
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                  className="w-full px-4 py-3.5 rounded-2xl bg-[#0a1528]/95 border border-blue-500/60 focus:border-blue-400 text-sm sm:text-base text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-400/50 shadow-[0_0_15px_rgba(37,99,235,0.25)] transition font-sans"
                />
              </div>

              {/* Solid Vibrant Electric Blue SSO Button */}
              <button
                type="submit"
                disabled={isAuthenticating}
                className="w-full py-3.5 px-5 rounded-2xl bg-[#0066ff] hover:bg-[#1a75ff] active:scale-[0.99] text-white font-bold text-sm sm:text-base transition shadow-[0_0_25px_rgba(0,102,255,0.5)] hover:shadow-[0_0_35px_rgba(0,102,255,0.75)] flex items-center justify-center gap-2.5 cursor-pointer"
              >
                {isAuthenticating ? (
                  <span className="flex items-center gap-2.5">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Verifying SSO Credentials...</span>
                  </span>
                ) : (
                  <span>Sign in with Corporate SSO</span>
                )}
              </button>
            </form>

            {/* DEMO SECTION BELOW (1-Click Evaluation Personas) */}
            <div className="mt-5 pt-4 border-t border-slate-800/80">

              {/* Header */}
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-mono text-slate-300 font-semibold flex items-center gap-1.5 uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                  DEMO EVALUATION PERSONAS
                </span>
                <span className="text-[10px] text-amber-300 font-mono px-2.5 py-0.5 rounded-full bg-amber-950/70 border border-amber-800/50 font-semibold">
                  Authenticated Evaluation
                </span>
              </div>

              {/* Explanatory Popup Banner */}
              <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 flex items-start gap-2 mb-3 leading-relaxed">
                <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>
                  <strong className="text-white font-bold">Evaluation Personas:</strong> Preconfigured accounts for evaluating role workspaces via real backend API authentication.
                </span>
              </div>

              {/* 4 Role Buttons in 2x2 Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm">

                {/* 1. Security Analyst */}
                <button
                  type="button"
                  onClick={() => handleQuickRole('analyst')}
                  className="p-3 sm:p-3.5 rounded-2xl bg-slate-950/75 border border-slate-800/90 hover:border-cyan-500/60 hover:bg-slate-900/90 text-left transition group cursor-pointer"
                >
                  <div className="font-bold text-slate-100 group-hover:text-cyan-400 flex items-center justify-between text-sm sm:text-[15px]">
                    <span>1. Analyst</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 font-mono font-bold">SOC</span>
                  </div>
                  <div className="text-xs text-slate-400 truncate mt-1">Alex Chen</div>
                </button>

                {/* 2. Legal Counsel */}
                <button
                  type="button"
                  onClick={() => handleQuickRole('legal')}
                  className="p-3 sm:p-3.5 rounded-2xl bg-slate-950/75 border border-slate-800/90 hover:border-blue-500/60 hover:bg-slate-900/90 text-left transition group cursor-pointer"
                >
                  <div className="font-bold text-slate-100 group-hover:text-blue-400 flex items-center justify-between text-sm sm:text-[15px]">
                    <span>2. Legal Counsel</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-800 font-mono font-bold">LAW</span>
                  </div>
                  <div className="text-xs text-slate-400 truncate mt-1">Sarah Vance</div>
                </button>

                {/* 3. Support & Frontline */}
                <button
                  type="button"
                  onClick={() => handleQuickRole('support')}
                  className="p-3 sm:p-3.5 rounded-2xl bg-slate-950/75 border border-slate-800/90 hover:border-amber-500/60 hover:bg-slate-900/90 text-left transition group cursor-pointer"
                >
                  <div className="font-bold text-slate-100 group-hover:text-amber-400 flex items-center justify-between text-sm sm:text-[15px]">
                    <span>3. Frontline Ops</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800 font-mono font-bold">OPS</span>
                  </div>
                  <div className="text-xs text-slate-400 truncate mt-1">Marcus Brooks</div>
                </button>

                {/* 4. CISO / Executive */}
                <button
                  type="button"
                  onClick={() => handleQuickRole('ciso')}
                  className="p-3 sm:p-3.5 rounded-2xl bg-slate-950/75 border border-slate-800/90 hover:border-purple-500/60 hover:bg-slate-900/90 text-left transition group cursor-pointer"
                >
                  <div className="font-bold text-slate-100 group-hover:text-purple-400 flex items-center justify-between text-sm sm:text-[15px]">
                    <span>4. CISO Exec</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-purple-950 text-purple-400 border border-purple-800 font-mono font-bold">CISO</span>
                  </div>
                  <div className="text-xs text-slate-400 truncate mt-1">Elena Rostova</div>
                </button>

              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Bottom Subdued Footnote */}
      <footer className="relative z-20 w-full px-6 sm:px-12 pb-5 flex flex-col sm:flex-row items-center justify-between gap-2">
        <span
          className="text-xs font-mono text-slate-400"
          style={{ textShadow: '0 2px 4px #000000, 0 0 8px rgba(0,0,0,1)' }}
        >
          Protected by Enterprise Zero-Trust Architecture • All Actions Audited
        </span>
        <span
          className="text-xs font-mono text-slate-400"
          style={{ textShadow: '0 2px 4px #000000, 0 0 8px rgba(0,0,0,1)' }}
        >
          HacXLerate 2026 Kampus.VC DRP Challenge
        </span>
      </footer>

    </div>
  );
}
