"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onlineSimProvider = exports.OnlineSimProvider = void 0;
const index_js_1 = require("../config/index.js");
class OnlineSimProvider {
    baseUrl = 'https://onlinesim.io/api';
    /**
     * Fetch live balance from OnlineSIM
     */
    async getBalance() {
        if (!index_js_1.config.onlineSimApiKey)
            return null;
        try {
            const res = await fetch(`${this.baseUrl}/getBalance.php?apikey=${index_js_1.config.onlineSimApiKey}`);
            if (!res.ok) {
                console.warn(`[OnlineSIM] getBalance HTTP ${res.status}`);
                return null;
            }
            const data = (await res.json());
            if (data && String(data.response) === '1') {
                return parseFloat(data.balance || '0');
            }
            return null;
        }
        catch (err) {
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
    async buyNumber(service = 'telegram', countryCode = '7') {
        if (!index_js_1.config.onlineSimApiKey) {
            return { success: false, error: 'OnlineSIM API key not configured' };
        }
        try {
            const url = `${this.baseUrl}/getNum.php?apikey=${index_js_1.config.onlineSimApiKey}&service=${service}&country=${countryCode}`;
            const res = await fetch(url);
            const data = (await res.json());
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
        }
        catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            return { success: false, error: msg };
        }
    }
    /**
     * Check SMS / state for an order
     */
    async checkState(tzid) {
        if (!index_js_1.config.onlineSimApiKey) {
            return { status: 'UNKNOWN', error: 'OnlineSIM API key not configured' };
        }
        try {
            const res = await fetch(`${this.baseUrl}/getState.php?apikey=${index_js_1.config.onlineSimApiKey}&tzid=${tzid}`);
            const data = (await res.json());
            if (Array.isArray(data) && data.length > 0) {
                const item = data[0];
                const responseCode = String(item.response);
                if (responseCode === 'TZ_NUM_WAIT') {
                    return {
                        status: 'PENDING',
                        message: item.number,
                        raw: item,
                    };
                }
                else if (responseCode === 'TZ_NUM_ANSWER') {
                    return {
                        status: 'RECEIVED',
                        code: String(item.msg || item.code || ''),
                        message: String(item.msg || ''),
                        raw: item,
                    };
                }
                else if (responseCode === 'TZ_OVER_EMPTY' || responseCode === 'ERROR_NO_NUMBER') {
                    return {
                        status: 'CANCELED',
                        error: responseCode,
                        raw: item,
                    };
                }
            }
            return { status: 'PENDING', raw: data };
        }
        catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            return { status: 'UNKNOWN', error: msg };
        }
    }
    /**
     * Finalize order (Mark OK)
     */
    async setOperationOk(tzid) {
        if (!index_js_1.config.onlineSimApiKey)
            return false;
        try {
            const res = await fetch(`${this.baseUrl}/setOperationOk.php?apikey=${index_js_1.config.onlineSimApiKey}&tzid=${tzid}`);
            const data = (await res.json());
            return String(data.response) === '1';
        }
        catch {
            return false;
        }
    }
    /**
     * Cancel / Revise order (Release number)
     */
    async setOperationRevise(tzid) {
        if (!index_js_1.config.onlineSimApiKey)
            return false;
        try {
            const res = await fetch(`${this.baseUrl}/setOperationRevise.php?apikey=${index_js_1.config.onlineSimApiKey}&tzid=${tzid}`);
            const data = (await res.json());
            return String(data.response) === '1';
        }
        catch {
            return false;
        }
    }
}
exports.OnlineSimProvider = OnlineSimProvider;
exports.onlineSimProvider = new OnlineSimProvider();
