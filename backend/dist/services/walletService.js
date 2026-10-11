"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.walletService = exports.WalletService = void 0;
const uuid_1 = require("uuid");
const memoryStore_js_1 = require("../store/memoryStore.js");
const cache_js_1 = require("../store/cache.js");
class WalletService {
    getOrCreateWallet(userId) {
        const cacheKey = `wallet:${userId}`;
        const cached = cache_js_1.memoryCache.get(cacheKey);
        if (cached)
            return cached;
        let wallet = memoryStore_js_1.memoryStore.wallets.get(userId);
        if (!wallet) {
            wallet = {
                id: `WAL-${(0, uuid_1.v4)().slice(0, 8).toUpperCase()}`,
                userId,
                availableBalance: 0.0,
                heldBalance: 0.0,
                currency: 'INR',
                updatedAt: new Date().toISOString(),
            };
            memoryStore_js_1.memoryStore.wallets.set(userId, wallet);
        }
        cache_js_1.memoryCache.set(cacheKey, wallet, 300);
        return wallet;
    }
    getTransactions(userId) {
        return memoryStore_js_1.memoryStore.transactions
            .filter((t) => t.userId === userId)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    getAllTransactions() {
        return [...memoryStore_js_1.memoryStore.transactions].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    /**
     * Recharge Wallet (CREDIT_RECHARGE)
     */
    creditRecharge(userId, amount, referenceId, gateway = 'UPI') {
        if (amount <= 0) {
            throw new Error('Recharge amount must be greater than zero');
        }
        const wallet = this.getOrCreateWallet(userId);
        const balanceBefore = wallet.availableBalance;
        const holdBefore = wallet.heldBalance;
        wallet.availableBalance = Math.round((wallet.availableBalance + amount) * 100) / 100;
        wallet.updatedAt = new Date().toISOString();
        cache_js_1.memoryCache.set(`wallet:${userId}`, wallet, 300);
        const transaction = {
            id: `TXN-${(0, uuid_1.v4)().slice(0, 8).toUpperCase()}`,
            walletId: wallet.id,
            userId,
            type: 'CREDIT_RECHARGE',
            amount,
            balanceBefore,
            balanceAfter: wallet.availableBalance,
            holdBefore,
            holdAfter: wallet.heldBalance,
            referenceType: 'PAYMENT_GATEWAY',
            referenceId,
            description: `Instant wallet top-up via ${gateway.toUpperCase()} Gateway`,
            status: 'COMPLETED',
            createdAt: new Date().toISOString(),
        };
        memoryStore_js_1.memoryStore.transactions.push(transaction);
        return { wallet, transaction };
    }
    /**
     * Place Funds on Hold when OTP Number is Requested (HOLD_OTP_PURCHASE)
     */
    placeHold(userId, amount, orderId, serviceName) {
        const wallet = this.getOrCreateWallet(userId);
        if (wallet.availableBalance < amount) {
            throw new Error(`Insufficient available balance. Required: ₹${amount.toFixed(2)}, Available: ₹${wallet.availableBalance.toFixed(2)}`);
        }
        const balanceBefore = wallet.availableBalance;
        const holdBefore = wallet.heldBalance;
        // Deduct from available, add to hold
        wallet.availableBalance = Math.round((wallet.availableBalance - amount) * 100) / 100;
        wallet.heldBalance = Math.round((wallet.heldBalance + amount) * 100) / 100;
        wallet.updatedAt = new Date().toISOString();
        cache_js_1.memoryCache.set(`wallet:${userId}`, wallet, 300);
        const transaction = {
            id: `TXN-${(0, uuid_1.v4)().slice(0, 8).toUpperCase()}`,
            walletId: wallet.id,
            userId,
            type: 'HOLD_OTP_PURCHASE',
            amount,
            balanceBefore,
            balanceAfter: wallet.availableBalance,
            holdBefore,
            holdAfter: wallet.heldBalance,
            referenceType: 'OTP_ORDER',
            referenceId: orderId,
            description: `Temporary hold for ${serviceName} virtual number reservation`,
            status: 'COMPLETED',
            createdAt: new Date().toISOString(),
        };
        memoryStore_js_1.memoryStore.transactions.push(transaction);
        return { wallet, transaction };
    }
    /**
     * Release Hold when Customer or System cancels order before SMS (RELEASE_HOLD)
     */
    releaseHold(userId, amount, orderId, reason = 'Order cancelled before SMS receipt') {
        const wallet = this.getOrCreateWallet(userId);
        const balanceBefore = wallet.availableBalance;
        const holdBefore = wallet.heldBalance;
        const actualRelease = Math.min(wallet.heldBalance, amount);
        wallet.heldBalance = Math.round((wallet.heldBalance - actualRelease) * 100) / 100;
        wallet.availableBalance = Math.round((wallet.availableBalance + actualRelease) * 100) / 100;
        wallet.updatedAt = new Date().toISOString();
        cache_js_1.memoryCache.set(`wallet:${userId}`, wallet, 300);
        const transaction = {
            id: `TXN-${(0, uuid_1.v4)().slice(0, 8).toUpperCase()}`,
            walletId: wallet.id,
            userId,
            type: 'RELEASE_HOLD',
            amount: actualRelease,
            balanceBefore,
            balanceAfter: wallet.availableBalance,
            holdBefore,
            holdAfter: wallet.heldBalance,
            referenceType: 'OTP_ORDER',
            referenceId: orderId,
            description: `Held funds released back to available balance (${reason})`,
            status: 'COMPLETED',
            createdAt: new Date().toISOString(),
        };
        memoryStore_js_1.memoryStore.transactions.push(transaction);
        return { wallet, transaction };
    }
    /**
     * Convert Held Funds to Final Debit upon successful OTP delivery (DEBIT_OTP_PURCHASE)
     */
    finalizeDebit(userId, amount, orderId, serviceName) {
        const wallet = this.getOrCreateWallet(userId);
        const balanceBefore = wallet.availableBalance;
        const holdBefore = wallet.heldBalance;
        const actualDeduct = Math.min(wallet.heldBalance, amount);
        wallet.heldBalance = Math.round((wallet.heldBalance - actualDeduct) * 100) / 100;
        wallet.updatedAt = new Date().toISOString();
        cache_js_1.memoryCache.set(`wallet:${userId}`, wallet, 300);
        const transaction = {
            id: `TXN-${(0, uuid_1.v4)().slice(0, 8).toUpperCase()}`,
            walletId: wallet.id,
            userId,
            type: 'DEBIT_OTP_PURCHASE',
            amount: actualDeduct,
            balanceBefore,
            balanceAfter: wallet.availableBalance,
            holdBefore,
            holdAfter: wallet.heldBalance,
            referenceType: 'OTP_ORDER',
            referenceId: orderId,
            description: `Finalized debit for verified OTP delivery: ${serviceName}`,
            status: 'COMPLETED',
            createdAt: new Date().toISOString(),
        };
        memoryStore_js_1.memoryStore.transactions.push(transaction);
        return { wallet, transaction };
    }
    /**
     * Administrative Balance Adjustment
     */
    adminAdjustBalance(userId, type, amount, description) {
        const wallet = this.getOrCreateWallet(userId);
        const balanceBefore = wallet.availableBalance;
        const holdBefore = wallet.heldBalance;
        if (type === 'ADMIN_CREDIT') {
            wallet.availableBalance = Math.round((wallet.availableBalance + amount) * 100) / 100;
        }
        else {
            wallet.availableBalance = Math.max(0, Math.round((wallet.availableBalance - amount) * 100) / 100);
        }
        wallet.updatedAt = new Date().toISOString();
        cache_js_1.memoryCache.set(`wallet:${userId}`, wallet, 300);
        const transaction = {
            id: `TXN-${(0, uuid_1.v4)().slice(0, 8).toUpperCase()}`,
            walletId: wallet.id,
            userId,
            type,
            amount,
            balanceBefore,
            balanceAfter: wallet.availableBalance,
            holdBefore,
            holdAfter: wallet.heldBalance,
            referenceType: 'ADMIN_AUDIT',
            referenceId: `ADJ-${Date.now()}`,
            description: `Manual admin adjustment: ${description}`,
            status: 'COMPLETED',
            createdAt: new Date().toISOString(),
        };
        memoryStore_js_1.memoryStore.transactions.push(transaction);
        return { wallet, transaction };
    }
}
exports.WalletService = WalletService;
exports.walletService = new WalletService();
