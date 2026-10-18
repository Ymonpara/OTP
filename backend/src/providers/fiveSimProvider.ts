import { config } from '../config/index.js';

export interface FiveSimProfile {
  id: number;
  email: string;
  balance: number;
  rating: number;
  frozenBalance: number;
}

export interface FiveSimOrderResult {
  success: boolean;
  orderId?: string;
  phoneNumber?: string;
  operator?: string;
  price?: number;
  error?: string;
  raw?: unknown;
}

export interface FiveSimSmsMessage {
  id: number;
  sender: string;
  text: string;
  code: string;
  createdAt: string;
}

export interface FiveSimCheckResult {
  status: 'PENDING' | 'RECEIVED' | 'CANCELED' | 'TIMEOUT' | 'FINISHED' | 'BANNED' | 'UNKNOWN';
  sms: FiveSimSmsMessage[];
  error?: string;
}

export class FiveSimProvider {
  private baseUrl = 'https://5sim.net/v1';

  private get headers(): Record<string, string> {
    return {
      Authorization: `Bearer ${config.fiveSimApiKey}`,
      Accept: 'application/json',
    };
  }

  /**
   * Fetch live balance and profile info from 5SIM
   */
  public async getProfile(): Promise<FiveSimProfile | null> {
    if (!config.fiveSimApiKey) return null;

    try {
      const res = await fetch(`${this.baseUrl}/user/profile`, {
        headers: this.headers,
      });

      if (!res.ok) {
        console.warn(`[5SIM] getProfile failed with HTTP ${res.status}`);
        return null;
      }

      const data = (await res.json()) as Record<string, any>;
      return {
        id: Number(data.id),
        email: String(data.email || ''),
        balance: typeof data.balance === 'number' ? data.balance : parseFloat(data.balance || '0'),
        rating: Number(data.rating || 0),
        frozenBalance: Number(data.frozen_balance || 0),
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('[5SIM] Profile fetch error:', msg);
      return null;
    }
  }

  /**
   * Buy / Reserve virtual number from 5SIM
   * @param country - e.g. "india", "usa", "russia"
   * @param operator - e.g. "any", "virtual34"
   * @param product - e.g. "telegram", "whatsapp", "google"
   */
  public async buyNumber(
    country: string = 'india',
    operator: string = 'any',
    product: string = 'telegram'
  ): Promise<FiveSimOrderResult> {
    if (!config.fiveSimApiKey) {
      return { success: false, error: '5SIM API key not configured' };
    }

    try {
      const url = `${this.baseUrl}/user/buy/activation/${country.toLowerCase()}/${operator.toLowerCase()}/${product.toLowerCase()}`;
      const res = await fetch(url, {
        headers: this.headers,
      });

      const bodyText = await res.text();
      let data: Record<string, unknown> = {};
      try {
        data = JSON.parse(bodyText);
      } catch {
        // 5sim sometimes returns raw text error like "no free phones" or "no money"
        return {
          success: false,
          error: bodyText || `5SIM HTTP ${res.status}`,
        };
      }

      if (!res.ok || !data.phone) {
        return {
          success: false,
          error: (data.msg as string) || (data.error as string) || bodyText,
          raw: data,
        };
      }

      return {
        success: true,
        orderId: String(data.id),
        phoneNumber: String(data.phone),
        operator: String(data.operator || operator),
        price: Number(data.price || 0),
        raw: data,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return { success: false, error: msg };
    }
  }

  /**
   * Check order status and check for incoming SMS messages
   */
  public async checkOrder(orderId: string): Promise<FiveSimCheckResult> {
    if (!config.fiveSimApiKey) {
      return { status: 'UNKNOWN', sms: [], error: '5SIM API key not configured' };
    }

    try {
      const res = await fetch(`${this.baseUrl}/user/check/${orderId}`, {
        headers: this.headers,
      });

      if (!res.ok) {
        return {
          status: 'UNKNOWN',
          sms: [],
          error: `5SIM check HTTP ${res.status}`,
        };
      }

      const data = (await res.json()) as Record<string, any>;
      const rawSmsList = Array.isArray(data.sms) ? data.sms : [];

      const sms: FiveSimSmsMessage[] = rawSmsList.map((item: Record<string, unknown>) => ({
        id: Number(item.id || 0),
        sender: String(item.sender || ''),
        text: String(item.text || ''),
        code: String(item.code || ''),
        createdAt: String(item.created_at || new Date().toISOString()),
      }));

      const rawStatus = String(data.status || 'PENDING').toUpperCase();
      let status: FiveSimCheckResult['status'] = 'PENDING';
      if (rawStatus === 'RECEIVED' || rawStatus === 'FINISHED') status = 'RECEIVED';
      else if (rawStatus === 'CANCELED') status = 'CANCELED';
      else if (rawStatus === 'TIMEOUT') status = 'TIMEOUT';
      else if (rawStatus === 'BANNED') status = 'BANNED';

      return {
        status,
        sms,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return { status: 'UNKNOWN', sms: [], error: msg };
    }
  }

  /**
   * Finish activation once OTP is received
   */
  public async finishOrder(orderId: string): Promise<boolean> {
    if (!config.fiveSimApiKey) return false;
    try {
      const res = await fetch(`${this.baseUrl}/user/finish/${orderId}`, {
        headers: this.headers,
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  /**
   * Cancel activation & release provider hold
   */
  public async cancelOrder(orderId: string): Promise<boolean> {
    if (!config.fiveSimApiKey) return false;
    try {
      const res = await fetch(`${this.baseUrl}/user/cancel/${orderId}`, {
        headers: this.headers,
      });
      return res.ok;
    } catch {
      return false;
    }
  }
}

export const fiveSimProvider = new FiveSimProvider();
