'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePlatform } from '@/context/PlatformContext';
import {
  User,
  Bell,
  Save,
  CheckCircle2,
  Trash2,
  AlertTriangle,
  X,
  ShieldAlert,
} from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const { currentUser, logout } = usePlatform();
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  // Danger Space: Delete Account Modal & State
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [confirmInput, setConfirmInput] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleDeleteAccount = () => {
    if (confirmInput.trim().toUpperCase() !== 'CONFIRM') return;
    setIsDeleting(true);

    setTimeout(() => {
      logout();
      router.push('/');
    }, 800);
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Account Settings</h1>
        <p className="text-xs text-zinc-400 mt-1">
          Manage your personal details, notification preferences, and account security.
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
              className="w-4 h-4 rounded text-emerald-500 bg-zinc-800 border-zinc-700 cursor-pointer"
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
              className="w-4 h-4 rounded text-emerald-500 bg-zinc-800 border-zinc-700 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div>
        <button
          type="button"
          onClick={handleSave}
          className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs transition flex items-center gap-2 shadow-lg shadow-emerald-500/20 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>Save Preferences</span>
        </button>
      </div>

      {/* DANGER SPACE: Permanently Delete Account */}
      <div className="p-6 rounded-2xl bg-rose-950/20 border-2 border-rose-900/50 space-y-4">
        <div className="flex items-center gap-2 text-rose-400 font-bold text-sm">
          <ShieldAlert className="w-5 h-5 text-rose-500" />
          <span>Danger Space: Permanent Account Deletion</span>
        </div>

        <p className="text-xs text-zinc-400 leading-relaxed">
          Permanently delete your account, active temporary numbers, order history, and wallet ledger
          balances. Once confirmed, this action cannot be reversed and your data is permanently removed.
        </p>

        {!isDeleteConfirmOpen ? (
          <button
            type="button"
            onClick={() => setIsDeleteConfirmOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition flex items-center gap-2 shadow-lg shadow-rose-600/20 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Account Permanently</span>
          </button>
        ) : (
          <div className="p-4 rounded-xl bg-zinc-950 border border-rose-800/60 space-y-3 animate-in fade-in duration-200">
            <div className="flex items-start gap-2.5 text-xs text-rose-300">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Are you absolutely certain?</span>
                <span className="text-[11px] text-zinc-400">
                  Please type <code className="text-rose-400 font-mono font-bold">CONFIRM</code> below to confirm permanent deletion.
                </span>
              </div>
            </div>

            <input
              type="text"
              value={confirmInput}
              onChange={(e) => setConfirmInput(e.target.value)}
              placeholder="Type CONFIRM to proceed..."
              className="w-full px-3.5 py-2.5 bg-zinc-900 border border-rose-900/80 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-rose-500"
              autoFocus
            />

            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={confirmInput.trim().toUpperCase() !== 'CONFIRM' || isDeleting}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white font-bold text-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>{isDeleting ? 'Deleting Everything...' : 'Yes, Permanently Delete'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsDeleteConfirmOpen(false);
                  setConfirmInput('');
                }}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold transition cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
