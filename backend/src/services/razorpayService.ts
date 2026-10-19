import crypto from 'crypto';
import { config } from '../config/index.js';

export interface RazorpayOrderResult {
  success: boolean;
  orderId: string;
  amount: number; // in paise (e.g. 10000 for ₹100)
  amountInRupees: number;
  currency: string;
  keyId: string;
  isSandbox: boolean;
  error?: string;
}

export interface RazorpayVerifyResult {
  success: boolean;
  verified: boolean;
  paymentId: string;
  orderId: string;
  error?: string;
}

export class RazorpayService {
  private baseUrl = 'https://api.razorpay.com/v1';

  public isConfigured(): boolean {
    return Boolean(config.razorpayKeyId && config.razorpayKeySecret);
  }

  public getKeyId(): string {
    return config.razorpayKeyId || 'rzp_test_mock_sandbox_key';
  }

  /**
   * Create Razorpay Order
   * @param amountInRupees - Amount in INR (e.g. 100)
   * @param userId - ID of user recharging
   */
  public async createOrder(
    amountInRupees: number,
    userId: string
  ): Promise<RazorpayOrderResult> {
    const amountInPaise = Math.round(amountInRupees * 100);

    // If live/test Razorpay keys are provided, call official Razorpay Orders API
    if (this.isConfigured()) {
      try {
        const auth = Buffer.from(
          `${config.razorpayKeyId}:${config.razorpayKeySecret}`
        ).toString('base64');

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

        const data = (await res.json()) as Record<string, any>;

        if (!res.ok || !data.id) {
          console.warn('[Razorpay API Error]', data);
          return {
            success: false,
            orderId: '',
            amount: amountInPaise,
            amountInRupees,
            currency: 'INR',
            keyId: config.razorpayKeyId,
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
          keyId: config.razorpayKeyId,
          isSandbox: false,
        };
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error('[Razorpay Order Exception]', msg);
        return {
          success: false,
          orderId: '',
          amount: amountInPaise,
          amountInRupees,
          currency: 'INR',
          keyId: config.razorpayKeyId,
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
  public verifySignature(
    orderId: string,
    paymentId: string,
    signature: string
  ): RazorpayVerifyResult {
    // If live Razorpay is configured, verify HMAC SHA-256 signature
    if (this.isConfigured()) {
      try {
        const expectedSignature = crypto
          .createHmac('sha256', config.razorpayKeySecret)
          .update(`${orderId}|${paymentId}`)
          .digest('hex');

        const isValid = expectedSignature === signature;

        if (!isValid) {
          console.warn(
            `[Razorpay Signature Mismatch] Expected: ${expectedSignature}, Received: ${signature}`
          );
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
      } catch (err: unknown) {
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

export const razorpayService = new RazorpayService();
