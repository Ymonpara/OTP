'use client';

import React, { useState } from 'react';
import { usePlatform } from '@/context/PlatformContext';
import { FileText, Search, Download } from 'lucide-react';

export default function AdminWalletTransactionsPage() {
  const { transactions } = usePlatform();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');

  const filteredTxns = transactions.filter((t) => {
    const matchesSearch =
      t.id.toLowerCase().includes(search.toLowerCase()) ||
      t.userId.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase()) ||
      t.referenceId.toLowerCase().includes(search.toLowerCase());
    const matchesType = typeFilter === 'ALL' || t.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const exportCSV = () => {
    const headers = [
      'Txn ID,User ID,Type,Amount,Balance Before,Balance After,Hold Before,Hold After,Reference,Description,Status,Date\n',
    ];
    const rows = filteredTxns.map(
      (t) =>
        `"${t.id}","${t.userId}","${t.type}",${t.amount},${t.balanceBefore},${t.balanceAfter},${t.holdBefore},${t.holdAfter},"${t.referenceType}:${t.referenceId}","${t.description}","${t.status}","${t.createdAt}"\n`
    );
    const blob = new Blob([...headers, ...rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `admin_global_ledger_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Global Wallet Ledger</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Section 22 & 27: Master immutable financial ledger across all users and system adjustments.
          </p>
        </div>

        <button
          type="button"
          onClick={exportCSV}
          className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition border border-zinc-700/80"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Master Ledger</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        <div className="sm:col-span-8 relative">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by txn ID, user ID, description, or reference..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition"
          />
        </div>

        <div className="sm:col-span-4">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs font-medium focus:outline-none focus:border-purple-500 transition cursor-pointer"
          >
            <option value="ALL">All Transaction Types</option>
            <option value="CREDIT_RECHARGE">CREDIT_RECHARGE</option>
            <option value="HOLD_OTP_PURCHASE">HOLD_OTP_PURCHASE</option>
            <option value="DEBIT_OTP_PURCHASE">DEBIT_OTP_PURCHASE</option>
            <option value="RELEASE_HOLD">RELEASE_HOLD</option>
            <option value="REFUND">REFUND</option>
            <option value="ADMIN_CREDIT">ADMIN_CREDIT</option>
            <option value="ADMIN_DEBIT">ADMIN_DEBIT</option>
          </select>
        </div>
      </div>

      {/* Master Table */}
      <div className="rounded-2xl glass-panel border border-zinc-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-900 text-zinc-400 font-semibold border-b border-zinc-800">
              <tr>
                <th className="px-4 py-3">Txn ID</th>
                <th className="px-4 py-3">User ID</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Available (Before → After)</th>
                <th className="px-4 py-3">Held (Before → After)</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {filteredTxns.map((t) => {
                const isCredit =
                  t.type === 'CREDIT_RECHARGE' ||
                  t.type === 'RELEASE_HOLD' ||
                  t.type === 'REFUND' ||
                  t.type === 'ADMIN_CREDIT';
                return (
                  <tr key={t.id} className="hover:bg-zinc-900/40 transition">
                    <td className="px-4 py-3.5 font-mono font-bold text-zinc-200">{t.id}</td>
                    <td className="px-4 py-3.5 font-mono text-zinc-400">{t.userId}</td>

                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          t.type === 'CREDIT_RECHARGE' || t.type === 'ADMIN_CREDIT'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : t.type === 'HOLD_OTP_PURCHASE'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            : t.type === 'RELEASE_HOLD' || t.type === 'REFUND'
                            ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20'
                            : t.type === 'DEBIT_OTP_PURCHASE'
                            ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                            : 'bg-zinc-800 text-zinc-400'
                        }`}
                      >
                        {t.type}
                      </span>
                    </td>

                    <td
                      className={`px-4 py-3.5 font-mono font-bold ${
                        isCredit ? 'text-emerald-400' : 'text-zinc-200'
                      }`}
                    >
                      {isCredit ? '+' : '-'}₹{t.amount.toFixed(2)}
                    </td>

                    <td className="px-4 py-3.5 font-mono text-zinc-400">
                      ₹{t.balanceBefore.toFixed(2)} →{' '}
                      <span className="text-zinc-200 font-bold">₹{t.balanceAfter.toFixed(2)}</span>
                    </td>

                    <td className="px-4 py-3.5 font-mono text-zinc-400">
                      ₹{t.holdBefore.toFixed(2)} → ₹{t.holdAfter.toFixed(2)}
                    </td>

                    <td className="px-4 py-3.5 text-zinc-300 max-w-xs truncate">{t.description}</td>

                    <td className="px-4 py-3.5 text-zinc-400 text-[11px] whitespace-nowrap">
                      {new Date(t.createdAt).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
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
    </div>
  );
}
