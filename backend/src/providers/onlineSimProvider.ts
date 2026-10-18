import { config } from '../config/index.js';

export interface OnlineSimBalanceResult {
  response: string;
  balance: number;
}

export interface OnlineSimOrderResult {
  success: boolean;
  tzid?: number;
  phoneNumber?: string;
  error?: string;
  raw?: unknown;
}

export interface OnlineSimCheckResult {
  status: 'PENDING' | 'RECEIVED' | 'CANCELED' | 'TIMEOUT' | 'UNKNOWN';
  code?: string;
  message?: string;
  error?: string;
  raw?: unknown;
}

export class OnlineSimProvider {
  private baseUrl = 'https://onlinesim.io/api';

  /**
   * Fetch live balance from OnlineSIM
   */
  public async getBalance(): Promise<number | null> {
    if (!config.onlineSimApiKey) return null;

    try {
      const res = await fetch(`${this.baseUrl}/getBalance.php?apikey=${config.onlineSimApiKey}`);
      if (!res.ok) {
        console.warn(`[OnlineSIM] getBalance HTTP ${res.status}`);
        return null;
      }

      const data = (await res.json()) as Record<string, any>;
      if (data && String(data.response) === '1') {
        return parseFloat(data.balance || '0');
      }
      return null;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('[OnlineSIM] Balance fetch error:', msg);
      return null;
    }
  }

  /**
   * Buy / Reserve virtual number from OnlineSIM
   * @param service - e.g. "telegram", "whatsapp", "google"
   * @param countryCode - e.g. "7" (Russia), "91" (India), "1" (USA)
   */
  public async buyNumber(
    service: string = 'telegram',
    countryCode: string = '7'
  ): Promise<OnlineSimOrderResult> {
    if (!config.onlineSimApiKey) {
      return { success: false, error: 'OnlineSIM API key not configured' };
    }

    try {
      const url = `${this.baseUrl}/getNum.php?apikey=${config.onlineSimApiKey}&service=${service}&country=${countryCode}`;
      const res = await fetch(url);
      const data = (await res.json()) as Record<string, any>;

      if (String(data.response) === '1' && data.tzid) {
        // Wait or query getState for assigned number
        const stateRes = await this.checkState(data.tzid);
        return {
          success: true,
          tzid: Number(data.tzid),
          phoneNumber: stateRes.message || String(data.number || ''),
          raw: data,
        };
      }

      return {
        success: false,
        error: String(data.response || 'Failed to order number from OnlineSIM'),
        raw: data,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return { success: false, error: msg };
    }
  }

  /**
   * Check SMS / state for an order
   */
  public async checkState(tzid: number): Promise<OnlineSimCheckResult> {
    if (!config.onlineSimApiKey) {
      return { status: 'UNKNOWN', error: 'OnlineSIM API key not configured' };
    }

    try {
      const res = await fetch(`${this.baseUrl}/getState.php?apikey=${config.onlineSimApiKey}&tzid=${tzid}`);
      const data = (await res.json()) as Record<string, any>;

      if (Array.isArray(data) && data.length > 0) {
        const item = data[0];
        const responseCode = String(item.response);

        if (responseCode === 'TZ_NUM_WAIT') {
          return {
            status: 'PENDING',
            message: item.number,
            raw: item,
          };
        } else if (responseCode === 'TZ_NUM_ANSWER') {
          return {
            status: 'RECEIVED',
            code: String(item.msg || item.code || ''),
            message: String(item.msg || ''),
            raw: item,
          };
        } else if (responseCode === 'TZ_OVER_EMPTY' || responseCode === 'ERROR_NO_NUMBER') {
          return {
            status: 'CANCELED',
            error: responseCode,
            raw: item,
          };
        }
      }

      return { status: 'PENDING', raw: data };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return { status: 'UNKNOWN', error: msg };
    }
  }

  /**
   * Finalize order (Mark OK)
   */
  public async setOperationOk(tzid: number): Promise<boolean> {
    if (!config.onlineSimApiKey) return false;
    try {
      const res = await fetch(`${this.baseUrl}/setOperationOk.php?apikey=${config.onlineSimApiKey}&tzid=${tzid}`);
      const data = (await res.json()) as Record<string, any>;
      return String(data.response) === '1';
    } catch {
      return false;
    }
  }

  /**
   * Cancel / Revise order (Release number)
   */
  public async setOperationRevise(tzid: number): Promise<boolean> {
    if (!config.onlineSimApiKey) return false;
    try {
      const res = await fetch(
        `${this.baseUrl}/setOperationRevise.php?apikey=${config.onlineSimApiKey}&tzid=${tzid}`
      );
      const data = (await res.json()) as Record<string, any>;
      return String(data.response) === '1';
    } catch {
      return false;
    }
  }
}

export const onlineSimProvider = new OnlineSimProvider();
