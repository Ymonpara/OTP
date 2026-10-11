import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { memoryStore } from '../store/memoryStore.js';
import { AuthTokenPayload, User } from '../types/index.js';

export interface AuthenticatedRequest extends Request {
  user?: User;
}

export const authenticate = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({
      success: false,
      error: 'Authentication token required',
    });
    return;
  }

  // Support Superadmin master key header
  if (authHeader === `Bearer ${config.superadminMasterKey}`) {
    const adminUser = memoryStore.users.get('USR-ADMIN-001');
    if (adminUser) {
      req.user = adminUser;
      next();
      return;
    }
  }

  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : authHeader;

  try {
    const decoded = jwt.verify(token, config.jwtSecret) as AuthTokenPayload;
    const user = memoryStore.users.get(decoded.userId);

    if (!user) {
      res.status(401).json({
        success: false,
        error: 'User account not found',
      });
      return;
    }

    if (user.status === 'blocked') {
      res.status(403).json({
        success: false,
        error: 'Account has been suspended by administration',
      });
      return;
    }

    req.user = user;
    next();
  } catch {
    res.status(401).json({
      success: false,
      error: 'Invalid or expired authentication token',
    });
  }
};

export const requireAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'superadmin')) {
    res.status(403).json({
      success: false,
      error: 'Administrative privileges required',
    });
    return;
  }
  next();
};
