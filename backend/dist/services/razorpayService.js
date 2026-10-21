"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.razorpayService = exports.RazorpayService = void 0;
const crypto_1 = __importDefault(require("crypto"));
const index_js_1 = require("../config/index.js");
class RazorpayService {
    baseUrl = 'https://api.razorpay.com/v1';
    isConfigured() {
        return Boolean(index_js_1.config.razorpayKeyId && index_js_1.config.razorpayKeySecret);
    }
    getKeyId() {
        return index_js_1.config.razorpayKeyId || 'rzp_test_mock_sandbox_key';
    }
    /**
     * Create Razorpay Order
     * @param amountInRupees - Amount in INR (e.g. 100)
     * @param userId - ID of user recharging
     */
    async createOrder(amountInRupees, userId) {
        const amountInPaise = Math.round(amountInRupees * 100);
        // If live/test Razorpay keys are provided, call official Razorpay Orders API
        if (this.isConfigured()) {
            try {
                const auth = Buffer.from(`${index_js_1.config.razorpayKeyId}:${index_js_1.config.razorpayKeySecret}`).toString('base64');
                const receipt = `RCPT-${Date.now().toString(36).toUpperCase()}`;
                const res = await fetch(`${this.baseUrl}/orders`, {
                    method: 'POST',
                    headers: {
                        Authorization: `Basic ${auth}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        amount: amountInPaise,
                        currency: 'INR',
                        receipt,
                        notes: {
                            userId,
                            platform: 'OTP_WALLET_PLATFORM',
                        },
                    }),
                });
                const data = (await res.json());
                if (!res.ok || !data.id) {
                    console.warn('[Razorpay API Error]', data);
                    return {
                        success: false,
                        orderId: '',
                        amount: amountInPaise,
                        amountInRupees,
                        currency: 'INR',
                        keyId: index_js_1.config.razorpayKeyId,
                        isSandbox: false,
                        error: data.error?.description || 'Failed to create Razorpay order',
                    };
                }
                console.log(`[Razorpay Order Created] Order ID: ${data.id} (₹${amountInRupees})`);
                return {
                    success: true,
                    orderId: data.id,
                    amount: data.amount,
                    amountInRupees,
                    currency: data.currency || 'INR',
                    keyId: index_js_1.config.razorpayKeyId,
                    isSandbox: false,
                };
            }
            catch (err) {
                const msg = err instanceof Error ? err.message : String(err);
                console.error('[Razorpay Order Exception]', msg);
                return {
                    success: false,
                    orderId: '',
                    amount: amountInPaise,
                    amountInRupees,
                    currency: 'INR',
                    keyId: index_js_1.config.razorpayKeyId,
                    isSandbox: false,
                    error: msg,
                };
            }
        }
        // Sandbox / Mock fallback when keys are not yet provided
        const mockOrderId = `order_mock_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`;
        return {
            success: true,
            orderId: mockOrderId,
            amount: amountInPaise,
            amountInRupees,
            currency: 'INR',
            keyId: 'rzp_test_sandbox_key',
            isSandbox: true,
        };
    }
    /**
     * Verify Razorpay Payment Signature
     */
    verifySignature(orderId, paymentId, signature) {
        // If live Razorpay is configured, verify HMAC SHA-256 signature
        if (this.isConfigured()) {
            try {
                const expectedSignature = crypto_1.default
                    .createHmac('sha256', index_js_1.config.razorpayKeySecret)
                    .update(`${orderId}|${paymentId}`)
                    .digest('hex');
                const isValid = expectedSignature === signature;
                if (!isValid) {
                    console.warn(`[Razorpay Signature Mismatch] Expected: ${expectedSignature}, Received: ${signature}`);
                    return {
                        success: false,
                        verified: false,
                        paymentId,
                        orderId,
                        error: 'Invalid payment signature. Verification failed.',
                    };
                }
                return {
                    success: true,
                    verified: true,
                    paymentId,
                    orderId,
                };
            }
            catch (err) {
                const msg = err instanceof Error ? err.message : String(err);
                return {
                    success: false,
                    verified: false,
                    paymentId,
                    orderId,
                    error: msg,
                };
            }
        }
        // Mock/Sandbox verification: always accepts
        return {
            success: true,
            verified: true,
            paymentId,
            orderId,
        };
    }
}
exports.RazorpayService = RazorpayService;
exports.razorpayService = new RazorpayService();
