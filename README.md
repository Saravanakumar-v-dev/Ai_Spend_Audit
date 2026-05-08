# AI Spend Audit

A Next.js 15 web application designed to help startups analyze their AI tool subscriptions, discover where they are overspending, and generate actionable savings reports.

## Architecture

This project is built using:
- **Next.js 15 (App Router)**: Fast Server Components and API Routes.
- **Tailwind CSS v4**: Utility-first styling with modern features.
- **Supabase**: PostgreSQL database with Row Level Security (RLS) for data persistence.
- **Zod**: Shared schema validation between the client and API.
- **Vitest**: Lightning-fast unit testing for engine accuracy.

## Engineering Decisions

### 1. Database & Security (Supabase / Postgres)
We chose Supabase (PostgreSQL) for lead storage due to its robust Row Level Security (RLS) policies. By enforcing RLS on the `leads` table, we ensure that the public Next.js client cannot directly read or write arbitrary data. Instead, data is inserted exclusively via the `/api/audit` Next.js server route using a secure `service_role` key. 

### 2. Form Persistence
To prevent users from losing their progress if they accidentally refresh or navigate away from the multi-step form, a custom `useLocalStorage` React hook was implemented. This hook safely syncs the form state with the browser's `localStorage` while circumventing SSR hydration mismatch errors.

### 3. Data Flow & Lead Capture Structure
We deliberately structured the database schema to capture the raw `input_data` (a JSONB payload of all tool inputs, seats, and usage estimates) rather than only saving the calculated result. 

**Why?** Saving the raw input JSON is better for future audit re-runs. If pricing changes or the calculation engine algorithms are updated next month, we can retroactively re-run historical lead data against the new engine to discover new upsell or savings opportunities without asking the customer to re-enter their stack. Additionally, we explicitly capture `total_savings` and flag `is_high_savings` (savings > $500/mo) at the database level to optimize querying for our sales team to instantly identify high-value prospects.

### 4. Defensible Audit Engine Math
The `calculateAudit` engine was designed strictly around real-world verified pricing limits and rules (e.g., catching "Overkill" usage where small teams purchase Enterprise tiers). This ensures that if a startup's finance team reviews the generated report, the math and rationale completely align with standard procurement logic.

## Setup

```bash
npm install
npm run dev
```

Run tests:
```bash
npm run test
```
