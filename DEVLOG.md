# Development Log — AI Spend Audit

## Day 1
- Defined architecture (Next.js 15, Tailwind 4, Supabase, Vercel)
- Mapped out pricing research requirements for IDEs, Chatbots, APIs, and UI Gen tools
- Drafted user interview script with 7 high-signal questions to uncover pain points and trust requirements
- Scaffolded project structure and initial Next.js application

## Day 2
- Implemented `calculateAudit` engine with hardcoded verified pricing (Cursor, Copilot, Claude, ChatGPT, APIs)
- Engineered rules for detecting "Overkill" usage, enterprise discount scenarios, and alternative tool suggestions
- Implemented client-side persistence in `AuditForm` using `localStorage`
- Authored 5 automated test cases using Vitest and achieved 100% pass rate
- Designed `leads` table schema in Supabase for tracking audit submissions and savings estimates
- Configured GitHub Actions CI pipeline to enforce green builds on push

## Day 3 2026-05-08
Hours worked: 5
What I did: Implemented form state persistence across reloads. Built the backend lead capture API with Supabase, integrated Resend for transactional emails, and added a honeypot for spam protection.
What I learned: Realized that using a `useState` initializer with `localStorage` in Next.js causes severe hydration mismatch errors between the SSR HTML and the client render. I had to build a custom `useLocalStorage` hook that returns the initial state on the first render and syncs the stored value in a `useEffect` to safely bridge the gap.
Blockers / what I'm stuck on: Currently struggling with DNS propagation for Resend. Trying to verify the DKIM and SPF records for the custom domain so the transactional emails stop going directly to the spam folder.
Plan for tomorrow: Build the core deterministic financial logic for the Audit Engine and create the Results Page UI with the required honesty filter.
