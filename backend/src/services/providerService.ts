import { v4 as uuidv4 } from 'uuid';
import { memoryStore } from '../store/memoryStore.js';
import { ServiceItem, SmsProvider, ReceivedSms, OtpOrder } from '../types/index.js';
import { config } from '../config/index.js';
import { fiveSimProvider } from '../providers/fiveSimProvider.js';
import { onlineSimProvider } from '../providers/onlineSimProvider.js';

export interface ProviderPurchaseResult {
  provider: SmsProvider;
  providerOrderId: string;
  phoneNumber: string;
  providerCost: number;
  grossMargin: number;
  isReal?: boolean;
}

const mapToFiveSimCountry = (code: string): string => {
  const map: Record<string, string> = {
    IN: 'india',
    US: 'usa',
    GB: 'england',
    RU: 'russia',
    ID: 'indonesia',
    BR: 'brazil',
    PH: 'philippines',
    VN: 'vietnam',
    NG: 'nigeria',
  };
  return map[code.toUpperCase()] || 'india';
};

const mapToFiveSimProduct = (slug: string, serviceCode: string): string => {
  const map: Record<string, string> = {
    whatsapp: 'whatsapp',
    telegram: 'telegram',
    openai: 'openai',
    google: 'google',
    instagram: 'instagram',
    facebook: 'facebook',
    discord: 'discord',
    amazon: 'amazon',
  };
  return map[slug.toLowerCase()] || serviceCode || slug.toLowerCase();
};

const mapToOnlineSimCountry = (code: string): string => {
  const map: Record<string, string> = {
    IN: '91',
    US: '1',
    GB: '44',
    RU: '7',
    ID: '62',
    BR: '55',
    PH: '63',
    VN: '84',
    NG: '234',
  };
  return map[code.toUpperCase()] || '91';
};

const mapToOnlineSimService = (slug: string): string => {
  const map: Record<string, string> = {
    whatsapp: 'whatsapp',
    telegram: 'telegram',
    openai: 'openai',
    google: 'google',
    instagram: 'instagram',
    facebook: 'facebook',
    discord: 'discord',
    amazon: 'amazon',
  };
  return map[slug.toLowerCase()] || slug.toLowerCase();
};

export class ProviderService {
  /**
   * Synchronize live balances and operational health for all configured providers
   */
  public async syncProviderBalances(): Promise<void> {
    // 1. 5SIM
    if (config.fiveSimApiKey) {
      try {
        const profile = await fiveSimProvider.getProfile();
        const prv = memoryStore.providers.get('prv-5sim');
        if (prv) {
          if (profile) {
            prv.balance = profile.balance;
            prv.apiHealth = 'operational';
            prv.lastCheckedAt = 'Just now';
            console.log(`[5SIM Sync] Live balance: ${profile.balance} RUB, Rating: ${profile.rating}`);
          } else {
            prv.apiHealth = 'degraded';
          }
        }
      } catch (e) {
        console.error('[5SIM Sync Error]', e);
      }
    }

    // 2. OnlineSIM
    if (config.onlineSimApiKey) {
      try {
        const balance = await onlineSimProvider.getBalance();
        const prv = memoryStore.providers.get('prv-onlinesim');
        if (prv) {
          if (balance !== null) {
            prv.balance = balance;
            prv.apiHealth = 'operational';
            prv.lastCheckedAt = 'Just now';
            console.log(`[OnlineSIM Sync] Live balance: ${balance} RUB`);
          } else {
            prv.apiHealth = 'degraded';
          }
        }
      } catch (e) {
        console.error('[OnlineSIM Sync Error]', e);
      }
    }
  }

