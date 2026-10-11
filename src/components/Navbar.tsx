'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { usePlatform } from '@/context/PlatformContext';
import { RechargeModal } from '@/components/RechargeModal';
import { AuthModal } from '@/components/AuthModal';
import {
  Wallet as WalletIcon,
  ChevronDown,
  Plus,
  Radio,
  LayoutDashboard,
  Settings,
  HelpCircle,
  Shield,
  LogOut,
  User as UserIcon,
  Clock,
  History,
  KeyRound,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const {
    currentUser,
    isLoggedIn,
    wallet,
    openAuthModal,
    logout,
    isLoaded,
  } = usePlatform();

  const [isRechargeOpen, setIsRechargeOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const isAdmin = currentUser.role === 'admin' || currentUser.role === 'superadmin';

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-zinc-800 bg-zinc-950/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Left: Brand Logo & Title */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md group-hover:bg-blue-500 transition">
              <Radio className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-white">
                  OTP<span className="text-emerald-400">Wallet</span>
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  Live
                </span>
              </div>
              <span className="text-[10px] text-zinc-400 -mt-0.5 hidden sm:inline">
                Instant SMS & Temporary Numbers
              </span>
            </div>
          </Link>

          {/* Right Action Section */}
          <div className="flex items-center gap-3">
            {!isLoggedIn ? (
              /* When NOT Logged In: Show Login & Sign Up buttons */
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Discreet Superadmin Key entry button */}
                <button
                  type="button"
                  onClick={() => openAuthModal('admin')}
                  className="p-2 rounded-xl text-zinc-400 hover:text-purple-400 hover:bg-zinc-900 border border-transparent hover:border-purple-800/40 transition cursor-pointer"
                  title="Admin Superadmin Key Access"
                >
                  <KeyRound className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => openAuthModal('login')}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-200 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 transition cursor-pointer"
                >
                  Sign In
                </button>

                <button
                  type="button"
                  onClick={() => openAuthModal('signup')}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-black bg-emerald-500 hover:bg-emerald-400 shadow-md shadow-emerald-500/20 transition cursor-pointer"
                >
                  Sign Up
                </button>
              </div>
            ) : (
              /* When Logged In: Show Wallet & Right Side Dropdown */
              <div className="flex items-center gap-3">
                {/* Wallet Balance Pill (Hidden on Mobile) */}
                <div className="hidden sm:flex items-center bg-zinc-900 border border-zinc-800 rounded-xl p-1 shadow-sm">
                  <Link
                    href="/dashboard/wallet"
                    className="flex items-center gap-2 px-2.5 py-1 text-xs hover:bg-zinc-800 rounded-lg transition"
                  >
                    <WalletIcon className="w-3.5 h-3.5 text-emerald-400" />
                    <div className="flex flex-col text-left">
                      <span className="text-[10px] text-zinc-500 leading-none">Available</span>
                      <span className="font-bold text-zinc-100 font-mono">
                        {!isLoaded ? (
                          <span className="inline-block w-12 h-3.5 bg-zinc-800 animate-pulse rounded my-0.5" />
                        ) : (
                          `₹${wallet.availableBalance.toFixed(2)}`
                        )}
                      </span>
                    </div>
                    {isLoaded && wallet.heldBalance > 0 && (
                      <div className="hidden sm:flex flex-col text-left pl-2 border-l border-zinc-800">
                        <span className="text-[10px] text-amber-500 leading-none">Held</span>
                        <span className="font-medium text-amber-400 font-mono text-[11px]">
                          ₹{wallet.heldBalance.toFixed(2)}
                        </span>
                      </div>
                    )}
                  </Link>

                  <button
                    type="button"
                    onClick={() => setIsRechargeOpen(true)}
                    className="ml-1 p-1.5 bg-emerald-500 hover:bg-emerald-400 text-black rounded-lg transition flex items-center justify-center cursor-pointer font-bold"
                    title="Add Money"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>
                </div>

                {/* Right Side User Dropdown */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 p-1.5 rounded-xl border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs transition cursor-pointer"
                  >
                    <div
                      className={`w-7 h-7 rounded-lg ${
                        isAdmin ? 'bg-purple-600' : 'bg-emerald-600'
                      } flex items-center justify-center font-bold text-white text-xs`}
                    >
                      {currentUser.name ? currentUser.name.charAt(0) : 'U'}
                    </div>
                    <span className="hidden sm:inline font-medium text-zinc-300 max-w-[120px] truncate">
                      {currentUser.name || 'User'}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
                  </button>

                  {isUserMenuOpen && (
                    <div
                      className="absolute right-0 mt-2 w-60 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      {/* User Info Header */}
                      <div className="px-3 py-2 border-b border-zinc-800">
                        <p className="text-xs font-semibold text-zinc-200">{currentUser.name}</p>
                        <p className="text-[11px] text-zinc-500 truncate">{currentUser.email}</p>
                        <span
                          className={`inline-block mt-1 text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                            isAdmin
                              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          }`}
                        >
                          {currentUser.role}
                        </span>
                      </div>

                      {/* Dropdown Navigation Links */}
                      <div className="py-1">
                        <Link
                          href="/dashboard/overview"
                          className="flex items-center gap-2 px-3 py-1.5 text-xs text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg transition"
                        >
                          <LayoutDashboard className="w-4 h-4 text-blue-400" />
                          <span>Dashboard Overview</span>
                        </Link>
                        <Link
                          href="/dashboard/buy-number"
                          className="flex items-center gap-2 px-3 py-1.5 text-xs text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg transition"
                        >
                          <Radio className="w-4 h-4 text-emerald-400" />
                          <span>Buy Temporary Number</span>
                        </Link>
                        <Link
                          href="/dashboard/active-orders"
                          className="flex items-center gap-2 px-3 py-1.5 text-xs text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg transition"
                        >
                          <Clock className="w-4 h-4 text-amber-400" />
                          <span>Active Orders</span>
                        </Link>
                        <Link
                          href="/dashboard/activations"
                          className="flex items-center gap-2 px-3 py-1.5 text-xs text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg transition"
                        >
                          <History className="w-4 h-4 text-teal-400" />
                          <span>Order History</span>
                        </Link>
                        <Link
                          href="/dashboard/wallet"
                          className="flex items-center gap-2 px-3 py-1.5 text-xs text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg transition"
                        >
                          <WalletIcon className="w-4 h-4 text-emerald-400" />
                          <span>Wallet & Ledger</span>
                        </Link>

                        {/* Admin Console - ONLY visible if currentUser is admin/superadmin! */}
                        {isAdmin && (
                          <Link
                            href="/admin"
                            className="flex items-center gap-2 px-3 py-1.5 text-xs text-purple-300 hover:text-white hover:bg-purple-950/60 rounded-lg transition"
                          >
                            <Shield className="w-4 h-4 text-purple-400" />
                            <span>Admin Console</span>
                          </Link>
                        )}

                        <Link
                          href="/dashboard/settings"
                          className="flex items-center gap-2 px-3 py-1.5 text-xs text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg transition"
                        >
                          <Settings className="w-4 h-4 text-zinc-400" />
                          <span>Account Settings</span>
                        </Link>
                        <Link
                          href="/dashboard/support"
                          className="flex items-center gap-2 px-3 py-1.5 text-xs text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-lg transition"
                        >
                          <HelpCircle className="w-4 h-4 text-teal-400" />
                          <span>Support Center</span>
                        </Link>
                      </div>

                      {/* Sign Out */}
                      <div className="pt-1 border-t border-zinc-800">
                        <button
                          type="button"
                          onClick={() => {
                            logout();
                            setIsUserMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-rose-400 hover:bg-rose-500/10 rounded-lg transition cursor-pointer text-left"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Popups & Modals */}
      <AuthModal />
      <RechargeModal isOpen={isRechargeOpen} onClose={() => setIsRechargeOpen(false)} />
    </>
  );
};
