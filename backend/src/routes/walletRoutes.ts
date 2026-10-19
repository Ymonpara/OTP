import { Router, Response } from 'express';
import { z } from 'zod';
import { walletService } from '../services/walletService.js';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

export const walletRouter = Router();

const rechargeSchema = z.object({
  amount: z.number().positive('Recharge amount must be greater than zero'),
  gateway: z.string().optional(),
  paymentMethod: z.string().optional(),
});

const verifyPaymentSchema = z.object({
  gatewayOrderId: z.string().optional(),
  paymentId: z.string().min(1, 'Payment ID is required'),
  signature: z.string().optional(),
  amount: z.number().positive().optional(),
});

walletRouter.use(authenticate);

walletRouter.get('/', (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const wallet = walletService.getOrCreateWallet(userId);
  res.json({
    success: true,
    data: { wallet },
  });
});

walletRouter.get('/balance', (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const wallet = walletService.getOrCreateWallet(userId);
  res.json({
    success: true,
    data: { wallet },
  });
});

walletRouter.get('/transactions', (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const transactions = walletService.getTransactions(userId);
  res.json({
    success: true,
    data: { transactions },
  });
});

walletRouter.post('/recharge', validate(rechargeSchema), (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const userId = req.user!.id;
    const { amount, gateway, paymentMethod } = req.body;
    const selectedMethod = paymentMethod || gateway || 'upi';
    const refId = `PG-${selectedMethod.toUpperCase()}-${Date.now()}`;
    const result = walletService.creditRecharge(userId, amount, refId, selectedMethod);

    res.status(201).json({
      success: true,
      message: `Wallet credited with ₹${amount.toFixed(2)} via ${selectedMethod.toUpperCase()}`,
      data: {
        ...result,
        gatewayOrderId: refId,
      },
    });
  } catch (error) {
    next(error);
  }
});

walletRouter.post('/verify-payment', validate(verifyPaymentSchema), (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const userId = req.user!.id;
    const { paymentId, amount, gatewayOrderId } = req.body;
    const rechargeAmount = amount || 100;
    const refId = gatewayOrderId || `VERIFIED-${paymentId}`;
    const result = walletService.creditRecharge(userId, rechargeAmount, refId, 'verified_gateway');

    res.json({
      success: true,
      message: 'Payment verified and wallet balance updated successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

const razorpayCreateOrderSchema = z.object({
  amount: z.number().positive('Recharge amount must be greater than zero'),
});

const razorpayVerifySchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
  paymentId: z.string().min(1, 'Payment ID is required'),
  signature: z.string().min(1, 'Signature is required'),
  amount: z.number().positive('Amount is required'),
});

walletRouter.post(
  '/razorpay/create-order',
  validate(razorpayCreateOrderSchema),
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const { razorpayService } = await import('../services/razorpayService.js');
      const userId = req.user!.id;
      const { amount } = req.body;
      const orderResult = await razorpayService.createOrder(amount, userId);

      if (!orderResult.success) {
        res.status(400).json({
          success: false,
          error: orderResult.error || 'Failed to initialize Razorpay checkout',
        });
        return;
      }

      res.json({
        success: true,
        message: 'Razorpay order created successfully',
        data: orderResult,
      });
    } catch (error) {
      next(error);
    }
  }
);

walletRouter.post(
  '/razorpay/verify-payment',
  validate(razorpayVerifySchema),
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const { razorpayService } = await import('../services/razorpayService.js');
      const userId = req.user!.id;
      const { orderId, paymentId, signature, amount } = req.body;

      const verifyResult = razorpayService.verifySignature(orderId, paymentId, signature);

      if (!verifyResult.verified) {
        res.status(400).json({
          success: false,
          error: verifyResult.error || 'Signature verification failed',
        });
        return;
      }

      const rechargeResult = walletService.creditRecharge(
        userId,
        amount,
        paymentId,
        'RAZORPAY'
      );

      res.json({
        success: true,
        message: `Payment verified! ₹${amount.toFixed(2)} credited to your wallet.`,
        data: rechargeResult,
      });
    } catch (error) {
      next(error);
    }
  }
);


