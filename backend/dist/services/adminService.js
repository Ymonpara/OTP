"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminService = exports.AdminService = void 0;
const memoryStore_js_1 = require("../store/memoryStore.js");
const walletService_js_1 = require("./walletService.js");
class AdminService {
    getDashboardStats() {
        const users = Array.from(memoryStore_js_1.memoryStore.users.values());
        const orders = Array.from(memoryStore_js_1.memoryStore.orders.values());
        const transactions = memoryStore_js_1.memoryStore.transactions;
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
    getAllUsers() {
        return Array.from(memoryStore_js_1.memoryStore.users.values()).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    toggleUserStatus(userId) {
        const user = memoryStore_js_1.memoryStore.users.get(userId);
        if (!user) {
            throw new Error(`User not found: ${userId}`);
        }
        user.status = user.status === 'active' ? 'blocked' : 'active';
        memoryStore_js_1.memoryStore.users.set(userId, user);
        return user;
    }
    adjustUserWallet(userId, type, amount, notes) {
        return walletService_js_1.walletService.adminAdjustBalance(userId, type, amount, notes);
    }
    updateService(serviceId, updates) {
        const service = memoryStore_js_1.memoryStore.services.get(serviceId);
        if (!service) {
            throw new Error(`Service not found: ${serviceId}`);
        }
        const updated = { ...service, ...updates };
        memoryStore_js_1.memoryStore.services.set(serviceId, updated);
        return updated;
    }
}
exports.AdminService = AdminService;
exports.adminService = new AdminService();
