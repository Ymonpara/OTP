'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { usePlatform } from '@/context/PlatformContext';
import { OtpCountdownTimer } from '@/components/OtpCountdownTimer';
import {
  Zap,
  LayoutDashboard,
  Clock,
  History,
  Wallet,
  PlusCircle,
  FileText,
  LifeBuoy,
  Settings,
  AlertCircle,
  ArrowRight,
  Radio,
} from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { activeOrder, cancelOrder } = usePlatform();

  const navItems = [
    { label: 'Buy Number', href: '/dashboard/buy-number', icon: Zap, activeColor: 'bg-blue-600 text-white', iconColor: 'text-blue-400' },
    { label: 'Overview', href: '/dashboard/overview', icon: LayoutDashboard, activeColor: 'bg-zinc-800 text-white', iconColor: 'text-zinc-400' },
    {
      label: 'Active Orders',
      href: '/dashboard/active-orders',
      icon: Clock,
      activeColor: 'bg-amber-600 text-white',
      iconColor: 'text-amber-400',
      badge: activeOrder && activeOrder.status === 'WAITING_FOR_SMS' ? '1 Active' : null,
    },
    { label: 'Activations', href: '/dashboard/activations', icon: History, activeColor: 'bg-teal-600 text-white', iconColor: 'text-teal-400' },
    { label: 'Wallet', href: '/dashboard/wallet', icon: Wallet, activeColor: 'bg-emerald-600 text-white', iconColor: 'text-emerald-400' },
    { label: 'Add Money', href: '/dashboard/wallet/add-money', icon: PlusCircle, activeColor: 'bg-emerald-500 text-black', iconColor: 'text-emerald-400' },
    { label: 'Ledger', href: '/dashboard/wallet/transactions', icon: FileText, activeColor: 'bg-purple-600 text-white', iconColor: 'text-purple-400' },
    { label: 'Support', href: '/dashboard/support', icon: LifeBuoy, activeColor: 'bg-rose-600 text-white', iconColor: 'text-rose-400' },
    { label: 'Settings', href: '/dashboard/settings', icon: Settings, activeColor: 'bg-zinc-700 text-white', iconColor: 'text-zinc-400' },
  ];

  return (
    <div className="min-h-screen bg-[#090d16] flex flex-col text-zinc-100">
      <Navbar />

      {/* Floating Active Order Notice Banner (Solid Accent) */}
      {activeOrder && activeOrder.status === 'WAITING_FOR_SMS' && (
        <div className="bg-zinc-900 border-b-2 border-amber-500/60 px-4 py-2.5">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <span className="flex h-2.5 w-2.5 rounded-full bg-amber-400 animate-ping" />
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white">Active Order:</span>
                <span className="text-amber-400 font-bold">{activeOrder.serviceName}</span>
                <span className="text-zinc-400">({activeOrder.countryFlag} {activeOrder.phoneNumber})</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-zinc-400">Timer:</span>
                <OtpCountdownTimer
                  expiresAt={activeOrder.websiteExpiresAt}
                  className="scale-90"
                />
              </div>

              <Link
                href="/dashboard/buy-number"
                className="px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition flex items-center gap-1 shadow-sm"
              >
                <span>View OTP Box</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Main Dashboard Subnav & Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1">
        {/* Horizontal Navigation Pills (Multi-Color Active States) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-4 mb-6 border-b border-zinc-800 no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  isActive
                    ? `${item.activeColor} shadow-md`
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border border-transparent'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? '' : item.iconColor}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-500 text-white animate-pulse">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Child Pages Content */}
        <main>{children}</main>
      </div>

      <Footer />
    </div>
  );
}
