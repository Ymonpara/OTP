# OTP Wallet Platform — Developer Plan

## 1. Project Goal

Build a production-ready OTP / temporary-number platform where:

1. A customer creates an account.
2. The customer adds money to an internal wallet.
3. The customer selects a supported OTP/SMS service.
4. The website shows our selling price, for example ₹10.
5. On **Get Number**, the backend checks the user's wallet balance.
6. The backend chooses an available SMS activation provider.
7. A temporary number is purchased/reserved from the provider only at order time.
8. The customer sees the temporary number and a countdown timer.
9. The backend checks the provider for incoming SMS/OTP.
10. The OTP is shown to the customer when received.
11. The order is completed, cancelled, expired, or refunded based on provider status.
12. Admin can manage users, wallet transactions, services, provider integrations, prices, margins, orders, refunds, and reports.

> Important: Only services and use cases permitted by the provider and applicable laws/third-party terms should be enabled.

---

# 2. Recommended Technology Stack

## Frontend

- **Next.js**
- **React**
- **TypeScript**
- **Tailwind CSS**
- **shadcn/ui** or custom reusable UI components
- **React Hook Form**
- **Zod** for validation
- **TanStack Query** for API data fetching/caching if required

## Backend

Recommended:

- **Node.js**
- **NestJS** or **Express.js**
- **TypeScript**

Preferred for this project:

- **NestJS**

Reason:

- Better modular structure
- Good for payment/wallet modules
- Easier dependency injection
- Good guards/middleware architecture
- Easier to maintain provider integrations
- Better structure for jobs, queues and webhooks

---

# 3. Database

Use:

- **PostgreSQL**

ORM:

- **Prisma ORM**

Why PostgreSQL:

- Reliable transactions
- Strong consistency
- Good for wallet/financial records
- Easy reporting
- Good relational structure
- Safe transaction locking for balance operations

Do not store wallet balances only in frontend state.

All wallet-related operations must be handled on the backend.

---

# 4. Cache / Queue

Use:

- **Redis**

Use Redis for:

- OTP polling jobs
- Provider status checks
- Rate limiting
- Temporary order locks
- Countdown/order expiry state
- API response caching
- Background jobs

Queue:

- **BullMQ**

Example jobs:

- `check-otp-status`
- `expire-otp-order`
- `cancel-provider-order`
- `provider-balance-sync`
- `payment-webhook-processing`
- `low-provider-balance-alert`

---

# 5. Main Architecture

```text
Customer Browser
      |
      v
Next.js Frontend
      |
      v
Backend API
      |
      +--------------------+
      |                    |
      v                    v
PostgreSQL               Redis
      |
      +-----------------------------+
      |                             |
      v                             v
Payment Gateway              SMS Provider Layer
                                    |
                 +------------------+------------------+
                 |                  |                  |
                 v                  v                  v
               5SIM             OnlineSIM          Other Provider
```

---

# 6. Wallet Architecture

There are 3 separate concepts.

## A. Customer Wallet

Internal balance stored in our database.

Example:

```text
Customer deposits: ₹100
Wallet balance: ₹100
Customer purchases OTP: ₹10
New balance: ₹90
```

## B. Business Ledger

Tracks:

- Customer selling price
- Provider cost
- Gross margin
- Refund
- Payment gateway fee
- Net margin

Example:

```text
Selling Price: ₹10
Provider Cost: ₹4
Gross Margin: ₹6
```

## C. Provider Wallet

This is the balance stored in the external SMS provider account.

Example:

```text
5SIM account balance: ₹5,000
Order provider cost: ₹4
New provider balance: ₹4,996
```

Customer wallet money does NOT directly transfer to the provider wallet.

---

# 7. Recommended Wallet Transaction Model

Never directly update only a `wallet_balance` field.

Use a proper transaction ledger.

## Wallet Transaction Types

```text
CREDIT_RECHARGE
DEBIT_OTP_PURCHASE
HOLD_OTP_PURCHASE
RELEASE_HOLD
REFUND
ADMIN_CREDIT
ADMIN_DEBIT
BONUS
ADJUSTMENT
```

