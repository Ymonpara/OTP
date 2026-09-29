'use client';

import React from 'react';
import Link from 'next/link';
import { usePlatform } from '@/context/PlatformContext';
import {
  Users,
  Wallet,
  Package,
  TrendingUp,
  Cpu,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  ArrowUpRight,
  ShieldAlert,
  Layers,
  RefreshCw,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const { allUsers, orders, transactions, providers, syncProviderBalance, services } = usePlatform();

  const completedOrders = orders.filter((o) => o.status === 'COMPLETED');
  const successRate = orders.length > 0 ? ((completedOrders.length / orders.length) * 100).toFixed(1) : '100';

  const totalRevenue = completedOrders.reduce((acc, curr) => acc + curr.sellingPrice, 0);
  const totalProviderCost = completedOrders.reduce((acc, curr) => acc + curr.providerCost, 0);
  const grossMargin = totalRevenue - totalProviderCost;

  const totalRecharge = transactions
    .filter((t) => t.type === 'CREDIT_RECHARGE')
    .reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Admin Overview</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Real-time platform financial ledger, multi-provider health, and OTP volume analytics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-xs font-semibold text-emerald-400">System Healthy</span>
        </div>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl glass-panel border border-zinc-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-zinc-400">Total Revenue</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">
            ₹{totalRevenue.toFixed(2)}
          </div>
          <p className="text-[11px] text-emerald-400 mt-1">Gross completed orders</p>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-zinc-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-zinc-400">Gross Margin (Profit)</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-purple-400 font-mono">
            ₹{grossMargin.toFixed(2)}
          </div>
          <p className="text-[11px] text-zinc-400 mt-1">
            Margin: {totalRevenue > 0 ? ((grossMargin / totalRevenue) * 100).toFixed(1) : 0}%
          </p>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-zinc-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-zinc-400">Today&apos;s Recharges</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">
            ₹{totalRecharge.toFixed(2)}
          </div>
          <p className="text-[11px] text-zinc-400 mt-1">Wallet deposits verified</p>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-zinc-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-zinc-400">OTP Success Rate</span>
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-teal-400 font-mono">
            {successRate}%
          </div>
          <p className="text-[11px] text-zinc-400 mt-1">
            {completedOrders.length} of {orders.length} orders
          </p>
        </div>
      </div>

      {/* PROVIDER WALLET BALANCES */}
      <div className="p-6 rounded-2xl glass-panel border border-zinc-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-purple-400" />
              External SMS Provider Account Balances (Section 35)
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Live balances held with external upstream carriers. Alert triggers when balance drops
              below threshold.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {providers.map((p) => {
            const isLow = p.balance < p.minBalanceAlert && p.enabled;
            return (
              <div
                key={p.id}
                className={`p-4 rounded-xl border flex flex-col justify-between ${
                  isLow
                    ? 'bg-amber-500/10 border-amber-500/40'
                    : 'bg-zinc-900/60 border-zinc-800'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-xs text-white">{p.name}</span>
                    <span
                      className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        p.enabled ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-800 text-zinc-500'
                      }`}
                    >
                      {p.enabled ? `Priority ${p.priority}` : 'Disabled'}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold font-mono text-white">
                      ₹{p.balance.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-zinc-400">Balance</span>
                  </div>

                  {isLow ? (
                    <div className="flex items-center gap-1.5 text-xs text-amber-400 font-semibold mt-2">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Below ₹{p.minBalanceAlert} Alert Limit!</span>
                    </div>
                  ) : (
                    <div className="text-[11px] text-emerald-400 mt-2 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Healthy (Limit: ₹{p.minBalanceAlert})</span>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-zinc-800/80 mt-3 flex items-center justify-between text-[11px]">
                  <span className="text-zinc-500">Latency: {p.pingMs}ms</span>
                  <button
                    type="button"
                    onClick={() => syncProviderBalance(p.id)}
                    className="text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Sync Balance</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Services Pricing Snapshot & Volume */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Top Services Margins */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" />
              Service Pricing & Margin Spread
            </h3>
            <Link href="/admin/services" className="text-xs text-purple-400 hover:underline">
              Manage All Services →
            </Link>
          </div>

          <div className="rounded-2xl glass-panel border border-zinc-800 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-900 text-zinc-400 font-semibold border-b border-zinc-800">
                <tr>
                  <th className="px-4 py-3">Service</th>
                  <th className="px-4 py-3">Selling Price</th>
                  <th className="px-4 py-3">Provider Cost</th>
                  <th className="px-4 py-3">Gross Margin</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {services.slice(0, 6).map((s) => {
                  const margin = s.sellingPrice - s.providerCostEstimate;
                  return (
                    <tr key={s.id} className="hover:bg-zinc-900/40">
                      <td className="px-4 py-3 font-semibold text-white">{s.name}</td>
                      <td className="px-4 py-3 font-mono font-bold text-emerald-400">
                        ₹{s.sellingPrice.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 font-mono text-zinc-400">
                        ₹{s.providerCostEstimate.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 font-mono font-bold text-purple-300">
                        +₹{margin.toFixed(2)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            s.enabled
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : 'bg-zinc-800 text-zinc-500'
                          }`}
                        >
                          {s.enabled ? 'ACTIVE' : 'DISABLED'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Users Quick Overview */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-400" />
              Registered Customers ({allUsers.length})
            </h3>
            <Link href="/admin/users" className="text-xs text-purple-400 hover:underline">
              User Directory →
            </Link>
          </div>

          <div className="p-4 rounded-2xl glass-panel border border-zinc-800 space-y-3">
            {allUsers.map((u) => (
              <div
                key={u.id}
                className="flex items-center justify-between py-2 border-b border-zinc-800/60 last:border-0 text-xs"
              >
                <div>
                  <span className="font-semibold text-zinc-200 block">{u.name}</span>
                  <span className="text-[10px] text-zinc-500">{u.email}</span>
                </div>
                <div className="text-right">
                  <span
                    className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      u.status === 'active'
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : 'bg-rose-500/10 text-rose-400'
                    }`}
                  >
                    {u.status}
                  </span>
                  <span className="text-[10px] text-zinc-500 block mt-0.5">{u.role}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
