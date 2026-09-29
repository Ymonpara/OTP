'use client';

import React, { useState } from 'react';
import { usePlatform } from '@/context/PlatformContext';
import { SmsProvider } from '@/types';
import {
  Cpu,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Edit2,
  Sliders,
  ShieldCheck,
  Zap,
  X,
} from 'lucide-react';

export default function AdminProvidersPage() {
  const { providers, updateProvider, syncProviderBalance } = usePlatform();
  const [editingProvider, setEditingProvider] = useState<SmsProvider | null>(null);
  const [priority, setPriority] = useState<number>(1);
  const [minAlert, setMinAlert] = useState<number>(1000);

  const handleOpenEdit = (p: SmsProvider) => {
    setEditingProvider(p);
    setPriority(p.priority);
    setMinAlert(p.minBalanceAlert);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProvider) return;
    updateProvider(editingProvider.id, {
      priority,
      minBalanceAlert: minAlert,
    });
    setEditingProvider(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">SMS Provider Integrations</h1>
        <p className="text-xs text-zinc-400 mt-1">
          Sections 9, 11 & 35: Manage carrier adapters (5SIM, OnlineSIM, SMS-Man), priority routing, and balance alert monitors.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {providers.map((p) => {
          const isLow = p.balance < p.minBalanceAlert && p.enabled;
          return (
            <div
              key={p.id}
              className={`p-6 rounded-2xl glass-panel border flex flex-col justify-between space-y-6 ${
                isLow ? 'border-amber-500/50 bg-amber-500/5' : 'border-zinc-800'
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                      <Cpu className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-white">{p.name}</h3>
                      <span className="font-mono text-[10px] text-zinc-500">{p.code}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => updateProvider(p.id, { enabled: !p.enabled })}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase transition ${
                      p.enabled
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-zinc-800 text-zinc-500'
                    }`}
                  >
                    {p.enabled ? 'ACTIVE' : 'DISABLED'}
                  </button>
                </div>

                {/* Balance Box */}
                <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-1">
                  <span className="text-[10px] text-zinc-500 uppercase font-semibold">
                    Current External Balance
                  </span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-mono font-extrabold text-white">
                      ₹{p.balance.toFixed(2)}
                    </span>
                    <button
                      type="button"
                      onClick={() => syncProviderBalance(p.id)}
                      className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 font-semibold"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Sync</span>
                    </button>
                  </div>
                  <span className="text-[10px] text-zinc-500 block">
                    Last checked: {p.lastCheckedAt}
                  </span>
                </div>

                {/* Health & Specs */}
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between py-1 border-b border-zinc-800/60">
                    <span className="text-zinc-400">Priority Order:</span>
                    <span className="font-bold text-purple-300 font-mono">Rank #{p.priority}</span>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-zinc-800/60">
                    <span className="text-zinc-400">API Health:</span>
                    <span
                      className={`font-semibold flex items-center gap-1 ${
                        p.apiHealth === 'operational'
                          ? 'text-emerald-400'
                          : p.apiHealth === 'degraded'
                          ? 'text-amber-400'
                          : 'text-rose-400'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-current" />
                      {p.apiHealth} ({p.pingMs}ms)
                    </span>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-zinc-800/60">
                    <span className="text-zinc-400">Success Rate:</span>
                    <span className="font-mono text-zinc-200">{p.successRate}%</span>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-zinc-800/60">
                    <span className="text-zinc-400">Total Numbers Assigned:</span>
                    <span className="font-mono text-zinc-200">{p.totalNumbersAssigned}</span>
                  </div>

                  <div className="flex items-center justify-between py-1">
                    <span className="text-zinc-400">Low Balance Alert Limit:</span>
                    <span className="font-mono text-amber-400">₹{p.minBalanceAlert}</span>
                  </div>
                </div>

                {isLow && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>Threshold breach: Please deposit funds into {p.name} account.</span>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => handleOpenEdit(p)}
                className="w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-purple-600 hover:text-white text-zinc-200 text-xs font-semibold flex items-center justify-center gap-2 transition border border-zinc-700/80"
              >
                <Sliders className="w-4 h-4" />
                <span>Configure Priority & Alerts</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Edit Provider Modal */}
      {editingProvider && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="font-bold text-sm text-white">
                Configure {editingProvider.name}
              </h3>
              <button
                onClick={() => setEditingProvider(null)}
                className="text-zinc-500 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1 font-semibold">Priority Ranking</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  required
                  value={priority}
                  onChange={(e) => setPriority(parseInt(e.target.value) || 1)}
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-700 rounded-xl text-zinc-100 font-mono text-xs focus:outline-none focus:border-purple-500"
                />
                <p className="text-[10px] text-zinc-500 mt-1">
                  1 = Highest priority (tried first when buying temporary numbers).
                </p>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-semibold">
                  Minimum Balance Alert Threshold (₹)
                </label>
                <input
                  type="number"
                  min="100"
                  step="100"
                  required
                  value={minAlert}
                  onChange={(e) => setMinAlert(parseFloat(e.target.value) || 500)}
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-700 rounded-xl text-amber-400 font-mono text-xs focus:outline-none focus:border-purple-500"
                />
                <p className="text-[10px] text-zinc-500 mt-1">
                  Section 35: Administrator warning triggers when provider balance drops below this.
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingProvider(null)}
                  className="flex-1 py-2.5 rounded-xl bg-zinc-800 text-zinc-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold"
                >
                  Save Settings
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
