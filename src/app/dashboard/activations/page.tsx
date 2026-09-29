'use client';

import React, { useState } from 'react';
import { usePlatform } from '@/context/PlatformContext';
import { ServiceIcon } from '@/components/ServiceIcon';
import { OtpOrder } from '@/types';
import {
  Search,
  Filter,
  Download,
  Copy,
  Check,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  X,
  FileText,
} from 'lucide-react';

export default function ActivationsPage() {
  const { orders } = usePlatform();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedOrder, setSelectedOrder] = useState<OtpOrder | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(id);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.phoneNumber.includes(search) ||
      o.serviceName.toLowerCase().includes(search.toLowerCase()) ||
      o.id.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const exportCSV = () => {
    const headers = ['Order ID,Service,Country,Phone Number,Selling Price,Status,Ordered At,OTP Code\n'];
    const rows = filteredOrders.map(
      (o) =>
        `"${o.id}","${o.serviceName}","${o.countryName}","${o.phoneNumber}",${o.sellingPrice},"${o.status}","${o.orderedAt}","${o.smsReceived?.otpCode || ''}"\n`
    );
    const blob = new Blob([...headers, ...rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `activations_export_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Activation History</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Complete record of all temporary number orders, verification OTPs, and status reports.
          </p>
        </div>

        <button
          type="button"
          onClick={exportCSV}
          className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition border border-zinc-700/80"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        <div className="sm:col-span-8 relative">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by phone number, service, or order ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition"
          />
        </div>

        <div className="sm:col-span-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-100 text-xs font-medium focus:outline-none focus:border-emerald-500 transition cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="COMPLETED">Completed (SMS Received)</option>
            <option value="WAITING_FOR_SMS">Waiting for SMS</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="EXPIRED">Expired</option>
            <option value="REFUNDED">Refunded</option>
          </select>
        </div>
      </div>

      {/* Activations Table */}
      <div className="rounded-2xl glass-panel border border-zinc-800/80 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-900/90 text-zinc-400 font-semibold border-b border-zinc-800">
              <tr>
                <th className="px-4 py-3">Service & App</th>
                <th className="px-4 py-3">Phone Number</th>
                <th className="px-4 py-3">Received OTP</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Ordered At</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-zinc-900/40 transition">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center">
                        <ServiceIcon name={order.serviceIcon} className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="font-bold text-white block">{order.serviceName}</span>
                        <span className="text-[10px] text-zinc-400">
                          {order.countryFlag} {order.countryName}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3.5 font-mono text-zinc-200 font-medium">
                    <div className="flex items-center gap-2">
                      <span>{order.phoneNumber}</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(order.phoneNumber, order.id + '_phone')}
                        className="text-zinc-500 hover:text-zinc-300"
                        title="Copy Number"
                      >
                        {copiedText === order.id + '_phone' ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </td>

                  <td className="px-4 py-3.5">
                    {order.smsReceived ? (
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono font-bold">
                          {order.smsReceived.otpCode}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopy(order.smsReceived!.otpCode, order.id + '_otp')}
                          className="text-zinc-500 hover:text-zinc-300"
                          title="Copy OTP"
                        >
                          {copiedText === order.id + '_otp' ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    ) : (
                      <span className="text-zinc-500 italic text-[11px]">—</span>
                    )}
                  </td>

                  <td className="px-4 py-3.5 font-mono font-bold text-zinc-100">
                    ₹{order.sellingPrice.toFixed(2)}
                  </td>

                  <td className="px-4 py-3.5">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        order.status === 'COMPLETED'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : order.status === 'WAITING_FOR_SMS'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : order.status === 'REFUNDED'
                          ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20'
                          : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>

                  <td className="px-4 py-3.5 text-zinc-400 text-[11px]">
                    {new Date(order.orderedAt).toLocaleString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>

                  <td className="px-4 py-3.5 text-right">
                    <button
                      type="button"
                      onClick={() => setSelectedOrder(order)}
                      className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Order Details</h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-zinc-800/60">
                <span className="text-zinc-400">Order ID:</span>
                <span className="font-mono text-zinc-100">{selectedOrder.id}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-800/60">
                <span className="text-zinc-400">Service:</span>
                <span className="text-zinc-100 font-bold">{selectedOrder.serviceName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-800/60">
                <span className="text-zinc-400">Phone Number:</span>
                <span className="font-mono font-bold text-zinc-100">
                  {selectedOrder.phoneNumber}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-800/60">
                <span className="text-zinc-400">Selling Price:</span>
                <span className="font-mono font-bold text-emerald-400">
                  ₹{selectedOrder.sellingPrice.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-800/60">
                <span className="text-zinc-400">Provider:</span>
                <span className="text-zinc-300">{selectedOrder.providerName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-800/60">
                <span className="text-zinc-400">Status:</span>
                <span className="font-bold text-emerald-400">{selectedOrder.status}</span>
              </div>

              {selectedOrder.smsReceived && (
                <div className="mt-4 p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-400">Full Received SMS:</span>
                    <span className="font-mono text-zinc-500">
                      {selectedOrder.smsReceived.sender}
                    </span>
                  </div>
                  <p className="text-zinc-300 italic">&ldquo;{selectedOrder.smsReceived.message}&rdquo;</p>
                  <div className="pt-2 flex items-center justify-between">
                    <span className="text-zinc-400">Extracted OTP Code:</span>
                    <span className="font-mono font-extrabold text-white text-base bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-500/40">
                      {selectedOrder.smsReceived.otpCode}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setSelectedOrder(null)}
              className="w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
