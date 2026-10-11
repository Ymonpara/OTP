"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.otpRouter = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const otpOrderService_js_1 = require("../services/otpOrderService.js");
const auth_js_1 = require("../middleware/auth.js");
const validate_js_1 = require("../middleware/validate.js");
exports.otpRouter = (0, express_1.Router)();
const createOrderSchema = zod_1.z.object({
    serviceId: zod_1.z.string().min(1, 'Service ID is required'),
    countryCode: zod_1.z.string().default('IN'),
    operator: zod_1.z.string().optional(),
});
const simulateSmsSchema = zod_1.z.object({
    code: zod_1.z.string().optional(),
});
exports.otpRouter.use(auth_js_1.authenticate);
// 1. Create OTP Order (Get Virtual Number)
exports.otpRouter.post('/orders', (0, validate_js_1.validate)(createOrderSchema), (req, res, next) => {
    try {
        const userId = req.user.id;
        const { serviceId, countryCode } = req.body;
        const order = otpOrderService_js_1.otpOrderService.createOrder(userId, serviceId, countryCode);
        res.status(201).json({
            success: true,
            message: 'Virtual number reserved successfully. 5-minute timer started.',
            data: { order },
        });
    }
    catch (error) {
        next(error);
    }
});
// 2. Get User Orders
exports.otpRouter.get('/orders', (req, res) => {
    const userId = req.user.id;
    const orders = otpOrderService_js_1.otpOrderService.getUserOrders(userId);
    res.json({
        success: true,
        data: { orders },
    });
});
// 3. Get Currently Active In-Progress Order
exports.otpRouter.get('/orders/active', (req, res) => {
    const userId = req.user.id;
    const userOrders = otpOrderService_js_1.otpOrderService.getUserOrders(userId);
    const activeOrder = userOrders.find((o) => o.status === 'WAITING_FOR_SMS' || o.status === 'NUMBER_ASSIGNED') || null;
    res.json({
        success: true,
        data: { activeOrder },
    });
});
// 4. Get Order by ID
exports.otpRouter.get('/orders/:id', (req, res, next) => {
    try {
        const order = otpOrderService_js_1.otpOrderService.getOrder(req.params.id);
        if (order.userId !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'superadmin') {
            res.status(403).json({ success: false, error: 'Access denied' });
            return;
        }
        res.json({
            success: true,
            data: { order },
        });
    }
    catch (error) {
        next(error);
    }
});
// 5. Cancel Order and Release Held Funds
exports.otpRouter.post('/orders/:id/cancel', (req, res, next) => {
    try {
        const userId = req.user.id;
        const order = otpOrderService_js_1.otpOrderService.cancelOrder(userId, req.params.id);
        res.json({
            success: true,
            message: 'Order cancelled successfully and held funds released back to available balance.',
            data: { order },
        });
    }
    catch (error) {
        next(error);
    }
});
// 6. Simulate Incoming SMS Delivery (Testing Hook)
exports.otpRouter.post('/orders/:id/simulate-sms', (0, validate_js_1.validate)(simulateSmsSchema), (req, res, next) => {
    try {
        const { code } = req.body;
        const order = otpOrderService_js_1.otpOrderService.receiveSms(req.params.id, code);
        res.json({
            success: true,
            message: 'Simulated SMS code delivered and held funds finalized to debit.',
            data: { order },
        });
    }
    catch (error) {
        next(error);
    }
});
