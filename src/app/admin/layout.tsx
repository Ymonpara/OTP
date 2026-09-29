'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { usePlatform } from '@/context/PlatformContext';
import {
  Shield,
  LayoutDashboard,
  Layers,
  Cpu,
  Users,
  Package,
  FileText,
  BarChart3,
  ArrowLeft,
  AlertTriangle,
  Radio,
  CheckCircle2,
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { switchRole, providers } = usePlatform();

  const lowBalanceProviders = providers.filter((p) => p.balance < p.minBalanceAlert && p.enabled);

  const adminNavItems = [
    { label: 'Overview', href: '/admin', icon: LayoutDashboard },
    { label: 'Services & Pricing', href: '/admin/services', icon: Layers },
    { label: 'SMS Providers', href: '/admin/providers', icon: Cpu },
    { label: 'Users & Balances', href: '/admin/users', icon: Users },
    { label: 'OTP Orders', href: '/admin/orders', icon: Package },
    { label: 'Global Ledger', href: '/admin/wallet-transactions', icon: FileText },
    { label: 'Revenue & Reports', href: '/admin/reports', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-[#070a12] text-zinc-100 flex flex-col">
      {/* Admin Top Bar */}
      <header className="sticky top-0 z-40 w-full border-b border-purple-900/40 bg-zinc-950/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-600 flex items-center justify-center text-white shadow-lg shadow-purple-600/30">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm text-white">
                  OTP<span className="text-purple-400">Admin</span>
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 uppercase">
                  Superadmin Console
                </span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            {lowBalanceProviders.length > 0 && (
              <Link
                href="/admin/providers"
                className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold animate-pulse"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Low Provider Balance Alert ({lowBalanceProviders.length})</span>
              </Link>
            )}

            <button
              type="button"
              onClick={() => {
                switchRole('customer');
                router.push('/dashboard/buy-number');
              }}
              className="px-3.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition border border-zinc-700/80 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Customer View</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Nav Pills & Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1">
        {/* Horizontal Navigation Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-4 mb-6 border-b border-zinc-800/80 no-scrollbar">
          {adminNavItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === '/admin' ? pathname === '/admin' : pathname?.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border border-transparent'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        <main>{children}</main>
      </div>

      <footer className="w-full border-t border-zinc-900 bg-zinc-950 py-4 text-center text-xs text-zinc-500">
        OTP Platform Enterprise Administration Console • PostgreSQL Transactions & BullMQ Poller
      </footer>
    </div>
  );
}
