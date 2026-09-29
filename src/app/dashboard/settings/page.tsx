'use client';

import React, { useState } from 'react';
import { usePlatform } from '@/context/PlatformContext';
import {
  User,
  Key,
  Bell,
  Shield,
  Copy,
  Check,
  RefreshCw,
  Lock,
  Save,
  CheckCircle2,
} from 'lucide-react';

export default function SettingsPage() {
  const { currentUser } = usePlatform();
  const [apiKey, setApiKey] = useState('otp_live_89f92ba491a27e492b4920');
  const [copiedKey, setCopiedKey] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [webhookUrl, setWebhookUrl] = useState('https://myapp.com/api/webhooks/otp');
  const [isSaved, setIsSaved] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(apiKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleRegenerateKey = () => {
    const newKey = `otp_live_${Math.random().toString(36).substring(2, 14)}${Math.random().toString(36).substring(2, 14)}`;
    setApiKey(newKey);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Account & Developer Settings</h1>
        <p className="text-xs text-zinc-400 mt-1">
          Manage your personal details, developer API tokens, notification preferences, and security.
        </p>
      </div>

      {isSaved && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Settings saved successfully!</span>
        </div>
      )}

      {/* Profile Details */}
      <div className="p-6 rounded-2xl glass-panel border border-zinc-800 space-y-4">
        <div className="flex items-center gap-2 text-white font-bold text-sm">
          <User className="w-4 h-4 text-emerald-400" />
          <span>Profile Information</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-zinc-400 mb-1">Full Name</label>
            <input
              type="text"
              defaultValue={currentUser.name}
              className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-100 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-zinc-400 mb-1">Email Address</label>
            <div className="flex items-center gap-2">
              <input
                type="email"
                defaultValue={currentUser.email}
                disabled
                className="w-full px-3.5 py-2.5 bg-zinc-900/60 border border-zinc-800 rounded-xl text-zinc-400"
              />
              <span className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 font-semibold text-[10px] whitespace-nowrap">
                Verified
              </span>
            </div>
          </div>

          <div>
            <label className="block text-zinc-400 mb-1">Phone Number</label>
            <input
              type="tel"
              defaultValue={currentUser.phone || '+91 98765 43210'}
              className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-100 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="block text-zinc-400 mb-1">Account Role</label>
            <input
              type="text"
              defaultValue={currentUser.role.toUpperCase()}
              disabled
              className="w-full px-3.5 py-2.5 bg-zinc-900/60 border border-zinc-800 rounded-xl text-zinc-400 font-mono"
            />
          </div>
        </div>
      </div>

      {/* Developer API & Webhooks */}
      <div className="p-6 rounded-2xl glass-panel border border-zinc-800 space-y-4">
        <div className="flex items-center gap-2 text-white font-bold text-sm">
          <Key className="w-4 h-4 text-teal-400" />
          <span>Developer REST API Access</span>
        </div>
        <p className="text-xs text-zinc-400">
          Automate number purchases and receive incoming SMS callbacks programmatically via HTTP
          webhooks.
        </p>

        <div className="space-y-3 text-xs">
          <div>
            <label className="block text-zinc-400 mb-1">API Secret Key</label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={apiKey}
                className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-300 font-mono text-xs"
              />
              <button
                type="button"
                onClick={handleCopy}
                className="px-3.5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 transition shrink-0"
              >
                {copiedKey ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
              <button
                type="button"
                onClick={handleRegenerateKey}
                className="p-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-200 transition shrink-0"
                title="Regenerate Key"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-zinc-400 mb-1">SMS Webhook URL (POST)</label>
            <input
              type="url"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://yourserver.com/webhooks/otp"
              className="w-full px-3.5 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-100 font-mono text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Notifications & Audio */}
      <div className="p-6 rounded-2xl glass-panel border border-zinc-800 space-y-4">
        <div className="flex items-center gap-2 text-white font-bold text-sm">
          <Bell className="w-4 h-4 text-indigo-400" />
          <span>Notification Preferences</span>
        </div>

        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
            <div>
              <span className="font-bold text-zinc-200 block">Sound Alert on Incoming OTP</span>
              <span className="text-[11px] text-zinc-500">
                Play soft chime sound when an SMS verification code is detected
              </span>
            </div>
            <input
              type="checkbox"
              checked={soundEnabled}
              onChange={(e) => setSoundEnabled(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-500 bg-zinc-800 border-zinc-700"
            />
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
            <div>
              <span className="font-bold text-zinc-200 block">Email Alerts on Wallet Deposit</span>
              <span className="text-[11px] text-zinc-500">
                Receive transactional receipt whenever your wallet balance is credited
              </span>
            </div>
            <input
              type="checkbox"
              checked={emailAlerts}
              onChange={(e) => setEmailAlerts(e.target.checked)}
              className="w-4 h-4 rounded text-emerald-500 bg-zinc-800 border-zinc-700"
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <button
        type="button"
        onClick={handleSave}
        className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs transition flex items-center gap-2 shadow-lg shadow-emerald-500/20"
      >
        <Save className="w-4 h-4" />
        <span>Save Settings</span>
      </button>
    </div>
  );
}
