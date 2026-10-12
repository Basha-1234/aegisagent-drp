import React, { useState } from 'react';
import { Database, ShieldCheck, Globe, AtSign, Plus, CheckCircle, Sliders, ExternalLink } from 'lucide-react';

export default function BrandVault({ selectedBrand, onUpdateBrand, brands, onAddNewBrand }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newBrandName, setNewBrandName] = useState('');
  const [newHandle, setNewHandle] = useState('');
  const [newDomain, setNewDomain] = useState('');
  const [newIndustry, setNewIndustry] = useState('Fintech & Banking');

  const handleCreateBrand = (e) => {
    e.preventDefault();
    if (!newBrandName || !newHandle) return;

    const brandObj = {
      id: newBrandName.toLowerCase().replace(/[^a-z0-9]/g, ''),
      name: newBrandName,
      industry: newIndustry,
      officialHandle: newHandle.startsWith('@') ? newHandle : `@${newHandle}`,
      officialDomain: newDomain || `${newBrandName.toLowerCase()}.com`,
      supportHandle: `${newHandle}Support`,
      logoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
      riskThreshold: 50,
      activeThreats: 0
    };

    onAddNewBrand(brandObj);
    setShowAddForm(false);
    setNewBrandName('');
    setNewHandle('');
    setNewDomain('');
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img
              src={selectedBrand.logoUrl}
              alt={selectedBrand.name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-cyan-500/40 shadow-lg"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white">{selectedBrand.name}</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Vault Protected
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">{selectedBrand.industry}</p>
            </div>
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4 text-cyan-400" />
            <span>Register New Brand</span>
          </button>
        </div>
      </div>

      {/* Add New Brand Modal / Form */}
      {showAddForm && (
        <form onSubmit={handleCreateBrand} className="bg-slate-900 border border-cyan-500/30 rounded-3xl p-6 space-y-4 animate-in fade-in duration-200">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Database className="w-4 h-4 text-cyan-400" />
            Register Brand to Surveillance Vault
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-400 block mb-1">Company / Brand Name</label>
              <input
                type="text"
                required
                value={newBrandName}
                onChange={(e) => setNewBrandName(e.target.value)}
                placeholder="e.g. Acme Corp"
                className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl px-3.5 py-2 focus:ring-1 focus:ring-cyan-500"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400 block mb-1">Official Primary Handle</label>
              <input
                type="text"
                required
                value={newHandle}
                onChange={(e) => setNewHandle(e.target.value)}
                placeholder="@AcmeCorp"
                className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl px-3.5 py-2 font-mono focus:ring-1 focus:ring-cyan-500"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400 block mb-1">Legitimate Root Domain</label>
              <input
                type="text"
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                placeholder="acmecorp.com"
                className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl px-3.5 py-2 font-mono focus:ring-1 focus:ring-cyan-500"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-400 block mb-1">Industry Category</label>
              <select
                value={newIndustry}
                onChange={(e) => setNewIndustry(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl px-3.5 py-2 focus:ring-1 focus:ring-cyan-500"
              >
                <option>Fintech & Banking</option>
                <option>E-Commerce & Retail</option>
                <option>SaaS & Cloud Services</option>
                <option>Healthcare & Biotech</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-semibold shadow-md shadow-cyan-500/20"
            >
              Save Brand Assets
            </button>
          </div>
        </form>
      )}

      {/* Asset Specifications */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Whitelist channels */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Verified Brand Touchpoints (Authoritative Vault)
          </h3>

          <div className="space-y-3">
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AtSign className="w-4 h-4 text-cyan-400" />
                <div>
                  <div className="text-xs font-bold text-white font-mono">{selectedBrand.officialHandle}</div>
                  <div className="text-[11px] text-slate-400">Primary Official Social Identity</div>
                </div>
              </div>
              <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                VERIFIED
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Globe className="w-4 h-4 text-cyan-400" />
                <div>
                  <div className="text-xs font-bold text-white font-mono">https://{selectedBrand.officialDomain}</div>
                  <div className="text-[11px] text-slate-400">Official Authoritative Web Domain</div>
                </div>
              </div>
              <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                SSL ACTIVE
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AtSign className="w-4 h-4 text-cyan-400" />
                <div>
                  <div className="text-xs font-bold text-white font-mono">{selectedBrand.supportHandle}</div>
                  <div className="text-[11px] text-slate-400">Authorized Customer Support Desk</div>
                </div>
              </div>
              <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                VERIFIED
              </span>
            </div>
          </div>
        </div>

        {/* Risk Thresholds & Detection Rules */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            Detection Weights & AI Sensitivity Thresholds
          </h3>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-300">Minimum Impersonation Alert Threshold</span>
                <span className="font-mono font-bold text-cyan-300">{selectedBrand.riskThreshold}% Risk</span>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                <div 
                  className="bg-gradient-to-r from-emerald-500 via-amber-500 to-red-500 h-full" 
                  style={{ width: `${selectedBrand.riskThreshold}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Findings scoring above this value trigger high-priority alerts in your Security Operations feed.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs space-y-2">
              <div className="font-semibold text-slate-300">Active Surveillance Modules:</div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <CheckCircle className="w-3.5 h-3.5 text-cyan-400" /> Levenshtein Distance
                </div>
                <div className="flex items-center gap-1.5 text-slate-400">
                  <CheckCircle className="w-3.5 h-3.5 text-cyan-400" /> Perceptual Logo Hashing
                </div>
                <div className="flex items-center gap-1.5 text-slate-400">
                  <CheckCircle className="w-3.5 h-3.5 text-cyan-400" /> Homoglyph Substitution
                </div>
                <div className="flex items-center gap-1.5 text-slate-400">
                  <CheckCircle className="w-3.5 h-3.5 text-cyan-400" /> Scam Intent Classification
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
