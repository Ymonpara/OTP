'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePlatform, SUPERADMIN_MASTER_KEY } from '@/context/PlatformContext';
import {
  Radio,
  Lock,
  Mail,
  ArrowRight,
  Shield,
  UserCheck,
  Eye,
  EyeOff,
  Sparkles,
  Zap,
  KeyRound,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { loginAsDummyCustomer, loginWithAdminKey } = usePlatform();

  const [activeTab, setActiveTab] = useState<'customer' | 'admin'>('customer');
  const [email, setEmail] = useState('demo@otpwallet.com');
  const [password, setPassword] = useState('••••••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Superadmin Key state
  const [adminKey, setAdminKey] = useState('');
  const [showAdminKey, setShowAdminKey] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);

  const handleCustomerLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      loginAsDummyCustomer({ email });
      setIsLoading(false);
      router.push('/dashboard/buy-number');
    }, 400);
  };

  const handleQuickCustomer = () => {
    loginAsDummyCustomer({ name: 'Demo Customer', email: 'demo@otpwallet.com' });
    router.push('/dashboard/buy-number');
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError(null);
    setIsLoading(true);

    setTimeout(() => {
      const result = loginWithAdminKey(adminKey);
      setIsLoading(false);
      if (result.success) {
        router.push('/admin');
      } else {
        setAdminError(result.error || 'Invalid Superadmin Key');
      }
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[#090d16] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2.5 mb-4 group">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/25 group-hover:bg-blue-500 transition">
            <Radio className="w-5 h-5 text-white" />
          </div>
          <span className="font-extrabold text-xl tracking-tight text-white">
            OTP<span className="text-emerald-400">Wallet</span>
          </span>
        </Link>
        <h2 className="text-2xl font-bold text-white tracking-tight">Sign in to your account</h2>
        <p className="mt-1 text-xs text-zinc-400">
          Manage temporary numbers, orders, and wallet balance
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="glass-panel-elevated p-6 sm:p-8 rounded-2xl border border-zinc-800 space-y-6">
          {/* Tab Selector: Customer vs Superadmin Key */}
          <div className="flex bg-zinc-900 border border-zinc-800 p-1 rounded-xl gap-1">
            <button
              type="button"
              onClick={() => {
                setActiveTab('customer');
                setAdminError(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition cursor-pointer ${
                activeTab === 'customer'
                  ? 'bg-emerald-500 text-black shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Customer Access
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('admin');
                setAdminError(null);
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'admin'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-purple-400 hover:text-purple-300'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Superadmin Key</span>
            </button>
          </div>

          {activeTab === 'customer' ? (
            <>
              {/* 1-Click Demo Customer Access */}
              <div className="p-3.5 rounded-xl bg-zinc-900 border border-emerald-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Quick Access
                  </span>
                  <span className="text-[10px] text-zinc-400">Pre-funded ₹250.00</span>
                </div>
                <button
                  type="button"
                  onClick={handleQuickCustomer}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs transition flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20 cursor-pointer"
                >
                  <Zap className="w-4 h-4 fill-black" />
                  <span>1-Click Dummy User Login</span>
                </button>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-zinc-800" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-zinc-900 px-2 text-zinc-500">Or continue with credentials</span>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleCustomerLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1">Email Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full pl-9 pr-3 py-2.5 bg-zinc-900 border border-zinc-700/80 rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 text-xs transition"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-medium text-zinc-300">Password</label>
                    <Link
                      href="/auth/forgot-password"
                      className="text-[11px] text-emerald-400 hover:text-emerald-300"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-9 pr-10 py-2.5 bg-zinc-900 border border-zinc-700/80 rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 text-xs transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-500 hover:text-zinc-300 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer"
                >
                  {isLoading ? <span>Signing in...</span> : <span>Sign In</span>}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              <div className="text-center text-xs text-zinc-400">
                Don&apos;t have an account?{' '}
                <Link
                  href="/auth/register"
                  className="font-semibold text-emerald-400 hover:text-emerald-300"
                >
                  Create Account
                </Link>
              </div>
            </>
          ) : (
            /* Superadmin Key Mode */
            <div className="space-y-4">
              <div className="text-center space-y-1">
                <h3 className="text-sm font-bold text-white">Superadmin Key Authentication</h3>
                <p className="text-xs text-zinc-400">
                  Enter master key to unlock full platform administrative controls
                </p>
              </div>

              {/* Master Key Demo Autofill Box */}
              <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-800/60 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-zinc-400 block">Master Key:</span>
                  <code className="text-purple-300 font-mono font-bold">{SUPERADMIN_MASTER_KEY}</code>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setAdminKey(SUPERADMIN_MASTER_KEY);
                    setAdminError(null);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold text-[11px] transition cursor-pointer"
                >
                  Auto-fill Key
                </button>
              </div>

              {adminError && (
                <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 flex items-center gap-2 text-rose-300 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{adminError}</span>
                </div>
              )}

              <form onSubmit={handleAdminLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Superadmin Key
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                      <KeyRound className="w-4 h-4" />
                    </div>
                    <input
                      type={showAdminKey ? 'text' : 'password'}
                      required
                      value={adminKey}
                      onChange={(e) => {
                        setAdminKey(e.target.value);
                        setAdminError(null);
                      }}
                      className="w-full pl-10 pr-10 py-2.5 bg-zinc-900 border border-zinc-700/80 rounded-xl text-zinc-100 font-mono placeholder-zinc-500 focus:outline-none focus:border-purple-500 text-xs transition"
                      placeholder="Enter master superadmin key..."
                    />
                    <button
                      type="button"
                      onClick={() => setShowAdminKey(!showAdminKey)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-500 hover:text-zinc-300 cursor-pointer"
                    >
                      {showAdminKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !adminKey.trim()}
                  className="w-full py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 cursor-pointer"
                >
                  <Shield className="w-4 h-4" />
                  <span>{isLoading ? 'Verifying...' : 'Authenticate & Open Admin'}</span>
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
