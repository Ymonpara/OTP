'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { usePlatform } from '@/context/PlatformContext';
import { RechargeModal } from '@/components/RechargeModal';
import { OtpCountdownTimer } from '@/components/OtpCountdownTimer';
import {
  Zap,
  LayoutDashboard,
  Clock,
  History,
  Wallet,
  FileText,
  Settings,
  Radio,
  Plus,
  ArrowRight,
  PanelLeft,
  X,
  LogOut,
  User as UserIcon,
  Shield,
  ChevronUp,
} from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const {
    currentUser,
    wallet,
    activeOrder,
    logout,
    isLoaded,
  } = usePlatform();

  const [isRechargeOpen, setIsRechargeOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isBottomUserMenuOpen, setIsBottomUserMenuOpen] = useState(false);

  const isAdmin = currentUser.role === 'admin' || currentUser.role === 'superadmin';

  // Sidebar navigation sections (Support & Settings removed; Add Money removed)
  const navSections = [
    {
      title: 'CORE SERVICES',
      items: [
        {
          label: 'Buy Number',
          href: '/dashboard/buy-number',
          icon: Zap,
          activeBg: 'bg-blue-600 text-white',
          iconColor: 'text-blue-400',
          badge: 'Instant',
          badgeStyle: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
        },
        {
          label: 'Overview',
          href: '/dashboard/overview',
          icon: LayoutDashboard,
          activeBg: 'bg-zinc-800 text-white',
          iconColor: 'text-zinc-400',
        },
        {
          label: 'Active Orders',
          href: '/dashboard/active-orders',
          icon: Clock,
          activeBg: 'bg-amber-600 text-white',
          iconColor: 'text-amber-400',
          badge: activeOrder && activeOrder.status === 'WAITING_FOR_SMS' ? '1 Live' : null,
          badgeStyle: 'bg-amber-500 text-black font-extrabold animate-pulse',
        },
        {
          label: 'Activations',
          href: '/dashboard/activations',
          icon: History,
          activeBg: 'bg-teal-600 text-white',
          iconColor: 'text-teal-400',
        },
      ],
    },
    {
      title: 'WALLET & BILLING',
      items: [
        {
          label: 'Wallet Overview',
          href: '/dashboard/wallet',
          icon: Wallet,
          activeBg: 'bg-emerald-600 text-white',
          iconColor: 'text-emerald-400',
        },
        {
          label: 'Financial Ledger',
          href: '/dashboard/wallet/transactions',
          icon: FileText,
          activeBg: 'bg-purple-600 text-white',
          iconColor: 'text-purple-400',
        },
      ],
    },
  ];

  // Handler when clicking Add Funds button: opens recharge modal & routes to Wallet Overview
  const handleAddFundsClick = () => {
    setIsRechargeOpen(true);
    if (!pathname?.startsWith('/dashboard/wallet')) {
      router.push('/dashboard/wallet');
    }
  };

  // Reusable Left Sidebar Content
  const sidebarContent = (
    <div className="flex flex-col h-full bg-zinc-950 text-zinc-100 select-none">
      {/* 1. Sidebar Brand Header */}
      <div className="p-5 border-b border-zinc-800/80 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md group-hover:bg-blue-500 transition">
            <Radio className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-white">
                OTP<span className="text-emerald-400">Wallet</span>
              </span>
              <span className="px-1.5 py-0.2 text-[9px] font-bold uppercase rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                Live
              </span>
            </div>
            <span className="text-[10px] text-zinc-400 -mt-0.5">Customer Dashboard</span>
          </div>
        </Link>

        {/* Mobile Close Button */}
        <button
          type="button"
          onClick={() => setIsMobileSidebarOpen(false)}
          className="lg:hidden p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
          title="Close Menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* 2. Embedded Wallet Card in Sidebar */}
      <div className="p-3 mx-3 mt-4 mb-2 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-sm space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-medium">
            <Wallet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Available Balance</span>
          </div>
          <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300">
            INR
          </span>
        </div>

        <div className="flex items-baseline justify-between">
          {!isLoaded ? (
            <div className="h-6 w-24 bg-zinc-800 animate-pulse rounded my-0.5" />
          ) : (
            <>
              <span className="text-xl font-extrabold text-white font-mono tracking-tight">
                ₹{wallet.availableBalance.toFixed(2)}
              </span>
              {wallet.heldBalance > 0 && (
                <span className="text-[11px] font-mono text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                  ₹{wallet.heldBalance.toFixed(2)} held
                </span>
              )}
            </>
          )}
        </div>

        <button
          type="button"
          onClick={handleAddFundsClick}
          className="w-full py-2 px-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs transition flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/15 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 stroke-[3]" />
          <span>Add Funds</span>
        </button>
      </div>

      {/* 3. Navigation Menu Sections */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-5 no-scrollbar">
        {navSections.map((section) => (
          <div key={section.title} className="space-y-1">
            <span className="px-3 text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
              {section.title}
            </span>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href ||
                  (item.href !== '/dashboard' && pathname?.startsWith(item.href));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileSidebarOpen(false)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                      isActive
                        ? `${item.activeBg} shadow-md`
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.iconColor}`} />
                      <span>{item.label}</span>
                    </div>

                    {item.badge && (
                      <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${item.badgeStyle}`}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        {/* If Admin, show Quick Portal Switch in Sidebar */}
        {isAdmin && (
          <div className="pt-2 border-t border-zinc-800/80">
            <span className="px-3 text-[10px] font-bold text-purple-400 uppercase tracking-wider block mb-1">
              ADMINISTRATION
            </span>
            <Link
              href="/admin"
              onClick={() => setIsMobileSidebarOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-purple-300 hover:bg-purple-950/60 border border-purple-800/40 transition"
            >
              <Shield className="w-4 h-4 text-purple-400" />
              <span>Admin Console</span>
            </Link>
          </div>
        )}
      </div>

      {/* 4. Sidebar Bottom User Section with Interactive Settings & Logout Dropdown */}
      <div className="p-3 border-t border-zinc-800/80 bg-zinc-950/80 relative">
        {/* Dropdown Menu (Opens Upwards) */}
        {isBottomUserMenuOpen && (
          <div className="absolute bottom-16 left-3 right-3 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150 space-y-1">
            <div className="px-3 py-2 border-b border-zinc-800/80">
              <span className="text-xs font-bold text-white block truncate">
                {currentUser.name}
              </span>
              <span className="text-[10px] text-zinc-400 block truncate">
                {currentUser.email}
              </span>
            </div>

            <Link
              href="/dashboard/settings"
              onClick={() => {
                setIsBottomUserMenuOpen(false);
                setIsMobileSidebarOpen(false);
              }}
              className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-xl transition"
            >
              <Settings className="w-4 h-4 text-zinc-400" />
              <span>Account Settings</span>
            </Link>

            <button
              type="button"
              onClick={() => {
                setIsBottomUserMenuOpen(false);
                setIsMobileSidebarOpen(false);
                logout();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition cursor-pointer text-left"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        )}

        {/* User Card Trigger */}
        <button
          type="button"
          onClick={() => setIsBottomUserMenuOpen(!isBottomUserMenuOpen)}
          className="w-full p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800/90 border border-zinc-800/80 flex items-center justify-between gap-2 text-left transition cursor-pointer"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center font-bold text-white text-xs shrink-0">
              {currentUser.name ? currentUser.name.charAt(0) : 'U'}
            </div>
            <div className="min-w-0">
              <span className="font-bold text-xs text-white block truncate">
                {currentUser.name}
              </span>
              <span className="text-[10px] text-zinc-400 block truncate">
                {currentUser.email}
              </span>
            </div>
          </div>

          <ChevronUp
            className={`w-4 h-4 text-zinc-400 transition-transform ${
              isBottomUserMenuOpen ? 'rotate-180' : ''
            }`}
          />
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#080b13] text-zinc-100 flex">
      {/* ========================================================================= */}
      {/* DESKTOP FIXED LEFT SIDEBAR */}
      {/* ========================================================================= */}
      <aside className="hidden lg:flex w-64 h-screen sticky top-0 flex-col shrink-0 border-r border-zinc-800/80 z-40 bg-zinc-950">
        {sidebarContent}
      </aside>

      {/* ========================================================================= */}
      {/* MOBILE DRAWER SIDEBAR WITH LEFT-TO-RIGHT SLIDE ANIMATION */}
      {/* ========================================================================= */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop with fade-in */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
            onClick={() => setIsMobileSidebarOpen(false)}
          />

          {/* Drawer Panel with hardware-accelerated slide-in-from-left */}
          <div className="relative w-72 max-w-[85vw] h-full z-10 shadow-2xl flex flex-col animate-slide-in-left">
            {sidebarContent}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MAIN RIGHT CONTAINER */}
      {/* ========================================================================= */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 h-16 bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800/80 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          {/* Left: Menu Icon + Logo (Breadcrumb Removed) */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Replaced Menu Icon with PanelLeft */}
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-zinc-300 hover:text-white bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition cursor-pointer"
              title="Open Navigation Menu"
            >
              <PanelLeft className="w-5 h-5 text-emerald-400" />
            </button>

            {/* Brand Logo added in left side after menu icon */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md group-hover:bg-blue-500 transition">
                <Radio className="w-4 h-4 text-white animate-pulse" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-sm sm:text-base tracking-tight text-white">
                    OTP<span className="text-emerald-400">Wallet</span>
                  </span>
                  <span className="px-1.5 py-0.2 text-[9px] font-bold uppercase rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    Live
                  </span>
                </div>
              </div>
            </Link>
          </div>

          {/* Right: Quick Controls (Wallet Pill Hidden on Mobile) */}
          <div className="flex items-center gap-3">
            {/* Quick "Get Number" CTA */}
            <Link
              href="/dashboard/buy-number"
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-sm transition"
            >
              <Zap className="w-3.5 h-3.5 fill-white" />
              <span>Get Number</span>
            </Link>

            {/* Top Bar Wallet Pill - Visible on Mobile and Desktop */}
            <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-xl p-1 shadow-sm">
              <Link
                href="/dashboard/wallet"
                className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-2.5 py-1 text-xs hover:bg-zinc-800 rounded-lg transition"
              >
                <Wallet className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <div className="flex flex-col text-left">
                  <span className="text-[9px] sm:text-[10px] text-zinc-400 leading-none">Available</span>
                  <span className="font-bold text-zinc-100 font-mono text-xs">
                    {!isLoaded ? (
                      <span className="inline-block w-12 h-3 bg-zinc-800 animate-pulse rounded my-0.5" />
                    ) : (
                      `₹${wallet.availableBalance.toFixed(2)}`
                    )}
                  </span>
                </div>
              </Link>

              <button
                type="button"
                onClick={handleAddFundsClick}
                className="ml-1 p-1 sm:p-1.5 bg-emerald-500 hover:bg-emerald-400 text-black rounded-lg transition flex items-center justify-center cursor-pointer font-bold shrink-0"
                title="Add Money"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            </div>

            {/* Header User Dropdown - HIDDEN ON MOBILE */}
            <div className="hidden sm:block relative">
              <button
                type="button"
                onClick={() => setIsBottomUserMenuOpen(!isBottomUserMenuOpen)}
                className="flex items-center gap-2 p-1.5 rounded-xl border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs transition cursor-pointer"
                title="Account Menu"
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center font-bold text-white text-xs">
                  {currentUser.name ? currentUser.name.charAt(0) : 'U'}
                </div>
              </button>
            </div>
          </div>
        </header>

        {/* Floating Active Order Notice Banner (if waiting for SMS) */}
        {activeOrder && activeOrder.status === 'WAITING_FOR_SMS' && (
          <div className="bg-zinc-900 border-b-2 border-amber-500/60 px-4 sm:px-6 lg:px-8 py-2.5">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <span className="flex h-2.5 w-2.5 rounded-full bg-amber-400 animate-ping" />
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white">Active Order:</span>
                  <span className="text-amber-400 font-bold">{activeOrder.serviceName}</span>
                  <span className="text-zinc-400">
                    ({activeOrder.countryFlag} {activeOrder.phoneNumber})
                  </span>
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

        {/* Child Pages Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-zinc-900 px-6 py-4 text-xs text-zinc-400 flex flex-col sm:flex-row items-center justify-between gap-2 mt-auto">
          <span>© {new Date().getFullYear()} OTPWallet Platform. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:text-zinc-200 transition">
              Home Portal
            </Link>
          </div>
        </footer>
      </div>

      {/* Recharge Modal */}
      <RechargeModal isOpen={isRechargeOpen} onClose={() => setIsRechargeOpen(false)} />
    </div>
  );
}
