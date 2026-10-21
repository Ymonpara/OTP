"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = exports.AuthService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const uuid_1 = require("uuid");
const index_js_1 = require("../config/index.js");
const memoryStore_js_1 = require("../store/memoryStore.js");
class AuthService {
    generateToken(user) {
        const payload = {
            userId: user.id,
            email: user.email,
            role: user.role,
        };
        return jsonwebtoken_1.default.sign(payload, index_js_1.config.jwtSecret, {
            expiresIn: index_js_1.config.jwtExpiresIn,
        });
    }
    register(name, email, _password, phone) {
        const normalizedEmail = email.toLowerCase().trim();
        // Check existing
        const existing = Array.from(memoryStore_js_1.memoryStore.users.values()).find((u) => u.email.toLowerCase() === normalizedEmail);
        if (existing) {
            throw new Error('An account with this email address already exists');
        }
        const newUser = {
            id: `USR-${(0, uuid_1.v4)().slice(0, 8).toUpperCase()}`,
            name: name.trim(),
            email: normalizedEmail,
            phone: phone || '+91 98000 00000',
            role: 'customer',
            status: 'active',
            emailVerified: true,
            twoFactorEnabled: false,
            createdAt: new Date().toISOString(),
        };
        memoryStore_js_1.memoryStore.users.set(newUser.id, newUser);
        // Create user wallet with zero starting balance
        const wallet = {
            id: `WAL-${(0, uuid_1.v4)().slice(0, 8).toUpperCase()}`,
            userId: newUser.id,
            availableBalance: 0.0,
            heldBalance: 0.0,
            currency: 'INR',
            updatedAt: new Date().toISOString(),
        };
        memoryStore_js_1.memoryStore.wallets.set(newUser.id, wallet);
        const token = this.generateToken(newUser);
        return { user: newUser, token };
    }
    login(email, _password) {
        const normalizedEmail = email.toLowerCase().trim();
        const user = Array.from(memoryStore_js_1.memoryStore.users.values()).find((u) => u.email.toLowerCase() === normalizedEmail);
        if (!user) {
            throw new Error('Invalid email or credentials');
        }
        if (user.status === 'blocked') {
            throw new Error('This account has been suspended by administration');
        }
        const token = this.generateToken(user);
        return { user, token };
    }
    loginAsDemoCustomer() {
        let demoCustomer = memoryStore_js_1.memoryStore.users.get('USR-DEMO-001');
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
            memoryStore_js_1.memoryStore.users.set(demoCustomer.id, demoCustomer);
        }
        const token = this.generateToken(demoCustomer);
        return { user: demoCustomer, token };
    }
    loginWithAdminKey(key) {
        if (key.trim() !== index_js_1.config.superadminMasterKey) {
            throw new Error('Invalid Superadmin master key');
        }
        let adminUser = memoryStore_js_1.memoryStore.users.get('USR-ADMIN-001');
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
            memoryStore_js_1.memoryStore.users.set(adminUser.id, adminUser);
        }
        const token = this.generateToken(adminUser);
        return { user: adminUser, token };
    }
}
exports.AuthService = AuthService;
exports.authService = new AuthService();
