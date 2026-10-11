# OTP Wallet Platform — Node.js Backend

Production-ready backend API built using **Node.js**, **Express.js**, **TypeScript**, **Zod**, and **JWT**, adhering directly to the specifications in [`OTP_Wallet_Platform_Developer_Plan.md`](../OTP_Wallet_Platform_Developer_Plan.md).

---

## ⚡ Features Implemented

1. **Double-Entry Financial Ledger (`walletService`)**:
   - Customer available balance & held balance isolation.
   - `HOLD_OTP_PURCHASE` locks funds when a number reservation is initiated.
   - `RELEASE_HOLD` instantly returns funds to available balance if cancelled before SMS receipt.
   - `DEBIT_OTP_PURCHASE` finalizes the deduction only upon successful OTP receipt.
   - `CREDIT_RECHARGE` for instant top-ups via UPI / Razorpay / Cashfree gateway simulations.

2. **SMS Provider Integration Layer (`providerService`)**:
   - Implements Section 11 Provider Selection: respects provider enabled status, priority order (1, 2, 3), and maximum allowed provider cost checks.
   - Virtual Number reservation engine with realistic country dial codes and countdown session timers.
   - Simulated OTP delivery and provider balance tracking (Section 35).

3. **Complete OTP Order Lifecycle (`otpOrderService`)**:
   - Order reservation with 5-minute countdown expiry.
   - Live SMS receipt hooks and test simulation endpoint.
   - Immediate cancellation and automated hold release.

4. **Authentication & Role-Based Access (`authService` & `auth` middleware)**:
   - JWT tokens with 7-day expiry.
   - Customer registration, login, and profile check (`/api/v1/auth/me`).
   - 1-Click Demo Customer (`/api/v1/auth/demo-customer`) & Demo Superadmin (`/api/v1/auth/admin-login`).

5. **Superadmin Console (`adminService`)**:
   - KPI metrics (Revenue, Gross Margin, Success Rate %, Top Services).
   - Global Double-Entry Ledger inspection across all platform transactions.
   - Service pricing & margin management.
   - Carrier provider monitoring.
   - User account moderation & manual wallet audit adjustments.

6. **Database Migration Ready**:
   - Prepared `prisma/schema.prisma` with all relational tables and enums.
   - Ready to migrate to PostgreSQL whenever you are ready.

---

## 🚀 Running the Backend

From the `backend` folder:

```bash
# 1. Install dependencies
npm install

# 2. Run in development mode (hot-reload via tsx)
npm run dev

# 3. Build production bundle
npm run build
npm start
```

Default Server URL: **`http://localhost:5000`**  
API Base Route: **`http://localhost:5000/api/v1`**

---

## 📚 API Endpoints Summary

### Authentication (`/api/v1/auth`)
- `POST /register`: Create account
- `POST /login`: Log in
- `POST /demo-customer`: Quick 1-click test login as Demo Customer
- `POST /admin-login`: Quick 1-click test login with master key (`SUPERADMIN_2026`)
- `GET /me`: Get current authenticated user profile

### Customer Wallet (`/api/v1/wallet`)
- `GET /`: Get current available & held balance
- `GET /transactions`: Get user double-entry ledger history
- `POST /recharge`: Recharge wallet with funds

### Services & Countries (`/api/v1/services`)
- `GET /`: List all OTP verification services with live selling prices
- `GET /countries`: List supported country dial codes and flags
- `GET /:id`: Service details

### OTP Numbers & Orders (`/api/v1/otp`)
- `POST /orders`: Purchase/reserve temporary virtual number (places selling price on hold)
- `GET /orders`: Activation order history
- `GET /orders/active`: Get currently active order waiting for SMS
- `GET /orders/:id`: Order details
- `POST /orders/:id/cancel`: Cancel order and immediately release hold back to customer balance
- `POST /orders/:id/simulate-sms`: Test incoming OTP delivery

### Support Tickets (`/api/v1/tickets`)
- `GET /`: List user support tickets
- `POST /`: Submit new ticket
- `POST /:id/reply`: Add reply to ticket thread

### Superadmin Console (`/api/v1/admin`)
- `GET /dashboard`: Platform overview KPIs
- `GET /users`: Customer directory
- `PATCH /users/:id/status`: Toggle user status (active ↔ blocked)
- `POST /users/:id/wallet/adjust`: Manual credit or debit with audit note
- `GET /wallet-transactions`: Master ledger
- `GET /providers`: Carrier providers status, ping, and balances
- `PATCH /providers/:id`: Update provider priority and settings
- `GET /services`: All services with margin configurations
- `PATCH /services/:id`: Modify selling price and minimum margin
- `GET /orders`: Master orders directory
- `POST /orders/:id/refund`: Issue manual refund for an order