## Recommended Purchase Flow

```text
User Wallet = ₹100
OTP Selling Price = ₹10

1. User clicks Get Number
2. Backend checks wallet >= ₹10
3. ₹10 is placed on HOLD
4. Backend requests number from provider
5. If provider returns number:
      hold -> final debit
6. If provider fails:
      hold -> released
7. If provider refund is valid:
      customer refund rule is applied
```

Use database transactions for every wallet operation.

---

# 8. Payment Gateway

For India, integrate one supported payment gateway.

Possible options:

- Razorpay
- Cashfree
- PhonePe Payment Gateway
- Stripe if business/payment model is supported

Recommended initial integration:

- **Razorpay** or **Cashfree**

Payment flow:

```text
Customer selects Add Balance
        |
        v
Create payment order
        |
        v
Customer pays
        |
        v
Payment gateway webhook
        |
        v
Backend verifies payment
        |
        v
Create wallet CREDIT transaction
        |
        v
Update available customer balance
```

Never credit the wallet based only on frontend success.

Only credit after verified backend webhook/payment verification.

---

# 9. SMS Provider Integration Architecture

Create a common provider interface.

Example:

```ts
interface SmsProvider {
  getBalance(): Promise<number>;

  getServices(country: string): Promise<Service[]>;

  getPrice(
    country: string,
    service: string,
    operator?: string
  ): Promise<number>;

  purchaseNumber(params: PurchaseNumberInput): Promise<ProviderOrder>;

  getOrderStatus(providerOrderId: string): Promise<ProviderOrderStatus>;

  getSms(providerOrderId: string): Promise<ReceivedSms[]>;

  cancelOrder(providerOrderId: string): Promise<void>;

  completeOrder(providerOrderId: string): Promise<void>;
}
```

Provider adapters:

```text
/providers
  /five-sim
  /online-sim
  /sms-man
  /provider-x
```

This lets us add/remove providers without changing the core order system.

---

# 10. Initial Provider Strategy

Start with:

## Provider 1

- 5SIM

Then optionally add:

## Provider 2

- OnlineSIM

Future:

- SMS-Man
- SMSPool
- Other compliant provider

Do not tightly couple business logic to one provider.

---

# 11. Provider Selection Logic

Admin controls:

```text
Provider Enabled: Yes/No
Priority: 1, 2, 3...
Minimum Margin
Maximum Provider Cost
Supported Country
Supported Service
Supported Operator
```

Example:

```text
Website Selling Price = ₹10
Minimum Margin = ₹4
Maximum Allowed Provider Cost = ₹6
```

Provider options:

```text
5SIM = ₹4
OnlineSIM = ₹5.50
Provider C = ₹7
```

Backend chooses:

```text
5SIM
```

If unavailable:

```text
OnlineSIM
```

Skip Provider C because provider cost is above ₹6.

---

# 12. Service Pricing System

Do not directly expose provider cost.

Database fields:

```text
service_name
service_code
country_code
selling_price
minimum_margin
maximum_provider_cost
enabled
```

Example:

```text
Service: Example App
Selling Price: ₹10
Provider Cost: ₹4
Gross Margin: ₹6
```

Admin should be able to change selling price without code changes.

---

# 13. User Roles

## Customer

Can:

- Register
- Login
- Reset password
- Add wallet balance
- View wallet
- Purchase temporary number
- View active orders
- View received OTP/SMS
- Cancel eligible order
- View activation history
- View transaction history
- Open support ticket
- Update profile

## Admin

Can:

- Manage users
- Block/unblock users
- View customer wallet
- Credit/debit wallet manually
- View all wallet transactions
- Manage OTP services
- Manage countries
- Manage providers
- Manage provider priority
- Configure selling price
- Configure margins
- View provider cost
- View provider balance
- View OTP orders
- Cancel/refund orders
- View revenue/profit reports
- Manage payment transactions
- Manage support tickets
- Manage settings

## Super Admin

Optional.

Can:

- Manage admins
- Manage permissions
- Manage secret/system settings
- View security logs

---

# 14. Customer Pages

