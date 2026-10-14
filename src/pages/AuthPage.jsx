import React, { useState } from 'react';
import { useAuth, DEMO_PERSONAS } from '../context/AuthContext';
import AegisShieldLogo from '../components/common/AegisShieldLogo';
import { Shield, ArrowRight, Lock, Mail, User, Building, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

export default function AuthPage() {
  const { login, loginAsRole, submitAccessRequest } = useAuth();
  
  // Tab state: 'signin' | 'request'
  const [activeTab, setActiveTab] = useState('signin');
  
  // Sign-in form state
  const [email, setEmail] = useState('alex.chen@quickpay.com');
  const [password, setPassword] = useState('••••••••••••');
  const [step, setStep] = useState(1);
  const [authError, setAuthError] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Request Access form state
  const [reqName, setReqName] = useState('');
  const [reqEmail, setReqEmail] = useState('');
  const [reqRole, setReqRole] = useState('analyst');
  const [reqDept, setReqDept] = useState('Security Operations');
  const [reqSubmitted, setReqSubmitted] = useState(false);

  // Handle standard email submission
  const handleProceedToPassword = (e) => {
    e.preventDefault();
    setAuthError('');
    if (!email.trim() || !email.includes('@')) {
      setAuthError('Please enter a valid corporate email address');
      return;
    }
    setStep(2);
  };

  const handleFinalSignIn = (e) => {
    e.preventDefault();
    setIsAuthenticating(true);
    setAuthError('');
    setTimeout(() => {
      const res = login(email, password);
      if (!res.success) {
        setAuthError(res.message);
        setIsAuthenticating(false);
      }
    }, 450);
  };

  // 1-Click Demo Persona Quick-Fill
  const handleQuickDemoSelect = (roleKey) => {
    const persona = DEMO_PERSONAS[roleKey];
    if (persona) {
      setEmail(persona.email);
      setPassword('••••••••••••');
      setIsAuthenticating(true);
      setTimeout(() => {
        loginAsRole(roleKey);
      }, 300);
    }
  };

  // Handle Access Request Submission
  const handleRequestSubmit = (e) => {
    e.preventDefault();
    if (!reqName.trim() || !reqEmail.trim()) {
      setAuthError('Please fill in all required fields');
      return;
    }
    submitAccessRequest({
      name: reqName,
      email: reqEmail,
      requestedRole: reqRole,
      department: reqDept
    });
    setReqSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-enterprise-grid flex flex-col items-center justify-center p-4 sm:p-8 relative selection:bg-blue-500 selection:text-white">
      
      {/* Top Ambient Corporate Ribbon */}
      <div className="absolute top-5 flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-950/40 border border-blue-500/25 text-blue-400 text-xs font-mono font-medium backdrop-blur-md shadow-sm">
        <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
        <span>ENTERPRISE THREAT RADAR & IDENTITY PROTECTION GATEWAY</span>
      </div>

      {/* Main Responsive Split Layout: Left 3D Shield + Right Floating Glass Card */}
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center my-auto pt-10 lg:pt-0">
        
        {/* LEFT COLUMN: 3D Faceted Cobalt Crystal Shield with Radiant Blue Light Rays */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center relative select-none">
          {/* Ambient Blue Radial Flare Behind Shield */}
          <div className="absolute -inset-4 sm:-inset-8 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute w-72 h-72 bg-sky-500/15 rounded-full blur-2xl pointer-events-none animate-pulse" />
          
          {/* 3D Shield Visual Asset (Exact image matching user reference) */}
          <div className="relative z-10 transition-transform duration-500 hover:scale-105 group cursor-pointer">
            <div className="w-64 sm:w-80 h-auto rounded-3xl overflow-hidden shadow-[0_20px_60px_-15px_rgba(37,99,235,0.5)] border border-blue-400/30">
              <img 
                src="/aegis_shield_3d_cobalt.jpg" 
                alt="AegisAgent DRP 3D Cobalt Shield" 
                className="w-full h-auto object-cover transform scale-110 group-hover:scale-115 transition duration-500" 
              />
            </div>
            
            {/* Luminous Specular Badge Overlay */}
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full bg-slate-950/90 border border-blue-500/40 shadow-xl backdrop-blur-md flex items-center gap-2 whitespace-nowrap">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              <span className="text-[11px] font-mono text-blue-200 font-semibold tracking-wide">Autonomous 3D Aegis Core</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Floating Frosted Glass Card (Matching Exact Screen Typography & Layout) */}
        <div className="lg:col-span-7 w-full">
          <div className="w-full glass-panel rounded-3xl p-6 sm:p-9 relative shadow-2xl border border-blue-500/30">
            
            {/* Header Typography Exactly Matching Image */}
            <div className="mb-6">
              <div className="text-xs font-semibold text-blue-400 font-mono tracking-wider uppercase flex items-center gap-1.5">
                <span>AegisAgent DRP</span>
                <span className="text-slate-600">•</span>
                <span className="text-slate-400">Enterprise Edition</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
                Enterprise Threat Command
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 font-medium leading-relaxed">
                Autonomous Digital Risk Protection: Social & App Monitoring
              </p>

              {/* Active Tenant Capsule Pill Exactly as in Reference Image */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-950/80 border border-blue-500/25 text-xs text-slate-200 mt-3 font-mono">
                <span className="text-slate-400">Tenant:</span>
                <strong className="text-blue-400">QuickPay Technologies</strong>
              </div>
            </div>

            {/* Dual-Mode Segmented Tabs (Direct Sign-In vs Request Access) */}
            <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-950/80 border border-blue-500/20 mb-5 text-xs font-semibold">
              <button
                onClick={() => { setActiveTab('signin'); setAuthError(''); }}
                className={`py-2 px-3 rounded-lg transition-all text-center flex items-center justify-center gap-1.5 ${
                  activeTab === 'signin'
                    ? 'bg-blue-600/30 text-blue-300 border border-blue-500/50 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Direct Corporate Sign-In</span>
              </button>
              <button
                onClick={() => { setActiveTab('request'); setAuthError(''); setReqSubmitted(false); }}
                className={`py-2 px-3 rounded-lg transition-all text-center flex items-center justify-center gap-1.5 ${
                  activeTab === 'request'
                    ? 'bg-blue-600/30 text-blue-300 border border-blue-500/50 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Request Access</span>
              </button>
            </div>

            {/* TAB 1: DIRECT CORPORATE SIGN-IN */}
            {activeTab === 'signin' && (
              <div className="space-y-4">
                {authError && (
                  <div className="p-2.5 rounded-xl bg-red-950/50 border border-red-500/30 text-red-300 text-xs flex items-center gap-2 animate-in fade-in">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                    <span>{authError}</span>
                  </div>
                )}

                {step === 1 ? (
                  /* Step 1: Corporate Email Input with Glowing Blue Border */
                  <form onSubmit={handleProceedToPassword} className="space-y-3.5">
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Corporate email (user@quickpay.com)"
                        required
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/90 border border-blue-500/40 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/40 transition shadow-inner"
                      />
                    </div>

                    {/* Exact Vibrant Solid Blue Button from Reference Image */}
                    <button
                      type="submit"
                      className="w-full py-2.5 px-4 rounded-xl cobalt-button text-xs flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] font-bold tracking-wide"
                    >
                      <span>Sign in with Corporate SSO</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </form>
                ) : (
                  /* Step 2: Password / SSO */
                  <form onSubmit={handleFinalSignIn} className="space-y-3.5 animate-in slide-in-from-right-3 duration-200">
                    <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
                      <span className="text-slate-300 font-medium truncate">{email}</span>
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="text-blue-400 hover:underline text-[11px] font-semibold ml-2 shrink-0"
                      >
                        Change
                      </button>
                    </div>

                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter corporate password"
                        required
                        autoFocus
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/90 border border-blue-500/40 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/40 transition shadow-inner"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isAuthenticating}
                      className="w-full py-2.5 px-4 rounded-xl cobalt-button text-xs flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] font-bold tracking-wide"
                    >
                      {isAuthenticating ? (
                        <span className="flex items-center gap-2">
                          <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Authenticating Credentials...
                        </span>
                      ) : (
                        <>
                          <Shield className="w-3.5 h-3.5" />
                          <span>Verify & Enter Console</span>
                        </>
                      )}
                    </button>
                  </form>
                )}

                {/* 1-Click Evaluation Personas Bar */}
                <div className="pt-4 border-t border-slate-800/80">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-blue-400" />
                      1-CLICK EVALUATION PERSONAS
                    </span>
                    <span className="text-[10px] text-blue-400 font-mono">Demo Mode</span>
                  </div>

                  {/* Guidance Box requested by user */}
                  <div className="p-2.5 rounded-xl bg-blue-950/40 border border-blue-500/25 text-[11px] text-blue-200/90 flex items-start gap-2 mb-3">
                    <Sparkles className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />
                    <span className="leading-snug">
                      <strong className="text-white font-semibold">Evaluation Quick-Access:</strong> Click any role below to instantly log in as that employee and test their dedicated dashboard without typing credentials.
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <button
                      type="button"
                      onClick={() => handleQuickDemoSelect('analyst')}
                      className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-cyan-500/60 hover:bg-slate-900 text-left transition group"
                    >
                      <div className="font-bold text-slate-200 group-hover:text-cyan-400 flex items-center justify-between">
                        <span>1. Analyst</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 font-mono">SOC</span>
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">Alex Chen</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleQuickDemoSelect('legal')}
                      className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-amber-500/60 hover:bg-slate-900 text-left transition group"
                    >
                      <div className="font-bold text-slate-200 group-hover:text-amber-400 flex items-center justify-between">
                        <span>2. Legal</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-950 text-amber-400 border border-amber-800 font-mono">DMCA</span>
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">Sarah Vance</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleQuickDemoSelect('support')}
                      className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-blue-500/60 hover:bg-slate-900 text-left transition group"
                    >
                      <div className="font-bold text-slate-200 group-hover:text-blue-400 flex items-center justify-between">
                        <span>3. Support</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-blue-950 text-blue-400 border border-blue-800 font-mono">Radar</span>
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">Marcus Brooks</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleQuickDemoSelect('ciso')}
                      className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-emerald-500/60 hover:bg-slate-900 text-left transition group"
                    >
                      <div className="font-bold text-slate-200 group-hover:text-emerald-400 flex items-center justify-between">
                        <span>4. CISO</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono">Admin</span>
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">Elena Rostova</div>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: REQUEST WORKSPACE ACCESS (PENDING CISO APPROVAL) */}
            {activeTab === 'request' && (
              <div className="space-y-4">
                <div className="text-xs font-semibold text-slate-300 pb-1 flex items-center justify-between">
                  <span>Employee Onboarding Request</span>
                  <span className="text-[11px] text-blue-400 font-mono">Requires CISO Sign-off</span>
                </div>

                {reqSubmitted ? (
                  <div className="p-5 rounded-2xl bg-blue-950/40 border border-blue-500/30 text-center space-y-3 animate-in fade-in">
                    <div className="w-10 h-10 rounded-full bg-blue-500/20 border border-blue-500/40 text-blue-400 flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white">Access Request Dispatched!</h4>
                      <p className="text-xs text-slate-300 mt-1">
                        Your request has been routed to the organization CISO (<strong className="text-blue-400">Elena Rostova</strong>). Once approved, you will receive your role activation credentials.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setActiveTab('signin'); setReqSubmitted(false); }}
                      className="text-xs text-blue-400 hover:underline font-semibold"
                    >
                      ← Return to Direct Sign-In
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleRequestSubmit} className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-400 mb-1">Full Legal Name</label>
                      <input
                        type="text"
                        value={reqName}
                        onChange={(e) => setReqName(e.target.value)}
                        placeholder="e.g., Rohan Sharma"
                        required
                        className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-blue-500/30 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-400"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-400 mb-1">Corporate Email Address</label>
                      <input
                        type="email"
                        value={reqEmail}
                        onChange={(e) => setReqEmail(e.target.value)}
                        placeholder="rohan.sharma@quickpay.com"
                        required
                        className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-blue-500/30 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-400"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-medium text-slate-400 mb-1">Department</label>
                        <select
                          value={reqDept}
                          onChange={(e) => setReqDept(e.target.value)}
                          className="w-full px-2.5 py-2 rounded-xl bg-slate-950/80 border border-blue-500/30 text-xs text-white focus:outline-none focus:border-blue-400"
                        >
                          <option value="Security Operations">Security Ops (SOC)</option>
                          <option value="Legal & IP Compliance">Legal & Compliance</option>
                          <option value="Customer Support">Customer Care</option>
                          <option value="Executive Office">C-Suite / Executive</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-slate-400 mb-1">Requested Role</label>
                        <select
                          value={reqRole}
                          onChange={(e) => setReqRole(e.target.value)}
                          className="w-full px-2.5 py-2 rounded-xl bg-slate-950/80 border border-blue-500/30 text-xs text-white focus:outline-none focus:border-blue-400"
                        >
                          <option value="analyst">Security Analyst (/analyst)</option>
                          <option value="legal">Legal Counsel (/legal)</option>
                          <option value="support">Customer Support (/support)</option>
                        </select>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 px-4 rounded-xl cobalt-button text-xs flex items-center justify-center gap-2 cursor-pointer mt-2"
                    >
                      <span>Submit Request to CISO</span>
                      <Building className="w-3.5 h-3.5" />
                    </button>
                  </form>
                )}
              </div>
            )}

          </div>
        </div>

      </div>

      {/* Bottom Operational Status Capsule */}
      <div className="mt-8 flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-950/90 border border-blue-500/25 text-[11px] text-slate-400 shadow-sm backdrop-blur-md">
        <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
        <span>System: <strong className="text-blue-400 font-semibold">All Defense Engines Operational</strong></span>
        <span className="text-slate-600">•</span>
        <span className="font-mono text-[10px] text-slate-400">SOC 2 Type II Certified</span>
      </div>

    </div>
  );
}
