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
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';

export default function AdminProvidersPage() {
  const { providers, updateProvider, syncProviderBalance, syncAllProviders } = usePlatform();
  const [editingProvider, setEditingProvider] = useState<SmsProvider | null>(null);
  const [priority, setPriority] = useState<number>(1);
  const [minAlert, setMinAlert] = useState<number>(1000);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [isSyncingAll, setIsSyncingAll] = useState(false);

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

  const handleSync = async (id: string) => {
    setSyncingId(id);
    try {
      await syncProviderBalance(id);
    } finally {
      setSyncingId(null);
    }
  };

  const handleSyncAll = async () => {
    setIsSyncingAll(true);
    try {
      await syncAllProviders();
    } finally {
      setIsSyncingAll(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">SMS Provider Integrations</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Section 9, 11 & 35: Live Carrier Gateway adapters (5SIM, OnlineSIM, SMS-Man), priority routing, and upstream balance monitors.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSyncAll}
          disabled={isSyncingAll}
          className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-lg shadow-purple-600/20"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncingAll ? 'animate-spin' : ''}`} />
          <span>{isSyncingAll ? 'Syncing Carriers...' : 'Sync All Upstream Balances'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {providers.map((p) => {
          const isLow = p.balance <= 0 && p.enabled;
          const isSyncing = syncingId === p.id;
          const depositUrl =
            p.code === 'five_sim'
              ? 'https://5sim.net/pay'
              : p.code === 'online_sim'
              ? 'https://onlinesim.io/payment'
              : 'https://sms-man.com/payment';

          const hasLiveKey = p.code === 'five_sim' || p.code === 'online_sim';

          return (
            <div
              key={p.id}
              className={`p-6 rounded-2xl glass-panel border flex flex-col justify-between space-y-6 ${
                isLow ? 'border-amber-500/40 bg-amber-500/5' : 'border-zinc-800'
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                      <Cpu className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-bold text-sm text-white">{p.name}</h3>
                        {hasLiveKey && (
                          <span className="w-2 h-2 rounded-full bg-emerald-400" title="Live API Key Active" />
                        )}
                      </div>
                      <span className="font-mono text-[10px] text-zinc-500 uppercase">{p.code}</span>
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

                {/* API Key Status Pill */}
                <div className="p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800 flex items-center justify-between text-[11px]">
                  <span className="text-zinc-400">Carrier API:</span>
                  {hasLiveKey ? (
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Live Key Active</span>
                    </span>
                  ) : (
                    <span className="text-zinc-500 font-semibold flex items-center gap-1">
                      <span>Sandbox Mode</span>
                    </span>
                  )}
                </div>

                {/* Balance Box */}
                <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-1">
                  <span className="text-[10px] text-zinc-500 uppercase font-semibold">
                    Current Carrier Balance
                  </span>
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-2xl font-mono font-extrabold text-white">
                        {p.balance.toFixed(2)} {p.currency || 'RUB'}
                      </span>
                      <span className="text-[11px] text-zinc-400 font-mono block">
                        ≈ ₹{(p.balance * 1.1).toFixed(2)} INR (Est.)
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleSync(p.id)}
                      disabled={isSyncing}
                      className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 font-semibold disabled:opacity-50 cursor-pointer"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                      <span>{isSyncing ? 'Syncing...' : 'Sync'}</span>
                    </button>
                  </div>
                  <span className="text-[10px] text-zinc-500 block pt-1">
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
                    <span className="font-mono text-amber-400">{p.minBalanceAlert} {p.currency}</span>
                  </div>
                </div>

                {isLow && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>Carrier balance zero: Deposit funds on {p.name} to activate real numbers.</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2 border-t border-zinc-800">
                <a
                  href={depositUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 px-3 rounded-xl bg-purple-600/10 hover:bg-purple-600/20 text-purple-300 border border-purple-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                >
                  <span>Deposit Funds on {p.name}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <button
                  type="button"
                  onClick={() => handleOpenEdit(p)}
                  className="w-full py-2.5 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Configure Priority & Alerts</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Priority & Alerts Modal */}
      {editingProvider && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-950 border border-purple-900/60 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white text-base">Configure {editingProvider.name}</h3>
                <span className="text-xs text-zinc-400">Adjust carrier priority & alert levels</span>
              </div>
              <button
                type="button"
                onClick={() => setEditingProvider(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Routing Priority (1 = Highest First Choice)
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs font-medium focus:outline-none focus:border-purple-500"
                >
                  <option value={1}>Priority 1 (Primary Carrier)</option>
                  <option value={2}>Priority 2 (Secondary Fallback)</option>
                  <option value={3}>Priority 3 (Tertiary Fallback)</option>
                </select>
                <span className="text-[10px] text-zinc-500 mt-1 block">
                  The order engine always queries Priority 1 first. If margin or numbers fail, it falls back to 2, then 3.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Low Balance Alert Threshold ({editingProvider.currency})
                </label>
                <input
                  type="number"
                  value={minAlert}
                  onChange={(e) => setMinAlert(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs font-mono focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingProvider(null)}
                  className="flex-1 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 text-xs font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold transition cursor-pointer shadow-lg shadow-purple-600/30"
                >
                  Save Configuration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
