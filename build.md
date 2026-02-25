# UrbanSmart Payment Switch - Build & Deployment Guide

This document outlines the steps required to initialize, build, and deploy the UrbanSmart Payment Switch platform.

## Prerequisites
Before you begin, ensure you have the following installed on your system:
*   **Node.js**: v20 or newer (LTS recommended)
*   **npm**: v10 or newer (comes with Node.js)
*   **Git**: For version control
*   **SQLite**: Handled locally for development. Note: For production, a PostgreSQL database is required.

---

## Local Development Setup

### 1. Clone the Repository
If you haven't already, clone the project repository to your local machine:
```bash
git clone <repository-url>
cd <repository-directory>/frontend
```

### 2. Install Dependencies
Install all required Node modules using npm:
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root of the `frontend` directory. You will need the following baseline variables:
```env
# Database connection string (SQLite used for local development)
DATABASE_URL="file:./dev.db"

# Public URL of the running switch (for callbacks)
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Yoco Gateway Credentials (Test/Live)
NEXT_PUBLIC_YOCO_PUBLIC_KEY="pk_test_XXX"
YOCO_SECRET_KEY="sk_test_XXX"

# Webhook Secret (used for HMAC signing payloads to merchants)
WEBHOOK_SECRET="your_secure_random_string"
```

### 4. Database Initialization
The platform uses Prisma ORM. To set up the initial SQLite database schema and generate the Prisma Client, run:
```bash
# Push the schema changes directly into the dev.db file
npx prisma db push

# Generate the TypeScript definitions for the database models
npx prisma generate
```

### 5. Seed the Database (Optional but Recommended)
To populate the database with a test Merchant Store, mock System Configurations, and initial dummy transactions, run the Prisma seeder:
```bash
npx prisma db seed
```
*(Note: Ensure your `package.json` contains the `"seed": "tsx prisma/seed.ts"` under the `"prisma"` block).*

### 6. Start the Development Server
Launch the Next.js development server:
```bash
npm run dev
```
The application will be accessible at: `http://localhost:3000`

---

## Production Build & Deployment

### 1. Production Database Setup
For production deployments (e.g., matching a VPS or Vercel/Render architecture), you **must** swap SQLite for PostgreSQL.
1. Update your `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
2. Update your `.env` to point to the live PostgreSQL URL:
   ```env
   DATABASE_URL="postgresql://user:password@host:port/dbname?schema=public"
   ```
3. Run migrations instead of `db push` for safe schema evolution:
   ```bash
   npx prisma migrate deploy
   ```

### 2. Build the Next.js Application
Create an optimized production build:
```bash
npm run build
```
This command compiles the React code, optimizes assets, and readies the serverless API endpoints.

### 3. Start the Production Server
Start the Next.js instance in production mode:
```bash
npm start
```

---

## Important Scripts Overview

*   `npm run dev`: Starts the local development environment with Hot Module Replacement (HMR).
*   `npm run build`: Compiles the application for production deployment.
*   `npm start`: Runs the compiled production build.
*   `npm run lint`: Executes Next.js ESLint rules to enforce code quality.
*   `npx prisma studio`: Launches a visual interface inside the browser (usually at `http://localhost:5555`) to directly view/edit records in the database.

## Testing Failover & Reconciliation
If you are developing locally and want to test the resilience engines (Circuit Breaker / Routing):
1. **Testing Routing Failover**: Intentionally change `YOCO_SECRET_KEY` in `.env` to an invalid string and restart the server. Hit `http://localhost:3000/payment` via an API REST client; observe the transaction rerouting to `NORTH` in the logs.
2. **Testing Reconciliation**: Execute `node scripts/testReconciliation.cjs` to fire mock settlements into the `/api/reconciliation/ingest` engine, then check the Dashboard UI for the results.