```text
/
  Landing Page

/auth
  /login
  /register
  /forgot-password
  /reset-password

/dashboard
  /overview
  /buy-number
  /active-orders
  /activations
  /wallet
  /wallet/add-money
  /wallet/transactions
  /support
  /settings
```

---

# 15. Buy Number Page

Components:

```text
Country Dropdown
Service Dropdown
Operator Dropdown (optional)
Selling Price
Get Number Button
Active Number
Copy Number Button
Countdown Timer
OTP / SMS Box
Cancel Button
Request New Number
Order Status
```

Example:

```text
Service: Example App
Price: ₹10

[ Get Number ]

Number:
+91XXXXXXXXXX
[ Copy ]

Time Remaining:
04:27

OTP:
123456
```

---

# 16. Order Statuses

Use explicit statuses.

```text
PENDING
WALLET_HOLD
PROVIDER_REQUESTED
NUMBER_ASSIGNED
WAITING_FOR_SMS
SMS_RECEIVED
COMPLETED
CANCEL_REQUESTED
CANCELLED
EXPIRED
FAILED
REFUNDED
PARTIAL_REFUND
```

Do not use only `success` / `failed`.

---

# 17. Recommended OTP Order Flow

```text
Customer clicks Get Number
        |
        v
Validate customer
        |
        v
Check service active
        |
        v
Check wallet balance
        |
        v
Create order
        |
        v
Create ₹10 HOLD transaction
        |
        v
Get eligible providers
        |
        v
Check provider availability / price
        |
        v
Purchase one number
        |
   +----+----+
   |         |
 success    fail
   |         |
   v         v
Store       Try next provider
number          |
   |            v
   |        all providers fail
   |            |
   |            v
   |        release wallet hold
   v
Show number
        |
        v
Start 5-minute website session
        |
        v
Background job checks provider
        |
   +----+------+
   |           |
 OTP         timeout
   |           |
   v           v
Save SMS    Cancel/expire
   |           |
   v           v
Complete    Apply refund rules
```

---

# 18. 5-Minute Timer

The website can show:

```text
05:00
04:59
04:58
...
```

Important:

The local website timer and provider activation timer may be different.

Backend must store:

```text
order_started_at
website_expires_at
provider_expires_at
```

Never rely only on browser JavaScript timer.

If the customer closes the page, the backend still knows the expiry time.

---

# 19. OTP Polling

Preferred:

- Provider webhook if available

Fallback:

- Background polling

Example:

```text
Every 5–10 seconds:
check provider order status
```

Use BullMQ job.

Stop polling when:

```text
SMS_RECEIVED
COMPLETED
CANCELLED
EXPIRED
FAILED
```

---

# 20. Resend OTP

Do not generate OTP ourselves.

The third-party service generates the OTP.

Our platform only waits for the SMS on the assigned temporary number.

If the provider supports a specific resend/status action, use their documented flow.

UI button label can be:

```text
Check Again
```

or:

```text
Refresh OTP
```

Avoid misleading users if there is no provider resend API.

---

# 21. Refund Rules

Admin-configurable rules.

Possible logic:

## Case 1 — Provider has no number

```text
Customer charge = ₹0
Release wallet hold
```

## Case 2 — Number assigned but provider reports failure and refunds us

```text
Refund customer based on platform policy
```

## Case 3 — OTP successfully received

```text
No refund
```

## Case 4 — Customer cancels after OTP received

```text
No refund
```

## Case 5 — User times out but provider charges the activation

```text
Refund depends on configured business policy
```

Never assume provider always refunds.

---

# 22. Core Database Tables

## users

```text
id
name
email
phone
password_hash
status
email_verified_at
created_at
updated_at
```

## wallets

```text
id
user_id
available_balance
held_balance
currency
created_at
updated_at
```

## wallet_transactions

```text
id
wallet_id
user_id
type
amount
balance_before
balance_after
hold_before
hold_after
reference_type
reference_id
description
status
created_at
```

## payment_orders

```text
id
user_id
gateway
gateway_order_id
amount
currency
status
created_at
```

## payments

```text
id
user_id
payment_order_id
gateway_payment_id
amount
gateway_fee
status
raw_response
created_at
```

