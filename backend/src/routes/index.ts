import { Router } from 'express';
import { authRouter } from './authRoutes.js';
import { walletRouter } from './walletRoutes.js';
import { serviceRouter } from './serviceRoutes.js';
import { otpRouter } from './otpRoutes.js';
import { ticketRouter } from './ticketRoutes.js';
import { adminRouter } from './adminRoutes.js';

export const apiRouter = Router();

apiRouter.use('/auth', authRouter);
apiRouter.use('/wallet', walletRouter);
apiRouter.use('/services', serviceRouter);
apiRouter.use('/otp', otpRouter);
apiRouter.use('/tickets', ticketRouter);
apiRouter.use('/admin', adminRouter);

apiRouter.get('/health', (_req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'OTP Wallet Platform API',
    version: '1.0.0',
  });
});
