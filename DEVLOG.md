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
