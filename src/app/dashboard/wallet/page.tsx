'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePlatform } from '@/context/PlatformContext';
import { RechargeModal } from '@/components/RechargeModal';
import {
  Wallet,
  Clock,
  PlusCircle,
  FileText,
  ShieldCheck,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  Sparkles,
  Lock,
} from 'lucide-react';

export default function WalletPage() {
  const { wallet, transactions } = usePlatform();
  const [isRechargeOpen, setIsRechargeOpen] = useState(false);

  const totalCredits = transactions
    .filter((t) => t.type === 'CREDIT_RECHARGE' || t.type === 'RELEASE_HOLD' || t.type === 'REFUND')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalDebits = transactions
    .filter((t) => t.type === 'DEBIT_OTP_PURCHASE')
    .reduce((acc, t) => acc + t.amount, 0);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Internal Wallet</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Secure balance ledger with transactional hold locking and instantaneous refunds.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsRechargeOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 stroke-[2.5]" />
            <span>Top Up Balance</span>
          </button>

          <Link
            href="/dashboard/wallet/transactions"
            className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition border border-zinc-700/80"
          >
            <FileText className="w-4 h-4" />
            <span>Full Ledger</span>
          </Link>
        </div>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-6 rounded-2xl glass-panel border border-emerald-500/30 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-zinc-400">Available Balance</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-white font-mono tracking-tight">
            ₹{wallet.availableBalance.toFixed(2)}
          </div>
          <p className="text-[11px] text-zinc-500 mt-2">
            Usable for immediate virtual number reservations
          </p>
        </div>

        <div className="p-6 rounded-2xl glass-panel border border-amber-500/30 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-zinc-400">Held Balance</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-amber-400 font-mono tracking-tight">
            ₹{wallet.heldBalance.toFixed(2)}
          </div>
          <p className="text-[11px] text-zinc-500 mt-2">
            Locked during active 5-min timer. Released if no SMS.
          </p>
        </div>

        <div className="p-6 rounded-2xl glass-panel border border-zinc-800 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-zinc-400">Lifetime Ledger Debits</span>
            <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-zinc-100 font-mono tracking-tight">
            ₹{totalDebits.toFixed(2)}
          </div>
          <p className="text-[11px] text-zinc-500 mt-2">
            Total verified OTP purchases settled
          </p>
        </div>
      </div>

      {/* Wallet Architecture Safeguards */}
      <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <h3 className="text-sm font-bold text-white">How Your Wallet Ledger Operates</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 space-y-1.5">
            <span className="font-bold text-zinc-200 block">1. Hold On Order</span>
            <p className="text-zinc-400 text-[11px] leading-relaxed">
              When you click &ldquo;Get Number&rdquo;, the exact service price (e.g. ₹15) is placed on HOLD.
              It is not yet debited from your account.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 space-y-1.5">
            <span className="font-bold text-zinc-200 block">2. Final Debit Only on SMS</span>
            <p className="text-zinc-400 text-[11px] leading-relaxed">
              Only when an incoming SMS code is verified by our carrier network does the hold
              convert to a final completed transaction.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-zinc-900/60 border border-zinc-800/80 space-y-1.5">
            <span className="font-bold text-zinc-200 block">3. Instant Hold Release</span>
            <p className="text-zinc-400 text-[11px] leading-relaxed">
              If the order is cancelled by you or the 5-minute timer expires with no SMS, the held
              funds are automatically returned to your available balance.
            </p>
          </div>
        </div>
      </div>

      {/* Recent Ledger Entries */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">Recent Transactions</h3>
          <Link
            href="/dashboard/wallet/transactions"
            className="text-xs text-emerald-400 hover:text-emerald-300 font-medium"
          >
            View Full Audit Trail →
          </Link>
        </div>

        <div className="rounded-2xl glass-panel border border-zinc-800 overflow-hidden shadow-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-900/90 text-zinc-400 font-semibold border-b border-zinc-800">
              <tr>
                <th className="px-4 py-3">Txn ID</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Balance After</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {transactions.slice(0, 6).map((txn) => {
                const isCredit =
                  txn.type === 'CREDIT_RECHARGE' ||
                  txn.type === 'RELEASE_HOLD' ||
                  txn.type === 'REFUND';
                return (
                  <tr key={txn.id} className="hover:bg-zinc-900/40 transition">
                    <td className="px-4 py-3 font-mono font-medium text-zinc-300">{txn.id}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          txn.type === 'CREDIT_RECHARGE'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : txn.type === 'HOLD_OTP_PURCHASE'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : txn.type === 'RELEASE_HOLD'
                            ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20'
                            : txn.type === 'DEBIT_OTP_PURCHASE'
                            ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                            : 'bg-zinc-800 text-zinc-400'
                        }`}
                      >
                        {txn.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-300">{txn.description}</td>
                    <td
                      className={`px-4 py-3 font-mono font-bold ${
                        isCredit ? 'text-emerald-400' : 'text-zinc-200'
                      }`}
                    >
                      {isCredit ? '+' : '-'}₹{txn.amount.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 font-mono text-zinc-400">
                      ₹{txn.balanceAfter.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-zinc-500 text-[11px]">
                      {new Date(txn.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <RechargeModal isOpen={isRechargeOpen} onClose={() => setIsRechargeOpen(false)} />
    </div>
  );
}
