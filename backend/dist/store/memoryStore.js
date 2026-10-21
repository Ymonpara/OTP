"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.memoryStore = exports.MemoryStore = void 0;
class MemoryStore {
    users = new Map();
    wallets = new Map();
    transactions = [];
    services = new Map();
    countries = new Map();
    providers = new Map();
    orders = new Map();
    tickets = new Map();
    constructor() {
        this.seed();
    }
    seed() {
        // 1. Seed Admin User
        const adminUser = {
            id: 'USR-ADMIN-001',
            name: 'Platform Administrator',
            email: 'admin@otpwallet.com',
            phone: '+91 99999 00000',
            role: 'admin',
            status: 'active',
            emailVerified: true,
            twoFactorEnabled: true,
            createdAt: new Date().toISOString(),
        };
        this.users.set(adminUser.id, adminUser);
        // 2. Seed Admin Wallet with zero starting balance
        const adminWallet = {
            id: 'WAL-ADMIN-001',
            userId: adminUser.id,
            availableBalance: 0.0,
            heldBalance: 0.0,
            currency: 'INR',
            updatedAt: new Date().toISOString(),
        };
        this.wallets.set(adminWallet.userId, adminWallet);
        // 3. Transactions initialized as clean empty array
        this.transactions = [];
        // 6. Seed Countries
        const seedCountries = [
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
        const seedServices = [
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
        // 8. SMS Providers (Initial carrier balances start at 0.0 until live API poll or deposit)
        const seedProviders = [
            {
                id: 'prv-5sim',
                name: '5SIM',
                code: 'five_sim',
                enabled: true,
                priority: 1,
                balance: 0.0,
                currency: 'RUB',
                minBalanceAlert: 500.0,
                apiHealth: 'operational',
                pingMs: 42,
                successRate: 100.0,
                lastCheckedAt: 'Just now',
                totalNumbersAssigned: 0,
            },
            {
                id: 'prv-onlinesim',
                name: 'OnlineSIM',
                code: 'online_sim',
                enabled: true,
                priority: 2,
                balance: 0.0,
                currency: 'RUB',
                minBalanceAlert: 400.0,
                apiHealth: 'operational',
                pingMs: 65,
                successRate: 100.0,
                lastCheckedAt: 'Just now',
                totalNumbersAssigned: 0,
            },
            {
                id: 'prv-smsman',
                name: 'SMS-Man',
                code: 'sms_man',
                enabled: false,
                priority: 3,
                balance: 0.0,
                currency: 'RUB',
                minBalanceAlert: 350.0,
                apiHealth: 'operational',
                pingMs: 94,
                successRate: 100.0,
                lastCheckedAt: 'Just now',
                totalNumbersAssigned: 0,
            },
        ];
        seedProviders.forEach((p) => this.providers.set(p.id, p));
        // 9. Clean empty maps for Orders and Support Tickets
        this.orders.clear();
        this.tickets.clear();
    }
}
exports.MemoryStore = MemoryStore;
exports.memoryStore = new MemoryStore();
