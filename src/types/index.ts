export type UserRole = 'customer' | 'admin' | 'superadmin';
export type UserStatus = 'active' | 'blocked';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  createdAt: string;
}

export interface Wallet {
  id: string;
  userId: string;
  availableBalance: number;
  heldBalance: number;
  currency: string;
  updatedAt: string;
}

export type WalletTxnType =
  | 'CREDIT_RECHARGE'
  | 'DEBIT_OTP_PURCHASE'
  | 'HOLD_OTP_PURCHASE'
  | 'RELEASE_HOLD'
  | 'REFUND'
  | 'ADMIN_CREDIT'
  | 'ADMIN_DEBIT'
  | 'BONUS'
  | 'ADJUSTMENT';

export interface WalletTransaction {
  id: string;
  walletId: string;
  userId: string;
  type: WalletTxnType;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  holdBefore: number;
  holdAfter: number;
  referenceType: string;
  referenceId: string;
  description: string;
  status: 'COMPLETED' | 'PENDING' | 'FAILED';
  createdAt: string;
}

export interface Country {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
}

export interface ServiceItem {
  id: string;
  name: string;
  slug: string;
  serviceCode: string;
  category: 'popular' | 'social' | 'messaging' | 'ai' | 'finance' | 'shopping' | 'gaming';
  countryCode: string;
  sellingPrice: number;
  minimumMargin: number;
  maximumProviderCost: number;
  providerCostEstimate: number;
  enabled: boolean;
  successRate: number;
  avgSpeedSeconds: number;
  iconName: string;
}

export type ProviderCode = 'five_sim' | 'online_sim' | 'sms_man';

export interface SmsProvider {
  id: string;
  name: string;
  code: ProviderCode;
  enabled: boolean;
  priority: number;
  balance: number;
  currency: string;
  minBalanceAlert: number;
  apiHealth: 'operational' | 'degraded' | 'offline';
  pingMs: number;
  successRate: number;
  lastCheckedAt: string;
  totalNumbersAssigned: number;
}

export type OrderStatus =
  | 'PENDING'
  | 'WALLET_HOLD'
  | 'PROVIDER_REQUESTED'
  | 'NUMBER_ASSIGNED'
  | 'WAITING_FOR_SMS'
  | 'SMS_RECEIVED'
  | 'COMPLETED'
  | 'CANCEL_REQUESTED'
  | 'CANCELLED'
  | 'EXPIRED'
  | 'FAILED'
  | 'REFUNDED';

export interface ReceivedSms {
  id: string;
  sender: string;
  message: string;
  otpCode: string;
  receivedAt: string;
}

export interface OtpOrder {
  id: string;
  userId: string;
  serviceId: string;
  serviceName: string;
  serviceIcon: string;
  countryCode: string;
  countryName: string;
  countryFlag: string;
  providerId: string;
  providerName: string;
  providerOrderId: string;
  phoneNumber: string;
  sellingPrice: number;
  providerCost: number;
  grossMargin: number;
  currency: string;
  status: OrderStatus;
  orderedAt: string;
  websiteExpiresAt: string;
  completedAt?: string;
  cancelledAt?: string;
  smsReceived?: ReceivedSms;
}

export interface SupportTicketReply {
  id: string;
  sender: 'user' | 'admin';
  senderName: string;
  message: string;
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  userId: string;
  subject: string;
  category: 'Wallet & Recharge' | 'OTP Delivery' | 'Order Refund' | 'API Integration' | 'Other';
  message: string;
  status: 'open' | 'in_progress' | 'resolved';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
  replies: SupportTicketReply[];
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  todayRecharge: number;
  todayOrders: number;
  successfulOrders: number;
  failedOrders: number;
  totalRefunds: number;
  totalRevenue: number;
  totalProviderCost: number;
  grossProfit: number;
}