## providers

```text
id
name
code
enabled
priority
api_base_url
created_at
updated_at
```

Secrets must NOT be stored as plain values here unless encrypted.

Prefer environment/secret manager.

## provider_accounts

```text
id
provider_id
account_name
enabled
priority
metadata
created_at
```

## services

```text
id
name
slug
service_code
country_code
selling_price
minimum_margin
maximum_provider_cost
enabled
created_at
updated_at
```

## provider_services

```text
id
provider_id
service_id
provider_service_code
provider_country_code
provider_operator
enabled
```

## otp_orders

```text
id
user_id
service_id
provider_id
provider_order_id
phone_number
selling_price
provider_cost
gross_margin
currency
status
ordered_at
website_expires_at
provider_expires_at
completed_at
cancelled_at
created_at
updated_at
```

## received_sms

```text
id
otp_order_id
provider_message_id
sender
message
otp_code
received_at
raw_payload
```

## refunds

```text
id
user_id
otp_order_id
amount
reason
status
wallet_transaction_id
created_at
```

## provider_balance_logs

```text
id
provider_id
balance
currency
checked_at
```

## admin_logs

```text
id
admin_user_id
action
resource_type
resource_id
ip_address
user_agent
metadata
created_at
```

## support_tickets

```text
id
user_id
subject
message
status
priority
created_at
updated_at
```

---

# 23. API Structure

Example:

```text
/api/v1
```

## Auth

```text
POST /auth/register
POST /auth/login
POST /auth/logout
POST /auth/forgot-password
POST /auth/reset-password
GET  /auth/me
```

## Wallet

```text
GET  /wallet
GET  /wallet/transactions
POST /wallet/recharge/create
POST /wallet/recharge/verify
```

## Services

```text
GET /services
GET /services/:id
```

## OTP Orders

```text
POST /otp/orders
GET  /otp/orders
GET  /otp/orders/:id
POST /otp/orders/:id/cancel
POST /otp/orders/:id/refresh
```

## Payment Webhooks

```text
POST /webhooks/payment/razorpay
POST /webhooks/payment/cashfree
```

## Provider Webhooks

```text
POST /webhooks/provider/:providerCode
```

---

# 24. Admin API

```text
GET    /admin/dashboard

GET    /admin/users
GET    /admin/users/:id
PATCH  /admin/users/:id/status

GET    /admin/wallet-transactions
POST   /admin/users/:id/wallet/credit
POST   /admin/users/:id/wallet/debit

GET    /admin/services
POST   /admin/services
PATCH  /admin/services/:id
DELETE /admin/services/:id

GET    /admin/providers
PATCH  /admin/providers/:id

GET    /admin/orders
GET    /admin/orders/:id
POST   /admin/orders/:id/refund

GET    /admin/payments
GET    /admin/refunds

GET    /admin/reports/revenue
GET    /admin/reports/provider-cost
GET    /admin/reports/profit
```

---

# 25. Authentication

Recommended:

- Email + password
- JWT access token
- Refresh token

or:

- Secure server-side session

Passwords:

- **Argon2** or **bcrypt**

Recommended:

- Argon2

Security:

- Email verification
- Forgot password
- Session revocation
- Admin 2FA
- Login rate limiting

---

# 26. Security Requirements

Must implement:

- HTTPS
- Password hashing
- JWT/session security
- CSRF protection where applicable
- CORS rules
- Helmet/security headers
- Rate limiting
- Request validation
- SQL injection protection via ORM
- XSS protection
- Secure cookies
- Refresh token rotation if JWT is used
- Payment webhook signature verification
- Provider webhook verification if available
- Idempotency keys for payments
- Idempotency for wallet operations
- Admin audit logs
- Environment variables
- Secret manager in production
- No API keys in frontend
- No provider secrets in browser

---

# 27. Wallet Safety Rules

Very important:

## Rule 1

All wallet changes happen on the server.

## Rule 2

Use PostgreSQL transactions.

## Rule 3

Lock wallet row during debit/hold operation.

## Rule 4

Every balance change requires a ledger record.

## Rule 5

Never trust amount from frontend.

