"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.otpOrderService = exports.OtpOrderService = void 0;
const uuid_1 = require("uuid");
const memoryStore_js_1 = require("../store/memoryStore.js");
const providerService_js_1 = require("./providerService.js");
const walletService_js_1 = require("./walletService.js");
class OtpOrderService {
    /**
     * Create a new OTP Order (Section 17 Developer Plan)
     */
    createOrder(userId, serviceId, countryCode = 'IN') {
        const service = memoryStore_js_1.memoryStore.services.get(serviceId);
        if (!service) {
            throw new Error(`Service not found: ${serviceId}`);
        }
        if (!service.enabled) {
            throw new Error(`This service is currently disabled by platform administration`);
        }
        const country = memoryStore_js_1.memoryStore.countries.get(countryCode) || {
            code: 'IN',
            name: 'India',
            flag: '🇮🇳',
            dialCode: '+91',
        };
        const orderId = `ORD-${(0, uuid_1.v4)().slice(0, 8).toUpperCase()}`;
        // 1. Double-Entry Ledger: Place selling price on HOLD
        walletService_js_1.walletService.placeHold(userId, service.sellingPrice, orderId, service.name);
        // 2. Select best provider and reserve temporary number
        const purchaseResult = providerService_js_1.providerService.purchaseNumber(service, country.code);
        // 3. Set 5-minute countdown window
        const now = new Date();
        const expiresAt = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes
        const order = {
            id: orderId,
            userId,
            serviceId: service.id,
            serviceName: service.name,
            serviceIcon: service.iconName,
            countryCode: country.code,
            countryName: country.name,
            countryFlag: country.flag,
            providerId: purchaseResult.provider.id,
            providerName: purchaseResult.provider.name,
            providerOrderId: purchaseResult.providerOrderId,
            phoneNumber: purchaseResult.phoneNumber,
            sellingPrice: service.sellingPrice,
            providerCost: purchaseResult.providerCost,
            grossMargin: purchaseResult.grossMargin,
            currency: 'INR',
            status: 'WAITING_FOR_SMS',
            orderedAt: now.toISOString(),
            websiteExpiresAt: expiresAt.toISOString(),
        };
        memoryStore_js_1.memoryStore.orders.set(order.id, order);
        return order;
    }
    getOrder(orderId) {
        const order = memoryStore_js_1.memoryStore.orders.get(orderId);
        if (!order) {
            throw new Error(`Order not found: ${orderId}`);
        }
        return order;
    }
    getUserOrders(userId) {
        return Array.from(memoryStore_js_1.memoryStore.orders.values())
            .filter((o) => o.userId === userId)
            .sort((a, b) => new Date(b.orderedAt).getTime() - new Date(a.orderedAt).getTime());
    }
    getAllOrders() {
        return Array.from(memoryStore_js_1.memoryStore.orders.values()).sort((a, b) => new Date(b.orderedAt).getTime() - new Date(a.orderedAt).getTime());
    }
    /**
     * Cancel in-progress order & release hold back to user (Section 21)
     */
    cancelOrder(userId, orderId) {
        const order = this.getOrder(orderId);
        if (order.userId !== userId) {
            throw new Error('Unauthorized to cancel this order');
        }
        if (order.status !== 'WAITING_FOR_SMS' && order.status !== 'NUMBER_ASSIGNED') {
            throw new Error(`Cannot cancel order in status: ${order.status}`);
        }
        // Release held funds back to customer available balance
        walletService_js_1.walletService.releaseHold(userId, order.sellingPrice, order.id, 'User requested order cancellation before SMS');
        order.status = 'CANCELLED';
        order.cancelledAt = new Date().toISOString();
        memoryStore_js_1.memoryStore.orders.set(order.id, order);
        return order;
    }
    /**
     * Process arrival of SMS (Simulated or Real Provider Webhook)
     */
    receiveSms(orderId, customOtpCode) {
        const order = this.getOrder(orderId);
        if (order.status !== 'WAITING_FOR_SMS' && order.status !== 'NUMBER_ASSIGNED') {
            throw new Error(`Order ${orderId} is not in a valid state to receive SMS (Status: ${order.status})`);
        }
        const sms = providerService_js_1.providerService.generateSimulatedSms(order.serviceName, customOtpCode);
        order.smsReceived = sms;
        order.status = 'COMPLETED';
        order.completedAt = new Date().toISOString();
        // Finalize debit from held funds
        walletService_js_1.walletService.finalizeDebit(order.userId, order.sellingPrice, order.id, order.serviceName);
        memoryStore_js_1.memoryStore.orders.set(order.id, order);
        return order;
    }
    /**
     * Admin Manual Refund
     */
    adminRefundOrder(orderId, reason) {
        const order = this.getOrder(orderId);
        if (order.status === 'REFUNDED') {
            throw new Error('Order is already refunded');
        }
        // Refund customer
        walletService_js_1.walletService.creditRecharge(order.userId, order.sellingPrice, `REFUND-${order.id}`, `ADMIN_REFUND: ${reason}`);
        order.status = 'REFUNDED';
        memoryStore_js_1.memoryStore.orders.set(order.id, order);
        return order;
    }
}
exports.OtpOrderService = OtpOrderService;
exports.otpOrderService = new OtpOrderService();
