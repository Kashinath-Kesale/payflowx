
# 💸 PayFlowX - Payment Reconciliation System

> **A robust, full-stack payment reconciliation platform built with modern web technologies.**

PayFlowX is a financial dashboard designed to simulate and manage the lifecycle of digital payments, from initiation to settlement and final reconciliation. It ensures data integrity between payment gateways and bank settlements, highlighting discrepancies for manual review.

---

## 🚀 Tech Stack

### **Backend** (Robust & Scalable)
-   **Framework**: [NestJS](https://nestjs.com/) (Modular, rigid architecture)
-   **Language**: TypeScript (End-to-end type safety)
-   **Database**: PostgreSQL
-   **ORM**: Prisma (Type-safe database access)
-   **Authentication**: JWT (JSON Web Tokens) with Passport strategy
-   **Logging**: Custom AppLogger for structured logging

### **Frontend** (Responsive & Interactive)
-   **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
-   **Styling**: Tailwind CSS (Utility-first design)
-   **State Management**: React Context & Hooks
-   **Data Fetching**: Native Fetch API with typed responses

---

## 🧠 Technical Deep Dive (Architecture & Design)

This project implements several advanced backend patterns to ensure reliability and correctness, which are critical in financial systems.

### 1. **Problem Definition & Scope Lock** 🎯
The core problem is **Data Consistency**. Financial systems often face "split-brain" scenarios where a payment gateway says "Success" but the bank says "Pending" or "Failed". PayFlowX acts as the source of truth by reconciling these two asynchronous streams of data.

### 2. **Payment Flow Design** �
The payment lifecycle is strictly defined:
1.  **Initiation**: Client requests a payment.
2.  **Idempotency Check**: Server checks if this request has already been processed.
3.  **Validation**: Merchant status and user limits are validated.
4.  **Processing**: Payment is recorded as `INITIATED`.
5.  **Finalization**: Status updates to `SUCCESS` or `FAILED` based on gateway response (simulated).

### 3. **Database Schema Design** 🗄️
The schema (`schema.prisma`) is normalized to 3NF where possible:
-   **Users/Merchants**: Core entities.
-   **Payments**: Linked to User and Merchant. Contains `idempotencyKey` (Unique).
-   **Settlements**: One-to-One relation with Payments. Separated to mimic real-world asynchronous bank feeds.

### 4. **Idempotency Strategy** 🔁
To prevent double-charging (e.g., user clicks "Pay" twice), every payment request requires a unique `idempotencyKey`.
-   **Implementation**: Before creating a payment, the `PaymentsService` checks `prisma.payment.findUnique({ where: { idempotencyKey } })`.
-   **Result**: If found, the existing payment object is returned immediately without re-processing, ensuring safe retries.

### 5. **Transaction State Machine** 🚦
Payments follow a rigid state machine enforced by the `PaymentStatus` enum:
-   `INITIATED`: Created but not finalized.
-   `SUCCESS`: Verified and capture confirmed.
-   `FAILED`: Error occurred (insufficient funds, system error).
*Transitions are strictly controlled within the `PaymentsService`.*

### 6. **Database Transaction Handling** ⚛️
Financial operations must be atomic.
-   **Implementation**: used `prisma.$transaction`.
-   **Logic**: The creation of the `INITIATED` record and the subsequent update to `SUCCESS`/`FAILED` happen within a managed transaction scope to ensure data integrity.

### 7. **Failure & Retry Handling** 🛡️
-   **Graceful Failures**: All external calls (simulated) are wrapped in `try-catch` blocks.
-   **Status Updates**: If a process fails, the entity is explicitly marked `FAILED` with a `failureReason` stored in the database for auditing.

### 8. **Settlement & Reconciliation Logic** ⚖️
-   **Settlement**: An async background process (`SettlementsService`) scans for `SUCCESS` payments and creates settlement records.
-   **Reconciliation**: A separate audit process compares `Payment.amount` vs `Settlement.amount`. Mismatches (e.g., fee deductions) are flagged as `MISMATCHED` in the dashboard.

### 9. **Indexing & Performance Optimization** ⚡
-   **Indexes**: Added `@@index` on high-cardinality fields like `userId`, `merchantId`, and `status` in the `Payment` model to speed up dashboard filtering and reporting queries.

---

## 🛠️ Setup & Running

1.  **Clone the repository**
2.  **Install Dependencies**:
    ```bash
    npm install
    ```
3.  **Setup Environment**:
    -   Configure `.env` with `DATABASE_URL` and `JWT_SECRET`.
4.  **Database Seeding**:
    The project includes a seed script to populate initial users, merchants, and transactions.
    ```bash
    npx prisma db seed
    ```
5.  **Run Backend**:
    ```bash
    cd backend
    npx prisma migrate dev
    npm run start:dev
    ```
6.  **Run Frontend**:
    ```bash
    cd frontend
    npm run dev
    ```

---

<<<<<<< HEAD
=======
## 🧪 Technical Highlights 
-   **Separation of Concerns**: Strict boundary between "Payment Ingestion" and "Reconciliation Logic".
-   **Error Handling**: Centralized error handling and detailed logging for debugging production issues.
-   **Type Safety**: Shared DTOs (implied) and strict TypeScript configuration to prevent runtime errors.
-   **Data Integrity**: The reconciliation logic is designed to be the "source of truth", catching edge cases like dropped webhooks or failed settlement jobs.

---

>>>>>>> f84c9d28a1b112cd854b5be18949421119458bc4
*Built with ❤️ by Kashinath Kesale*
