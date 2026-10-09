import React from 'react';
import Link from 'next/link';
import { Radio, ShieldCheck, Heart, Sparkles, CheckCircle2 } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-zinc-800/80 bg-zinc-950/60 backdrop-blur-md pt-12 pb-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Col 1 */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md">
                <Radio className="w-4 h-4 text-white" />
              </div>
              <span className="font-extrabold text-base tracking-tight text-white">
                OTP<span className="text-emerald-400">Wallet</span>
              </span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Enterprise-grade temporary virtual numbers for seamless SMS & OTP verification across
              200+ global platforms. Instant delivery under 10 seconds.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg w-fit">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>All Systems Operational (99.98%)</span>
            </div>
          </div>

          {/* Col 2 */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-zinc-200 uppercase tracking-wider">
              Popular Services
            </h4>
            <ul className="space-y-2 text-xs text-zinc-400">
              <li>
                <Link href="/dashboard/buy-number" className="hover:text-emerald-400 transition">
                  WhatsApp Temporary Numbers
                </Link>
              </li>
              <li>
                <Link href="/dashboard/buy-number" className="hover:text-emerald-400 transition">
                  Telegram Verification OTP
                </Link>
              </li>
              <li>
                <Link href="/dashboard/buy-number" className="hover:text-emerald-400 transition">
                  OpenAI & ChatGPT Phone Verification
                </Link>
              </li>
              <li>
                <Link href="/dashboard/buy-number" className="hover:text-emerald-400 transition">
                  Google & Gmail Virtual SMS
                </Link>
              </li>
              <li>
                <Link href="/dashboard/buy-number" className="hover:text-emerald-400 transition">
                  Instagram & TikTok Numbers
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3 */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-zinc-200 uppercase tracking-wider">
              Platform & Wallet
            </h4>
            <ul className="space-y-2 text-xs text-zinc-400">
              <li>
                <Link href="/dashboard/wallet" className="hover:text-emerald-400 transition">
                  Wallet Overview
                </Link>
              </li>
              <li>
                <Link href="/dashboard/wallet/transactions" className="hover:text-emerald-400 transition">
                  Financial Ledger
                </Link>
              </li>
              <li>
                <Link href="/dashboard/activations" className="hover:text-emerald-400 transition">
                  Order History & Logs
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-purple-400 transition">
                  Superadmin Portal (Key Required)
                </Link>
              </li>
              <li>
                <Link href="/dashboard/support" className="hover:text-emerald-400 transition">
                  Support & Help Center
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4 - Security & Compliance */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-zinc-200 uppercase tracking-wider">
              Security & Compliance
            </h4>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Transparent wallet ledger architecture with automated hold & release rules. Only
              services and use cases permitted by upstream providers and applicable local laws are
              supported.
            </p>
            <div className="pt-2 flex flex-wrap gap-2 text-[10px] text-zinc-400">
              <span className="px-2 py-1 rounded bg-zinc-900 border border-zinc-800">
                🔒 256-bit SSL
              </span>
              <span className="px-2 py-1 rounded bg-zinc-900 border border-zinc-800">
                ⚡ 5-Min Hold Window
              </span>
              <span className="px-2 py-1 rounded bg-zinc-900 border border-zinc-800">
                🛡️ Zero-Risk Refund
              </span>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-400">
          <p>© {new Date().getFullYear()} OTPWallet Platform. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/dashboard/support" className="hover:text-zinc-200 transition">
              Terms of Service
            </Link>
            <Link href="/dashboard/support" className="hover:text-zinc-200 transition">
              Privacy Policy
            </Link>
            <Link href="/dashboard/support" className="hover:text-zinc-200 transition">
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
