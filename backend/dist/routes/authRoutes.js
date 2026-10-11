"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const authService_js_1 = require("../services/authService.js");
const validate_js_1 = require("../middleware/validate.js");
const auth_js_1 = require("../middleware/auth.js");
exports.authRouter = (0, express_1.Router)();
const registerSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Name must be at least 2 characters'),
    email: zod_1.z.string().email('Valid email address required'),
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
    phone: zod_1.z.string().optional(),
});
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Valid email address required'),
    password: zod_1.z.string().optional(),
});
const adminLoginSchema = zod_1.z.object({
    key: zod_1.z.string().min(1, 'Admin master key required'),
});
exports.authRouter.post('/register', (0, validate_js_1.validate)(registerSchema), (req, res, next) => {
    try {
        const { name, email, password, phone } = req.body;
        const result = authService_js_1.authService.register(name, email, password, phone);
        res.status(201).json({
            success: true,
            message: 'Account created successfully',
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.authRouter.post('/login', (0, validate_js_1.validate)(loginSchema), (req, res, next) => {
    try {
        const { email, password } = req.body;
        const result = authService_js_1.authService.login(email, password);
        res.json({
            success: true,
            message: 'Login successful',
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.authRouter.post('/demo-customer', (_req, res, next) => {
    try {
        const result = authService_js_1.authService.loginAsDemoCustomer();
        res.json({
            success: true,
            message: 'Logged in as Demo Customer',
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.authRouter.post('/admin-login', (0, validate_js_1.validate)(adminLoginSchema), (req, res, next) => {
    try {
        const { key } = req.body;
        const result = authService_js_1.authService.loginWithAdminKey(key);
        res.json({
            success: true,
            message: 'Admin access authorized',
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.authRouter.get('/me', auth_js_1.authenticate, (req, res) => {
    res.json({
        success: true,
        data: { user: req.user },
    });
});
