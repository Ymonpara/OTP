import { v4 as uuidv4 } from 'uuid';
import { memoryStore } from '../store/memoryStore.js';
import { OtpOrder } from '../types/index.js';
import { providerService } from './providerService.js';
import { walletService } from './walletService.js';

export class OtpOrderService {
  /**
   * Create a new OTP Order (Section 17 Developer Plan)
   */
  public async createOrder(
    userId: string,
    serviceId: string,
    countryCode: string = 'IN'
  ): Promise<OtpOrder> {
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

    // 2. Select best provider and reserve temporary number (Live 5SIM / OnlineSIM or fallback)
    const purchaseResult = await providerService.purchaseNumber(service, country.code);

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
      isRealProvider: purchaseResult.isReal,
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
  public async cancelOrder(userId: string, orderId: string): Promise<OtpOrder> {
    const order = this.getOrder(orderId);

    if (order.userId !== userId) {
      throw new Error('Unauthorized to cancel this order');
    }

    if (order.status !== 'WAITING_FOR_SMS' && order.status !== 'NUMBER_ASSIGNED') {
      throw new Error(`Cannot cancel order in status: ${order.status}`);
    }

    // Cancel order on live carrier if applicable
    await providerService.cancelProviderOrder(order);

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
   * Background Worker: Poll live carrier SMS and expire any that exceed the 5-minute window
   */
  public async checkAndExpireOrders(): Promise<number> {
    const now = new Date().getTime();
    let expiredCount = 0;

    for (const order of memoryStore.orders.values()) {
      if (order.status === 'WAITING_FOR_SMS' || order.status === 'NUMBER_ASSIGNED') {
        // A. If order is using live carrier provider, poll for incoming SMS
        if (order.isRealProvider) {
          try {
            const sms = await providerService.pollIncomingSms(order);
            if (sms) {
              order.smsReceived = sms;
              order.status = 'COMPLETED';
              order.completedAt = new Date().toISOString();
              walletService.finalizeDebit(order.userId, order.sellingPrice, order.id, order.serviceName);
              memoryStore.orders.set(order.id, order);
              console.log(`🎉 [Live Carrier SMS] Order ${order.id} completed! OTP Code: ${sms.otpCode}`);
              continue;
            }
          } catch (err) {
            console.error(`❌ [Carrier Polling Error on ${order.id}]`, err);
          }
        }

        // B. Check expiration
        const expiresAt = new Date(order.websiteExpiresAt).getTime();
        if (now >= expiresAt) {
          try {
            console.log(
              `⏱️ [Order Worker] Order ${order.id} expired (5-min timeout reached). Releasing ₹${order.sellingPrice} hold for user ${order.userId}.`
            );
            // Cancel on carrier if real
            await providerService.cancelProviderOrder(order);

            // Release held funds back to customer available balance
            walletService.releaseHold(
              order.userId,
              order.sellingPrice,
              order.id,
              'OTP 5-minute timeout window expired without SMS'
            );

            order.status = 'EXPIRED';
            order.cancelledAt = new Date().toISOString();
            memoryStore.orders.set(order.id, order);
            expiredCount++;
          } catch (err) {
            console.error(`❌ [Order Worker] Error expiring order ${order.id}:`, err);
          }
        }
      }
    }

    return expiredCount;
  }

  private workerTimer: NodeJS.Timeout | null = null;

  /**
   * Starts periodic worker loop (every 3 seconds)
   */
  public startBackgroundWorker(intervalMs: number = 3000): void {
    if (this.workerTimer) {
      clearInterval(this.workerTimer);
    }
    console.log(
      `🔄 [Order Worker] Background order expiration & SMS carrier polling worker started (interval: ${intervalMs}ms)`
    );
    this.workerTimer = setInterval(async () => {
      await this.checkAndExpireOrders();
    }, intervalMs);
  }

  public stopBackgroundWorker(): void {
    if (this.workerTimer) {
      clearInterval(this.workerTimer);
      this.workerTimer = null;
      console.log(`⏹️ [Order Worker] Background worker stopped.`);
    }
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
