import { v4 as uuidv4 } from 'uuid';
import { memoryStore } from '../store/memoryStore.js';
import { OtpOrder } from '../types/index.js';
import { providerService } from './providerService.js';
import { walletService } from './walletService.js';

export class OtpOrderService {
  /**
   * Create a new OTP Order (Section 17 Developer Plan)
   */
  public createOrder(
    userId: string,
    serviceId: string,
    countryCode: string = 'IN'
  ): OtpOrder {
    const service = memoryStore.services.get(serviceId);
    if (!service) {
      throw new Error(`Service not found: ${serviceId}`);
    }

    if (!service.enabled) {
      throw new Error(`This service is currently disabled by platform administration`);
    }

    const country = memoryStore.countries.get(countryCode) || {
      code: 'IN',
      name: 'India',
      flag: '🇮🇳',
      dialCode: '+91',
    };

    const orderId = `ORD-${uuidv4().slice(0, 8).toUpperCase()}`;

    // 1. Double-Entry Ledger: Place selling price on HOLD
    walletService.placeHold(userId, service.sellingPrice, orderId, service.name);

    // 2. Select best provider and reserve temporary number
    const purchaseResult = providerService.purchaseNumber(service, country.code);

    // 3. Set 5-minute countdown window
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes

    const order: OtpOrder = {
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

    memoryStore.orders.set(order.id, order);
    return order;
  }

  public getOrder(orderId: string): OtpOrder {
    const order = memoryStore.orders.get(orderId);
    if (!order) {
      throw new Error(`Order not found: ${orderId}`);
    }
    return order;
  }

  public getUserOrders(userId: string): OtpOrder[] {
    return Array.from(memoryStore.orders.values())
      .filter((o) => o.userId === userId)
      .sort((a, b) => new Date(b.orderedAt).getTime() - new Date(a.orderedAt).getTime());
  }

  public getAllOrders(): OtpOrder[] {
    return Array.from(memoryStore.orders.values()).sort(
      (a, b) => new Date(b.orderedAt).getTime() - new Date(a.orderedAt).getTime()
    );
  }

  /**
   * Cancel in-progress order & release hold back to user (Section 21)
   */
  public cancelOrder(userId: string, orderId: string): OtpOrder {
    const order = this.getOrder(orderId);

    if (order.userId !== userId) {
      throw new Error('Unauthorized to cancel this order');
    }

    if (order.status !== 'WAITING_FOR_SMS' && order.status !== 'NUMBER_ASSIGNED') {
      throw new Error(`Cannot cancel order in status: ${order.status}`);
    }

    // Release held funds back to customer available balance
    walletService.releaseHold(
      userId,
      order.sellingPrice,
      order.id,
      'User requested order cancellation before SMS'
    );

    order.status = 'CANCELLED';
    order.cancelledAt = new Date().toISOString();
    memoryStore.orders.set(order.id, order);

    return order;
  }

  /**
   * Process arrival of SMS (Simulated or Real Provider Webhook)
   */
  public receiveSms(orderId: string, customOtpCode?: string): OtpOrder {
    const order = this.getOrder(orderId);

    if (order.status !== 'WAITING_FOR_SMS' && order.status !== 'NUMBER_ASSIGNED') {
      throw new Error(`Order ${orderId} is not in a valid state to receive SMS (Status: ${order.status})`);
    }

    const sms = providerService.generateSimulatedSms(order.serviceName, customOtpCode);
    order.smsReceived = sms;
    order.status = 'COMPLETED';
    order.completedAt = new Date().toISOString();

    // Finalize debit from held funds
    walletService.finalizeDebit(order.userId, order.sellingPrice, order.id, order.serviceName);

    memoryStore.orders.set(order.id, order);
    return order;
  }

  /**
   * Admin Manual Refund
   */
  public adminRefundOrder(orderId: string, reason: string): OtpOrder {
    const order = this.getOrder(orderId);

    if (order.status === 'REFUNDED') {
      throw new Error('Order is already refunded');
    }

    // Refund customer
    walletService.creditRecharge(
      order.userId,
      order.sellingPrice,
      `REFUND-${order.id}`,
      `ADMIN_REFUND: ${reason}`
    );

    order.status = 'REFUNDED';
    memoryStore.orders.set(order.id, order);
    return order;
  }
}

export const otpOrderService = new OtpOrderService();
