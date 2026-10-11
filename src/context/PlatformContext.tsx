'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  Wallet,
  WalletTransaction,
  ServiceItem,
  Country,
  SmsProvider,
  OtpOrder,
  SupportTicket,
  UserRole,
  TicketCategory,
} from '@/types';
import {
  INITIAL_ALL_USERS,
  INITIAL_COUNTRIES,
  INITIAL_ORDERS,
  INITIAL_PROVIDERS,
  INITIAL_SERVICES,
  INITIAL_TICKETS,
  INITIAL_TRANSACTIONS,
  INITIAL_USER,
  INITIAL_ADMIN_USER,
  INITIAL_WALLET,
} from '@/lib/mockData';

export const SUPERADMIN_MASTER_KEY = 'SUPERADMIN_2026';

interface PlatformContextType {
  // Loading & Hydration Cache State
  isLoaded: boolean;

  // Current session & auth
  currentUser: User;
  isLoggedIn: boolean;
  isAdminAuthenticated: boolean;
  switchRole: (role: UserRole) => void;
  loginAsDummyCustomer: (details?: { name?: string; email?: string }) => void;
  loginWithAdminKey: (key: string) => { success: boolean; error?: string };
  logout: () => void;

  // Auth modal management
  isAuthModalOpen: boolean;
  authModalTab: 'login' | 'signup' | 'admin';
  openAuthModal: (tab?: 'login' | 'signup' | 'admin') => void;
  closeAuthModal: () => void;

  allUsers: User[];
  toggleUserStatus: (userId: string) => void;

  // Wallet
  wallet: Wallet;
  transactions: WalletTransaction[];
  rechargeWallet: (amount: number, method: string) => Promise<{ success: boolean; txnId: string }>;
  adminAdjustWallet: (
    userId: string,
    type: 'ADMIN_CREDIT' | 'ADMIN_DEBIT',
    amount: number,
    reason: string
  ) => void;

  // Services & Providers
  services: ServiceItem[];
  countries: Country[];
  providers: SmsProvider[];
  updateService: (serviceId: string, updates: Partial<ServiceItem>) => void;
  toggleServiceStatus: (serviceId: string) => void;
  updateProvider: (providerId: string, updates: Partial<SmsProvider>) => void;
  syncProviderBalance: (providerId: string) => void;

  // Orders
  orders: OtpOrder[];
  activeOrder: OtpOrder | null;
  setActiveOrder: (order: OtpOrder | null) => void;
  buyNumber: (serviceId: string, countryCode: string, operator?: string) => Promise<{ success: boolean; order?: OtpOrder; error?: string }>;
  cancelOrder: (orderId: string) => Promise<{ success: boolean; message: string }>;
  simulateSmsReceived: (orderId: string, code?: string) => void;
  adminRefundOrder: (orderId: string, reason: string) => void;

  // Support
  tickets: SupportTicket[];
  createTicket: (subject: string, category: TicketCategory, message: string) => void;
  replyTicket: (ticketId: string, message: string) => void;

  // Audio / notification helper
  playNotificationSound: () => void;
}

const PlatformContext = createContext<PlatformContextType | undefined>(undefined);

// Web Audio API chime generator for incoming OTP / recharge success
const playChime = () => {
  if (typeof window === 'undefined') return;
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
  } catch {
    // Ignore audio permission errors
  }
};

