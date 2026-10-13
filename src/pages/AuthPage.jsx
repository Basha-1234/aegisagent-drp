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
  const [step, setStep] = useState(1); // 1 = email, 2 = password / SSO confirm
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
    <div className="min-h-screen bg-enterprise-grid flex flex-col items-center justify-center p-4 sm:p-6 relative selection:bg-emerald-500 selection:text-black">
      
      {/* Subtle Top Ambient Banner */}
      <div className="absolute top-6 flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/40 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-medium backdrop-blur-md">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        <span>ENTERPRISE DIGITAL RISK PROTECTION GATEWAY</span>
      </div>

      <div className="w-full max-w-md flex flex-col items-center">
        
        {/* 3D Shield Emblem Overhanging */}
        <div className="mb-[-28px] z-20 transition-transform duration-300 hover:scale-105 cursor-pointer">
          <AegisShieldLogo size={76} />
        </div>

        {/* Main Frosted Glass Card Container */}
        <div className="w-full glass-panel rounded-2xl p-6 sm:p-8 pt-11 relative shadow-2xl border border-emerald-500/25">
          
          {/* Header Typography */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center justify-center gap-2">
              AegisAgent <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono">DRP</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1 font-medium">
              Autonomous Digital Risk Protection: Social & App Monitoring
            </p>
          </div>

          {/* Dual-Mode Segmented Tabs */}
          <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-950/70 border border-emerald-500/20 mb-6 text-xs font-semibold">
            <button
              onClick={() => { setActiveTab('signin'); setAuthError(''); }}
              className={`py-2 px-3 rounded-lg transition-all text-center flex items-center justify-center gap-1.5 ${
                activeTab === 'signin'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Direct Sign-In</span>
            </button>
            <button
              onClick={() => { setActiveTab('request'); setAuthError(''); setReqSubmitted(false); }}
              className={`py-2 px-3 rounded-lg transition-all text-center flex items-center justify-center gap-1.5 ${
                activeTab === 'request'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
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
              <div className="text-xs font-semibold text-slate-300 pb-1 flex items-center justify-between">
                <span>Defense Operations Access Portal</span>
                <span className="text-[11px] text-emerald-400 font-mono">SSO Enabled</span>
              </div>

              {authError && (
                <div className="p-2.5 rounded-lg bg-red-950/50 border border-red-500/30 text-red-300 text-xs flex items-center gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{authError}</span>
                </div>
              )}

              {step === 1 ? (
                /* Step 1: Work Email */
                <form onSubmit={handleProceedToPassword} className="space-y-3.5">
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Modern corporate email (user@company.com)"
                      required
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-emerald-500/30 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/50 transition"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 rounded-xl emerald-button text-xs flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                  >
                    <span>Continue with Work Email</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              ) : (
                /* Step 2: Password / SSO */
                <form onSubmit={handleFinalSignIn} className="space-y-3.5 animate-in slide-in-from-right-3 duration-200">
                  <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-950/60 border border-slate-800 text-xs">
                    <span className="text-slate-300 font-medium truncate">{email}</span>
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="text-emerald-400 hover:underline text-[11px] font-semibold ml-2 shrink-0"
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
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-emerald-500/30 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400/50 transition"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isAuthenticating}
                    className="w-full py-2.5 px-4 rounded-xl emerald-button text-xs flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                  >
                    {isAuthenticating ? (
                      <span className="flex items-center gap-2">
                        <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                        Authenticating Credentials...
                      </span>
                    ) : (
                      <>
                        <Shield className="w-3.5 h-3.5" />
                        <span>Sign In with Corporate SSO</span>
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* 1-Click Demo Persona Quick-Fill */}
              <div className="pt-4 border-t border-slate-800/80">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-emerald-400" />
                    1-CLICK DEMO PERSONAS
                  </span>
                  <span className="text-[10px] text-slate-500">Instant Triage</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <button
                    type="button"
                    onClick={() => handleQuickDemoSelect('analyst')}
                    className="p-2 rounded-lg bg-slate-950/70 border border-slate-800 hover:border-cyan-500/60 hover:bg-slate-900 text-left transition group"
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
                    className="p-2 rounded-lg bg-slate-950/70 border border-slate-800 hover:border-amber-500/60 hover:bg-slate-900 text-left transition group"
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
                    className="p-2 rounded-lg bg-slate-950/70 border border-slate-800 hover:border-blue-500/60 hover:bg-slate-900 text-left transition group"
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
                    className="p-2 rounded-lg bg-slate-950/70 border border-slate-800 hover:border-emerald-500/60 hover:bg-slate-900 text-left transition group"
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
                <span className="text-[11px] text-amber-400 font-mono">Requires CISO Sign-off</span>
              </div>

              {reqSubmitted ? (
                <div className="p-5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-center space-y-3 animate-in fade-in">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-white">Access Request Dispatched!</h4>
                    <p className="text-xs text-slate-300 mt-1">
                      Your request has been routed to the organization CISO (<strong className="text-emerald-400">Elena Rostova</strong>). Once approved, you will receive your role activation credentials.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setActiveTab('signin'); setReqSubmitted(false); }}
                    className="text-xs text-emerald-400 hover:underline font-semibold"
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
                      className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-emerald-500/30 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
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
                      className="w-full px-3 py-2 rounded-xl bg-slate-950/80 border border-emerald-500/30 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-medium text-slate-400 mb-1">Department</label>
                      <select
                        value={reqDept}
                        onChange={(e) => setReqDept(e.target.value)}
                        className="w-full px-2.5 py-2 rounded-xl bg-slate-950/80 border border-emerald-500/30 text-xs text-white focus:outline-none focus:border-emerald-400"
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
                        className="w-full px-2.5 py-2 rounded-xl bg-slate-950/80 border border-emerald-500/30 text-xs text-white focus:outline-none focus:border-emerald-400"
                      >
                        <option value="analyst">Security Analyst (/analyst)</option>
                        <option value="legal">Legal Counsel (/legal)</option>
                        <option value="support">Customer Support (/support)</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 rounded-xl emerald-button text-xs flex items-center justify-center gap-2 cursor-pointer mt-2"
                  >
                    <span>Submit Request to CISO</span>
                    <Building className="w-3.5 h-3.5" />
                  </button>
                </form>
              )}
            </div>
          )}

        </div>

        {/* Bottom Operational Status Pill */}
        <div className="mt-6 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-950/80 border border-emerald-500/20 text-[11px] text-slate-400 shadow-sm backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>System: <strong className="text-emerald-400 font-semibold">All Defense Engines Operational</strong></span>
          <span className="text-slate-600">•</span>
          <span className="font-mono text-[10px] text-slate-400">SOC 2 Type II</span>
        </div>

      </div>

    </div>
  );
}
