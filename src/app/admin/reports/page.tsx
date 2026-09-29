'use client';

import React, { useState } from 'react';
import { usePlatform } from '@/context/PlatformContext';
import {
  BarChart3,
  Calendar,
  Download,
  TrendingUp,
  DollarSign,
  PieChart,
  Percent,
  CheckCircle2,
  Wallet,
} from 'lucide-react';

export default function AdminReportsPage() {
  const { orders, transactions, services, providers } = usePlatform();
  const [timeRange, setTimeRange] = useState<'today' | '7days' | '30days'>('today');

  const completedOrders = orders.filter((o) => o.status === 'COMPLETED');
  const refundedOrders = orders.filter((o) => o.status === 'REFUNDED');

  const totalRevenue = completedOrders.reduce((acc, curr) => acc + curr.sellingPrice, 0);
  const totalCost = completedOrders.reduce((acc, curr) => acc + curr.providerCost, 0);
  const grossProfit = totalRevenue - totalCost;
  const marginPercentage = totalRevenue > 0 ? ((grossProfit / totalRevenue) * 100).toFixed(1) : '0';

  const totalRecharge = transactions
    .filter((t) => t.type === 'CREDIT_RECHARGE')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalRefundAmount = transactions
    .filter((t) => t.type === 'REFUND')
    .reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="space-y-8">
      {/* Header & Date Range Filter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Financial & Margin Reports</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Section 33: Revenue, provider actual costs, gross margin spread, and wallet recharge volume.
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setTimeRange('today')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              timeRange === 'today' ? 'bg-purple-600 text-white' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => setTimeRange('7days')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              timeRange === '7days' ? 'bg-purple-600 text-white' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Last 7 Days
          </button>
          <button
            type="button"
            onClick={() => setTimeRange('30days')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              timeRange === '30days' ? 'bg-purple-600 text-white' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Last 30 Days
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl glass-panel border border-zinc-800">
          <span className="text-xs font-semibold text-zinc-400 block mb-1">Gross Selling Revenue</span>
          <div className="text-2xl font-extrabold text-white font-mono">
            ₹{totalRevenue.toFixed(2)}
          </div>
          <span className="text-[11px] text-emerald-400 mt-1 block">Customer order sales</span>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-zinc-800">
          <span className="text-xs font-semibold text-zinc-400 block mb-1">Provider Actual Cost</span>
          <div className="text-2xl font-extrabold text-zinc-300 font-mono">
            ₹{totalCost.toFixed(2)}
          </div>
          <span className="text-[11px] text-zinc-500 mt-1 block">Paid upstream to carriers</span>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-purple-500/30">
          <span className="text-xs font-semibold text-zinc-400 block mb-1">Gross Profit</span>
          <div className="text-2xl font-extrabold text-purple-400 font-mono">
            ₹{grossProfit.toFixed(2)}
          </div>
          <span className="text-[11px] text-purple-300 font-semibold mt-1 block">
            Net Margin: {marginPercentage}%
          </span>
        </div>

        <div className="p-5 rounded-2xl glass-panel border border-zinc-800">
          <span className="text-xs font-semibold text-zinc-400 block mb-1">Wallet Recharges</span>
          <div className="text-2xl font-extrabold text-indigo-400 font-mono">
            ₹{totalRecharge.toFixed(2)}
          </div>
          <span className="text-[11px] text-zinc-500 mt-1 block">Total customer deposits</span>
        </div>
      </div>

      {/* Visual Revenue Breakdown & Provider Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Service Performance Table */}
        <div className="lg:col-span-7 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-purple-400" />
            Service Volume & Profitability Breakdown
          </h3>

          <div className="rounded-2xl glass-panel border border-zinc-800 overflow-hidden shadow-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-900 text-zinc-400 font-semibold border-b border-zinc-800">
                <tr>
                  <th className="px-4 py-3">Service</th>
                  <th className="px-4 py-3">Selling Price</th>
                  <th className="px-4 py-3">Est. Cost</th>
                  <th className="px-4 py-3">Profit / Order</th>
                  <th className="px-4 py-3">Margin %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {services.slice(0, 8).map((s) => {
                  const profit = s.sellingPrice - s.providerCostEstimate;
                  const pct = ((profit / s.sellingPrice) * 100).toFixed(0);
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
                        +₹{profit.toFixed(2)}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 font-mono font-bold">
                          {pct}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Provider Breakdown */}
        <div className="lg:col-span-5 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <PieChart className="w-4 h-4 text-purple-400" />
            Carrier Provider Share
          </h3>

          <div className="p-5 rounded-2xl glass-panel border border-zinc-800 space-y-4">
            {providers.map((p) => (
              <div key={p.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-zinc-200">{p.name}</span>
                  <span className="text-zinc-400 font-mono">
                    {p.totalNumbersAssigned} Numbers Assigned
                  </span>
                </div>
                <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      p.code === 'five_sim'
                        ? 'bg-purple-500'
                        : p.code === 'online_sim'
                        ? 'bg-emerald-400'
                        : 'bg-indigo-400'
                    }`}
                    style={{
                      width: `${Math.min(
                        100,
                        (p.totalNumbersAssigned /
                          providers.reduce((a, b) => a + b.totalNumbersAssigned, 0)) *
                          100
                      )}%`,
                    }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-zinc-500">
                  <span>Balance: ₹{p.balance.toFixed(2)}</span>
                  <span>Success: {p.successRate}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
