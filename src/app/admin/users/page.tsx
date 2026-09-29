'use client';

import React, { useState } from 'react';
import { usePlatform } from '@/context/PlatformContext';
import { User } from '@/types';
import {
  Users,
  Search,
  Wallet,
  Shield,
  ShieldAlert,
  Edit,
  DollarSign,
  CheckCircle2,
  XCircle,
  PlusCircle,
  MinusCircle,
  X,
} from 'lucide-react';

export default function AdminUsersPage() {
  const { allUsers, toggleUserStatus, adminAdjustWallet, wallet } = usePlatform();
  const [search, setSearch] = useState('');
  const [adjustingUser, setAdjustingUser] = useState<User | null>(null);

  // Adjustment form states
  const [adjustType, setAdjustType] = useState<'ADMIN_CREDIT' | 'ADMIN_DEBIT'>('ADMIN_CREDIT');
  const [amount, setAmount] = useState<number>(100);
  const [reason, setReason] = useState<string>('Courtesy credit adjustment');

  const filteredUsers = allUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.id.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdjustSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingUser || amount <= 0) return;
    adminAdjustWallet(adjustingUser.id, adjustType, amount, reason);
    setAdjustingUser(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Customer Management</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Section 13 & 24: View customer balances, toggle active/blocked status, and perform manual ledger adjustments.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          placeholder="Search customers by name, email, or user ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition"
        />
      </div>

      {/* Users Table */}
      <div className="rounded-2xl glass-panel border border-zinc-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-900 text-zinc-400 font-semibold border-b border-zinc-800">
              <tr>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">User ID</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Wallet Balance</th>
                <th className="px-4 py-3">Account Status</th>
                <th className="px-4 py-3">Registered On</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {filteredUsers.map((user) => {
                // If demo user, use wallet balance from state
                const userBalance = user.role === 'customer' ? wallet.availableBalance : 0;

                return (
                  <tr key={user.id} className="hover:bg-zinc-900/40 transition">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-lg ${user.role === 'admin' ? 'bg-purple-600 text-white' : 'bg-blue-600 text-white'} flex items-center justify-center font-bold text-xs`}>
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <span className="font-bold text-white block">{user.name}</span>
                          <span className="text-[10px] text-zinc-500">{user.email}</span>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3.5 font-mono text-zinc-400">{user.id}</td>

                    <td className="px-4 py-3.5">
                      <span className="capitalize font-semibold text-zinc-300">{user.role}</span>
                    </td>

                    <td className="px-4 py-3.5 font-mono font-bold text-emerald-400">
                      ₹{userBalance.toFixed(2)}
                    </td>

                    <td className="px-4 py-3.5">
                      <button
                        type="button"
                        onClick={() => toggleUserStatus(user.id)}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase transition ${
                          user.status === 'active'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {user.status}
                      </button>
                    </td>

                    <td className="px-4 py-3.5 text-zinc-400 text-[11px]">
                      {new Date(user.createdAt).toLocaleDateString([], {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>

                    <td className="px-4 py-3.5 text-right">
                      <button
                        type="button"
                        onClick={() => setAdjustingUser(user)}
                        className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-purple-600 hover:text-white text-zinc-300 transition text-xs font-semibold inline-flex items-center gap-1"
                      >
                        <DollarSign className="w-3.5 h-3.5" />
                        <span>Adjust Balance</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Wallet Credit/Debit Modal (Section 24) */}
      {adjustingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div>
                <h3 className="font-bold text-sm text-white">Manual Balance Adjustment</h3>
                <p className="text-xs text-zinc-400">{adjustingUser.name} ({adjustingUser.email})</p>
              </div>
              <button
                onClick={() => setAdjustingUser(null)}
                className="text-zinc-500 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdjustSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-400 mb-2 font-semibold">Adjustment Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustType('ADMIN_CREDIT')}
                    className={`py-2 rounded-xl border font-bold flex items-center justify-center gap-1.5 transition ${
                      adjustType === 'ADMIN_CREDIT'
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                        : 'bg-zinc-800/60 border-zinc-700 text-zinc-400'
                    }`}
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Credit (+)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAdjustType('ADMIN_DEBIT')}
                    className={`py-2 rounded-xl border font-bold flex items-center justify-center gap-1.5 transition ${
                      adjustType === 'ADMIN_DEBIT'
                        ? 'bg-rose-500/20 border-rose-500 text-rose-400'
                        : 'bg-zinc-800/60 border-zinc-700 text-zinc-400'
                    }`}
                  >
                    <MinusCircle className="w-4 h-4" />
                    <span>Debit (-)</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-semibold">Amount (₹)</label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  required
                  value={amount}
                  onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-700 rounded-xl text-white font-mono font-bold text-sm focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-semibold">
                  Reason / Ledger Audit Note
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Compensation for provider outage"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-700 rounded-xl text-zinc-200 text-xs focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAdjustingUser(null)}
                  className="flex-1 py-2.5 rounded-xl bg-zinc-800 text-zinc-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold"
                >
                  Apply & Record in Ledger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
