'use client';

import React, { useState } from 'react';
import { usePlatform } from '@/context/PlatformContext';
import { ServiceIcon } from '@/components/ServiceIcon';
import { OtpOrder } from '@/types';
import {
  Package,
  Search,
  Filter,
  Download,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  X,
} from 'lucide-react';

export default function AdminOrdersPage() {
  const { orders, adminRefundOrder } = usePlatform();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [refundingOrder, setRefundingOrder] = useState<OtpOrder | null>(null);
  const [refundReason, setRefundReason] = useState('Admin approved customer refund');

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.phoneNumber.includes(search) ||
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.serviceName.toLowerCase().includes(search.toLowerCase()) ||
      o.providerName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleRefundSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!refundingOrder) return;
    adminRefundOrder(refundingOrder.id, refundReason);
    setRefundingOrder(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">All Platform OTP Orders</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Section 22 & 24: Real-time order log, provider cost tracking, gross margin breakdown, and refund management.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        <div className="sm:col-span-8 relative">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by order ID, phone number, service, or provider..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs placeholder-zinc-500 focus:outline-none focus:border-purple-500 transition"
          />
        </div>

        <div className="sm:col-span-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs font-medium focus:outline-none focus:border-purple-500 transition cursor-pointer"
          >
            <option value="ALL">All Order Statuses</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="WAITING_FOR_SMS">WAITING_FOR_SMS</option>
            <option value="CANCELLED">CANCELLED</option>
            <option value="REFUNDED">REFUNDED</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="rounded-2xl glass-panel border border-zinc-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-900 text-zinc-400 font-semibold border-b border-zinc-800">
              <tr>
                <th className="px-4 py-3">Order ID</th>
                <th className="px-4 py-3">Service</th>
                <th className="px-4 py-3">Provider</th>
                <th className="px-4 py-3">Phone Number</th>
                <th className="px-4 py-3">Selling Price</th>
                <th className="px-4 py-3">Provider Cost</th>
                <th className="px-4 py-3">Gross Margin</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {filteredOrders.map((order) => {
                const margin = order.sellingPrice - order.providerCost;
                return (
                  <tr key={order.id} className="hover:bg-zinc-900/40 transition">
                    <td className="px-4 py-3.5 font-mono font-bold text-zinc-200">{order.id}</td>

                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <ServiceIcon name={order.serviceIcon} className="w-3.5 h-3.5" />
                        <span className="font-semibold text-white">{order.serviceName}</span>
                      </div>
                    </td>

                    <td className="px-4 py-3.5 text-zinc-300">{order.providerName}</td>

                    <td className="px-4 py-3.5 font-mono text-zinc-200">{order.phoneNumber}</td>

                    <td className="px-4 py-3.5 font-mono font-bold text-emerald-400">
                      ₹{order.sellingPrice.toFixed(2)}
                    </td>

                    <td className="px-4 py-3.5 font-mono text-zinc-400">
                      ₹{order.providerCost.toFixed(2)}
                    </td>

                    <td className="px-4 py-3.5 font-mono font-bold text-purple-300">
                      +₹{margin.toFixed(2)}
                    </td>

                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          order.status === 'COMPLETED'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : order.status === 'WAITING_FOR_SMS'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse'
                            : order.status === 'REFUNDED'
                            ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20'
                            : 'bg-zinc-800 text-zinc-400'
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>

                    <td className="px-4 py-3.5 text-right">
                      {order.status === 'COMPLETED' ? (
                        <button
                          type="button"
                          onClick={() => setRefundingOrder(order)}
                          className="px-2.5 py-1 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-semibold inline-flex items-center gap-1 transition"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Refund</span>
                        </button>
                      ) : (
                        <span className="text-zinc-600 text-[11px]">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Refund Modal */}
      {refundingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="font-bold text-sm text-white">Refund Order #{refundingOrder.id}</h3>
              <button
                onClick={() => setRefundingOrder(null)}
                className="text-zinc-500 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRefundSubmit} className="space-y-4 text-xs">
              <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 space-y-1">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Order Service:</span>
                  <span className="text-white font-bold">{refundingOrder.serviceName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Refund Amount:</span>
                  <span className="text-emerald-400 font-mono font-bold">
                    ₹{refundingOrder.sellingPrice.toFixed(2)}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1 font-semibold">
                  Refund Reason / Ledger Reference
                </label>
                <input
                  type="text"
                  required
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-700 rounded-xl text-zinc-100 text-xs focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRefundingOrder(null)}
                  className="flex-1 py-2.5 rounded-xl bg-zinc-800 text-zinc-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold"
                >
                  Confirm & Credit Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