export const PlatformProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USER);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'signup' | 'admin'>('login');
  const [allUsers, setAllUsers] = useState<User[]>(INITIAL_ALL_USERS);
  const [wallet, setWallet] = useState<Wallet>(INITIAL_WALLET);
  const [transactions, setTransactions] = useState<WalletTransaction[]>(INITIAL_TRANSACTIONS);
  const [services, setServices] = useState<ServiceItem[]>(INITIAL_SERVICES);
  const [countries] = useState<Country[]>(INITIAL_COUNTRIES);
  const [providers, setProviders] = useState<SmsProvider[]>(INITIAL_PROVIDERS);
  const [orders, setOrders] = useState<OtpOrder[]>(INITIAL_ORDERS);
  const [activeOrder, setActiveOrder] = useState<OtpOrder | null>(null);
  const [tickets, setTickets] = useState<SupportTicket[]>(INITIAL_TICKETS);
  const [isLoaded, setIsLoaded] = useState(false);

  // Cache Helpers for instant localStorage and cookie sync
  const readCache = (key: string): string | null => {
    try {
      const local = localStorage.getItem(key);
      if (local) return local;
    } catch {}
    try {
      const match = typeof document !== 'undefined' ? document.cookie.match(new RegExp('(^|;\\s*)' + key + '=([^;]+)')) : null;
      if (match) return decodeURIComponent(match[2]);
    } catch {}
    return null;
  };

  const writeCache = (key: string, val: string) => {
    try {
      localStorage.setItem(key, val);
    } catch {}
    try {
      if (typeof document !== 'undefined') {
        const expires = new Date(Date.now() + 7 * 864e5).toUTCString();
        document.cookie = `${key}=${encodeURIComponent(val)}; expires=${expires}; path=/; SameSite=Lax`;
      }
    } catch {}
  };

  // Load from localStorage and cookie cache on mount
  useEffect(() => {
    queueMicrotask(() => {
      try {
        const savedWallet = readCache('otp_wallet');
        if (savedWallet) setWallet(JSON.parse(savedWallet));

        const savedTxns = readCache('otp_txns');
        if (savedTxns) setTransactions(JSON.parse(savedTxns));

        const savedOrders = readCache('otp_orders');
        if (savedOrders) {
          const parsedOrders: OtpOrder[] = JSON.parse(savedOrders);
          setOrders(parsedOrders);
          // Look for any currently active waiting order
          const pending = parsedOrders.find(
            (o) => o.status === 'WAITING_FOR_SMS' || o.status === 'NUMBER_ASSIGNED'
          );
          if (pending) setActiveOrder(pending);
        }

        const savedServices = readCache('otp_services');
        if (savedServices) setServices(JSON.parse(savedServices));

        const savedProviders = readCache('otp_providers');
        if (savedProviders) setProviders(JSON.parse(savedProviders));

        const savedLoggedIn = readCache('otp_is_logged_in');
        if (savedLoggedIn === 'true') {
          setIsLoggedIn(true);
          const savedRole = readCache('otp_user_role');
          if (savedRole === 'admin' || savedRole === 'superadmin') {
            setCurrentUser(INITIAL_ADMIN_USER);
          } else {
            const savedUserData = readCache('otp_user_data');
            if (savedUserData) {
              try {
                setCurrentUser(JSON.parse(savedUserData));
              } catch {
                setCurrentUser(INITIAL_USER);
              }
            } else {
              setCurrentUser(INITIAL_USER);
            }
          }
        } else {
          setIsLoggedIn(false);
          setCurrentUser(INITIAL_USER);
        }
      } catch (e) {
        console.error('Failed to load from storage cache', e);
      } finally {
        setIsLoaded(true);
      }
    });
  }, []);

  // Save to persistent cache (localStorage + cookies)
  useEffect(() => {
    if (!isLoaded) return;
    try {
      writeCache('otp_wallet', JSON.stringify(wallet));
      writeCache('otp_txns', JSON.stringify(transactions));
      writeCache('otp_orders', JSON.stringify(orders));
      writeCache('otp_services', JSON.stringify(services));
      writeCache('otp_providers', JSON.stringify(providers));
    } catch (e) {
      console.error('Failed to save to storage cache', e);
    }
  }, [wallet, transactions, orders, services, providers, isLoaded]);

  // Auth modal management
  const openAuthModal = (tab: 'login' | 'signup' | 'admin' = 'login') => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  // Login as Dummy Customer
  const loginAsDummyCustomer = (details?: { name?: string; email?: string }) => {
    const dummy: User = {
      ...INITIAL_USER,
      name: details?.name?.trim() || INITIAL_USER.name,
      email: details?.email?.trim() || INITIAL_USER.email,
      role: 'customer',
    };
    setCurrentUser(dummy);
    setIsLoggedIn(true);
    localStorage.setItem('otp_is_logged_in', 'true');
    localStorage.setItem('otp_user_role', 'customer');
    localStorage.setItem('otp_user_data', JSON.stringify(dummy));
    playChime();
  };

  // Login with Superadmin Key
  const loginWithAdminKey = (key: string): { success: boolean; error?: string } => {
    const cleanKey = key.trim().toUpperCase();
    if (cleanKey === SUPERADMIN_MASTER_KEY || key.trim() === 'admin123' || cleanKey === 'SUPERADMIN') {
      setCurrentUser(INITIAL_ADMIN_USER);
      setIsLoggedIn(true);
      localStorage.setItem('otp_is_logged_in', 'true');
      localStorage.setItem('otp_user_role', 'admin');
      playChime();
      return { success: true };
    }
    return {
      success: false,
      error: `Invalid Superadmin Key. Please enter the master key: ${SUPERADMIN_MASTER_KEY}`,
    };
  };

  // Logout
  const logout = () => {
    setIsLoggedIn(false);
    setCurrentUser(INITIAL_USER);
    localStorage.removeItem('otp_is_logged_in');
    localStorage.removeItem('otp_user_role');
    localStorage.removeItem('otp_user_data');
  };

  // Switch Role
  const switchRole = (role: UserRole) => {
    if (role === 'admin' || role === 'superadmin') {
      setCurrentUser(INITIAL_ADMIN_USER);
      setIsLoggedIn(true);
      localStorage.setItem('otp_user_role', 'admin');
      localStorage.setItem('otp_is_logged_in', 'true');
    } else {
      setCurrentUser(INITIAL_USER);
      setIsLoggedIn(true);
      localStorage.setItem('otp_user_role', 'customer');
      localStorage.setItem('otp_is_logged_in', 'true');
    }
  };

  // Toggle User Block/Active
  const toggleUserStatus = (userId: string) => {
    setAllUsers((prev) =>
      prev.map((u) =>
        u.id === userId ? { ...u, status: u.status === 'active' ? 'blocked' : 'active' } : u
      )
    );
  };

  // Add Money (Customer Recharge)
  const rechargeWallet = async (amount: number, method: string) => {
    const txnId = `TXN-${Math.floor(100000 + Math.random() * 900000)}`;
    const beforeBal = wallet.availableBalance;
    const afterBal = beforeBal + amount;

    const newTxn: WalletTransaction = {
      id: txnId,
      walletId: wallet.id,
      userId: currentUser.id,
      type: 'CREDIT_RECHARGE',
      amount,
      balanceBefore: beforeBal,
      balanceAfter: afterBal,
      holdBefore: wallet.heldBalance,
      holdAfter: wallet.heldBalance,
      referenceType: `PAYMENT_${method.toUpperCase()}`,
      referenceId: `pay_${Math.random().toString(36).substring(2, 11)}`,
      description: `Wallet recharge via ${method} (₹${amount.toFixed(2)})`,
      status: 'COMPLETED',
      createdAt: new Date().toISOString(),
    };

    setWallet((prev) => ({
      ...prev,
      availableBalance: afterBal,
      updatedAt: new Date().toISOString(),
    }));

    setTransactions((prev) => [newTxn, ...prev]);
    playChime();
    return { success: true, txnId };
  };

  // Admin Manual Credit / Debit
  const adminAdjustWallet = (
    userId: string,
    type: 'ADMIN_CREDIT' | 'ADMIN_DEBIT',
    amount: number,
    reason: string
  ) => {
    const txnId = `ADJ-${Math.floor(100000 + Math.random() * 900000)}`;
    const beforeBal = wallet.availableBalance;
    const afterBal = type === 'ADMIN_CREDIT' ? beforeBal + amount : Math.max(0, beforeBal - amount);

    const newTxn: WalletTransaction = {
      id: txnId,
      walletId: wallet.id,
      userId,
      type,
      amount,
      balanceBefore: beforeBal,
      balanceAfter: afterBal,
      holdBefore: wallet.heldBalance,
      holdAfter: wallet.heldBalance,
      referenceType: 'ADMIN_ADJUSTMENT',
      referenceId: currentUser.id,
      description: `Manual ${type === 'ADMIN_CREDIT' ? 'Credit' : 'Debit'} by Admin: ${reason}`,
      status: 'COMPLETED',
      createdAt: new Date().toISOString(),
    };

    setWallet((prev) => ({
      ...prev,
      availableBalance: afterBal,
      updatedAt: new Date().toISOString(),
    }));
    setTransactions((prev) => [newTxn, ...prev]);
    playChime();
  };

  // Buy Number ("Get Number" flow with Hold mechanism)
  const buyNumber = async (serviceId: string, countryCode: string) => {
    const service = services.find((s) => s.id === serviceId);
    if (!service) return { success: false, error: 'Service not found.' };

    const country = countries.find((c) => c.code === countryCode) || countries[0];
    const cost = service.sellingPrice;

    if (wallet.availableBalance < cost) {
      return {
        success: false,
        error: `Insufficient wallet balance. You need ₹${cost.toFixed(2)}, but only have ₹${wallet.availableBalance.toFixed(2)}.`,
      };
    }

    // Provider selection: choose enabled provider with highest priority and enough margin
    const enabledProviders = providers
      .filter((p) => p.enabled && p.apiHealth !== 'offline')
      .sort((a, b) => a.priority - b.priority);

    const provider = enabledProviders[0] || providers[0];
    const orderId = `ORD-${Math.floor(10000 + Math.random() * 90000)}`;
    const txnId = `TXN-${Math.floor(100000 + Math.random() * 900000)}`;

    // Generate realistic phone number for the country
    const randomDigits = Math.floor(100000000 + Math.random() * 900000000);
    const phoneNumber = `${country.dialCode} 9${randomDigits.toString().slice(0, 9)}`;

    const beforeBal = wallet.availableBalance;
    const afterBal = beforeBal - cost;
    const beforeHold = wallet.heldBalance;
    const afterHold = beforeHold + cost;

    // 1. Create HOLD transaction
    const holdTxn: WalletTransaction = {
      id: txnId,
      walletId: wallet.id,
      userId: currentUser.id,
      type: 'HOLD_OTP_PURCHASE',
      amount: cost,
      balanceBefore: beforeBal,
      balanceAfter: afterBal,
      holdBefore: beforeHold,
      holdAfter: afterHold,
      referenceType: 'OTP_ORDER',
      referenceId: orderId,
      description: `Reserve temporary number for ${service.name} (${country.name})`,
      status: 'COMPLETED',
      createdAt: new Date().toISOString(),
    };

    // 2. Create Order (5-minute website timer)
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 5 * 60 * 1000).toISOString();

    const newOrder: OtpOrder = {
      id: orderId,
      userId: currentUser.id,
      serviceId: service.id,
      serviceName: service.name,
      serviceIcon: service.iconName,
      countryCode: country.code,
      countryName: country.name,
      countryFlag: country.flag,
      providerId: provider.id,
      providerName: provider.name,
      providerOrderId: `${provider.code}_${Math.random().toString(36).substring(2, 9)}`,
      phoneNumber,
      sellingPrice: cost,
      providerCost: service.providerCostEstimate,
      grossMargin: cost - service.providerCostEstimate,
      currency: 'INR',
      status: 'WAITING_FOR_SMS',
      orderedAt: now.toISOString(),
      websiteExpiresAt: expiresAt,
    };

    // Update state
    setWallet((prev) => ({
      ...prev,
      availableBalance: afterBal,
      heldBalance: afterHold,
      updatedAt: new Date().toISOString(),
    }));

    setTransactions((prev) => [holdTxn, ...prev]);
    setOrders((prev) => [newOrder, ...prev]);
    setActiveOrder(newOrder);

    // Update provider total assigned count
    setProviders((prev) =>
      prev.map((p) =>
        p.id === provider.id ? { ...p, totalNumbersAssigned: p.totalNumbersAssigned + 1 } : p
      )
    );

    return { success: true, order: newOrder };
  };

  // Cancel Order & Release Hold
  const cancelOrder = async (orderId: string) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return { success: false, message: 'Order not found.' };

    if (order.status !== 'WAITING_FOR_SMS' && order.status !== 'NUMBER_ASSIGNED') {
      return { success: false, message: 'Only active waiting orders can be cancelled.' };
    }

    const cost = order.sellingPrice;
    const beforeBal = wallet.availableBalance;
    const afterBal = beforeBal + cost;
    const beforeHold = wallet.heldBalance;
    const afterHold = Math.max(0, beforeHold - cost);

    const releaseTxn: WalletTransaction = {
      id: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
      walletId: wallet.id,
      userId: currentUser.id,
      type: 'RELEASE_HOLD',
      amount: cost,
      balanceBefore: beforeBal,
      balanceAfter: afterBal,
      holdBefore: beforeHold,
      holdAfter: afterHold,
      referenceType: 'OTP_ORDER_CANCEL',
      referenceId: order.id,
      description: `Order cancelled before SMS received - 100% Refund (₹${cost.toFixed(2)})`,
      status: 'COMPLETED',
      createdAt: new Date().toISOString(),
    };

    setWallet((prev) => ({
      ...prev,
      availableBalance: afterBal,
      heldBalance: afterHold,
      updatedAt: new Date().toISOString(),
    }));

    setTransactions((prev) => [releaseTxn, ...prev]);

    const updatedOrder: OtpOrder = {
      ...order,
      status: 'CANCELLED',
      cancelledAt: new Date().toISOString(),
    };

    setOrders((prev) => prev.map((o) => (o.id === orderId ? updatedOrder : o)));
    if (activeOrder?.id === orderId) {
      setActiveOrder(null);
    }

    return { success: true, message: 'Order cancelled successfully. Funds restored to wallet.' };
  };

  // Simulate Incoming SMS (or triggered on timer/button)
  const simulateSmsReceived = (orderId: string, customCode?: string) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order || order.status === 'COMPLETED' || order.status === 'CANCELLED') return;

    const otpCode = customCode || Math.floor(100000 + Math.random() * 900000).toString();
    const sms = {
      id: `sms_${Math.random().toString(36).substring(2, 8)}`,
      sender: order.serviceName.toUpperCase().slice(0, 6) + '-SEC',
      message: `Your ${order.serviceName} verification code is ${otpCode}. Valid for 10 minutes. Never share this code.`,
      otpCode,
      receivedAt: new Date().toISOString(),
    };

    const cost = order.sellingPrice;
    const beforeHold = wallet.heldBalance;
    const afterHold = Math.max(0, beforeHold - cost);

    // Convert Hold to Final Debit
    const debitTxn: WalletTransaction = {
      id: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
      walletId: wallet.id,
      userId: currentUser.id,
      type: 'DEBIT_OTP_PURCHASE',
      amount: cost,
      balanceBefore: wallet.availableBalance,
      balanceAfter: wallet.availableBalance,
      holdBefore: beforeHold,
      holdAfter: afterHold,
      referenceType: 'OTP_ORDER_COMPLETED',
      referenceId: order.id,
      description: `OTP Received successfully for ${order.serviceName} (${order.phoneNumber})`,
      status: 'COMPLETED',
      createdAt: new Date().toISOString(),
    };

    setWallet((prev) => ({
      ...prev,
      heldBalance: afterHold,
      updatedAt: new Date().toISOString(),
    }));

    setTransactions((prev) => [debitTxn, ...prev]);

    const completedOrder: OtpOrder = {
      ...order,
      status: 'COMPLETED',
      completedAt: new Date().toISOString(),
      smsReceived: sms,
    };

    setOrders((prev) => prev.map((o) => (o.id === orderId ? completedOrder : o)));
    if (activeOrder?.id === orderId) {
      setActiveOrder(completedOrder);
    }

    playChime();
  };

  // Admin Manual Refund
  const adminRefundOrder = (orderId: string, reason: string) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;

    const cost = order.sellingPrice;
    const beforeBal = wallet.availableBalance;
    const afterBal = beforeBal + cost;

    const refundTxn: WalletTransaction = {
      id: `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
      walletId: wallet.id,
      userId: order.userId,
      type: 'REFUND',
      amount: cost,
      balanceBefore: beforeBal,
      balanceAfter: afterBal,
      holdBefore: wallet.heldBalance,
      holdAfter: wallet.heldBalance,
      referenceType: 'ADMIN_ORDER_REFUND',
      referenceId: order.id,
      description: `Refund for Order ${order.id}: ${reason}`,
      status: 'COMPLETED',
      createdAt: new Date().toISOString(),
    };

    setWallet((prev) => ({
      ...prev,
      availableBalance: afterBal,
      updatedAt: new Date().toISOString(),
    }));
    setTransactions((prev) => [refundTxn, ...prev]);

    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: 'REFUNDED' } : o))
    );
    if (activeOrder?.id === orderId) {
      setActiveOrder((prev) => (prev ? { ...prev, status: 'REFUNDED' } : null));
    }
  };

  // Service Management
  const updateService = (serviceId: string, updates: Partial<ServiceItem>) => {
    setServices((prev) =>
      prev.map((s) => (s.id === serviceId ? { ...s, ...updates } : s))
    );
  };

  const toggleServiceStatus = (serviceId: string) => {
    setServices((prev) =>
      prev.map((s) => (s.id === serviceId ? { ...s, enabled: !s.enabled } : s))
    );
  };

  // Provider Management
  const updateProvider = (providerId: string, updates: Partial<SmsProvider>) => {
    setProviders((prev) =>
      prev.map((p) => (p.id === providerId ? { ...p, ...updates } : p))
    );
  };

  const syncProviderBalance = (providerId: string) => {
    setProviders((prev) =>
      prev.map((p) => {
        if (p.id === providerId) {
          // fluctuate slightly to simulate real balance sync
          const delta = (Math.random() - 0.5) * 50;
          return {
            ...p,
            balance: Math.max(100, Math.round((p.balance + delta) * 100) / 100),
            lastCheckedAt: 'Just now',
          };
        }
        return p;
      })
    );
  };

  // Support Tickets
  const createTicket = (subject: string, category: TicketCategory, message: string) => {
    const newTicket: SupportTicket = {
      id: `TCK-${Math.floor(1000 + Math.random() * 9000)}`,
      userId: currentUser.id,
      subject,
      category,
      message,
      status: 'open',
      priority: 'medium',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      replies: [],
    };
    setTickets((prev) => [newTicket, ...prev]);
  };

  const replyTicket = (ticketId: string, message: string) => {
    const reply = {
      id: `rep_${Math.random().toString(36).substring(2, 7)}`,
      sender: (currentUser.role === 'admin' ? 'admin' : 'user') as 'admin' | 'user',
      senderName: currentUser.name,
      message,
      createdAt: new Date().toISOString(),
    };

    setTickets((prev) =>
      prev.map((t) =>
        t.id === ticketId
          ? {
              ...t,
              status: currentUser.role === 'admin' ? 'in_progress' : t.status,
              updatedAt: new Date().toISOString(),
              replies: [...t.replies, reply],
            }
          : t
      )
    );
  };

  return (
    <PlatformContext.Provider
      value={{
        currentUser,
        isLoggedIn,
        isAdminAuthenticated: isLoggedIn && (currentUser.role === 'admin' || currentUser.role === 'superadmin'),
        switchRole,
        loginAsDummyCustomer,
        loginWithAdminKey,
        logout,
        isAuthModalOpen,
        authModalTab,
        openAuthModal,
        closeAuthModal,
        allUsers,
        toggleUserStatus,
        wallet,
        transactions,
        rechargeWallet,
        adminAdjustWallet,
        services,
        countries,
        providers,
        updateService,
        toggleServiceStatus,
        updateProvider,
        syncProviderBalance,
        orders,
        activeOrder,
        setActiveOrder,
        buyNumber,
        cancelOrder,
        simulateSmsReceived,
        adminRefundOrder,
        tickets,
        createTicket,
        replyTicket,
        playNotificationSound: playChime,
        isLoaded,
      }}
    >
      {children}
    </PlatformContext.Provider>
  );
};

export const usePlatform = () => {
  const context = useContext(PlatformContext);
  if (!context) {
    throw new Error('usePlatform must be used within a PlatformProvider');
  }
  return context;
};
