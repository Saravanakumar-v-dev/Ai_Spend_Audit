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

## Day 3
- Migrated deterministic Engine pricing architecture to native INR.
- Added Copilot, ChatGPT, and API metrics directly to the Tool Selector UI.
- Validated form integration to submit via `POST /api/leads` and redirect automatically.

## Day 4 2026-05-09
Hours worked: 6
What I did: Finalized the deterministic financial logic engine, built the Results UI with the mandatory 'Honesty Filter', and wrote 5 rigorous automated test cases.
What I learned: I realized that writing deterministic tests for financial logic requires abandoning flexible rounding and tying exact expectations to the defined conversion rates. Handling UI states for edge cases like $0 savings fundamentally shifts the application from a raw "calculator" into a trust-building sales tool.
Blockers / what I'm stuck on: Currently stuck on formatting the Hero section to look good on both mobile and desktop. Tailwind grid rules are colliding with padding variables on iPhone viewports.
Plan for tomorrow: Integrate the Anthropic API for personalized AI summaries and build the public-facing shareable URLs.

## Day 5 2026-05-10
Hours worked: 5
What I did: Implemented the AI summary generation with Anthropic Claude Sonnet 4, the dynamic /share route with PII stripping, and injected dynamic Open Graph tags for social sharing. Built the PROMPTS.md rubric file and applied three targeted Lighthouse optimisations (font-display swap, aria-labelledby, semantic nav landmarks).
What I learned: Next.js App Router `generateMetadata` runs as a separate server invocation from the page component, meaning the audit engine is called twice — once for metadata and once for rendering. I cached this by keeping the payload decode logic shared. I also discovered that `console.error` inside a Server Component triggers the Next.js dev overlay as a full-screen error, unlike `console.log` which stays in the terminal — a critical distinction when writing graceful fallbacks.
Blockers / what I'm stuck on: The OG image preview renders correctly on LinkedIn and Slack but Twitter/X card validator shows a blank preview because we have not yet generated a static OG image via `next/og` ImageResponse. The text-only card works fine but the visual is missing.
Plan for tomorrow: Shift entirely to the entrepreneurial files: GTM, Economics, and Landing Copy.

## Day 6 2026-05-11
Hours worked: 5
What I did: Shifted entirely to business logic. Finalized unit economics with full funnel math (1,450 monthly visitors → 5 customers/month → Rs 1 Crore ARR in 18 months), wrote the GTM strategy targeting seed-stage VPEs in AI-native startups with a $0-budget first-100-users hustle plan, synthesized my 3 user interviews into structured product insights, defined product metrics with a North Star (Total Rupee Value of Wasted Spend Surfaced) and concrete pivot triggers, and drafted landing page copy including a 5-question FAQ addressing CTO skepticism. Also fixed two critical bugs in audit-engine.ts: API tools were calculating Rs 0 because the engine required explicit token estimates (added moderate-usage fallback), and overlap detection was flagging redundancies but never actually reducing the optimized cost.
What I learned: B2B lead-gen CAC math is deceptively simple when channels are organic, but the real constraint is time-to-close. My funnel shows Rs 0 monetary CAC, but when I imputed my own time at Rs 1,000/hr, the effective CAC per converted lead is ~Rs 2,500. This means the bottleneck is not "can we afford to acquire leads" but "can we close 5 consultations per month from 20 bookings with a 25% close rate." The entire business model hinges on that consultation-to-close conversion, not on traffic volume. Every hour I spend making the audit report more trustworthy (transparent pricing sources, honesty filter) directly improves that close rate.
Blockers / what I'm stuck on: I cannot accurately estimate Credex's LTV without access to internal contract data. My Rs 1,20,000 LTV estimate is built on reasonable assumptions (Rs 75,000 engagement + 8% margin on Rs 6,00,000 annual spend, 18-month retention), but the actual margin on cloud credits brokerage could range from 5% to 15%. A 3× variance on the credits margin swings the LTV from Rs 93,000 to Rs 1,83,000, which materially changes the Rs 1 Crore ARR timeline. I flagged this as an open assumption in ECONOMICS.md.
Plan for tomorrow: Final pre-flight compliance check, Lighthouse optimizations, and submitting the repo.
