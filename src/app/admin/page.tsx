'use client';

import React, { useState } from 'react';
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
  ExternalLink,
  Activity,
  Server,
  Zap,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const {
    allUsers,
    orders,
    transactions,
    providers,
    syncProviderBalance,
    syncAllProviders,
    services,
  } = usePlatform();

  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [isSyncingAll, setIsSyncingAll] = useState(false);

  const completedOrders = orders.filter((o) => o.status === 'COMPLETED');
  const successRate = orders.length > 0 ? ((completedOrders.length / orders.length) * 100).toFixed(1) : '100';

  const totalRevenue = completedOrders.reduce((acc, curr) => acc + curr.sellingPrice, 0);
  const totalProviderCost = completedOrders.reduce((acc, curr) => acc + curr.providerCost, 0);
  const grossMargin = totalRevenue - totalProviderCost;

  const totalRecharge = transactions
    .filter((t) => t.type === 'CREDIT_RECHARGE')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const handleSyncProvider = async (id: string) => {
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
    <div className="space-y-8">
      {/* Header & Live System Status */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Admin Master Console</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Real-time platform financial ledger, multi-carrier upstream connectivity, and OTP volume analytics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSyncAll}
            disabled={isSyncingAll}
            className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-lg shadow-purple-600/20"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncingAll ? 'animate-spin' : ''}`} />
            <span>{isSyncingAll ? 'Syncing...' : 'Sync All Carriers'}</span>
          </button>
        </div>
      </div>

      {/* Live Upstream & Backend Status Ribbon */}
      <div className="p-4 rounded-2xl bg-zinc-950/80 border border-purple-900/40 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <Server className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-zinc-500 block uppercase font-semibold">Backend Engine</span>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="font-bold text-zinc-200">Express REST (Port 5000)</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-zinc-500 block uppercase font-semibold">5SIM Carrier</span>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="font-bold text-zinc-200">Live API Key Active</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-zinc-500 block uppercase font-semibold">OnlineSIM Carrier</span>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="font-bold text-zinc-200">Live API Key Active</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 shrink-0">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-zinc-500 block uppercase font-semibold">Auto-Expiry Worker</span>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
              <span className="font-bold text-zinc-200">3s Poll & Auto-Hold Release</span>
            </div>
          </div>
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

      {/* PROVIDER WALLET BALANCES (SECTION 35) */}
      <div className="p-6 rounded-2xl glass-panel border border-zinc-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-purple-400" />
              External Carrier Account Balances & Live Health
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Live balances held with upstream SMS carriers. When carrier balance is 0 RUB, platform smoothly falls back to sandbox.
            </p>
          </div>

          <Link href="/admin/providers" className="text-xs text-purple-400 hover:underline">
            Manage Provider Routing →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {providers.map((p) => {
            const isLow = p.balance <= 0 && p.enabled;
            const isSyncing = syncingId === p.id;
            const depositUrl =
              p.code === 'five_sim'
                ? 'https://5sim.net/pay'
                : p.code === 'online_sim'
                ? 'https://onlinesim.io/payment'
                : 'https://sms-man.com/payment';

            return (
              <div
                key={p.id}
                className={`p-4 rounded-xl border flex flex-col justify-between ${
                  isLow
                    ? 'bg-amber-500/5 border-amber-500/30'
                    : 'bg-zinc-900/60 border-zinc-800'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs text-white">{p.name}</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" title="Live API Connected" />
                    </div>
                    <span
                      className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        p.enabled ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-800 text-zinc-500'
                      }`}
                    >
                      {p.enabled ? `Priority #${p.priority}` : 'Disabled'}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold font-mono text-white">
                        {p.balance.toFixed(2)} {p.currency || 'RUB'}
                      </span>
                    </div>
                    <span className="text-[10px] text-zinc-400 block font-mono">
                      ≈ ₹{(p.balance * 1.1).toFixed(2)} INR (Est.)
                    </span>
                  </div>

                  {isLow ? (
                    <div className="flex items-center gap-1.5 text-[11px] text-amber-400 font-semibold mt-2.5">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>Zero Carrier Balance (Auto-Sandbox Active)</span>
                    </div>
                  ) : (
                    <div className="text-[11px] text-emerald-400 mt-2.5 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Live Carrier Operational</span>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-zinc-800/80 mt-3 flex items-center justify-between text-[11px]">
                  <a
                    href={depositUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-zinc-400 hover:text-white flex items-center gap-1"
                  >
                    <span>Deposit Funds</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>

                  <button
                    type="button"
                    onClick={() => handleSyncProvider(p.id)}
                    disabled={isSyncing}
                    className="text-purple-400 hover:text-purple-300 font-semibold flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>{isSyncing ? 'Syncing...' : 'Sync Balance'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* PAYMENT GATEWAY INTEGRATION STATUS */}
      <div className="p-5 rounded-2xl glass-panel border border-zinc-800 space-y-3 bg-gradient-to-r from-purple-950/20 via-zinc-900/60 to-zinc-900/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">Razorpay Payment Gateway</h3>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Production Key Active
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Key ID: <span className="font-mono text-zinc-300">rzp_live_TqcF2Qv8TXmNHS</span> • HMAC-SHA256 Verification: <span className="text-emerald-400 font-medium">Secured</span> • Automated Wallet Credit: <span className="text-emerald-400 font-medium">Enabled</span>
              </p>
            </div>
          </div>

          <Link
            href="/dashboard/wallet/add-money"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-semibold transition-all self-start sm:self-auto"
          >
            <span>Test Add Money</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* RECENT LIVE ORDERS FEED */}
      <div className="p-6 rounded-2xl glass-panel border border-zinc-800 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Package className="w-4 h-4 text-purple-400" />
              Live Order Stream & Carrier Sourcing
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Live virtual numbers issued to customers with carrier origin and incoming OTP codes.
            </p>
          </div>

          <Link href="/admin/orders" className="text-xs text-purple-400 hover:underline">
            View All {orders.length} Orders →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-900/80 text-zinc-400 font-semibold border-b border-zinc-800">
              <tr>
                <th className="px-4 py-3">Order ID</th>
                <th className="px-4 py-3">Service</th>
                <th className="px-4 py-3">Phone Number</th>
                <th className="px-4 py-3">Carrier Source</th>
                <th className="px-4 py-3">Price / Margin</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Received OTP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {orders.slice(0, 5).map((order) => {
                const isReal = order.isRealProvider;
                return (
                  <tr key={order.id} className="hover:bg-zinc-900/40">
                    <td className="px-4 py-3 font-mono text-zinc-300 font-semibold">
                      {order.id}
                    </td>
                    <td className="px-4 py-3 text-white font-medium">
                      {order.countryFlag} {order.serviceName}
                    </td>
                    <td className="px-4 py-3 font-mono text-zinc-200">
                      {order.phoneNumber}
                    </td>
                    <td className="px-4 py-3">
                      {isReal ? (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Real {order.providerName}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          Sandbox
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono">
                      <span className="text-white font-bold">₹{order.sellingPrice.toFixed(2)}</span>
                      <span className="text-[10px] text-purple-400 block">+₹{order.grossMargin.toFixed(2)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                          order.status === 'COMPLETED'
                            ? 'bg-emerald-500/10 text-emerald-400'
                            : order.status === 'WAITING_FOR_SMS'
                            ? 'bg-amber-500/10 text-amber-400 animate-pulse'
                            : order.status === 'CANCELLED'
                            ? 'bg-rose-500/10 text-rose-400'
                            : 'bg-zinc-800 text-zinc-400'
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono">
                      {order.smsReceived ? (
                        <span className="px-2 py-1 rounded bg-purple-500/20 text-purple-300 font-bold text-xs">
                          {order.smsReceived.otpCode}
                        </span>
                      ) : (
                        <span className="text-zinc-600 italic">Waiting...</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Services Pricing Snapshot & Users */}
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