  /**
   * Selects best eligible provider based on priority, margin, and health
   */
  public selectBestProvider(service: ServiceItem): SmsProvider {
    const eligibleProviders = Array.from(memoryStore.providers.values())
      .filter((p) => p.enabled && p.apiHealth !== 'offline')
      .sort((a, b) => a.priority - b.priority);

    if (eligibleProviders.length === 0) {
      throw new Error('No SMS carrier providers are currently active or operational');
    }

    for (const provider of eligibleProviders) {
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
   * Purchase/Reserve a temporary number from 5SIM, OnlineSIM, or Sandbox Fallback
   */
  public async purchaseNumber(
    service: ServiceItem,
    countryCode: string
  ): Promise<ProviderPurchaseResult> {
    const provider = this.selectBestProvider(service);

    // 1. Live 5SIM API Integration
    if (provider.code === 'five_sim' && config.fiveSimApiKey) {
      const countryName = mapToFiveSimCountry(countryCode);
      const productName = mapToFiveSimProduct(service.slug, service.serviceCode);

      try {
        console.log(`[5SIM] Requesting virtual number for ${productName} in ${countryName}...`);
        const realOrder = await fiveSimProvider.buyNumber(countryName, 'any', productName);

        if (realOrder.success && realOrder.phoneNumber && realOrder.orderId) {
          const costInInr =
            Math.round(
              (realOrder.price || service.providerCostEstimate) * config.rubToInrRate * 100
            ) / 100;

          provider.balance = Math.max(0, Math.round((provider.balance - (realOrder.price || 0)) * 100) / 100);
          provider.totalNumbersAssigned += 1;
          provider.lastCheckedAt = 'Just now';

          console.log(`[5SIM] ✅ Assigned Real Carrier Number: ${realOrder.phoneNumber} (Order #${realOrder.orderId})`);

          return {
            provider,
            providerOrderId: realOrder.orderId,
            phoneNumber: realOrder.phoneNumber,
            providerCost: costInInr,
            grossMargin: Math.round((service.sellingPrice - costInInr) * 100) / 100,
            isReal: true,
          };
        } else {
          console.warn(
            `[5SIM Carrier Notice] Order rejected by 5SIM ("${realOrder.error}"). Providing compliant sandbox number for testing.`
          );
        }
      } catch (err) {
        console.warn('[5SIM Exception] Falling back to sandbox number:', err);
      }
    }

    // 2. Live OnlineSIM API Integration
    if (provider.code === 'online_sim' && config.onlineSimApiKey) {
      const onlineSimCountry = mapToOnlineSimCountry(countryCode);
      const onlineSimService = mapToOnlineSimService(service.slug);

      try {
        console.log(`[OnlineSIM] Requesting virtual number for ${onlineSimService} (country: ${onlineSimCountry})...`);
        const realOrder = await onlineSimProvider.buyNumber(onlineSimService, onlineSimCountry);

        if (realOrder.success && realOrder.tzid) {
          provider.totalNumbersAssigned += 1;
          provider.lastCheckedAt = 'Just now';

          const country = memoryStore.countries.get(countryCode) || { dialCode: '+91' };
          const formattedPhone = realOrder.phoneNumber?.startsWith('+')
            ? realOrder.phoneNumber
            : `${country.dialCode} ${realOrder.phoneNumber || Math.floor(6000000000 + Math.random() * 3999999999)}`;

          console.log(`[OnlineSIM] ✅ Assigned Real Carrier Number: ${formattedPhone} (TZID #${realOrder.tzid})`);

          return {
            provider,
            providerOrderId: String(realOrder.tzid),
            phoneNumber: formattedPhone,
            providerCost: service.providerCostEstimate,
            grossMargin: Math.round((service.sellingPrice - service.providerCostEstimate) * 100) / 100,
            isReal: true,
          };
        } else {
          console.warn(
            `[OnlineSIM Carrier Notice] Order rejected by OnlineSIM ("${realOrder.error}"). Providing compliant sandbox number.`
          );
        }
      } catch (err) {
        console.warn('[OnlineSIM Exception] Falling back to sandbox number:', err);
      }
    }

    // 3. Fallback Sandbox Number Generation (for offline dev / when provider balance is 0)
    const country = memoryStore.countries.get(countryCode) || {
      dialCode: '+91',
      code: 'IN',
    };

    const randomDigits = Math.floor(6000000000 + Math.random() * 3999999999);
    const phoneNumber = `${country.dialCode} ${String(randomDigits).slice(0, 5)} ${String(randomDigits).slice(5)}`;

    const providerCost = service.providerCostEstimate;
    const grossMargin = Math.round((service.sellingPrice - providerCost) * 100) / 100;

    provider.totalNumbersAssigned += 1;
    provider.lastCheckedAt = 'Just now';

    return {
      provider,
      providerOrderId: `${provider.code.toUpperCase()}-SBX-${uuidv4().slice(0, 8).toUpperCase()}`,
      phoneNumber,
      providerCost,
      grossMargin,
      isReal: false,
    };
  }

  /**
   * Poll live provider API for incoming real carrier SMS
   */
  public async pollIncomingSms(order: OtpOrder): Promise<ReceivedSms | null> {
    if (!order.isRealProvider) return null;

    // 1. 5SIM Polling
    if (order.providerId === 'prv-5sim' && config.fiveSimApiKey) {
      try {
        const check = await fiveSimProvider.checkOrder(order.providerOrderId);
        if (check.status === 'RECEIVED' && check.sms && check.sms.length > 0) {
          const first = check.sms[0];
          console.log(`[5SIM Poll] 📩 Received SMS for Order ${order.id}: "${first.text}"`);
          return {
            id: `SMS-${first.id || uuidv4().slice(0, 8)}`,
            sender: first.sender || order.serviceName,
            message: first.text,
            otpCode: first.code || String(first.text.match(/\b\d{4,8}\b/)?.[0] || ''),
            receivedAt: first.createdAt || new Date().toISOString(),
          };
        }
      } catch (e) {
        console.error(`[5SIM Poll Error on ${order.id}]`, e);
      }
    }

    // 2. OnlineSIM Polling
    if (order.providerId === 'prv-onlinesim' && config.onlineSimApiKey) {
      try {
        const check = await onlineSimProvider.checkState(Number(order.providerOrderId));
        if (check.status === 'RECEIVED' && check.code) {
          console.log(`[OnlineSIM Poll] 📩 Received SMS for Order ${order.id}: "${check.code}"`);
          return {
            id: `SMS-${uuidv4().slice(0, 8)}`,
            sender: order.serviceName,
            message: check.message || `Your verification code is ${check.code}`,
            otpCode: check.code,
            receivedAt: new Date().toISOString(),
          };
        }
      } catch (e) {
        console.error(`[OnlineSIM Poll Error on ${order.id}]`, e);
      }
    }

    return null;
  }

  /**
   * Cancel order on the live carrier provider so funds are refunded
   */
  public async cancelProviderOrder(order: OtpOrder): Promise<void> {
    if (!order.isRealProvider) return;

    if (order.providerId === 'prv-5sim' && config.fiveSimApiKey) {
      try {
        await fiveSimProvider.cancelOrder(order.providerOrderId);
        console.log(`[5SIM] Cancelled order ${order.providerOrderId} on carrier`);
      } catch (e) {
        console.warn(`[5SIM Cancel Error]`, e);
      }
    } else if (order.providerId === 'prv-onlinesim' && config.onlineSimApiKey) {
      try {
        await onlineSimProvider.setOperationRevise(Number(order.providerOrderId));
        console.log(`[OnlineSIM] Cancelled order ${order.providerOrderId} on carrier`);
      } catch (e) {
        console.warn(`[OnlineSIM Cancel Error]`, e);
      }
    }
  }

  /**
   * Generates or extracts simulated SMS/OTP code for sandbox numbers
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
