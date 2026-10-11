import { memoryStore } from '../store/memoryStore.js';
import { AdminStats, ServiceItem, User } from '../types/index.js';
import { walletService } from './walletService.js';

export class AdminService {
  public getDashboardStats(): AdminStats {
    const users = Array.from(memoryStore.users.values());
    const orders = Array.from(memoryStore.orders.values());
    const transactions = memoryStore.transactions;

    const completedOrders = orders.filter((o) => o.status === 'COMPLETED');
    const failedOrders = orders.filter((o) => o.status === 'FAILED' || o.status === 'CANCELLED');
    const refundedOrders = orders.filter((o) => o.status === 'REFUNDED');

    const totalRevenue = completedOrders.reduce((sum, o) => sum + o.sellingPrice, 0);
    const totalProviderCost = completedOrders.reduce((sum, o) => sum + o.providerCost, 0);
    const grossProfit = Math.round((totalRevenue - totalProviderCost) * 100) / 100;

    const todayRecharge = transactions
      .filter((t) => t.type === 'CREDIT_RECHARGE')
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      totalUsers: users.length,
      activeUsers: users.filter((u) => u.status === 'active').length,
      todayRecharge: Math.round(todayRecharge * 100) / 100,
      todayOrders: orders.length,
      successfulOrders: completedOrders.length,
      failedOrders: failedOrders.length,
      totalRefunds: refundedOrders.length,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalProviderCost: Math.round(totalProviderCost * 100) / 100,
      grossProfit,
    };
  }

  public getAllUsers(): User[] {
    return Array.from(memoryStore.users.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public toggleUserStatus(userId: string): User {
    const user = memoryStore.users.get(userId);
    if (!user) {
      throw new Error(`User not found: ${userId}`);
    }
    user.status = user.status === 'active' ? 'blocked' : 'active';
    memoryStore.users.set(userId, user);
    return user;
  }

  public adjustUserWallet(
    userId: string,
    type: 'ADMIN_CREDIT' | 'ADMIN_DEBIT',
    amount: number,
    notes: string
  ) {
    return walletService.adminAdjustBalance(userId, type, amount, notes);
  }

  public updateService(serviceId: string, updates: Partial<ServiceItem>): ServiceItem {
    const service = memoryStore.services.get(serviceId);
    if (!service) {
      throw new Error(`Service not found: ${serviceId}`);
    }
    const updated = { ...service, ...updates };
    memoryStore.services.set(serviceId, updated);
    return updated;
  }
}

export const adminService = new AdminService();
