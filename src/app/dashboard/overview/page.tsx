'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePlatform } from '@/context/PlatformContext';
import { ServiceIcon } from '@/components/ServiceIcon';
import { RechargeModal } from '@/components/RechargeModal';
import {
  Wallet,
  Zap,
  Clock,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  Plus,
  ShieldCheck,
  AlertCircle,
  Copy,
  Check,
} from 'lucide-react';

export default function OverviewPage() {
  const { currentUser, wallet, orders, transactions, activeOrder, providers, isLoaded } = usePlatform();
  const [isRechargeOpen, setIsRechargeOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const completedOrders = orders.filter((o) => o.status === 'COMPLETED');
  const totalSpent = completedOrders.reduce((acc, curr) => acc + curr.sellingPrice, 0);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Welcome & Balance Row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Welcome back, {currentUser.name}
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Account ID: <span className="font-mono text-zinc-300">{currentUser.id}</span> • Status:{' '}
            <span className="text-emerald-400 font-semibold uppercase">{currentUser.status}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsRechargeOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs transition flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add Funds</span>
          </button>

          <Link
            href="/dashboard/buy-number"
            className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs transition flex items-center gap-1.5 border border-zinc-700"
          >
            <Zap className="w-4 h-4 text-emerald-400" />
            <span>Get Number</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl glass-panel border border-zinc-800/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-zinc-400">Available Balance</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">
            {!isLoaded ? (
              <div className="h-8 w-24 bg-zinc-800 animate-pulse rounded my-1" />
            ) : (
              `₹${wallet.availableBalance.toFixed(2)}`
            )}
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">Ready for number purchase</p>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-zinc-800/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-zinc-400">Funds in Hold</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-amber-400 font-mono">
            {!isLoaded ? (
              <div className="h-8 w-20 bg-zinc-800 animate-pulse rounded my-1" />
            ) : (
              `₹${wallet.heldBalance.toFixed(2)}`
            )}
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">Held during 5-min order timer</p>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-zinc-800/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-zinc-400">Successful Activations</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-white font-mono">
            {completedOrders.length}
          </div>
          <p className="text-[11px] text-emerald-400 mt-1">100% verified codes</p>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-zinc-800/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-zinc-400">Total Spent</span>
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-zinc-100 font-mono">
            ₹{totalSpent.toFixed(2)}
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">Lifetime account usage</p>
        </div>
      </div>

      {/* Two Column Layout: Recent Orders & Recent Ledger */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Recent Activations */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-emerald-400" />
              Recent Activations
            </h3>
            <Link
              href="/dashboard/activations"
              className="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {orders.slice(0, 4).map((order) => (
              <div
                key={order.id}
                className="p-4 rounded-xl glass-panel border border-zinc-800/80 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center">
                    <ServiceIcon name={order.serviceIcon} className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-white">{order.serviceName}</span>
                      <span className="text-[11px] text-zinc-400">{order.countryFlag}</span>
                    </div>
                    <span className="text-xs font-mono text-zinc-300 block">{order.phoneNumber}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-right">
                  {order.smsReceived && (
                    <div className="hidden sm:flex flex-col text-right">
                      <span className="text-[10px] text-zinc-500 uppercase">OTP</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(order.smsReceived!.otpCode, order.id)}
                        className="font-mono font-bold text-xs text-emerald-400 hover:underline flex items-center gap-1"
                      >
                        {order.smsReceived.otpCode}
                        {copiedId === order.id ? (
                          <Check className="w-3 h-3 text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3 text-zinc-500" />
                        )}
                      </button>
                    </div>
                  )}

                  <div className="flex flex-col items-end">
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        order.status === 'COMPLETED'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : order.status === 'WAITING_FOR_SMS'
                          ? 'bg-amber-500/10 text-amber-400 animate-pulse'
                          : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      {order.status}
                    </span>
                    <span className="text-[11px] font-mono text-zinc-400 mt-1">
                      ₹{order.sellingPrice.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Wallet Activity & System Status */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Wallet className="w-4 h-4 text-emerald-400" />
                Recent Ledger Activity
              </h3>
              <Link
                href="/dashboard/wallet/transactions"
                className="text-xs text-emerald-400 hover:text-emerald-300 font-medium"
              >
                Full Ledger
              </Link>
            </div>

            <div className="p-4 rounded-xl glass-panel border border-zinc-800/80 space-y-3">
              {transactions.slice(0, 4).map((txn) => {
                const isCredit = txn.type === 'CREDIT_RECHARGE' || txn.type === 'RELEASE_HOLD';
                return (
                  <div
                    key={txn.id}
                    className="flex items-center justify-between py-2 border-b border-zinc-800/60 last:border-0 text-xs"
                  >
                    <div>
                      <span className="font-semibold text-zinc-200 block text-[11px]">
                        {txn.type}
                      </span>
                      <span className="text-[10px] text-zinc-500">{txn.description}</span>
                    </div>
                    <span
                      className={`font-mono font-bold ${
                        isCredit ? 'text-emerald-400' : 'text-zinc-300'
                      }`}
                    >
                      {isCredit ? '+' : '-'}₹{txn.amount.toFixed(2)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Provider Network Live Status */}
          <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 space-y-2.5">
            <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
              Carrier Network Status
            </h4>
            <div className="space-y-2">
              {providers.map((p) => (
                <div key={p.id} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        p.apiHealth === 'operational'
                          ? 'bg-emerald-400'
                          : p.apiHealth === 'degraded'
                          ? 'bg-amber-400'
                          : 'bg-rose-400'
                      }`}
                    />
                    <span className="text-zinc-300">{p.name}</span>
                  </div>
                  <span className="text-[11px] text-zinc-500 font-mono">
                    {p.pingMs}ms • {p.successRate}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <RechargeModal isOpen={isRechargeOpen} onClose={() => setIsRechargeOpen(false)} />
    </div>
  );
}
