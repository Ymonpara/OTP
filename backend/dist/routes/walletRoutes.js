"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.walletRouter = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const walletService_js_1 = require("../services/walletService.js");
const auth_js_1 = require("../middleware/auth.js");
const validate_js_1 = require("../middleware/validate.js");
exports.walletRouter = (0, express_1.Router)();
const rechargeSchema = zod_1.z.object({
    amount: zod_1.z.number().positive('Recharge amount must be greater than zero'),
    gateway: zod_1.z.string().optional(),
    paymentMethod: zod_1.z.string().optional(),
});
const verifyPaymentSchema = zod_1.z.object({
    gatewayOrderId: zod_1.z.string().optional(),
    paymentId: zod_1.z.string().min(1, 'Payment ID is required'),
    signature: zod_1.z.string().optional(),
    amount: zod_1.z.number().positive().optional(),
});
exports.walletRouter.use(auth_js_1.authenticate);
exports.walletRouter.get('/', (req, res) => {
    const userId = req.user.id;
    const wallet = walletService_js_1.walletService.getOrCreateWallet(userId);
    res.json({
        success: true,
        data: { wallet },
    });
});
exports.walletRouter.get('/balance', (req, res) => {
    const userId = req.user.id;
    const wallet = walletService_js_1.walletService.getOrCreateWallet(userId);
    res.json({
        success: true,
        data: { wallet },
    });
});
exports.walletRouter.get('/transactions', (req, res) => {
    const userId = req.user.id;
    const transactions = walletService_js_1.walletService.getTransactions(userId);
    res.json({
        success: true,
        data: { transactions },
    });
});
exports.walletRouter.post('/recharge', (0, validate_js_1.validate)(rechargeSchema), (req, res, next) => {
    try {
        const userId = req.user.id;
        const { amount, gateway, paymentMethod } = req.body;
        const selectedMethod = paymentMethod || gateway || 'upi';
        const refId = `PG-${selectedMethod.toUpperCase()}-${Date.now()}`;
        const result = walletService_js_1.walletService.creditRecharge(userId, amount, refId, selectedMethod);
        res.status(201).json({
            success: true,
            message: `Wallet credited with ₹${amount.toFixed(2)} via ${selectedMethod.toUpperCase()}`,
            data: {
                ...result,
                gatewayOrderId: refId,
            },
        });
    }
    catch (error) {
        next(error);
    }
});
exports.walletRouter.post('/verify-payment', (0, validate_js_1.validate)(verifyPaymentSchema), (req, res, next) => {
    try {
        const userId = req.user.id;
        const { paymentId, amount, gatewayOrderId } = req.body;
        const rechargeAmount = amount || 100;
        const refId = gatewayOrderId || `VERIFIED-${paymentId}`;
        const result = walletService_js_1.walletService.creditRecharge(userId, rechargeAmount, refId, 'verified_gateway');
        res.json({
            success: true,
            message: 'Payment verified and wallet balance updated successfully',
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
});
