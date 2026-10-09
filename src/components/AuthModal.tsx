'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePlatform, SUPERADMIN_MASTER_KEY } from '@/context/PlatformContext';
import {
  X,
  Radio,
  Lock,
  Mail,
  User as UserIcon,
  Shield,
  ArrowRight,
  Zap,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  KeyRound,
} from 'lucide-react';

export const AuthModal: React.FC = () => {
  const router = useRouter();
  const {
    isAuthModalOpen,
    authModalTab,
    openAuthModal,
    closeAuthModal,
    loginAsDummyCustomer,
    loginWithAdminKey,
  } = usePlatform();

  // Local form states
  const [loginEmail, setLoginEmail] = useState('demo@otpwallet.com');
  const [loginPassword, setLoginPassword] = useState('password123');

  const [signupName, setSignupName] = useState('Alex Rivera');
  const [signupEmail, setSignupEmail] = useState('alex.rivera@example.com');
  const [signupPassword, setSignupPassword] = useState('password123');

  const [adminKey, setAdminKey] = useState('');
  const [showAdminKey, setShowAdminKey] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);
  const [adminSuccess, setAdminSuccess] = useState(false);

  if (!isAuthModalOpen) return null;

  const handleDummyLogin = () => {
    loginAsDummyCustomer({ name: 'Demo Customer', email: loginEmail || 'demo@otpwallet.com' });
    closeAuthModal();
  };

  const handleDummyRegister = () => {
    loginAsDummyCustomer({
      name: signupName || 'New User',
      email: signupEmail || 'user@otpwallet.com',
    });
    closeAuthModal();
  };

  const handleAdminAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError(null);

    const result = loginWithAdminKey(adminKey);
    if (result.success) {
      setAdminSuccess(true);
      setTimeout(() => {
        closeAuthModal();
        router.push('/admin');
      }, 400);
    } else {
      setAdminError(result.error || 'Invalid Superadmin Key');
    }
  };

  const handleAutofillAdminKey = () => {
    setAdminKey(SUPERADMIN_MASTER_KEY);
    setAdminError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={closeAuthModal}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="relative px-6 pt-6 pb-4 border-b border-zinc-800/80 bg-zinc-900/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md">
              <Radio className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-sm text-white">
                OTP<span className="text-emerald-400">Wallet</span>
              </span>
              <p className="text-[10px] text-zinc-400 -mt-0.5">Authentication Portal</p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeAuthModal}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-zinc-800 bg-zinc-950/80 p-1.5 gap-1">
          <button
            type="button"
            onClick={() => {
              openAuthModal('login');
              setAdminError(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
              authModalTab === 'login'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              openAuthModal('signup');
              setAdminError(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
              authModalTab === 'signup'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Sign Up
          </button>
          <button
            type="button"
            onClick={() => {
              openAuthModal('admin');
              setAdminError(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1 cursor-pointer ${
              authModalTab === 'admin'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-purple-400 hover:text-purple-300 hover:bg-purple-950/40'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Admin Key</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* LOGIN TAB */}
          {authModalTab === 'login' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-white">Sign In to OTPWallet</h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Access your temporary numbers, active orders & wallet balance
                </p>
              </div>

              {/* Instant 1-Click Dummy User Login */}
              <div className="p-3.5 rounded-2xl bg-zinc-900 border border-emerald-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Quick Demo Access
                  </span>
                  <span className="text-[10px] text-zinc-400">Pre-funded ₹250.00</span>
                </div>
                <button
                  type="button"
                  onClick={handleDummyLogin}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs transition flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20 cursor-pointer"
                >
                  <Zap className="w-4 h-4 fill-black" />
                  <span>1-Click Dummy User Login</span>
                </button>
              </div>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-zinc-800" />
                <span className="flex-shrink mx-3 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                  or sign in with email
                </span>
                <div className="flex-grow border-t border-zinc-800" />
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleDummyLogin();
                }}
                className="space-y-3"
              >
                <div>
                  <label className="block text-[11px] font-medium text-zinc-300 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                      placeholder="name@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-zinc-300 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                      placeholder="••••••••••••"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer mt-2"
                >
                  <span>Sign In</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>

              <div className="pt-2 text-center text-xs text-zinc-400">
                Need an account?{' '}
                <button
                  type="button"
                  onClick={() => openAuthModal('signup')}
                  className="text-emerald-400 hover:underline font-semibold cursor-pointer"
                >
                  Create one now
                </button>
              </div>
            </div>
          )}

          {/* SIGN UP TAB */}
          {authModalTab === 'signup' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-white">Create New Account</h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Get started with instant virtual numbers and SMS verification
                </p>
              </div>

              {/* Instant 1-Click Dummy User Register */}
              <div className="p-3.5 rounded-2xl bg-zinc-900 border border-blue-500/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Quick Dummy Sign Up
                  </span>
                  <span className="text-[10px] text-zinc-400">Instant Demo Account</span>
                </div>
                <button
                  type="button"
                  onClick={handleDummyRegister}
                  className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs transition flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 cursor-pointer"
                >
                  <Zap className="w-4 h-4 fill-white" />
                  <span>Register as Demo User (₹250 Balance)</span>
                </button>
              </div>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-zinc-800" />
                <span className="flex-shrink mx-3 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
                  or enter your details
                </span>
                <div className="flex-grow border-t border-zinc-800" />
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleDummyRegister();
                }}
                className="space-y-3"
              >
                <div>
                  <label className="block text-[11px] font-medium text-zinc-300 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                      <UserIcon className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={signupName}
                      onChange={(e) => setSignupName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                      placeholder="Alex Rivera"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-zinc-300 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                      placeholder="alex.rivera@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-zinc-300 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type="password"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                      placeholder="••••••••••••"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer mt-2"
                >
                  <span>Create Account & Continue</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>

              <div className="pt-2 text-center text-xs text-zinc-400">
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => openAuthModal('login')}
                  className="text-emerald-400 hover:underline font-semibold cursor-pointer"
                >
                  Sign in here
                </button>
              </div>
            </div>
          )}

          {/* ADMIN ACCESS (SUPERADMIN KEY) TAB */}
          {authModalTab === 'admin' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-600 flex items-center justify-center text-white shadow-md">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Superadmin Key Login</h3>
                  <p className="text-xs text-purple-300/80">Restricted Administration Access</p>
                </div>
              </div>

              <p className="text-xs text-zinc-400 leading-relaxed">
                Enter your Master Superadmin Key to unlock administrative privileges, manage SMS
                providers, adjust pricing margins, and oversee the global financial ledger.
              </p>

              {/* Master Key Demo Pill */}
              <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-800/60 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-zinc-400 block">Master Superadmin Key:</span>
                  <code className="text-purple-300 font-mono font-bold">{SUPERADMIN_MASTER_KEY}</code>
                </div>
                <button
                  type="button"
                  onClick={handleAutofillAdminKey}
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

              {adminSuccess && (
                <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/60 flex items-center gap-2 text-emerald-300 text-xs">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>Key Verified! Redirecting to Admin Console...</span>
                </div>
              )}

              <form onSubmit={handleAdminAuth} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-medium text-zinc-300 mb-1">
                    Superadmin Key
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                      <KeyRound className="w-4 h-4" />
                    </div>
                    <input
                      type={showAdminKey ? 'text' : 'password'}
                      value={adminKey}
                      onChange={(e) => {
                        setAdminKey(e.target.value);
                        setAdminError(null);
                      }}
                      className="w-full pl-9 pr-10 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-purple-500"
                      placeholder="Enter master key..."
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
                  disabled={!adminKey.trim()}
                  className="w-full py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold text-xs transition flex items-center justify-center gap-2 shadow-md shadow-purple-600/20 cursor-pointer"
                >
                  <Shield className="w-4 h-4" />
                  <span>Unlock & Enter Admin Console</span>
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