Frontend can send:

```text
service_id
```

Backend decides:

```text
selling_price
```

## Rule 6

Payment webhooks must be idempotent.

Same webhook must not credit wallet twice.

---

# 28. Pricing Safety

Backend must calculate prices.

Do not accept:

```json
{
  "service": "example",
  "price": 10
}
```

Instead:

```json
{
  "service_id": "..."
}
```

Backend:

```text
Load service
Load selling price
Validate provider margin
Create order
```

---

# 29. Provider Cost Protection

Before buying number:

```text
providerCost <= maximumProviderCost
```

Example:

```text
Selling Price = ₹10
Minimum Margin = ₹4
Maximum Provider Cost = ₹6
```

If provider price becomes ₹8:

```text
do not buy
```

Possible actions:

1. Try next provider.
2. Mark service unavailable.
3. Raise customer selling price if dynamic pricing is enabled.

---

# 30. Admin Dashboard

Dashboard cards:

```text
Total Users
Active Users
Today's Wallet Recharge
Today's OTP Orders
Successful OTP Orders
Failed Orders
Refunds
Revenue
Provider Cost
Gross Margin
Provider Balances
```

Charts:

```text
Daily Revenue
Daily Provider Cost
Daily Profit
Order Success Rate
Top Services
Top Providers
```

---

# 31. Admin Service Management

Admin can configure:

```text
Service Name
Service Code
Country
Website Selling Price
Minimum Margin
Maximum Provider Cost
Enabled / Disabled
Provider Mapping
Provider Priority
```

---

# 32. Provider Management

Admin can see:

```text
Provider Name
Enabled
Priority
Current Balance
Last Balance Check
API Health
Success Rate
Average Cost
Average OTP Delivery Time
```

---

# 33. Reporting

Reports:

```text
Revenue Report
Provider Cost Report
Gross Profit Report
Wallet Recharge Report
Refund Report
Service Report
Provider Report
User Purchase Report
Payment Gateway Fee Report
```

Filters:

```text
Today
Yesterday
Last 7 Days
Last 30 Days
Custom Range
```

---

# 34. Notifications

Customer:

- Wallet recharge success
- Number assigned
- OTP received
- Order failed
- Refund processed

Admin:

- Provider low balance
- Provider API failure
- Payment webhook failure
- High refund rate
- Suspicious account activity

Notification channels:

- In-app
- Email
- Optional Telegram/Slack for admin alerts

---

# 35. Provider Low Balance System

Example:

```text
5SIM Minimum Balance Alert = ₹1,000
```

Background job checks balance.

If:

```text
balance < ₹1,000
```

Send admin alert.

---

# 36. Logging

Use structured logs.

Recommended:

- Pino
- Winston

Log:

```text
request_id
user_id
order_id
provider_id
provider_order_id
event
duration
error
```

Never log:

- Passwords
- Full payment secrets
- API secrets
- Session tokens

---

# 37. Error Monitoring

Recommended:

- Sentry

Track:

- Frontend crashes
- Backend exceptions
- Provider API failures
- Payment processing failures

---

# 38. Project Folder Structure

## Monorepo Option

Recommended:

```text
otp-platform/
│
├── apps/
│   ├── web/
│   │   ├── app/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── lib/
│   │   └── types/
│   │
│   └── api/
│       ├── src/
│       │   ├── auth/
│       │   ├── users/
│       │   ├── wallets/
│       │   ├── payments/
│       │   ├── services/
│       │   ├── otp-orders/
│       │   ├── providers/
│       │   │   ├── interfaces/
│       │   │   ├── five-sim/
│       │   │   └── online-sim/
│       │   ├── refunds/
│       │   ├── reports/
│       │   ├── admin/
│       │   ├── webhooks/
│       │   ├── jobs/
│       │   ├── common/
│       │   └── main.ts
│       │
│       └── test/
│
├── packages/
│   ├── shared-types/
│   ├── validation/
│   └── config/
│
├── prisma/
│   ├── schema.prisma
│   └── migrations/
│
├── docker/
│
├── docs/
│
├── .env.example
├── docker-compose.yml
├── package.json
└── README.md
```

