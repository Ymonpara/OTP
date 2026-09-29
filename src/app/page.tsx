'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ServiceIcon } from '@/components/ServiceIcon';
import { usePlatform } from '@/context/PlatformContext';
import {
  Radio,
  Zap,
  ShieldCheck,
  Clock,
  ArrowRight,
  CheckCircle2,
  RefreshCw,
  Wallet,
  Globe,
  Sparkles,
  ChevronRight,
  Lock,
  Layers,
  TrendingUp,
  Cpu,
} from 'lucide-react';

export default function LandingPage() {
  const { services, countries } = usePlatform();
  const [selectedServiceSlug, setSelectedServiceSlug] = useState('whatsapp');
  const [selectedCountryCode, setSelectedCountryCode] = useState('IN');

  const selectedService =
    services.find((s) => s.slug === selectedServiceSlug) || services[0];
  const selectedCountry =
    countries.find((c) => c.code === selectedCountryCode) || countries[0];

  const popularServices = services.slice(0, 8);

  return (
    <div className="flex flex-col min-h-screen bg-[#090d16] text-zinc-100 selection:bg-emerald-500/30">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Headlines & CTA */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 shadow-sm">
                <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
                <span className="text-xs font-bold text-emerald-400">
                  Multi-Provider Carrier Network
                </span>
                <span className="text-xs text-zinc-600">|</span>
                <span className="text-xs text-blue-400 font-medium">5SIM & OnlineSIM Integrated</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1]">
                Instant Virtual Numbers for{' '}
                <span className="text-blue-400">SMS</span> &{' '}
                <span className="text-emerald-400">OTP Verification</span>
              </h1>

              <p className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
                Activate accounts on WhatsApp, Telegram, OpenAI, Google and 200+ services in seconds.
                Zero-risk wallet reservation with automatic refunds if SMS is not received.
              </p>

              {/* Action Buttons (Solid Multi-Color) */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  href="/dashboard/buy-number"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 group"
                >
                  <Zap className="w-4 h-4 fill-black" />
                  <span>Get Temporary Number</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  href="/admin"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-purple-900/40 hover:bg-purple-900/60 text-purple-300 border border-purple-700/60 font-semibold text-sm transition flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4 text-purple-400" />
                  <span>Launch Admin Portal</span>
                </Link>
              </div>

              {/* Trust Badges (Multi-Color Highlights) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-zinc-800">
                <div className="p-3 rounded-xl bg-zinc-900 border border-blue-500/20">
                  <div className="text-xl font-extrabold text-blue-400">4.8s</div>
                  <div className="text-xs text-zinc-400">Avg OTP Speed</div>
                </div>
                <div className="p-3 rounded-xl bg-zinc-900 border border-emerald-500/20">
                  <div className="text-xl font-extrabold text-emerald-400">99.4%</div>
                  <div className="text-xs text-zinc-400">Delivery Rate</div>
                </div>
                <div className="p-3 rounded-xl bg-zinc-900 border border-amber-500/20">
                  <div className="text-xl font-extrabold text-amber-400">₹0 Risk</div>
                  <div className="text-xs text-zinc-400">Auto Hold Release</div>
                </div>
                <div className="p-3 rounded-xl bg-zinc-900 border border-purple-500/20">
                  <div className="text-xl font-extrabold text-purple-400">200+</div>
                  <div className="text-xs text-zinc-400">Supported Apps</div>
                </div>
              </div>
            </div>

            {/* Right Column: Live Interactive Demo Card */}
            <div className="lg:col-span-5">
              <div className="relative p-6 sm:p-7 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl">
                <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-zinc-200">
                      Live Number Generator
                    </span>
                  </div>
                  <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-blue-500/15 text-blue-400 border border-blue-500/30">
                    Instant Demo
                  </span>
                </div>

                <div className="py-5 space-y-4">
                  {/* Country Selector */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                      1. Choose Country
                    </label>
                    <select
                      value={selectedCountryCode}
                      onChange={(e) => setSelectedCountryCode(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-100 text-xs font-medium focus:outline-none focus:border-blue-500 transition cursor-pointer"
                    >
                      {countries.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.flag} {c.name} ({c.dialCode})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Service Selector */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                      2. Choose Platform / Service
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {services.slice(0, 4).map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => setSelectedServiceSlug(s.slug)}
                          className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-medium transition cursor-pointer ${
                            selectedServiceSlug === s.slug
                              ? 'bg-blue-600/20 border-blue-500 text-white'
                              : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <ServiceIcon name={s.iconName} className="w-4 h-4" />
                            <span className="truncate">{s.name.split('/')[0]}</span>
                          </div>
                          <span className="font-mono text-emerald-400 font-bold">
                            ₹{s.sellingPrice}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Summary Box (Multi-Color Details) */}
                  <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-400">Guaranteed Selling Price:</span>
                      <span className="text-base font-bold text-emerald-400 font-mono">
                        ₹{selectedService.sellingPrice.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-400">Activation Window:</span>
                      <span className="text-amber-400 font-bold">5 Minutes Countdown</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-400">Refund Guarantee:</span>
                      <span className="text-teal-400 font-semibold">100% Release if No SMS</span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <Link
                    href="/dashboard/buy-number"
                    className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-md shadow-blue-600/20"
                  >
                    <span>Get {selectedService.name} Number</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <p className="text-[11px] text-zinc-500 text-center">
                    Instant delivery • Temporary 1-time virtual verification
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section (4 Distinct Solid Colors) */}
      <section className="py-16 border-t border-zinc-800 bg-zinc-950/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <h2 className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-2">
              Simple 4-Step Process
            </h2>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
              How the OTP Wallet Platform Works
            </h3>
            <p className="text-sm text-zinc-400 mt-2">
              Every step is managed with financial ledger integrity and automatic risk protection.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Step 1: Emerald Green */}
            <div className="p-6 rounded-2xl bg-zinc-900 border-2 border-emerald-500/30 relative">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 text-black font-extrabold flex items-center justify-center mb-4">
                1
              </div>
              <h4 className="text-base font-bold text-emerald-300 mb-1">Add Wallet Balance</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Deposit funds via instant UPI, QR code, or Razorpay. Balance is immediately
                credited to your ledger.
              </p>
            </div>

            {/* Step 2: Electric Blue */}
            <div className="p-6 rounded-2xl bg-zinc-900 border-2 border-blue-500/30 relative">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-extrabold flex items-center justify-center mb-4">
                2
              </div>
              <h4 className="text-base font-bold text-blue-300 mb-1">Choose Service</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Select from WhatsApp, Telegram, Google, etc. Our backend calculates transparent
                selling prices with guaranteed margins.
              </p>
            </div>

            {/* Step 3: Amber Gold */}
            <div className="p-6 rounded-2xl bg-zinc-900 border-2 border-amber-500/30 relative">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-black font-extrabold flex items-center justify-center mb-4">
                3
              </div>
              <h4 className="text-base font-bold text-amber-300 mb-1">Number Hold & 5-Min Timer</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Funds are put on hold (not permanently charged). You get a fresh temporary number
                and a 5-minute countdown window.
              </p>
            </div>

            {/* Step 4: Purple / Violet */}
            <div className="p-6 rounded-2xl bg-zinc-900 border-2 border-purple-500/30 relative">
              <div className="w-10 h-10 rounded-xl bg-purple-600 text-white font-extrabold flex items-center justify-center mb-4">
                4
              </div>
              <h4 className="text-base font-bold text-purple-300 mb-1">Receive OTP or Auto-Refund</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                SMS arrives within seconds. If no SMS arrives or you cancel within the window, the
                hold is instantly released!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Services Grid */}
      <section className="py-16 border-t border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
            <div>
              <h3 className="text-2xl font-extrabold text-white">Popular Verification Services</h3>
              <p className="text-xs text-zinc-400 mt-1">
                Real-time provider routing with high delivery success rates.
              </p>
            </div>
            <Link
              href="/dashboard/buy-number"
              className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1"
            >
              <span>View All 200+ Services</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {popularServices.map((service) => (
              <div
                key={service.id}
                className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 flex flex-col justify-between transition"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-9 h-9 rounded-lg bg-zinc-950 flex items-center justify-center border border-zinc-800">
                      <ServiceIcon name={service.iconName} className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                      ₹{service.sellingPrice.toFixed(2)}
                    </span>
                  </div>
                  <h4 className="font-bold text-zinc-100 text-sm">{service.name}</h4>
                  <div className="flex items-center gap-3 text-[11px] text-zinc-400 mt-1">
                    <span>Speed: ~{service.avgSpeedSeconds}s</span>
                    <span>•</span>
                    <span className="text-emerald-400 font-semibold">{service.successRate}% Success</span>
                  </div>
                </div>

                <Link
                  href="/dashboard/buy-number"
                  className="mt-4 w-full py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-500 font-bold text-xs text-white transition text-center shadow-sm"
                >
                  Activate Number
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Architectural Rigor & Safeguards (Solid Multi-Color Cards) */}
      <section className="py-16 border-t border-zinc-800 bg-zinc-950/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-xs font-bold text-purple-400 uppercase tracking-widest mb-2">
              Engineering Architecture
            </h2>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
              Built to the Exact Developer Plan Specification
            </h3>
            <p className="text-sm text-zinc-400 mt-2">
              Designed for financial precision, multi-provider resiliency, and full administrator
              transparency.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-zinc-900 border border-purple-500/30 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
                <Wallet className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-purple-300">Double-Entry Wallet Ledger</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Matches Sections 6 & 7: balances are tracked via explicit transactions (RECHARGE,
                HOLD, DEBIT, RELEASE_HOLD, REFUND). No direct unsafe mutations.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-zinc-900 border border-blue-500/30 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
                <Cpu className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-blue-300">Multi-Provider Adapter System</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Matches Sections 9 & 11: standardized provider interface for 5SIM, OnlineSIM, and
                future providers with automatic price checking and priority fallback.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-zinc-900 border border-emerald-500/30 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-emerald-300">Provider Cost & Margin Safety</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Matches Sections 28 & 29: selling price is calculated on the server with minimum
                margin enforcement. Orders never purchase if provider cost exceeds limits.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Box (Solid Dark Bordered) */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl p-8 sm:p-12 bg-zinc-900 border-2 border-emerald-500/40 text-center shadow-xl">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
              Ready to Activate Your Virtual Number?
            </h3>
            <p className="text-sm text-zinc-400 max-w-xl mx-auto mb-6">
              Create an account or start with our interactive demo. Top up ₹50+ and get instant
              access to virtual numbers worldwide.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/dashboard/buy-number"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-sm transition shadow-lg shadow-emerald-500/20"
              >
                Start Verification
              </Link>
              <Link
                href="/auth/login"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 font-semibold text-sm transition"
              >
                Log In
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
