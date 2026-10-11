import { Router, Response } from 'express';
import { z } from 'zod';
import { otpOrderService } from '../services/otpOrderService.js';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

export const otpRouter = Router();

const createOrderSchema = z.object({
  serviceId: z.string().min(1, 'Service ID is required'),
  countryCode: z.string().default('IN'),
  operator: z.string().optional(),
});

const simulateSmsSchema = z.object({
  code: z.string().optional(),
});

otpRouter.use(authenticate);

// 1. Create OTP Order (Get Virtual Number)
otpRouter.post('/orders', validate(createOrderSchema), (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const userId = req.user!.id;
    const { serviceId, countryCode } = req.body;
    const order = otpOrderService.createOrder(userId, serviceId, countryCode);

    res.status(201).json({
      success: true,
      message: 'Virtual number reserved successfully. 5-minute timer started.',
      data: { order },
    });
  } catch (error) {
    next(error);
  }
});

// 2. Get User Orders
otpRouter.get('/orders', (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const orders = otpOrderService.getUserOrders(userId);
  res.json({
    success: true,
    data: { orders },
  });
});

// 3. Get Currently Active In-Progress Order
otpRouter.get('/orders/active', (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const userOrders = otpOrderService.getUserOrders(userId);
  const activeOrder = userOrders.find(
    (o) => o.status === 'WAITING_FOR_SMS' || o.status === 'NUMBER_ASSIGNED'
  ) || null;

  res.json({
    success: true,
    data: { activeOrder },
  });
});

// 4. Get Order by ID
otpRouter.get('/orders/:id', (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const order = otpOrderService.getOrder(req.params.id as string);
    if (order.userId !== req.user!.id && req.user!.role !== 'admin' && req.user!.role !== 'superadmin') {
      res.status(403).json({ success: false, error: 'Access denied' });
      return;
    }
    res.json({
      success: true,
      data: { order },
    });
  } catch (error) {
    next(error);
  }
});

// 5. Cancel Order and Release Held Funds
otpRouter.post('/orders/:id/cancel', (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const userId = req.user!.id;
    const order = otpOrderService.cancelOrder(userId, req.params.id as string);
    res.json({
      success: true,
      message: 'Order cancelled successfully and held funds released back to available balance.',
      data: { order },
    });
  } catch (error) {
    next(error);
  }
});

// 6. Simulate Incoming SMS Delivery (Testing Hook)
otpRouter.post('/orders/:id/simulate-sms', validate(simulateSmsSchema), (req: AuthenticatedRequest, res: Response, next) => {
  try {
    const { code } = req.body;
    const order = otpOrderService.receiveSms(req.params.id as string, code);
    res.json({
      success: true,
      message: 'Simulated SMS code delivered and held funds finalized to debit.',
      data: { order },
    });
  } catch (error) {
    next(error);
  }
});