---

# 39. Environment Variables

Example:

```env
NODE_ENV=development

APP_URL=
API_URL=

DATABASE_URL=
REDIS_URL=

JWT_SECRET=
JWT_REFRESH_SECRET=

RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=

FIVESIM_API_KEY=

ONLINESIM_API_KEY=

SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=

SENTRY_DSN=
```

Never commit `.env`.

Commit only:

```text
.env.example
```

---

# 40. Docker

Recommended for development and deployment.

Services:

```text
web
api
postgres
redis
worker
```

Example:

```text
docker-compose.yml
```

Development can run:

```text
docker compose up
```

---

# 41. Hosting

Recommended production setup:

## Frontend

Option 1:

- Vercel

or

- Same VPS using Docker

## Backend

- VPS
- Docker
- Nginx
- SSL

## Database

Preferred:

- Managed PostgreSQL

or initial:

- PostgreSQL on VPS

## Redis

- Managed Redis

or:

- Redis on VPS

For financial/wallet data, managed DB + backups is preferred.

---

# 42. Deployment Architecture

```text
Cloudflare
    |
    v
Nginx / Reverse Proxy
    |
    +---------+
    |         |
    v         v
Frontend    Backend API
              |
       +------+------+
       |             |
       v             v
 PostgreSQL        Redis
                     |
                     v
                  Worker
```

---

# 43. Domain Structure

Example:

```text
www.example.com
api.example.com
admin.example.com
```

or:

```text
example.com
example.com/admin
api.example.com
```

---

# 44. Testing

## Unit Tests

Test:

- Wallet calculations
- Margin calculations
- Refund rules
- Provider selection
- Price validation

## Integration Tests

Test:

- Wallet + order creation
- Payment webhook
- Provider order creation
- Provider cancellation
- Refund

## End-to-End Tests

Test:

```text
Register
Login
Recharge
Buy number
Receive OTP
Complete order
View history
```

Frameworks:

- Jest
- Supertest
- Playwright

---

# 45. Important Test Cases

## Wallet

```text
Two orders at same time
Insufficient balance
Webhook sent twice
Refund sent twice
Admin credit during active order
```

## Provider

```text
Provider timeout
Provider out of stock
Provider price changes
Provider returns invalid response
Provider returns same number
Provider returns delayed OTP
```

## Payment

```text
Payment successful
Payment failed
Webhook delayed
Webhook duplicated
Wrong signature
```

---

# 46. Development Phases

## Phase 1 — Project Setup

- Repository
- Next.js
- NestJS
- PostgreSQL
- Prisma
- Redis
- Docker
- Auth base

Estimated:

```text
3–4 days
```

## Phase 2 — User + Wallet

- Registration/login
- Dashboard
- Wallet
- Wallet ledger
- Recharge UI
- Payment gateway

Estimated:

```text
5–7 days
```

## Phase 3 — OTP Core

- Services
- Pricing
- OTP orders
- Provider interface
- First provider integration
- Number purchase
- OTP polling
- Timer

Estimated:

```text
7–9 days
```

## Phase 4 — Refund + Provider Logic

- Cancel
- Expire
- Refund
- Provider fallback
- Margin validation

Estimated:

```text
4–5 days
```

## Phase 5 — Admin Panel

- Users
- Wallet
- Services
- Providers
- Orders
- Refunds
- Reports

Estimated:

```text
6–8 days
```

## Phase 6 — Testing + Security

- Full testing
- Payment tests
- Provider tests
- Security checks
- Error handling

Estimated:

```text
5–6 days
```

## Phase 7 — Deployment

- VPS
- Database
- Redis
- SSL
- Domain
- Backups
- Monitoring

Estimated:

```text
2–3 days
```

---

# 47. Total Estimated Timeline

```text
35–45 working days
```

Safe client timeline:

```text
7–9 weeks
```

---

# 48. Recommended Development Cost

Project development quotation:

```text
₹1,60,000
```

This should include:

- Frontend
- Backend
- Database
- Customer wallet
- Payment gateway
- OTP order system
- One primary SMS provider integration
- Admin panel
- Refund system
- Reports
- Security
- Testing
- Deployment

