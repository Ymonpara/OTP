'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePlatform } from '@/context/PlatformContext';
import { Radio, Lock, Mail, User, Phone, ArrowRight, Sparkles, Check } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { loginAsDummyCustomer } = usePlatform();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [agree, setAgree] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      loginAsDummyCustomer({ name: name || 'Demo User', email: email || 'user@otpwallet.com' });
      router.push('/dashboard/buy-number');
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[#090d16] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-600/15 blur-[100px] rounded-full pointer-events-none -z-10" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2.5 mb-4 group">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/25 group-hover:bg-blue-500 transition">
            <Radio className="w-5 h-5 text-white" />
          </div>
          <span className="font-extrabold text-xl tracking-tight text-white">
            OTP<span className="text-emerald-400">Wallet</span>
          </span>
        </Link>
        <h2 className="text-2xl font-bold text-white tracking-tight">Create your account</h2>
        <p className="mt-1 text-xs text-zinc-400">
          Get started with instant virtual numbers and OTP verification
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="glass-panel-elevated p-6 sm:p-8 rounded-2xl border border-zinc-800 space-y-6">
          {/* Welcome Promo Badge */}
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3 text-xs text-emerald-400">
            <Sparkles className="w-4 h-4 shrink-0" />
            <span>Instant wallet registration. Try any verification service in seconds!</span>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Aarav Sharma"
                  className="w-full pl-9 pr-3 py-2.5 bg-zinc-900 border border-zinc-700/80 rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 text-xs transition"
                />
              </div>
            </div>

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
              <label className="block text-xs font-medium text-zinc-300 mb-1">
                Phone Number <span className="text-zinc-500">(Optional)</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full pl-9 pr-3 py-2.5 bg-zinc-900 border border-zinc-700/80 rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 text-xs transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-3 py-2.5 bg-zinc-900 border border-zinc-700/80 rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 text-xs transition"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="terms"
                required
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                className="w-4 h-4 rounded bg-zinc-900 border-zinc-700 text-emerald-500 focus:ring-emerald-500"
              />
              <label htmlFor="terms" className="text-xs text-zinc-400">
                I agree to the Terms of Service and acceptable use policy
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer"
            >
              {isLoading ? (
                <span>Creating account...</span>
              ) : (
                <>
                  <span>Create Free Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="text-center text-xs text-zinc-400">
            Already have an account?{' '}
            <Link href="/auth/login" className="font-semibold text-emerald-400 hover:text-emerald-300">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
