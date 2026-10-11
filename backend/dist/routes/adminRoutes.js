"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminRouter = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const adminService_js_1 = require("../services/adminService.js");
const walletService_js_1 = require("../services/walletService.js");
const providerService_js_1 = require("../services/providerService.js");
const otpOrderService_js_1 = require("../services/otpOrderService.js");
const memoryStore_js_1 = require("../store/memoryStore.js");
const auth_js_1 = require("../middleware/auth.js");
const validate_js_1 = require("../middleware/validate.js");
exports.adminRouter = (0, express_1.Router)();
// Protect all admin routes
exports.adminRouter.use(auth_js_1.authenticate, auth_js_1.requireAdmin);
// 1. Dashboard Overview KPIs (Section 30)
exports.adminRouter.get('/dashboard', (_req, res) => {
    const stats = adminService_js_1.adminService.getDashboardStats();
    res.json({
        success: true,
        data: { stats },
    });
});
// 2. User Directory (Section 13, 24)
exports.adminRouter.get('/users', (_req, res) => {
    const users = adminService_js_1.adminService.getAllUsers();
    res.json({
        success: true,
        data: { users },
    });
});
exports.adminRouter.patch('/users/:id/status', (req, res, next) => {
    try {
        const user = adminService_js_1.adminService.toggleUserStatus(req.params.id);
        res.json({
            success: true,
            message: `User status changed to ${user.status}`,
            data: { user },
        });
    }
    catch (error) {
        next(error);
    }
});
// 3. User Wallet Manual Adjustment Modal
const walletAdjustSchema = zod_1.z.object({
    type: zod_1.z.enum(['ADMIN_CREDIT', 'ADMIN_DEBIT']),
    amount: zod_1.z.number().positive('Adjustment amount must be positive'),
    notes: zod_1.z.string().min(3, 'Audit notes required'),
});
exports.adminRouter.post('/users/:id/wallet/adjust', (0, validate_js_1.validate)(walletAdjustSchema), (req, res, next) => {
    try {
        const { type, amount, notes } = req.body;
        const result = adminService_js_1.adminService.adjustUserWallet(req.params.id, type, amount, notes);
        res.json({
            success: true,
            message: `User balance adjusted by ₹${amount.toFixed(2)} (${type})`,
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
});
// 4. Global Double-Entry Ledger (Section 22)
exports.adminRouter.get('/wallet-transactions', (_req, res) => {
    const transactions = walletService_js_1.walletService.getAllTransactions();
    res.json({
        success: true,
        data: { transactions },
    });
});
// 5. SMS Carrier Providers (Section 32, 35)
exports.adminRouter.get('/providers', (_req, res) => {
    const providers = providerService_js_1.providerService.getAllProviders();
    res.json({
        success: true,
        data: { providers },
    });
});
const updateProviderSchema = zod_1.z.object({
    enabled: zod_1.z.boolean().optional(),
    priority: zod_1.z.number().optional(),
    minBalanceAlert: zod_1.z.number().optional(),
});
exports.adminRouter.patch('/providers/:id', (0, validate_js_1.validate)(updateProviderSchema), (req, res, next) => {
    try {
        const updated = providerService_js_1.providerService.updateProvider(req.params.id, req.body);
        res.json({
            success: true,
            message: 'Provider updated',
            data: { provider: updated },
        });
    }
    catch (error) {
        next(error);
    }
});
// 6. Services & Margin Management (Section 28, 31)
exports.adminRouter.get('/services', (_req, res) => {
    const services = Array.from(memoryStore_js_1.memoryStore.services.values());
    res.json({
        success: true,
        data: { services },
    });
});
const updateServiceSchema = zod_1.z.object({
    sellingPrice: zod_1.z.number().optional(),
    minimumMargin: zod_1.z.number().optional(),
    maximumProviderCost: zod_1.z.number().optional(),
    enabled: zod_1.z.boolean().optional(),
});
exports.adminRouter.patch('/services/:id', (0, validate_js_1.validate)(updateServiceSchema), (req, res, next) => {
    try {
        const updated = adminService_js_1.adminService.updateService(req.params.id, req.body);
        res.json({
            success: true,
            message: 'Service pricing and margin configuration updated',
            data: { service: updated },
        });
    }
    catch (error) {
        next(error);
    }
});
// 7. Platform Orders & Manual Refund (Section 22, 24)
exports.adminRouter.get('/orders', (_req, res) => {
    const orders = otpOrderService_js_1.otpOrderService.getAllOrders();
    res.json({
        success: true,
        data: { orders },
    });
});
const refundSchema = zod_1.z.object({
    reason: zod_1.z.string().min(3, 'Refund reason required'),
});
exports.adminRouter.post('/orders/:id/refund', (0, validate_js_1.validate)(refundSchema), (req, res, next) => {
    try {
        const { reason } = req.body;
        const order = otpOrderService_js_1.otpOrderService.adminRefundOrder(req.params.id, reason);
        res.json({
            success: true,
            message: 'Order refunded and balance credited to customer wallet.',
            data: { order },
        });
    }
    catch (error) {
        next(error);
    }
});
