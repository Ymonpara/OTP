"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiRouter = void 0;
const express_1 = require("express");
const authRoutes_js_1 = require("./authRoutes.js");
const walletRoutes_js_1 = require("./walletRoutes.js");
const serviceRoutes_js_1 = require("./serviceRoutes.js");
const otpRoutes_js_1 = require("./otpRoutes.js");
const ticketRoutes_js_1 = require("./ticketRoutes.js");
const adminRoutes_js_1 = require("./adminRoutes.js");
exports.apiRouter = (0, express_1.Router)();
exports.apiRouter.use('/auth', authRoutes_js_1.authRouter);
exports.apiRouter.use('/wallet', walletRoutes_js_1.walletRouter);
exports.apiRouter.use('/services', serviceRoutes_js_1.serviceRouter);
exports.apiRouter.use('/otp', otpRoutes_js_1.otpRouter);
exports.apiRouter.use('/tickets', ticketRoutes_js_1.ticketRouter);
exports.apiRouter.use('/admin', adminRoutes_js_1.adminRouter);
exports.apiRouter.get('/health', (_req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        service: 'OTP Wallet Platform API',
        version: '1.0.0',
    });
});
