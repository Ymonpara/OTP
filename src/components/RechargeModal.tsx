'use client';

import React, { useState } from 'react';
import { usePlatform } from '@/context/PlatformContext';
import {
  X,
  CreditCard,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Loader2,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface RechargeModalProps {
  isOpen: boolean;
  onClose: () => void;
  recommendedAmount?: number;
}

export const RechargeModal: React.FC<RechargeModalProps> = ({
  isOpen,
  onClose,
  recommendedAmount,
}) => {
  const { rechargeWallet } = usePlatform();
  const [amount, setAmount] = useState<number>(recommendedAmount || 200);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [method, setMethod] = useState<'upi' | 'razorpay' | 'cashfree'>('upi');
  const [isProcessing, setIsProcessing] = useState(false);
  const [successTxn, setSuccessTxn] = useState<string | null>(null);

  if (!isOpen) return null;

  const presetAmounts = [100, 200, 500, 1000, 2000];

  const handlePresetClick = (val: number) => {
    setAmount(val);
    setCustomAmount('');
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomAmount(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num > 0) {
      setAmount(num);
    }
  };

  const handlePay = async () => {
    if (amount <= 0) return;
    setIsProcessing(true);

    // Simulate gateway checkout time
    await new Promise((res) => setTimeout(res, 1200));

    const res = await rechargeWallet(amount, method);
    setIsProcessing(false);
    if (res.success) {
      setSuccessTxn(res.txnId);
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  };

  const handleResetAndClose = () => {
    setSuccessTxn(null);
    setIsProcessing(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-zinc-100 text-sm">Add Funds to Wallet</h3>
              <p className="text-xs text-zinc-400">Instant UPI & Netbanking Credit</p>
            </div>
          </div>
          <button
            onClick={handleResetAndClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {successTxn ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 animate-bounce">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-white">Recharge Successful!</h4>
                <p className="text-sm text-zinc-400 mt-1">
                  ₹{amount.toFixed(2)} has been credited to your available balance.
                </p>
              </div>
              <div className="bg-zinc-800/60 rounded-xl p-3 border border-zinc-700/50 text-xs text-zinc-300">
                <span className="text-zinc-400">Txn Ref: </span>
                <span className="font-mono text-emerald-400">{successTxn}</span>
              </div>
              <button
                onClick={handleResetAndClose}
                className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-black font-semibold text-sm transition shadow-lg shadow-emerald-500/20"
              >
                Done
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Presets */}
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-2">
                  Select Quick Amount
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {presetAmounts.map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => handlePresetClick(val)}
                      className={`py-2 text-xs font-semibold rounded-lg border transition ${
                        amount === val && !customAmount
                          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-sm'
                          : 'bg-zinc-800/60 border-zinc-700/60 text-zinc-300 hover:border-zinc-600'
                      }`}
                    >
                      ₹{val}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom amount */}
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1">
                  Or Enter Custom Amount (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 font-medium">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="10"
                    max="50000"
                    placeholder="e.g. 350"
                    value={customAmount}
                    onChange={handleCustomChange}
                    className="w-full pl-8 pr-4 py-2.5 bg-zinc-800/70 border border-zinc-700 rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 transition text-sm"
                  />
                </div>
                <p className="text-[11px] text-zinc-500 mt-1">Minimum recharge: ₹10 • Max: ₹50,000</p>
              </div>

              {/* Payment Methods */}
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-2">
                  Choose Payment Gateway
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setMethod('upi')}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition text-left ${
                      method === 'upi'
                        ? 'bg-emerald-500/10 border-emerald-500 text-zinc-100'
                        : 'bg-zinc-800/40 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <QrCode className="w-5 h-5 text-emerald-400" />
                    <span className="text-xs font-medium">UPI / QR</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMethod('razorpay')}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition text-left ${
                      method === 'razorpay'
                        ? 'bg-blue-500/10 border-blue-500 text-zinc-100'
                        : 'bg-zinc-800/40 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <CreditCard className="w-5 h-5 text-blue-400" />
                    <span className="text-xs font-medium">Razorpay</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMethod('cashfree')}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition text-left ${
                      method === 'cashfree'
                        ? 'bg-purple-500/10 border-purple-500 text-zinc-100'
                        : 'bg-zinc-800/40 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                    }`}
                  >
                    <Sparkles className="w-5 h-5 text-purple-400" />
                    <span className="text-xs font-medium">Cashfree</span>
                  </button>
                </div>
              </div>

              {/* Security info */}
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-zinc-800/40 border border-zinc-800 text-xs text-zinc-400">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>256-bit encrypted checkout. Instant ledger verification.</span>
              </div>

              {/* Submit button */}
              <button
                type="button"
                onClick={handlePay}
                disabled={isProcessing || amount <= 0}
                className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing Payment...</span>
                  </>
                ) : (
                  <>
                    <span>Proceed to Pay ₹{amount.toFixed(2)}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
