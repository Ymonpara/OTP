import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { config } from './config/index.js';
import { apiRouter } from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';

export const app = express();

// Middlewares
app.use(
  cors({
    origin: [config.corsOrigin, 'http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
  })
);
app.use(express.json());
app.use(morgan('dev'));

// Root endpoint
app.get('/', (_req, res) => {
  res.json({
    name: 'OTP Wallet Platform API',
    version: '1.0.0',
    documentation: '/api/v1/health',
    endpoints: {
      auth: '/api/v1/auth',
      wallet: '/api/v1/wallet',
      services: '/api/v1/services',
      otp: '/api/v1/otp',
      tickets: '/api/v1/tickets',
      admin: '/api/v1/admin',
    },
  });
});

// Mount V1 API
app.use('/api/v1', apiRouter);

// 404 Handler
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: 'API endpoint not found',
  });
});

// Error handling middleware
app.use(errorHandler);
