import { Router, Response } from 'express';
import { z } from 'zod';
import { authService } from '../services/authService.js';
import { validate } from '../middleware/validate.js';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.js';

export const authRouter = Router();

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Valid email address required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  phone: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email('Valid email address required'),
  password: z.string().optional(),
});

const adminLoginSchema = z.object({
  key: z.string().min(1, 'Admin master key required'),
});

authRouter.post('/register', validate(registerSchema), (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;
    const result = authService.register(name, email, password, phone);
    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

authRouter.post('/login', validate(loginSchema), (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = authService.login(email, password);
    res.json({
      success: true,
      message: 'Login successful',
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

authRouter.post('/demo-customer', (_req, res, next) => {
  try {
    const result = authService.loginAsDemoCustomer();
    res.json({
      success: true,
      message: 'Logged in as Demo Customer',
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

authRouter.post('/admin-login', validate(adminLoginSchema), (req, res, next) => {
  try {
    const { key } = req.body;
    const result = authService.loginWithAdminKey(key);
    res.json({
      success: true,
      message: 'Admin access authorized',
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

authRouter.get('/me', authenticate, (req: AuthenticatedRequest, res: Response) => {
  res.json({
    success: true,
    data: { user: req.user },
  });
});