Exclude:

- Domain
- Hosting
- Payment gateway fees
- SMS provider wallet balance
- Paid external services
- Future provider integrations
- Ongoing maintenance unless included separately

---

# 49. Future Provider Integration Cost

For each new provider:

```text
₹15,000–₹25,000
```

depending on API complexity.

---

# 50. MVP Scope

For fastest safe launch, MVP should include:

```text
1 Country initially
1 SMS provider
Selected supported services
Customer registration/login
Wallet
Payment gateway
Get Number
OTP receive
5-minute website timer
Cancel/expire
Refund rules
Activation history
Wallet history
Admin panel
Basic reports
```

After stable launch:

```text
Add Provider 2
Add automatic fallback
Add more countries
Add advanced reports
Add admin alerts
Add provider health scoring
```

---

# 51. Codex Implementation Priority

Codex should implement in this order:

```text
1. Monorepo setup
2. PostgreSQL + Prisma schema
3. Auth
4. Wallet ledger
5. Payment gateway
6. Service/pricing module
7. OTP order state machine
8. Provider interface
9. 5SIM adapter
10. Background worker
11. OTP polling/webhooks
12. Cancel/refund flow
13. Customer dashboard
14. Admin panel
15. Reports
16. Security hardening
17. Tests
18. Docker
19. Deployment documentation
```

---

# 52. Non-Negotiable Engineering Rules

Codex must follow these rules:

```text
- TypeScript everywhere
- No provider API keys in frontend
- No payment secrets in frontend
- All wallet operations backend-only
- PostgreSQL transaction for all balance operations
- Ledger entry for every wallet change
- Idempotent payment webhook handling
- Idempotent refund handling
- Backend decides price
- Backend decides provider
- Admin can change selling price
- Provider actual cost stored per order
- Gross margin stored per order
- Provider failure must not lose customer balance
- OTP polling must run in background worker
- Browser timer must not be source of truth
- Every important admin action must be logged
- Use environment variables / secret manager
- Add validation to every request
- Add rate limiting
- Add structured error handling
- Add automated tests for wallet and payment logic
```

---

# 53. Final Product Flow

```text
Customer Registers
        |
        v
Adds ₹100 to Wallet
        |
        v
Payment Verified
        |
        v
Wallet = ₹100
        |
        v
Selects Service ₹10
        |
        v
Clicks Get Number
        |
        v
₹10 Wallet Hold
        |
        v
Backend Checks Provider Price + Stock
        |
        v
Backend Purchases ONE Number
        |
        v
Number Displayed
        |
        v
5 Minute Website Timer
        |
        v
Provider Receives SMS
        |
        v
OTP Displayed to Customer
        |
        v
Order Completed
        |
        v
Wallet Final Debit ₹10
        |
        v
Provider Cost Stored (example ₹4)
        |
        v
Gross Margin Stored (example ₹6)
```

If no number or eligible failure:

```text
Release / Refund Customer Wallet
```

---

# 54. Final Recommended Stack Summary

```text
Frontend:
Next.js + React + TypeScript + Tailwind CSS

Backend:
Node.js + NestJS + TypeScript

Database:
PostgreSQL

ORM:
Prisma

Cache / Queue:
Redis + BullMQ

Payment:
Razorpay or Cashfree

SMS Provider:
5SIM initially
Provider adapter architecture for future providers

Authentication:
JWT/Refresh Token or Secure Session

Validation:
Zod / class-validator

Logging:
Pino

Monitoring:
Sentry

Testing:
Jest + Supertest + Playwright

Deployment:
Docker + VPS + Nginx + SSL

Security:
Rate limiting + webhook verification + audit logs + secure secrets
```

---

# 55. Codex Task

Build this as a production-ready modular application.

Start with the MVP, but keep the architecture ready for:

- Multiple providers
- Multiple countries
- Dynamic pricing
- Provider fallback
- Admin-controlled margins
- Wallet refunds
- Revenue reporting
- Provider health monitoring

Do not hard-code provider business logic inside controllers.

Use services, provider adapters, transactions, queues, and clear domain modules.

