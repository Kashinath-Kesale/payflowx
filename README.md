
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
*   🔴 **Cache & Locks**: Redis (`ioredis` client)
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

## ⚛️ Transaction & Atomicity Handling

All financial operations must be **Atomic** to ensure data integrity.

*   **Implementation**: Critical flows utilize `prisma.$transaction`.
*   **Logic**: The creation of the `INITIATED` record and the subsequent update to `SUCCESS`/`FAILED` happen within a **single managed transaction** scope.
*   **Benefit**: Ensures consistency - partial or contradictory payment states are never persisted.

---

## 🔴 Redis Integration Layer (Caching & Concurrency Control)

To improve system performance, prevent race-condition double-charges, and reduce PostgreSQL query load, a centralized Redis layer is integrated:

*   🔒 **Distributed Idempotency Lock**: 
    *   **Locking**: Uses the atomic `NX` (Not Exists) command to acquire a lock (`payment:lock:{idempotencyKey}`) for **30 seconds**, immediately blocking duplicate concurrent requests with an HTTP `409 Conflict`.
    *   **Fast Return**: Caches finalized payment results (`payment:result:{key}`) for **24 hours**. Subsequent retries are resolved instantly (< 1ms) from Redis, avoiding redundant database transactions.
*   🚦 **Centralized Rate Limiting**: Migrated global rate limits (10 requests/minute) to Redis via `@nest-lab/throttler-storage-redis`. This ensures consistent and synchronized enforcement across horizontally-scaled application servers.
*   ⚡ **Cache-Aside Strategy**:
    *   **Merchant Metadata**: Caches active merchant profiles (`merchant:{id}`) for **5 minutes** to optimize checkout verification pipelines.
    *   **Dashboard Statistics**: Caches user payment stats (`user:stats:{userId}`) for **60 seconds** to guarantee rapid frontend dashboard loads.
*   🛡️ **Resiliency & Graceful Degradation**: All Redis operations execute within exception-handling wrappers. If Redis goes offline, the backend logs a warning and automatically falls back to PostgreSQL queries and DB constraints, ensuring zero downtime.

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

### 1. Run Redis via Docker

Spin up a lightweight Redis instance locally using Docker:
```bash
docker run -d --name payflowx-redis -p 6379:6379 redis:7-alpine
```

### 2. Backend Setup

```bash
cd backend
npm install
npx prisma migrate dev
npm run start:dev
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### Environment Variables (Backend `.env`)

Create a `.env` file in the `backend/` directory with the following variables for local development:

```env
DATABASE_URL="postgresql://<YOUR_POSTGRES_USER>:<YOUR_POSTGRES_PASSWORD>@localhost:5432/payflowx"
REDIS_URL="redis://localhost:6379"
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
* **Message queues** (Kafka/RabbitMQ) could decouple settlement processing further

---

## 🎯 Key Takeaways & Core Competencies

This project demonstrates:

* **Strong domain modeling**
* **Distributed locking & caching strategies** using Redis
* **Graceful degradation and fail-safe coding patterns**
* **Correct handling of retries, race conditions, and failures**
* **Clear separation of concerns**
* **Practical understanding of financial systems and scalability**

---

*Built with ❤️ by Kashinath Kesale*

---
