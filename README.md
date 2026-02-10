
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

## 🌟 Key Features Implemented

### 1. **Authentication & Security** 🔐
-   **Secure Login**: Implemented JWT-based authentication.
-   **Protected Routes**: Backend `JwtAuthGuard` ensures only authenticated requests access sensitive financial data.
-   **Password Hashing**: User passwords are securely hashed (bcrypt) before storage.

### 2. **Payment Processing Engine** 💳
-   **Transaction Lifecycle**: simulating the flow of payments from `INITIATED` to `SUCCESS` or `FAILED`.
-   **Database Consistency**: Uses Prisma transactions (implicit where applicable) to ensure data validity.

### 3. **Settlement Management** 🏦
-   **Automated Settlements**: Logic to simulate bank settlement processes for successful payments.
-   **Status Tracking**: Tracks settlement states: `PENDING` -> `SETTLED` or `FAILED`.
-   **Batch Processing**: Endpoint `internal/settlements/process` designed to handle bulk settlement updates.

### 4. **Smart Reconciliation System** ⚖️
-   **Automated Matching**: Compares `Payments` against `Settlements` based on unique IDs, Amounts, and Currencies.
-   **Discrepancy Detection**:
    -   **Missing Settlement**: Identifies payments that claim to be successful but have no corresponding bank settlement.
    -   **Pending Settlements**: Smartly distinguishes between "Missing" (Error) and "Pending" (In Progress) settlements to reduce false alarms.
    -   **Amount Mismatch**: Flags transactions where the payment amount differs from the settled amount (e.g., hidden fees).

### 5. **Interactive Dashboard** 📊
-   **Real-time Insights**: View total volume, reconciliation status, and settlement health.
-   **Drill-down Tables**: Detailed views for Settlements and Reconciliation discrepancies.
-   **User Experience**: Polished UI with loading states, error handling, and responsive navigation.

---

## 🏗️ System Architecture

The project follows a **Microservices-ready Monolith** architecture using NestJS modules:

-   **Auth Module**: Handles user identity and token issuance.
-   **Payments Module**: Core logic for accepting and recording transactions.
-   **Settlements Module**: Asynchronous processing of payment settlements.
-   **Reconciliation Module**: The "Audit" layer that cross-references data between Payments and Settlements to ensure financial accuracy.

---

## 🛠️ Setup & Running

1.  **Clone the repository**
2.  **Install Dependencies**:
    ```bash
    npm install
    ```
3.  **Setup Environment**:
    -   Configure `.env` with `DATABASE_URL` and `JWT_SECRET`.
4.  **Run Backend**:
    ```bash
    cd backend
    request npx prisma migrate dev
    npm run start:dev
    ```
5.  **Run Frontend**:
    ```bash
    cd frontend
    npm run dev
    ```

---

## 🧪 Technical Highlights 
-   **Separation of Concerns**: Strict boundary between "Payment Ingestion" and "Reconciliation Logic".
-   **Error Handling**: Centralized error handling and detailed logging for debugging production issues.
-   **Type Safety**: Shared DTOs (implied) and strict TypeScript configuration to prevent runtime errors.
-   **Data Integrity**: The reconciliation logic is designed to be the "source of truth", catching edge cases like dropped webhooks or failed settlement jobs.

---

*Built with ❤️ by Kashinath Kesale*
