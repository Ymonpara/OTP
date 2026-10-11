import { Router, Response } from 'express';
import { z } from 'zod';
import { adminService } from '../services/adminService.js';
import { walletService } from '../services/walletService.js';
import { providerService } from '../services/providerService.js';
import { otpOrderService } from '../services/otpOrderService.js';
import { memoryStore } from '../store/memoryStore.js';
import { authenticate, requireAdmin, AuthenticatedRequest } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

export const adminRouter = Router();

// Protect all admin routes
adminRouter.use(authenticate, requireAdmin);

// 1. Dashboard Overview KPIs (Section 30)
adminRouter.get('/dashboard', (_req: AuthenticatedRequest, res: Response) => {
  const stats = adminService.getDashboardStats();
  res.json({
    success: true,
    data: { stats },
  });
});

// 2. User Directory (Section 13, 24)
adminRouter.get('/users', (_req: AuthenticatedRequest, res: Response) => {
  const users = adminService.getAllUsers();
  res.json({
    success: true,
    data: { users },
  });
});

adminRouter.patch('/users/:id/status', (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const user = adminService.toggleUserStatus(req.params.id as string);
    res.json({
      success: true,
      message: `User status changed to ${user.status}`,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
});

// 3. User Wallet Manual Adjustment Modal
const walletAdjustSchema = z.object({
  type: z.enum(['ADMIN_CREDIT', 'ADMIN_DEBIT']),
  amount: z.number().positive('Adjustment amount must be positive'),
  notes: z.string().min(3, 'Audit notes required'),
});

adminRouter.post('/users/:id/wallet/adjust', validate(walletAdjustSchema), (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { type, amount, notes } = req.body;
    const result = adminService.adjustUserWallet(req.params.id as string, type, amount, notes);
    res.json({
      success: true,
      message: `User balance adjusted by ₹${amount.toFixed(2)} (${type})`,
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

// 4. Global Double-Entry Ledger (Section 22)
adminRouter.get('/wallet-transactions', (_req: AuthenticatedRequest, res: Response) => {
  const transactions = walletService.getAllTransactions();
  res.json({
    success: true,
    data: { transactions },
  });
});

// 5. SMS Carrier Providers (Section 32, 35)
adminRouter.get('/providers', (_req: AuthenticatedRequest, res: Response) => {
  const providers = providerService.getAllProviders();
  res.json({
    success: true,
    data: { providers },
  });
});

const updateProviderSchema = z.object({
  enabled: z.boolean().optional(),
  priority: z.number().optional(),
  minBalanceAlert: z.number().optional(),
});

adminRouter.patch('/providers/:id', validate(updateProviderSchema), (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const updated = providerService.updateProvider(req.params.id as string, req.body);
    res.json({
      success: true,
      message: 'Provider updated',
      data: { provider: updated },
    });
  } catch (error) {
    next(error);
  }
});

// 6. Services & Margin Management (Section 28, 31)
adminRouter.get('/services', (_req: AuthenticatedRequest, res: Response) => {
  const services = Array.from(memoryStore.services.values());
  res.json({
    success: true,
    data: { services },
  });
});

const updateServiceSchema = z.object({
  sellingPrice: z.number().optional(),
  minimumMargin: z.number().optional(),
  maximumProviderCost: z.number().optional(),
  enabled: z.boolean().optional(),
});

adminRouter.patch('/services/:id', validate(updateServiceSchema), (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const updated = adminService.updateService(req.params.id as string, req.body);
    res.json({
      success: true,
      message: 'Service pricing and margin configuration updated',
      data: { service: updated },
    });
  } catch (error) {
    next(error);
  }
});

// 7. Platform Orders & Manual Refund (Section 22, 24)
adminRouter.get('/orders', (_req: AuthenticatedRequest, res: Response) => {
  const orders = otpOrderService.getAllOrders();
  res.json({
    success: true,
    data: { orders },
  });
});

const refundSchema = z.object({
  reason: z.string().min(3, 'Refund reason required'),
});

adminRouter.post('/orders/:id/refund', validate(refundSchema), (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { reason } = req.body;
    const order = otpOrderService.adminRefundOrder(req.params.id as string, reason);
    res.json({
      success: true,
      message: 'Order refunded and balance credited to customer wallet.',
      data: { order },
    });
  } catch (error) {
    next(error);
  }
});
