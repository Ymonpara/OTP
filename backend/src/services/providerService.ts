import { v4 as uuidv4 } from 'uuid';
import { memoryStore } from '../store/memoryStore.js';
import { ServiceItem, SmsProvider, ReceivedSms } from '../types/index.js';

export interface ProviderPurchaseResult {
  provider: SmsProvider;
  providerOrderId: string;
  phoneNumber: string;
  providerCost: number;
  grossMargin: number;
}

export class ProviderService {
  /**
   * Selects the best eligible provider based on Section 11 of the Developer Plan:
   * 1. Provider must be enabled
   * 2. Provider API health must not be offline
   * 3. Provider cost must not exceed maximumProviderCost
   * 4. Respects Priority (Priority 1 first, fallback to 2, 3...)
   */
  public selectBestProvider(service: ServiceItem): SmsProvider {
    const eligibleProviders = Array.from(memoryStore.providers.values())
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

    throw new Error(
      `All SMS providers exceed maximum allowed provider cost threshold (Max: ₹${service.maximumProviderCost})`
    );
  }

  /**
   * Purchase/Reserve a temporary number from the selected provider
   */
  public purchaseNumber(service: ServiceItem, countryCode: string): ProviderPurchaseResult {
    const provider = this.selectBestProvider(service);

    // Generate compliant regional mobile number
    const country = memoryStore.countries.get(countryCode) || {
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
      providerOrderId: `${provider.code.toUpperCase()}-ORD-${uuidv4().slice(0, 8).toUpperCase()}`,
      phoneNumber,
      providerCost,
      grossMargin,
    };
  }

  /**
   * Generates or extracts simulated SMS/OTP code for the virtual number
   */
  public generateSimulatedSms(serviceName: string, customCode?: string): ReceivedSms {
    const otp = customCode || String(Math.floor(100000 + Math.random() * 900000));
    return {
      id: `SMS-${uuidv4().slice(0, 8).toUpperCase()}`,
      sender: serviceName,
      message: `Your ${serviceName} verification security code is ${otp}. Valid for 5 minutes. Do not share with anyone.`,
      otpCode: otp,
      receivedAt: new Date().toISOString(),
    };
  }

  public getAllProviders(): SmsProvider[] {
    return Array.from(memoryStore.providers.values()).sort((a, b) => a.priority - b.priority);
  }

  public updateProvider(id: string, updates: Partial<SmsProvider>): SmsProvider {
    const provider = memoryStore.providers.get(id);
    if (!provider) {
      throw new Error(`Provider not found: ${id}`);
    }
    const updated = { ...provider, ...updates };
    memoryStore.providers.set(id, updated);
    return updated;
  }
}

export const providerService = new ProviderService();
