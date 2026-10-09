'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { usePlatform, SUPERADMIN_MASTER_KEY } from '@/context/PlatformContext';
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
  KeyRound,
  Eye,
  EyeOff,
  AlertCircle,
  Menu,
  X,
  ChevronRight,
  Radio,
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const {
    isAdminAuthenticated,
    loginWithAdminKey,
    switchRole,
    providers,
  } = usePlatform();

  const [inputKey, setInputKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [keyError, setKeyError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // If NOT authenticated as admin, show the Superadmin Key Gate
  if (!isAdminAuthenticated) {
    const handleKeySubmit = (e: React.FormEvent) => {
      e.preventDefault();
      setKeyError(null);
      setIsVerifying(true);

      setTimeout(() => {
        const result = loginWithAdminKey(inputKey);
        setIsVerifying(false);
        if (!result.success) {
          setKeyError(result.error || 'Invalid Superadmin Key');
        }
      }, 300);
    };

    return (
      <div className="min-h-screen bg-[#070a12] text-zinc-100 flex flex-col justify-center items-center p-4 relative overflow-hidden">
        <div className="w-full max-w-md bg-zinc-950 border border-purple-900/60 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-purple-600 flex items-center justify-center text-white shadow-xl shadow-purple-600/30">
              <Shield className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight pt-2">
              Superadmin Portal Access
            </h1>
            <p className="text-xs text-zinc-400 leading-relaxed max-w-sm mx-auto">
              This area is strictly restricted to platform administrators. Enter your Master
              Superadmin Key to unlock administrative privileges.
            </p>
          </div>

          {/* Master Key Demo Autofill Box */}
          <div className="p-3.5 rounded-2xl bg-purple-950/40 border border-purple-800/60 flex items-center justify-between text-xs">
            <div>
              <span className="text-[10px] text-zinc-400 block">Master Superadmin Key:</span>
              <code className="text-purple-300 font-mono font-bold">{SUPERADMIN_MASTER_KEY}</code>
            </div>
            <button
              type="button"
              onClick={() => {
                setInputKey(SUPERADMIN_MASTER_KEY);
                setKeyError(null);
              }}
              className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition cursor-pointer"
            >
              Auto-fill Key
            </button>
          </div>

          {keyError && (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 flex items-center gap-2 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{keyError}</span>
            </div>
          )}

          <form onSubmit={handleKeySubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                Superadmin Key
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type={showKey ? 'text' : 'password'}
                  value={inputKey}
                  onChange={(e) => {
                    setInputKey(e.target.value);
                    setKeyError(null);
                  }}
                  className="w-full pl-10 pr-10 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-purple-500"
                  placeholder="Enter superadmin key..."
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-500 hover:text-zinc-300 cursor-pointer"
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isVerifying || !inputKey.trim()}
              className="w-full py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 cursor-pointer"
            >
              <Shield className="w-4 h-4" />
              <span>{isVerifying ? 'Verifying Key...' : 'Authenticate & Unlock'}</span>
            </button>
          </form>

          <div className="pt-2 text-center border-t border-zinc-900">
            <button
              type="button"
              onClick={() => router.push('/')}
              className="text-xs text-zinc-400 hover:text-white transition flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Public Home</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // When Authenticated as Admin:
  const lowBalanceProviders = providers.filter((p) => p.balance < p.minBalanceAlert && p.enabled);

  const adminSections = [
    {
      title: 'DASHBOARD',
      items: [
        { label: 'Overview', href: '/admin', icon: LayoutDashboard },
      ],
    },
    {
      title: 'PLATFORM INVENTORY',
      items: [
        { label: 'Services & Pricing', href: '/admin/services', icon: Layers },
        { label: 'SMS Providers', href: '/admin/providers', icon: Cpu },
      ],
    },
    {
      title: 'USERS & TRANSACTIONS',
      items: [
        { label: 'Users & Balances', href: '/admin/users', icon: Users },
        { label: 'OTP Orders', href: '/admin/orders', icon: Package },
        { label: 'Global Ledger', href: '/admin/wallet-transactions', icon: FileText },
      ],
    },
    {
      title: 'ANALYTICS',
      items: [
        { label: 'Revenue & Reports', href: '/admin/reports', icon: BarChart3 },
      ],
    },
  ];

  const getCurrentAdminTitle = () => {
    if (pathname === '/admin') return 'Overview';
    if (pathname?.includes('/admin/services')) return 'Services & Pricing';
    if (pathname?.includes('/admin/providers')) return 'SMS Carrier Providers';
    if (pathname?.includes('/admin/users')) return 'Users & Accounts';
    if (pathname?.includes('/admin/orders')) return 'OTP Orders';
    if (pathname?.includes('/admin/wallet-transactions')) return 'Global Ledger';
    if (pathname?.includes('/admin/reports')) return 'Financial Reports';
    return 'Superadmin Console';
  };

  const AdminSidebarContent = () => (
    <div className="flex flex-col h-full bg-zinc-950 text-zinc-100 select-none">
      {/* Brand */}
      <div className="p-5 border-b border-purple-900/40 flex items-center justify-between">
        <Link href="/admin" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-purple-600 flex items-center justify-center text-white shadow-lg shadow-purple-600/30">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-white">
                OTP<span className="text-purple-400">Admin</span>
              </span>
              <span className="px-1.5 py-0.2 text-[9px] font-bold uppercase rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Master
              </span>
            </div>
            <span className="text-[10px] text-zinc-400 -mt-0.5">Superadmin Console</span>
          </div>
        </Link>

        {/* Mobile Close Button */}
        <button
          type="button"
          onClick={() => setIsMobileSidebarOpen(false)}
          className="lg:hidden p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
          title="Close Admin Menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Nav Menu */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5 no-scrollbar">
        {adminSections.map((section) => (
          <div key={section.title} className="space-y-1">
            <span className="px-3 text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">
              {section.title}
            </span>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.href === '/admin' ? pathname === '/admin' : pathname?.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileSidebarOpen(false)}
                    className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                      isActive
                        ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-zinc-400'}`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Switcher */}
      <div className="p-3 border-t border-purple-900/40 bg-zinc-950/80">
        <button
          type="button"
          onClick={() => {
            switchRole('customer');
            router.push('/dashboard/buy-number');
          }}
          className="w-full py-2.5 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Exit Admin Mode</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#070a12] text-zinc-100 flex">
      {/* Desktop Fixed Left Sidebar */}
      <aside className="hidden lg:flex w-64 h-screen sticky top-0 flex-col shrink-0 border-r border-purple-900/40 z-40 bg-zinc-950">
        <AdminSidebarContent />
      </aside>

      {/* Mobile Drawer Sidebar */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          <div className="relative w-72 max-w-[85vw] h-full z-10 shadow-2xl flex flex-col">
            <AdminSidebarContent />
          </div>
        </div>
      )}

      {/* Main Right Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 h-16 bg-zinc-950/90 backdrop-blur-md border-b border-purple-900/40 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-xs">
              <span className="text-purple-400 font-semibold">Admin</span>
              <ChevronRight className="w-3.5 h-3.5 text-zinc-500" />
              <span className="font-bold text-white">{getCurrentAdminTitle()}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {lowBalanceProviders.length > 0 && (
              <Link
                href="/admin/providers"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold animate-pulse"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Low Balance:</span>
                <span>{lowBalanceProviders.length} Providers</span>
              </Link>
            )}

            <button
              type="button"
              onClick={() => {
                switchRole('customer');
                router.push('/dashboard/buy-number');
              }}
              className="px-3.5 py-1.5 rounded-xl bg-purple-900/30 hover:bg-purple-900/50 text-purple-300 border border-purple-700/50 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Customer View</span>
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
