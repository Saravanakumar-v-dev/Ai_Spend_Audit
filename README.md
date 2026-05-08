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

### 1. Form Persistence: `localStorage` vs. Cookies
I chose to use a custom `useLocalStorage` React hook for form persistence rather than HTTP-only cookies. While cookies are superior for secure authentication states, the AI Spend Audit form state is non-sensitive, transient input data. Using `localStorage` avoids unnecessary payload weight on every HTTP request back to the server. Furthermore, the custom hook handles hydration safely on the client without forcing the Next.js App Router to abandon static rendering/SSR benefits.

### 2. Database Choice: Supabase vs. Custom Postgres Container
I selected Supabase over deploying a custom PostgreSQL Docker container. For an MVP focusing on rapid validation, setting up Docker, managing volumes, configuring pg_hba.conf, and writing a custom Express/Nest backend adds days of operational overhead. Supabase provides an instant, production-grade Postgres instance with built-in Row Level Security (RLS) policies, allowing our Next.js API routes to insert leads securely via a service_role key without exposing the database to the client.

### 3. Abuse Protection: Honeypot vs. hCaptcha
To prevent spam bot submissions, I implemented a visually hidden "honeypot" field instead of integrating an active challenge like hCaptcha. The goal of this tool is high-conversion lead generation; adding a CAPTCHA introduces significant user friction that decreases conversion rates. A honeypot silently traps the majority of automated scrapers without taxing the actual human founders filling out the form.

## Setup

```bash
npm install
npm run dev
```

Run tests:
```bash
npm run test
```
