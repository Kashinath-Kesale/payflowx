
# 💸 PayFlowX — Payment Processing, Settlement & Reconciliation System

> **A backend-heavy, full-stack financial system that models real-world payment flows with correctness, reliability, and auditability as first-class concerns.**

PayFlowX simulates the **end-to-end lifecycle of digital payments** — from payment initiation to asynchronous settlement and final reconciliation.
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

* `INITIATED` — payment intent recorded
* `SUCCESS` — payment confirmed
* `FAILED` — error occurred (with failure reason)

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
*   **Benefit**: Ensures consistency — partial or contradictory payment states are never persisted.

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

### Design Choice

* Frontend **never triggers settlements**
* All financial processing remains backend-controlled
* UI only reflects system state

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

### Environment Variables

```env
DATABASE_URL=postgresql://...
JWT_SECRET=your_secret
```

---

## ⚠️ Known Limitations

* **Authentication** is simplified (email-only login)
* No **external payment gateway integration** (logic simulated)
* **Settlement job** is manually triggered for demo purposes
* **Rate limiting** and **queues** are discussed but not implemented

These choices are intentional to focus on **system design and correctness**.

---

## 🏗️ Production Considerations

In a **production system**:

* Settlement would be triggered via **scheduled background workers** (cron jobs)
* Authentication would integrate with an **identity provider** (Auth0, Cognito)
* **Rate limiting** would be enforced at the API gateway level
* **Message queues** (Kafka/RabbitMQ) could decouple settlement processing further

---

## 🎯 Interview Highlights

This project demonstrates:

* **Strong domain modeling**
* **Correct handling of retries and failures**
* **Clear separation of concerns**
* **Practical understanding of financial systems**
* **Ability to reason about scale and correctness**

---

*Built with ❤️ by Kashinath Kesale*

---
