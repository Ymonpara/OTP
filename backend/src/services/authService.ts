import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config/index.js';
import { memoryStore } from '../store/memoryStore.js';
import { AuthTokenPayload, User, Wallet } from '../types/index.js';

export class AuthService {
  public generateToken(user: User): string {
    const payload: AuthTokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };
    return jwt.sign(payload, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn as jwt.SignOptions['expiresIn'],
    });
  }

  public register(name: string, email: string, _password: string, phone?: string): { user: User; token: string } {
    const normalizedEmail = email.toLowerCase().trim();

    // Check existing
    const existing = Array.from(memoryStore.users.values()).find(
      (u) => u.email.toLowerCase() === normalizedEmail
    );
    if (existing) {
      throw new Error('An account with this email address already exists');
    }

    const newUser: User = {
      id: `USR-${uuidv4().slice(0, 8).toUpperCase()}`,
      name: name.trim(),
      email: normalizedEmail,
      phone: phone || '+91 98000 00000',
      role: 'customer',
      status: 'active',
      emailVerified: true,
      twoFactorEnabled: false,
      createdAt: new Date().toISOString(),
    };

    memoryStore.users.set(newUser.id, newUser);

    // Create user wallet with zero starting balance
    const wallet: Wallet = {
      id: `WAL-${uuidv4().slice(0, 8).toUpperCase()}`,
      userId: newUser.id,
      availableBalance: 0.0,
      heldBalance: 0.0,
      currency: 'INR',
      updatedAt: new Date().toISOString(),
    };
    memoryStore.wallets.set(newUser.id, wallet);

    const token = this.generateToken(newUser);
    return { user: newUser, token };
  }

  public login(email: string, _password?: string): { user: User; token: string } {
    const normalizedEmail = email.toLowerCase().trim();
    const user = Array.from(memoryStore.users.values()).find(
      (u) => u.email.toLowerCase() === normalizedEmail
    );

    if (!user) {
      throw new Error('Invalid email or credentials');
    }

    if (user.status === 'blocked') {
      throw new Error('This account has been suspended by administration');
    }

    const token = this.generateToken(user);
    return { user, token };
  }

  public loginAsDemoCustomer(): { user: User; token: string } {
    let demoCustomer = memoryStore.users.get('USR-DEMO-001');
    if (!demoCustomer) {
      demoCustomer = {
        id: 'USR-DEMO-001',
        name: 'Demo Customer',
        email: 'customer@otpwallet.com',
        role: 'customer',
        status: 'active',
        emailVerified: true,
        twoFactorEnabled: false,
        createdAt: new Date().toISOString(),
      };
      memoryStore.users.set(demoCustomer.id, demoCustomer);
    }
    const token = this.generateToken(demoCustomer);
    return { user: demoCustomer, token };
  }

  public loginWithAdminKey(key: string): { user: User; token: string } {
    if (key.trim() !== config.superadminMasterKey) {
      throw new Error('Invalid Superadmin master key');
    }
    let adminUser = memoryStore.users.get('USR-ADMIN-001');
    if (!adminUser) {
      adminUser = {
        id: 'USR-ADMIN-001',
        name: 'Platform Superadmin',
        email: 'admin@otpwallet.com',
        role: 'admin',
        status: 'active',
        emailVerified: true,
        twoFactorEnabled: true,
        createdAt: new Date().toISOString(),
      };
      memoryStore.users.set(adminUser.id, adminUser);
    }
    const token = this.generateToken(adminUser);
    return { user: adminUser, token };
  }
}

export const authService = new AuthService();
