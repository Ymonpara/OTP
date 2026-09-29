# OTP Wallet Platform — Production Frontend

State-of-the-art Next.js frontend built precisely to the specifications outlined in [`OTP_Wallet_Platform_Developer_Plan.md`](./OTP_Wallet_Platform_Developer_Plan.md).

Built using **Next.js 16 (App Router)**, **React 19**, **TypeScript**, **Tailwind CSS**, and **Lucide React**.

---

## ⚡ What Has Been Built

### 1. Public Marketing Experience
- **`/` — Landing Page**:
  - High-converting dark fintech aesthetic with glowing ambient backdrops.
  - Interactive live number generator & pricing preview.
  - 4-Step workflow explanation (Deposit → Pick Service → Hold & Timer → Receive SMS).
  - Popular services grid (WhatsApp, Telegram, OpenAI, Google, etc.).
  - Architectural rigor highlights (Double-entry ledger, multi-provider failover, provider cost protection).
  - Trust statistics, FAQ section, and legal compliance disclaimer.

### 2. Authentication Flow (`/auth/...`)
- **`/auth/login`**:
  - Clean credentials form + **1-Click Quick Demo Login** buttons for instant testing as **Demo Customer** or **Demo Admin**.
- **`/auth/register`**:
  - Account creation with password visibility toggle and terms checkbox.
- **`/auth/forgot-password`**:
  - Password recovery interface.

### 3. Customer Dashboard (`/dashboard/...`)
- **Global Header & Navigation**:
  - Real-time Wallet Pill: Available Balance (`₹xxx.xx`) and Held Balance (`₹xx.xx`) with quick `+` recharge trigger.
  - Role switcher button (**Customer** ↔ **Admin**) for seamless end-to-end evaluation.
  - **Live Floating Active Order Notice Banner** whenever an order is waiting for SMS, visible across all dashboard pages.
- **`/dashboard/buy-number` (The Core Purchase Experience)**:
  - Country selection dropdown with dial codes and flags.
  - Service directory with category tabs (*Popular*, *Messaging*, *Social*, *AI*, *Finance*, *Gaming*) and search filter.
  - Guaranteed website selling price breakdown & balance sufficiency check.
  - **Get Number Action**: Places funds on **HOLD** (`HOLD_OTP_PURCHASE`), assigns a virtual phone number, and initiates a **5-Minute Countdown Timer**.
  - **SMS / OTP Box**:
    - Live network polling animation.
    - **Simulate SMS Arrival (Test Button)**: Instantly simulates provider OTP delivery with celebration/confetti and synthesized audio chime.
    - Automatic OTP arrival simulation after 10s if untouched.
    - One-click copy for the temporary number and extracted OTP code.
  - **Order Actions**:
    - "Check Again / Refresh" (Section 20).
    - "Cancel Order & Refund" (Section 21: immediately releases held funds back to available balance via `RELEASE_HOLD`).
- **`/dashboard/active-orders`**:
  - Live monitor of in-progress numbers with simultaneous countdown timers and controls.
- **`/dashboard/activations`**:
  - Activation order history table with status filters (`COMPLETED`, `WAITING_FOR_SMS`, `CANCELLED`, `REFUNDED`), detail modal, and **CSV Export**.
- **`/dashboard/wallet`**:
  - Balance cards (Available, Held, Lifetime Spent).
  - Visual explanation of ledger hold & debit mechanics (Section 6 & 7).
  - Recent ledger entries.
- **`/dashboard/wallet/add-money`**:
  - Preset quick chips (₹100, ₹200, ₹500, ₹1000, ₹2000, ₹5000) and custom input.
  - UPI / QR Code preview, Razorpay and Cashfree checkout simulation with instant ledger credit.
- **`/dashboard/wallet/transactions`**:
  - Full double-entry financial ledger (Section 22 `wallet_transactions`): Transaction ID, Type, Amount, Balance Before → After, Hold Before → After, Reference ID, Description, Timestamp, and CSV Export.
- **`/dashboard/support`**:
  - Interactive support tickets with category selector, conversation threads, and replies.
- **`/dashboard/settings`**:
  - Profile information, Developer REST API key preview & regeneration, Webhook URL configuration, sound alerts, and notification toggles.

### 4. Administrator Console (`/admin/...`)
- **`/admin` — Dashboard Overview (Section 30)**:
  - Primary KPIs: Total Revenue, Gross Margin (Profit), Recharges, OTP Success Rate %.
  - **Section 35 Provider Low Balance System**: Real-time balance status for **5SIM**, **OnlineSIM**, and **SMS-Man** with threshold alerts.
  - Live margin spread breakdown per service.
- **`/admin/services` — Service & Margin Management (Section 12, 28, 31)**:
  - Table of all services with Selling Price, Est. Provider Cost, Min Margin, and Max Provider Cost.
  - **Edit Pricing & Margins Modal**: Change selling prices on-the-fly.
  - Enable/Disable service toggles.
- **`/admin/providers` — SMS Provider Integrations (Section 9, 10, 11, 32)**:
  - Provider priority ranking (1, 2, 3), balance sync button, API health ping ms, and alert limit configuration.
- **`/admin/users` — User Directory (Section 13, 24)**:
  - Customer directory with active/blocked toggle.
  - **Manual Wallet Adjustment Modal**: Credit or debit customer balance with ledger audit notes.
- **`/admin/orders` — All Platform OTP Orders (Section 22, 24)**:
  - Global order history with selling price, provider cost, gross margin, and **Manual Refund Modal**.
- **`/admin/wallet-transactions` — Global Master Ledger (Section 22)**:
  - Master double-entry ledger across all users.
- **`/admin/reports` — Financial & Margin Reports (Section 33)**:
  - Today / 7 Days / 30 Days filters, revenue vs cost vs gross margin, service profitability, and carrier provider market share.

---

## 🚀 Running the Project

```bash
# Run the development server
npm run dev

# Or build and run production bundle
npm run build
npm start
```

Access in your browser at:
- Customer Portal: `http://localhost:3000`
- Admin Console: `http://localhost:3000/admin`
