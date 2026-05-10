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
