import { Router, Response } from 'express';
import { z } from 'zod';
import { walletService } from '../services/walletService.js';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

export const walletRouter = Router();

const rechargeSchema = z.object({
  amount: z.number().positive('Recharge amount must be greater than zero'),
  gateway: z.string().default('upi'),
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
    const { amount, gateway } = req.body;
    const refId = `PG-${gateway.toUpperCase()}-${Date.now()}`;
    const result = walletService.creditRecharge(userId, amount, refId, gateway);

    res.status(201).json({
      success: true,
      message: `Wallet credited with ₹${amount.toFixed(2)} via ${gateway.toUpperCase()}`,
      data: result,
    });
  } catch (error) {
    next(error);
  }
});
