'use client';

import React, { useState } from 'react';
import { usePlatform } from '@/context/PlatformContext';
import { TicketCategory } from '@/types';
import {
  LifeBuoy,
  Plus,
  Send,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ChevronRight,
  User,
  Shield,
} from 'lucide-react';

export default function SupportPage() {
  const { tickets, createTicket, replyTicket, currentUser } = usePlatform();
  const [selectedTicketId, setSelectedTicketId] = useState<string>(tickets[0]?.id || '');
  const [isNewTicketOpen, setIsNewTicketOpen] = useState(false);
  const [replyText, setReplyText] = useState('');

  // Form states
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState<TicketCategory>('OTP Delivery');
  const [message, setMessage] = useState('');

  const activeTicket = tickets.find((t) => t.id === selectedTicketId) || tickets[0];

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !message) return;
    createTicket(subject, category, message);
    setSubject('');
    setMessage('');
    setIsNewTicketOpen(false);
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !activeTicket) return;
    replyTicket(activeTicket.id, replyText);
    setReplyText('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Support & Help Desk</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Need help with a verification code, wallet top-up, or provider inquiry?
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsNewTicketOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs transition flex items-center gap-1.5 shadow-md shadow-emerald-500/20"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Open Support Ticket</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Ticket List (Left) */}
        <div className="lg:col-span-4 space-y-3">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Your Tickets</h3>

          {tickets.length === 0 ? (
            <div className="p-6 rounded-2xl glass-panel text-center text-xs text-zinc-500">
              No tickets open.
            </div>
          ) : (
            <div className="space-y-2">
              {tickets.map((t) => (
                <div
                  key={t.id}
                  onClick={() => setSelectedTicketId(t.id)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition ${
                    activeTicket?.id === t.id
                      ? 'bg-zinc-800 border-emerald-500/50 shadow-md'
                      : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-[10px] text-zinc-500">{t.id}</span>
                    <span
                      className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        t.status === 'resolved'
                          ? 'bg-emerald-500/10 text-emerald-400'
                          : t.status === 'in_progress'
                          ? 'bg-blue-500/10 text-blue-400'
                          : 'bg-amber-500/10 text-amber-400'
                      }`}
                    >
                      {t.status.replace('_', ' ')}
                    </span>
                  </div>
                  <h4 className="font-bold text-xs text-zinc-200 line-clamp-1">{t.subject}</h4>
                  <div className="flex items-center justify-between text-[10px] text-zinc-500 mt-2">
                    <span>{t.category}</span>
                    <span>{new Date(t.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Ticket Conversation (Right) */}
        <div className="lg:col-span-8">
          {activeTicket ? (
            <div className="rounded-2xl glass-panel border border-zinc-800 flex flex-col h-[520px]">
              {/* Header */}
              <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-white">{activeTicket.subject}</h3>
                  <div className="flex items-center gap-2 text-[11px] text-zinc-400 mt-0.5">
                    <span>Category: {activeTicket.category}</span>
                    <span>•</span>
                    <span className="font-mono">ID: {activeTicket.id}</span>
                  </div>
                </div>
                <span
                  className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${
                    activeTicket.status === 'resolved'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                  }`}
                >
                  {activeTicket.status.replace('_', ' ')}
                </span>
              </div>

              {/* Chat Thread */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Initial Ticket Message */}
                <div className="flex gap-3">
                  <div className="w-7 h-7 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-zinc-300" />
                  </div>
                  <div className="space-y-1 max-w-lg">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-zinc-200">You</span>
                      <span className="text-[10px] text-zinc-500">
                        {new Date(activeTicket.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="p-3 rounded-2xl rounded-tl-none bg-zinc-800/80 text-xs text-zinc-200 leading-relaxed">
                      {activeTicket.message}
                    </div>
                  </div>
                </div>

                {/* Replies */}
                {activeTicket.replies.map((reply) => {
                  const isAdmin = reply.sender === 'admin';
                  return (
                    <div
                      key={reply.id}
                      className={`flex gap-3 ${isAdmin ? 'flex-row-reverse' : ''}`}
                    >
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                          isAdmin ? 'bg-purple-900/60 text-purple-300' : 'bg-zinc-800 text-zinc-300'
                        }`}
                      >
                        {isAdmin ? <Shield className="w-4 h-4" /> : <User className="w-4 h-4" />}
                      </div>

                      <div className={`space-y-1 max-w-lg ${isAdmin ? 'items-end text-right' : ''}`}>
                        <div
                          className={`flex items-center gap-2 ${
                            isAdmin ? 'justify-end' : ''
                          }`}
                        >
                          <span className="font-bold text-xs text-zinc-200">
                            {reply.senderName}
                          </span>
                          <span className="text-[10px] text-zinc-500">
                            {new Date(reply.createdAt).toLocaleTimeString()}
                          </span>
                        </div>
                        <div
                          className={`p-3 rounded-2xl text-xs leading-relaxed ${
                            isAdmin
                              ? 'bg-purple-950/60 border border-purple-800/50 text-purple-100 rounded-tr-none text-left'
                              : 'bg-zinc-800/80 text-zinc-200 rounded-tl-none'
                          }`}
                        >
                          {reply.message}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Reply Input */}
              <form onSubmit={handleSendReply} className="p-3 border-t border-zinc-800 flex gap-2">
                <input
                  type="text"
                  placeholder="Type your message to support..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-100 text-xs focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="submit"
                  disabled={!replyText.trim()}
                  className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-xs transition flex items-center gap-1 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </form>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center p-8 text-zinc-500 text-xs">
              Select a ticket to view replies.
            </div>
          )}
        </div>
      </div>

      {/* New Ticket Modal */}
      {isNewTicketOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Create New Support Ticket</h3>

            <form onSubmit={handleCreateTicket} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-400 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as TicketCategory)}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-zinc-100"
                >
                  <option value="OTP Delivery">OTP Delivery & Reception</option>
                  <option value="Wallet & Recharge">Wallet & Recharge</option>
                  <option value="Order Refund">Order Cancellation & Refund</option>
                  <option value="API Integration">Developer API</option>
                  <option value="Other">Other Query</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Subject</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. WhatsApp verification not receiving code"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-zinc-100"
                />
              </div>

              <div>
                <label className="block text-zinc-400 mb-1">Message</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Describe your issue with order number or service name..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-zinc-100 resize-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewTicketOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-zinc-800 text-zinc-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-500 text-black font-bold"
                >
                  Submit Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
