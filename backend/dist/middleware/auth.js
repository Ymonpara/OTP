"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAdmin = exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const index_js_1 = require("../config/index.js");
const memoryStore_js_1 = require("../store/memoryStore.js");
const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        res.status(401).json({
            success: false,
            error: 'Authentication token required',
        });
        return;
    }
    // Support Superadmin master key header
    if (authHeader === `Bearer ${index_js_1.config.superadminMasterKey}`) {
        const adminUser = memoryStore_js_1.memoryStore.users.get('USR-ADMIN-001');
        if (adminUser) {
            req.user = adminUser;
            next();
            return;
        }
    }
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : authHeader;
    try {
        const decoded = jsonwebtoken_1.default.verify(token, index_js_1.config.jwtSecret);
        const user = memoryStore_js_1.memoryStore.users.get(decoded.userId);
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
    }
    catch {
        res.status(401).json({
            success: false,
            error: 'Invalid or expired authentication token',
        });
    }
};
exports.authenticate = authenticate;
const requireAdmin = (req, res, next) => {
    if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'superadmin')) {
        res.status(403).json({
            success: false,
            error: 'Administrative privileges required',
        });
        return;
    }
    next();
};
exports.requireAdmin = requireAdmin;
