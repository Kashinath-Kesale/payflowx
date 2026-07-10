
# 💸 PayFlowX - Payment Processing, Settlement & Reconciliation System

> **A backend-heavy, full-stack financial system that models real-world payment flows with correctness, reliability, and auditability as first-class concerns.**

PayFlowX simulates the **end-to-end lifecycle of digital payments** - from payment initiation to asynchronous settlement and final reconciliation.
The system is designed to highlight **financial correctness**, **failure safety**, and **clear separation of responsibilities**, which are critical in real payment platforms.

---

## 🚀 Tech Stack

### Backend

*   🦁 **Framework**: NestJS (modular, opinionated architecture)
*   🟦 **Language**: TypeScript (strict typing)
*   🐘 **Database**: PostgreSQL
*   💎 **ORM**: Prisma (type-safe DB access)
*   🔐 **Authentication**: JWT (Passport strategy)
*   📜 **Logging**: Structured logging via custom `AppLogger`
*   📄 **API Docs**: Swagger OpenAPI (Live: [https://payflowx-backend.onrender.com/api](https://payflowx-backend.onrender.com/api))

### Frontend

*   ⚛️ **Framework**: Next.js 14 (App Router)
*   🎨 **Styling**: Tailwind CSS
*   🎣 **State Handling**: React Hooks
*   🌐 **Data Fetching**: Native Fetch API
*   🛡️ **Auth Handling**: JWT-based protected routes

---

## 🧠 System Overview & Design Philosophy

### Core Problem

Financial systems often face **eventual consistency issues**, where:

* A payment appears successful at the gateway
* But settlement or bank confirmation happens later

PayFlowX addresses this by:

* Separating **payment intent**, **settlement**, and **reconciliation**
* Treating reconciliation as the **source of truth** for financial correctness

---

## 🔄 Payment Lifecycle Design

### 1. Payment Ingestion

* Client initiates a payment request
* Request must include a unique `idempotencyKey`

### 2. Idempotency Enforcement

* Duplicate requests are safely handled
* If a payment with the same `idempotencyKey` exists, it is returned immediately
* Prevents double-charging and retry-related inconsistencies

### 3. Payment States

Payments follow a strict state machine:

* `INITIATED` - payment intent recorded
* `SUCCESS` - payment confirmed
* `FAILED` - error occurred (with failure reason)

State transitions are controlled **only within the service layer**.

---

## 🗄️ Database Design

### Core Models

*   👤 **Users**: System users who initiate payments.
*   🏢 **Merchants**: Validated entities receiving payments.
*   💳 **Payments**: The central ledger entry.
    *   Linked to User & Merchant.
    *   Enforces `idempotencyKey` (Unique Constraint) to prevent duplicates.
    *   **Immutable** after reaching a terminal state (`SUCCESS`/`FAILED`).
*   🏦 **Settlements**:
    *   **One-to-One** relationship with Payments.
    *   Created **asynchronously** to mimic real-world banking delays.
*   ⚖️ **Reconciliation Results**:
    *   Derived audit records comparing Payments vs. Settlements.

---

## 🔁 Idempotency Strategy

**(Critical for preventing double-charging)**

To prevent accidental double-charges (e.g., user clicks "Pay" twice due to network lag), every payment request requires a unique `idempotencyKey`.

*   **Mechanism**: Before creating a payment, the `PaymentsService` performs a check:
    ```typescript
    prisma.payment.findUnique({ where: { idempotencyKey } })
    ```
*   **Outcome**: If found, the **existing payment object is returned immediately** without re-processing. This ensures **safe retries** even in case of timeouts or network failures.

---

## ⚛️ Transaction & Atomicity Handling

All financial operations must be **Atomic** to ensure data integrity.

*   **Implementation**: Critical flows utilize `prisma.$transaction`.
*   **Logic**: The creation of the `INITIATED` record and the subsequent update to `SUCCESS`/`FAILED` happen within a **single managed transaction** scope.
*   **Benefit**: Ensures consistency - partial or contradictory payment states are never persisted.

---

## 🚧 Global Rate Limiting (Security & UX)

To protect the system from malicious actors, brute-force attacks, and resource exhaustion, the application implements a robust **Global Rate Limiting** strategy.

*   **Backend Shield**: Implemented via an in-memory `ThrottlerGuard` configured as an `APP_GUARD`. It strictly limits clients to **10 requests per minute** globally. Breaches result in a fast `429 Too Many Requests` rejection, protecting database connections.
*   **Frontend Interceptor**: The frontend uses a global `api()` wrapper to catch all `429` status codes. Instead of crashing or failing silently, it gracefully intercepts the error and displays a user-friendly Toast notification ("You are doing that too fast. Please wait a minute."), ensuring a premium UX.

---

## 🛡️ Failure Handling & Observability

*   **Graceful Failures**: All external calls (simulated) are wrapped in robust `try-catch` blocks.
*   **Explicit Status**: If a process fails, the entity is explicitly marked `FAILED`.
*   **Audit Trail**: A detailed `failureReason` is stored in the database, allowing support teams to accurately **debug issues** without digging through raw application logs.
*   **Structured Logging**: We log critical lifecycle events (Settlement attempts, Reconciliation outcomes) to aid in **tracing and monitoring**.

---

## ⚖️ Settlement & Reconciliation Logic

This is the heart of the system, designed to verify financial accuracy 🎯.

### Settlement Simulation
An async background process (`SettlementsService`) scans for `SUCCESS` payments and creates settlement records, **mimicking a bank feed** 🏦.

### Reconciliation Engine
A separate **audit process** compares:
*   `Payment.amount` vs `Settlement.amount`
*   `Payment.currency` vs `Settlement.currency`

It produces **Smart Statuses**:
*   `MATCHED` ✅: Perfect alignment.
*   `MISMATCHED` ⚠️: Amount/Currency differs (e.g., hidden fees).
*   `SETTLEMENT PENDING` ⏳: Payment is success, but bank hasn't settled yet (Normal business delay).
*   `MISSING SETTLEMENT` ❌: Critical error (Payment exists, but implementation lost the settlement).

---

## ⚡ Performance & Indexing

To ensure the dashboard remains snappy as data grows 📈:

*   **Indexes**: Added `@@index` in `schema.prisma` on high-cardinality fields:
    *   `userId` (Find my payments)
    *   `merchantId` (Merchant reporting)
    *   `status` (Filtering by Success/Failed)
*   **Impact**: Significantly **reduces query time** and ensures **scalable reads** for dashboard filtering and reporting.

---

## 🖥️ Frontend Dashboard

The frontend acts as a **reporting and visualization layer**:

### Features

* JWT-based login
* Create payments
* View payment statuses
* View settlements (read-only)
* View reconciliation results (MATCHED / MISMATCHED)

---

## 🛠️ Setup & Running Locally

### Backend

```bash
cd backend
npm install
npx prisma migrate dev
npm run start:dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Environment Variables (Backend `.env`)

Create a `.env` file in the `backend/` directory with the following variables for local development:

```env
DATABASE_URL="postgresql://<YOUR_POSTGRES_USER>:<YOUR_POSTGRES_PASSWORD>@localhost:5432/payflowx"
JWT_SECRET="your_super_secret_jwt_key_here"
JWT_EXPIRES_IN=3600
PORT=3001
```

---

## 🧪 Testing the APIs (Swagger)

You do not need to run the frontend to test the core backend logic. The entire API is documented and interactive via Swagger UI.

1. Start the backend server (`npm run start:dev`).
2. Navigate to `http://localhost:3001/api` (or view the [Live Swagger Docs](https://payflowx-backend.onrender.com/api)).
3. Use the `/auth/login` endpoint to generate a JWT token.
4. Click **"Authorize"** at the top of the Swagger UI and paste the token to test protected payment routes.

---

## ⚠️ Known Limitations

* **Authentication** is simplified (email-only login)
* No **external payment gateway integration** (logic simulated)
* **Settlement job** is manually triggered for demo purposes
* **Message queues** are discussed but not implemented

These choices are intentional to focus on **system design and correctness**.

---

## 🏗️ Production Considerations

In a **production system**:

* Settlement would be triggered via **scheduled background workers** (cron jobs)
* Authentication would integrate with an **identity provider** (Auth0, Cognito)
* **Rate limiting** would be migrated from In-Memory to a centralized **Redis** cache for multi-server horizontal scaling
* **Message queues** (Kafka/RabbitMQ) could decouple settlement processing further

---

## � Key Takeaways & Core Competencies

This project demonstrates:

* **Strong domain modeling**
* **Correct handling of retries and failures**
* **Clear separation of concerns**
* **Practical understanding of financial systems**
* **Ability to reason about scale and correctness**

---

*Built with ❤️ by Kashinath Kesale*

---
