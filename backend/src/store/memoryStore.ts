import {
  User,
  Wallet,
  WalletTransaction,
  ServiceItem,
  Country,
  SmsProvider,
  OtpOrder,
  SupportTicket,
} from '../types/index.js';

export class MemoryStore {
  public users: Map<string, User> = new Map();
  public wallets: Map<string, Wallet> = new Map();
  public transactions: WalletTransaction[] = [];
  public services: Map<string, ServiceItem> = new Map();
  public countries: Map<string, Country> = new Map();
  public providers: Map<string, SmsProvider> = new Map();
  public orders: Map<string, OtpOrder> = new Map();
  public tickets: Map<string, SupportTicket> = new Map();

  constructor() {
    this.seed();
  }

  private seed() {
    // 1. Seed Demo Customer User
    const demoCustomer: User = {
      id: 'USR-DEMO-001',
      name: 'Demo Customer',
      email: 'customer@otpwallet.com',
      phone: '+91 98765 43210',
      role: 'customer',
      status: 'active',
      emailVerified: true,
      twoFactorEnabled: false,
      createdAt: '2026-03-01T10:00:00Z',
    };
    this.users.set(demoCustomer.id, demoCustomer);

    // 2. Seed Demo Admin User
    const demoAdmin: User = {
      id: 'USR-ADMIN-001',
      name: 'Platform Superadmin',
      email: 'admin@otpwallet.com',
      phone: '+91 99999 00000',
      role: 'admin',
      status: 'active',
      emailVerified: true,
      twoFactorEnabled: true,
      createdAt: '2026-01-01T00:00:00Z',
    };
    this.users.set(demoAdmin.id, demoAdmin);

    // 3. Seed Demo Customer Wallet (₹250 available balance, ₹0 held)
    const customerWallet: Wallet = {
      id: 'WAL-DEMO-001',
      userId: demoCustomer.id,
      availableBalance: 250.0,
      heldBalance: 0.0,
      currency: 'INR',
      updatedAt: new Date().toISOString(),
    };
    this.wallets.set(customerWallet.userId, customerWallet);

    // 4. Seed Admin Wallet
    const adminWallet: Wallet = {
      id: 'WAL-ADMIN-001',
      userId: demoAdmin.id,
      availableBalance: 10000.0,
      heldBalance: 0.0,
      currency: 'INR',
      updatedAt: new Date().toISOString(),
    };
    this.wallets.set(adminWallet.userId, adminWallet);

    // 5. Seed Initial Ledger Transactions for Demo Customer
    this.transactions.push({
      id: 'TXN-INIT-001',
      walletId: customerWallet.id,
      userId: demoCustomer.id,
      type: 'CREDIT_RECHARGE',
      amount: 250.0,
      balanceBefore: 0.0,
      balanceAfter: 250.0,
      holdBefore: 0.0,
      holdAfter: 0.0,
      referenceType: 'PAYMENT_GATEWAY',
      referenceId: 'UPI-DEMO-REF-9988',
      description: 'Initial account signup promotional bonus / UPI recharge',
      status: 'COMPLETED',
      createdAt: '2026-03-01T10:05:00Z',
    });

    // 6. Seed Countries
    const seedCountries: Country[] = [
      { code: 'IN', name: 'India', dialCode: '+91', flag: '🇮🇳' },
      { code: 'US', name: 'United States', dialCode: '+1', flag: '🇺🇸' },
      { code: 'GB', name: 'United Kingdom', dialCode: '+44', flag: '🇬🇧' },
      { code: 'ID', name: 'Indonesia', dialCode: '+62', flag: '🇮🇩' },
      { code: 'BR', name: 'Brazil', dialCode: '+55', flag: '🇧🇷' },
      { code: 'PH', name: 'Philippines', dialCode: '+63', flag: '🇵🇭' },
      { code: 'VN', name: 'Vietnam', dialCode: '+84', flag: '🇻🇳' },
      { code: 'NG', name: 'Nigeria', dialCode: '+234', flag: '🇳🇬' },
    ];
    seedCountries.forEach((c) => this.countries.set(c.code, c));

    // 7. Seed Services (India & Global)
    const seedServices: ServiceItem[] = [
      {
        id: 'srv-whatsapp',
        name: 'WhatsApp',
        slug: 'whatsapp',
        serviceCode: 'wa',
        category: 'messaging',
        countryCode: 'IN',
        sellingPrice: 18.0,
        minimumMargin: 4.0,
        maximumProviderCost: 14.0,
        providerCostEstimate: 7.5,
        enabled: true,
        successRate: 98.4,
        avgSpeedSeconds: 12,
        iconName: 'MessageSquare',
      },
      {
        id: 'srv-telegram',
        name: 'Telegram',
        slug: 'telegram',
        serviceCode: 'tg',
        category: 'messaging',
        countryCode: 'IN',
        sellingPrice: 12.0,
        minimumMargin: 3.5,
        maximumProviderCost: 8.5,
        providerCostEstimate: 4.2,
        enabled: true,
        successRate: 99.1,
        avgSpeedSeconds: 8,
        iconName: 'Send',
      },
      {
        id: 'srv-openai',
        name: 'OpenAI / ChatGPT',
        slug: 'openai',
        serviceCode: 'oa',
        category: 'ai',
        countryCode: 'IN',
        sellingPrice: 15.0,
        minimumMargin: 4.0,
        maximumProviderCost: 11.0,
        providerCostEstimate: 5.8,
        enabled: true,
        successRate: 97.2,
        avgSpeedSeconds: 14,
        iconName: 'Bot',
      },
      {
        id: 'srv-google',
        name: 'Google / YouTube',
        slug: 'google',
        serviceCode: 'go',
        category: 'popular',
        countryCode: 'IN',
        sellingPrice: 14.0,
        minimumMargin: 3.5,
        maximumProviderCost: 10.5,
        providerCostEstimate: 5.1,
        enabled: true,
        successRate: 96.5,
        avgSpeedSeconds: 16,
        iconName: 'Globe',
      },
      {
        id: 'srv-instagram',
        name: 'Instagram / Threads',
        slug: 'instagram',
        serviceCode: 'ig',
        category: 'social',
        countryCode: 'IN',
        sellingPrice: 10.0,
        minimumMargin: 3.0,
        maximumProviderCost: 7.0,
        providerCostEstimate: 3.6,
        enabled: true,
        successRate: 98.8,
        avgSpeedSeconds: 9,
        iconName: 'Instagram',
      },
      {
        id: 'srv-facebook',
        name: 'Facebook / Meta',
        slug: 'facebook',
        serviceCode: 'fb',
        category: 'social',
        countryCode: 'IN',
        sellingPrice: 10.0,
        minimumMargin: 3.0,
        maximumProviderCost: 7.0,
        providerCostEstimate: 3.4,
        enabled: true,
        successRate: 97.9,
        avgSpeedSeconds: 11,
        iconName: 'Facebook',
      },
      {
        id: 'srv-discord',
        name: 'Discord',
        slug: 'discord',
        serviceCode: 'ds',
        category: 'messaging',
        countryCode: 'IN',
        sellingPrice: 11.0,
        minimumMargin: 3.0,
        maximumProviderCost: 8.0,
        providerCostEstimate: 4.1,
        enabled: true,
        successRate: 98.0,
        avgSpeedSeconds: 10,
        iconName: 'MessageCircle',
      },
      {
        id: 'srv-amazon',
        name: 'Amazon Shopping',
        slug: 'amazon',
        serviceCode: 'am',
        category: 'shopping',
        countryCode: 'IN',
        sellingPrice: 12.0,
        minimumMargin: 3.5,
        maximumProviderCost: 8.5,
        providerCostEstimate: 4.8,
        enabled: true,
        successRate: 95.8,
        avgSpeedSeconds: 15,
        iconName: 'ShoppingBag',
      },
    ];
    seedServices.forEach((s) => this.services.set(s.id, s));

    // 8. Seed SMS Providers
    const seedProviders: SmsProvider[] = [
      {
        id: 'prv-5sim',
        name: '5SIM',
        code: 'five_sim',
        enabled: true,
        priority: 1,
        balance: 4850.5,
        currency: 'RUB',
        minBalanceAlert: 500.0,
        apiHealth: 'operational',
        pingMs: 42,
        successRate: 98.4,
        lastCheckedAt: 'Just now',
        totalNumbersAssigned: 1420,
      },
      {
        id: 'prv-onlinesim',
        name: 'OnlineSIM',
        code: 'online_sim',
        enabled: true,
        priority: 2,
        balance: 2310.0,
        currency: 'RUB',
        minBalanceAlert: 400.0,
        apiHealth: 'operational',
        pingMs: 65,
        successRate: 96.8,
        lastCheckedAt: '1 min ago',
        totalNumbersAssigned: 890,
      },
      {
        id: 'prv-smsman',
        name: 'SMS-Man',
        code: 'sms_man',
        enabled: true,
        priority: 3,
        balance: 1150.2,
        currency: 'RUB',
        minBalanceAlert: 350.0,
        apiHealth: 'operational',
        pingMs: 94,
        successRate: 94.2,
        lastCheckedAt: '3 mins ago',
        totalNumbersAssigned: 410,
      },
    ];
    seedProviders.forEach((p) => this.providers.set(p.id, p));

    // 9. Seed Completed Past Demo Orders
    const sampleCompletedOrder: OtpOrder = {
      id: 'ORD-781923',
      userId: demoCustomer.id,
      serviceId: 'srv-telegram',
      serviceName: 'Telegram',
      serviceIcon: 'Send',
      countryCode: 'IN',
      countryName: 'India',
      countryFlag: '🇮🇳',
      providerId: 'prv-5sim',
      providerName: '5SIM',
      providerOrderId: '5SIM-ORD-991823',
      phoneNumber: '+91 98452 11984',
      sellingPrice: 12.0,
      providerCost: 4.2,
      grossMargin: 7.8,
      currency: 'INR',
      status: 'COMPLETED',
      orderedAt: '2026-03-05T14:22:10Z',
      websiteExpiresAt: '2026-03-05T14:27:10Z',
      completedAt: '2026-03-05T14:23:42Z',
      smsReceived: {
        id: 'SMS-881273',
        sender: 'Telegram',
        message: 'Your Telegram verification code is 842910. Do not share this code.',
        otpCode: '842910',
        receivedAt: '2026-03-05T14:23:42Z',
      },
    };
    this.orders.set(sampleCompletedOrder.id, sampleCompletedOrder);

    // 10. Seed Demo Support Ticket
    const demoTicket: SupportTicket = {
      id: 'TCK-5541',
      userId: demoCustomer.id,
      subject: 'Inquiry regarding Developer REST API Webhooks',
      category: 'API Integration',
      message: 'Hello, I want to integrate your automated OTP reception into my testing pipeline. How do webhooks push received OTPs?',
      status: 'resolved',
      priority: 'medium',
      createdAt: '2026-03-04T09:15:00Z',
      updatedAt: '2026-03-04T10:30:00Z',
      replies: [
        {
          id: 'REP-101',
          sender: 'admin',
          senderName: 'Support Team',
          message: 'Hi! You can configure your Webhook URL under Dashboard > Settings. When an SMS arrives, our system sends a POST payload with orderId, phoneNumber, and otpCode immediately.',
          createdAt: '2026-03-04T10:30:00Z',
        },
      ],
    };
    this.tickets.set(demoTicket.id, demoTicket);
  }
}

export const memoryStore = new MemoryStore();
