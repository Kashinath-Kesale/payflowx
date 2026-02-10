---

# 💸 PayFlowX — Payment Processing, Settlement & Reconciliation System

> **A backend-heavy, full-stack financial system that models real-world payment flows with correctness, reliability, and auditability as first-class concerns.**

PayFlowX simulates the **end-to-end lifecycle of digital payments** — from payment initiation to asynchronous settlement and final reconciliation.
The system is designed to highlight **financial correctness**, **failure safety**, and **clear separation of responsibilities**, which are critical in real payment platforms.

---

## 🚀 Tech Stack

### Backend

* **Framework**: NestJS (modular, opinionated architecture)
* **Language**: TypeScript (strict typing)
* **Database**: PostgreSQL
* **ORM**: Prisma (type-safe DB access)
* **Authentication**: JWT (Passport strategy)
* **Logging**: Structured logging via custom `AppLogger`

### Frontend

* **Framework**: Next.js 14 (App Router)
* **Styling**: Tailwind CSS
* **State Handling**: React Hooks
* **Data Fetching**: Native Fetch API
* **Auth Handling**: JWT-based protected routes

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

* **Users** — system users
* **Merchants** — payment receivers (validated before processing)
* **Payments**

  * Linked to User & Merchant
  * Contains `idempotencyKey` (unique constraint)
  * Immutable after terminal state
* **Settlements**

  * One-to-one relationship with Payments
  * Created asynchronously
* **Reconciliation Results**

  * Derived by comparing Payments and Settlements

### Design Rationale

* Separation of tables mirrors real payment systems
* Prevents mixing real-time operations with batch processes
* Improves auditability and reasoning

---

## 🔁 Idempotency Strategy

* Idempotency is enforced at the **database level**
* Ensures:

  * Safe retries
  * No duplicate records
  * Consistent responses under network failures

This mirrors real-world payment gateway behavior.

---

## ⚛️ Transaction & Atomicity Handling

* Critical operations are wrapped in `prisma.$transaction`
* Guarantees:

  * Atomic writes
  * No partial state persistence
  * Strong consistency during payment processing

---

## 🛡️ Failure Handling & Observability

* All failures are explicitly captured
* `FAILED` records include a `failureReason`
* Structured logs record:

  * Payment lifecycle events
  * Settlement attempts
  * Reconciliation outcomes

This enables debugging and auditing without manual DB inspection.

---

## ⚖️ Settlement & Reconciliation

### Settlement

* Executed asynchronously via a backend job
* Scans successful payments
* Creates settlement records independently

### Reconciliation

* A read-only audit process
* Compares:

  * Payment amount & currency
  * Settlement amount & currency
* Produces:

  * `MATCHED`
  * `MISMATCHED` (with reason)

This models real-world accounting verification flows.

---

## ⚡ Performance & Indexing

* Indexes applied on frequently queried fields:

  * `userId`
  * `merchantId`
  * `status`
  * `idempotencyKey`
* Ensures fast dashboard queries and scalable reads

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

* Authentication is simplified (email-only login)
* No external payment gateway integration (logic simulated)
* Settlement job is manually triggered for demo purposes
* Rate limiting and queues are discussed but not implemented

These choices are intentional to focus on **system design and correctness**.

---

## 🏗️ Production Considerations

In a production system:

* Settlement would be triggered via scheduled background workers
* Authentication would integrate with an identity provider
* Rate limiting would be enforced at the API gateway
* Message queues could decouple settlement processing further

---

## 🎯 Interview Highlights

This project demonstrates:

* Strong domain modeling
* Correct handling of retries and failures
* Clear separation of concerns
* Practical understanding of financial systems
* Ability to reason about scale and correctness

---

*Built with ❤️ by Kashinath Kesale*

---
