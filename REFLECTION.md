# Reflection — AI Spend Audit

## Q1: What was the hardest technical challenge you faced this week, and how did you solve it?

The hardest challenge was making the audit engine produce non-zero savings for API-based tools (OpenAI API, Anthropic API). On Day 4, after wiring the full form-to-report pipeline, I noticed that selecting "Anthropic API" produced a report showing Rs 0 current spend and Rs 0 savings. The tool was technically "working" — no errors, no crashes — but the output was wrong.

My first hypothesis was a frontend bug: maybe the form wasn't sending the tool slug correctly. I added `console.log(formData)` before submission and confirmed the payload was correct — `toolSlug: "api_anthropic_sonnet"`, `planName: "api_usage"`. So the data was reaching the engine.

My second hypothesis was a pricing lookup failure. I checked `API_PRICING["api_anthropic_sonnet"]` and it returned valid per-million-token rates. The pricing data was fine.

The actual bug was subtle: the engine calculated API costs using `tool.estimatedMonthlyTokens.inputTokens` and `tool.estimatedMonthlyTokens.outputTokens`, but the frontend never sent these fields for API tools — they were `undefined`. The cost formula `(undefined / 1_000_000) * rate` evaluated to `NaN`, which `roundCurrency` then converted to `0`. I wrote a standalone `test.ts` script that called `calculateAudit` directly with API tools and confirmed the NaN propagation. The fix was a "moderate usage" fallback: if no token estimates are provided, default to 10M input / 2M output tokens — a reasonable assumption for a mid-stage startup's API usage. I validated this by checking that the resulting monthly cost (~Rs 5,662 for Anthropic Sonnet) matched my manual calculation from the pricing table. The test now asserts `toBeCloseTo(5190.4, 2)` for OpenAI, pinning the exact expected value.

---

## Q2: What would you do differently if you started over?

If I restarted, I would build the engine with a proper plugin architecture from Day 1 instead of a single monolithic `calculateAudit` function. Currently, all 9 optimization rules (small-team overkill, enterprise negotiation, annual billing, unused seats, API right-sizing, cross-category alternatives, ChatGPT Pro catch, and both overlap detections) live in one 300-line function with nested `if` blocks. Adding a 10th rule requires reading the entire function to understand the interaction order.

A better design would be a pipeline of independent "rule" functions, each receiving the current `ToolAuditResult` and returning a modified version. Each rule would be its own file with its own test. The orchestrator would simply `reduce` the tool through the pipeline: `rules.reduce((result, rule) => rule(result, context), initialResult)`. This would make rules composable, testable in isolation, and allow users or admins to enable/disable specific rules via configuration.

I would also skip the Supabase integration entirely for the MVP. I spent most of Day 2 configuring Row Level Security policies, service role keys, and connection pooling — none of which is used in the final deployed product because the stateless URL encoding approach eliminated the need for database reads. That time would have been better spent on the billing cycle toggle and active users input, which I only added on Day 7.

---

## Q3: How would you scale this to handle 10,000 users per day?

The current architecture already handles moderate scale well because the audit calculation is stateless and CPU-bound — no database reads, no external API calls (the LLM summary is optional). Each Vercel serverless function computes the audit in ~50ms. At 10,000 users/day (~7 requests/minute peak), a single Vercel function instance handles this comfortably.

The first bottleneck at 10K users/day would be the Anthropic API call for the narrative summary. At $3/1K input tokens, 10K calls/day would cost ~$300/day. I would implement two mitigations: (1) cache the AI summary by hashing the `toolResults` array — identical tool stacks produce identical summaries, so a Redis/KV cache with a 24-hour TTL would eliminate 60-70% of duplicate API calls, and (2) move the AI summary to a background job using Vercel's `waitUntil()`, returning the deterministic report immediately and streaming the AI summary via a polling endpoint or Server-Sent Events.

The second bottleneck would be lead storage. Currently stubbed, but at scale I would use Supabase with connection pooling via PgBouncer (already configured in Supabase's infrastructure). The `POST /api/leads` endpoint would batch-insert using `upsert` to handle duplicate emails gracefully. For the share page, I would add Vercel Edge Middleware to cache the ISR-rendered pages at the CDN layer, eliminating redundant renders for viral reports that get shared multiple times.

---

## Q4: How did you use AI tools during this project? What did you trust them with, and what did you not?

I used Claude (via Cursor IDE integration and direct chat) extensively throughout the week. Here is how I partitioned trust:

**What I trusted AI with:** Boilerplate scaffolding (Zod schemas, API route handlers, CSS utility classes), first-draft documentation (ARCHITECTURE.md structure, DEVLOG entry formatting), and exploration of Next.js 15 App Router patterns I hadn't used before (Server Components, `generateMetadata`, `generateStaticParams`). I also used AI to generate the test file structure and suggest edge cases I might have missed.

**What I explicitly did NOT trust AI with:** The pricing data. Every number in `PRICING_DATA.md` was manually verified against each vendor's official pricing page. Claude suggested ChatGPT Pro costs "$100/month" — it actually costs $200/month. If I had accepted that, the entire engine would produce wrong savings calculations and the tool would lose all credibility. I also did not trust AI with the overlap detection logic order. Claude initially generated overlap code that always cancelled the second tool in the array regardless of cost. I rewrote this to sort by `currentMonthlyCost` and keep the cheapest — a business logic decision that required product thinking, not code generation.

**One specific time AI gave me bad advice:** On Day 5, I asked Claude to implement the `/share/[id]` route. It generated code that read the audit from Supabase using the URL ID as a database primary key. This was architecturally wrong — the share page is public, and hitting the database on every share-link click would expose us to denial-of-service via URL enumeration. I rejected the entire approach and instead implemented stateless base64url encoding, where the audit data is embedded in the URL itself. No database, no auth, no attack surface. The AI optimized for the "obvious" solution; I optimized for the secure one.

---

## Q5: Rate yourself (1-10) on the following dimensions.

| Dimension | Rating | Justification |
|:----------|:-------|:--------------|
| **Discipline** | 7/10 | I shipped every day for 7 days and maintained a structured DEVLOG, but I spent too long on Supabase integration (Day 2) that I ultimately didn't need, and my Days 1-3 logs were informal until I retroactively structured them. |
| **Code Quality** | 8/10 | The audit engine has 13 passing tests, deterministic math with no floating-point rounding errors, and clear separation between calculation and presentation. I lose points for the monolithic `calculateAudit` function — the 9 rules should be individual, composable pipeline stages. |
| **Design Sense** | 8/10 | The glassmorphism design system, gradient animations, and multi-step form with progress indicator create a premium feel. The honesty filter (suppressing aggressive CTAs for well-optimized stacks) is a product design decision, not just UI. I lose points for the missing OG image preview and the "Coming Soon" chart that persisted until Day 7. |
| **Problem-Solving** | 9/10 | The NaN-to-zero API bug required systematic hypothesis testing. The stateless URL encoding was a creative solution to the database-dependency problem. The smart overlap detection (cost-sorted, not arbitrary) was a non-obvious improvement I identified through my own analysis, not from a prompt. |
| **Entrepreneurial Thinking** | 7/10 | The GTM strategy, unit economics, and user interview synthesis demonstrate founder-level thinking. The North Star metric (Total Rupee Value of Wasted Spend Surfaced) directly ties product usage to business value. I lose points because I cannot validate the LTV assumption without Credex internal data, and I did not build a working email integration — both would be required to actually launch this as a business. |
