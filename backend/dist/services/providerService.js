"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.providerService = exports.ProviderService = void 0;
const uuid_1 = require("uuid");
const memoryStore_js_1 = require("../store/memoryStore.js");
class ProviderService {
    /**
     * Selects the best eligible provider based on Section 11 of the Developer Plan:
     * 1. Provider must be enabled
     * 2. Provider API health must not be offline
     * 3. Provider cost must not exceed maximumProviderCost
     * 4. Respects Priority (Priority 1 first, fallback to 2, 3...)
     */
    selectBestProvider(service) {
        const eligibleProviders = Array.from(memoryStore_js_1.memoryStore.providers.values())
            .filter((p) => p.enabled && p.apiHealth !== 'offline')
            .sort((a, b) => a.priority - b.priority);
        if (eligibleProviders.length === 0) {
            throw new Error('No SMS carrier providers are currently active or operational');
        }
        // Pick top priority provider whose cost satisfies margin requirements
        for (const provider of eligibleProviders) {
            // Estimated provider cost
            const estimatedCost = service.providerCostEstimate;
            if (estimatedCost <= service.maximumProviderCost) {
                return provider;
            }
        }
        throw new Error(`All SMS providers exceed maximum allowed provider cost threshold (Max: ₹${service.maximumProviderCost})`);
    }
    /**
     * Purchase/Reserve a temporary number from the selected provider
     */
    purchaseNumber(service, countryCode) {
        const provider = this.selectBestProvider(service);
        // Generate compliant regional mobile number
        const country = memoryStore_js_1.memoryStore.countries.get(countryCode) || {
            dialCode: '+91',
            code: 'IN',
        };
        const randomDigits = Math.floor(6000000000 + Math.random() * 3999999999);
        const phoneNumber = `${country.dialCode} ${String(randomDigits).slice(0, 5)} ${String(randomDigits).slice(5)}`;
        const providerCost = service.providerCostEstimate;
        const grossMargin = Math.round((service.sellingPrice - providerCost) * 100) / 100;
        // Deduct cost from external provider ledger
        provider.balance = Math.max(0, Math.round((provider.balance - providerCost) * 100) / 100);
        provider.totalNumbersAssigned += 1;
        provider.lastCheckedAt = 'Just now';
        return {
            provider,
            providerOrderId: `${provider.code.toUpperCase()}-ORD-${(0, uuid_1.v4)().slice(0, 8).toUpperCase()}`,
            phoneNumber,
            providerCost,
            grossMargin,
        };
    }
    /**
     * Generates or extracts simulated SMS/OTP code for the virtual number
     */
    generateSimulatedSms(serviceName, customCode) {
        const otp = customCode || String(Math.floor(100000 + Math.random() * 900000));
        return {
            id: `SMS-${(0, uuid_1.v4)().slice(0, 8).toUpperCase()}`,
            sender: serviceName,
            message: `Your ${serviceName} verification security code is ${otp}. Valid for 5 minutes. Do not share with anyone.`,
            otpCode: otp,
            receivedAt: new Date().toISOString(),
        };
    }
    getAllProviders() {
        return Array.from(memoryStore_js_1.memoryStore.providers.values()).sort((a, b) => a.priority - b.priority);
    }
    updateProvider(id, updates) {
        const provider = memoryStore_js_1.memoryStore.providers.get(id);
        if (!provider) {
            throw new Error(`Provider not found: ${id}`);
        }
        const updated = { ...provider, ...updates };
        memoryStore_js_1.memoryStore.providers.set(id, updated);
        return updated;
    }
}
exports.ProviderService = ProviderService;
exports.providerService = new ProviderService();
