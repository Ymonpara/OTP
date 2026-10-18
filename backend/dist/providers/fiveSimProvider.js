"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fiveSimProvider = exports.FiveSimProvider = void 0;
const index_js_1 = require("../config/index.js");
class FiveSimProvider {
    baseUrl = 'https://5sim.net/v1';
    get headers() {
        return {
            Authorization: `Bearer ${index_js_1.config.fiveSimApiKey}`,
            Accept: 'application/json',
        };
    }
    /**
     * Fetch live balance and profile info from 5SIM
     */
    async getProfile() {
        if (!index_js_1.config.fiveSimApiKey)
            return null;
        try {
            const res = await fetch(`${this.baseUrl}/user/profile`, {
                headers: this.headers,
            });
            if (!res.ok) {
                console.warn(`[5SIM] getProfile failed with HTTP ${res.status}`);
                return null;
            }
            const data = (await res.json());
            return {
                id: Number(data.id),
                email: String(data.email || ''),
                balance: typeof data.balance === 'number' ? data.balance : parseFloat(data.balance || '0'),
                rating: Number(data.rating || 0),
                frozenBalance: Number(data.frozen_balance || 0),
            };
        }
        catch (err) {
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
    async buyNumber(country = 'india', operator = 'any', product = 'telegram') {
        if (!index_js_1.config.fiveSimApiKey) {
            return { success: false, error: '5SIM API key not configured' };
        }
        try {
            const url = `${this.baseUrl}/user/buy/activation/${country.toLowerCase()}/${operator.toLowerCase()}/${product.toLowerCase()}`;
            const res = await fetch(url, {
                headers: this.headers,
            });
            const bodyText = await res.text();
            let data = {};
            try {
                data = JSON.parse(bodyText);
            }
            catch {
                // 5sim sometimes returns raw text error like "no free phones" or "no money"
                return {
                    success: false,
                    error: bodyText || `5SIM HTTP ${res.status}`,
                };
            }
            if (!res.ok || !data.phone) {
                return {
                    success: false,
                    error: data.msg || data.error || bodyText,
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
        }
        catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            return { success: false, error: msg };
        }
    }
    /**
     * Check order status and check for incoming SMS messages
     */
    async checkOrder(orderId) {
        if (!index_js_1.config.fiveSimApiKey) {
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
            const data = (await res.json());
            const rawSmsList = Array.isArray(data.sms) ? data.sms : [];
            const sms = rawSmsList.map((item) => ({
                id: Number(item.id || 0),
                sender: String(item.sender || ''),
                text: String(item.text || ''),
                code: String(item.code || ''),
                createdAt: String(item.created_at || new Date().toISOString()),
            }));
            const rawStatus = String(data.status || 'PENDING').toUpperCase();
            let status = 'PENDING';
            if (rawStatus === 'RECEIVED' || rawStatus === 'FINISHED')
                status = 'RECEIVED';
            else if (rawStatus === 'CANCELED')
                status = 'CANCELED';
            else if (rawStatus === 'TIMEOUT')
                status = 'TIMEOUT';
            else if (rawStatus === 'BANNED')
                status = 'BANNED';
            return {
                status,
                sms,
            };
        }
        catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            return { status: 'UNKNOWN', sms: [], error: msg };
        }
    }
    /**
     * Finish activation once OTP is received
     */
    async finishOrder(orderId) {
        if (!index_js_1.config.fiveSimApiKey)
            return false;
        try {
            const res = await fetch(`${this.baseUrl}/user/finish/${orderId}`, {
                headers: this.headers,
            });
            return res.ok;
        }
        catch {
            return false;
        }
    }
    /**
     * Cancel activation & release provider hold
     */
    async cancelOrder(orderId) {
        if (!index_js_1.config.fiveSimApiKey)
            return false;
        try {
            const res = await fetch(`${this.baseUrl}/user/cancel/${orderId}`, {
                headers: this.headers,
            });
            return res.ok;
        }
        catch {
            return false;
        }
    }
}
exports.FiveSimProvider = FiveSimProvider;
exports.fiveSimProvider = new FiveSimProvider();
