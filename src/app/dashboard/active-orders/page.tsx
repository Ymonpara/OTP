'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePlatform } from '@/context/PlatformContext';
import { ServiceIcon } from '@/components/ServiceIcon';
import { OtpCountdownTimer } from '@/components/OtpCountdownTimer';
import {
  Clock,
  Zap,
  Copy,
  Check,
  RefreshCw,
  XCircle,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Radio,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ActiveOrdersPage() {
  const { orders, activeOrder, cancelOrder, simulateSmsReceived } = usePlatform();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const activeList = orders.filter(
    (o) => o.status === 'WAITING_FOR_SMS' || o.status === 'NUMBER_ASSIGNED'
  );

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSimulate = (orderId: string) => {
    simulateSmsReceived(orderId);
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Active Orders</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Monitor incoming SMS in real-time. Orders auto-expire after 5 minutes if no SMS is
            received.
          </p>
        </div>

        <Link
          href="/dashboard/buy-number"
          className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs transition flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
        >
          <Zap className="w-4 h-4 fill-black" />
          <span>New Order</span>
        </Link>
      </div>

      {activeList.length === 0 ? (
        <div className="p-12 text-center rounded-2xl glass-panel border border-zinc-800 space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-zinc-800/80 border border-zinc-700 flex items-center justify-center text-zinc-400">
            <Radio className="w-8 h-8 text-zinc-500" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">No active orders right now</h3>
            <p className="text-xs text-zinc-400 mt-1 max-w-sm mx-auto">
              You do not have any numbers currently waiting for an OTP. Start by getting a temporary
              number.
            </p>
          </div>
          <Link
            href="/dashboard/buy-number"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs shadow-lg shadow-emerald-500/20 transition"
          >
            <span>Reserve Virtual Number</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {activeList.map((order) => (
            <div
              key={order.id}
              className="p-6 rounded-2xl glass-panel-elevated border border-emerald-500/40 shadow-xl space-y-4"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center">
                    <ServiceIcon name={order.serviceIcon} className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white flex items-center gap-2">
                      {order.serviceName}
                      <span className="text-xs font-normal text-zinc-400">
                        ({order.countryFlag} {order.countryName})
                      </span>
                    </h3>
                    <span className="text-[11px] font-mono text-zinc-500">
                      ID: {order.id} • Provider: {order.providerName}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="bg-zinc-950/80 px-3 py-1.5 rounded-xl border border-zinc-800">
                    <OtpCountdownTimer expiresAt={order.websiteExpiresAt} />
                  </div>
                  <span className="px-3 py-1 rounded-xl text-xs font-bold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1.5 animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    Waiting for SMS
                  </span>
                </div>
              </div>

              {/* Number and Simulator Controls */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                <div className="md:col-span-6 p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-zinc-500 uppercase font-semibold block">
                      Assigned Number
                    </span>
                    <span className="text-xl font-mono font-bold text-white tracking-wider">
                      {order.phoneNumber}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(order.phoneNumber, order.id)}
                    className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition cursor-pointer"
                  >
                    {copiedId === order.id ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>

                <div className="md:col-span-6 flex flex-wrap items-center gap-3 justify-end">
                  <button
                    type="button"
                    onClick={() => handleSimulate(order.id)}
                    className="px-3.5 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Simulate Incoming SMS</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => cancelOrder(order.id)}
                    className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 font-semibold text-xs flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Cancel & Refund</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
