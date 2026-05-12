# AI Spend Audit — by Saravanakumar

A free, deterministic audit tool for startups that reveals exactly how much your engineering team overspends on AI subscriptions (Cursor, Copilot, ChatGPT, Claude, and API platforms). It generates a shareable, privacy-safe report with line-item savings — no LLM guesswork on the numbers, no credit card required. Built as a lead-generation engine for Credex AI consulting.

**Target Audience:** Seed-to-Series-A VPs of Engineering, CTOs, and technical founders at AI-native startups with 5–50 engineers who are paying for overlapping AI tools without a procurement strategy.

---

## 🖼️ Screenshots

<!-- Replace these with actual screenshots or a Loom video link -->

| Landing Page | Audit Form | Results Report |
|:------------|:-----------|:---------------|
| ![Landing](screenshots/landing.png) | ![Form](screenshots/form.png) | ![Report](screenshots/report.png) |

> 🎥 **Video Walkthrough:** [Loom link here](#)

---

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- npm 10+

### Install & Run Locally

```bash
git clone https://github.com/Saravanakumar-v-dev/Ai_Spend_Audit.git
cd Ai_Spend_Audit
cp .env.example .env.local   # Add your keys (optional — app works without them)
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Run Tests

```bash
npm run test        # 13 tests covering all 9 optimization rules
```

### Deploy to Vercel

```bash
npx vercel --prod
```

Environment variables to set in Vercel dashboard:
- `ANTHROPIC_API_KEY` — for AI summary generation (optional, has fallback)
- `NEXT_PUBLIC_BASE_URL` — your deployed URL (for OG tags)

---

## 🏗️ Architecture

| Layer | Technology | Why |
|:------|:-----------|:----|
| Framework | Next.js 15 (App Router) | SSR + SSG + API Routes in one deploy |
| Styling | Tailwind CSS v4 | Utility-first, zero runtime cost |
| Validation | Zod | Single source of truth for client + server schemas |
| Database | Supabase (PostgreSQL + RLS) | Instant production-grade DB, no Docker ops |
| AI Summary | Anthropic Claude Sonnet 4 | Narrative report generation with deterministic fallback |
| Testing | Vitest | Sub-second test runs, same Vite transform pipeline |
| CI | GitHub Actions | Auto-runs `vitest run` on every push to `main` |
| Hosting | Vercel | Zero-config Next.js deployment |

> See [ARCHITECTURE.md](ARCHITECTURE.md) for the full system design and data flow diagrams.

---

## 🧠 Key Engineering Decisions

### 1. Hardcoded Rules Over LLM for Core Math
The audit engine uses 9 deterministic rules instead of prompting an LLM to "figure out savings." LLMs hallucinate prices. A user seeing "Rs 3,680/seat" needs to trust that number is real and verifiable. Every price traces back to `PRICING_DATA.md` with a May 2026 reference date. The LLM is only used for the narrative summary paragraph — never for dollar amounts.

### 2. `localStorage` Over Database for Form Draft State
The multi-step form saves progress to `localStorage` via a custom `useLocalStorage` hook, not to Supabase. Rationale: form state is transient, non-sensitive input data. Writing it to a database adds 200ms round-trip latency per keystroke, requires authentication, and creates GDPR cleanup obligations — all for data that lives 2 minutes. The tradeoff is that form state is lost if the user switches browsers, which is acceptable for a 2-minute flow.

### 3. Stateless URL Encoding Over Database Lookups for Reports
Audit reports live at `/audit/{base64url-encoded-payload}` instead of `/audit/{database-id}`. This means the report is fully self-contained in the URL — no database read, no 404s from deleted rows, no migration risk. The tradeoff is longer URLs (~400 chars), but they're never typed manually — only shared via links.

### 4. Honeypot Over CAPTCHA for Anti-Spam
A hidden `website_url` form field catches bots without penalizing real users. CAPTCHAs reduce conversion rates by 10-30% on lead-gen forms. For a tool targeting busy CTOs who will abandon at any friction, the conversion cost of hCaptcha exceeds the spam cost of the honeypot approach.

### 5. Smart Overlap Detection Over Simple Cancellation
When a user has both Cursor and Copilot, the engine now keeps the **cheaper** tool (sorted by actual cost) instead of arbitrarily cancelling the second one in the array. This required passing `toolResults` into `detectOverlaps()` for cost-aware sorting — more complex, but prevents the embarrassing scenario of recommending a user cancel their $20/mo tool while keeping their $100/mo tool.

---

## 📊 Audit Engine — 9 Optimization Rules

| Rule | Trigger | Example |
|:-----|:--------|:--------|
| Small Team Overkill | teamSize ≤ 2 on Teams/Enterprise plan | Cursor Teams → Pro (50% savings) |
| Enterprise Negotiation | Enterprise or Team Premium tier | 20% Credex volume discount |
| ChatGPT Pro Catch | Pro plan ($200/mo) | Downgrade to Plus ($20/mo, 90% savings) |
| Annual Billing | Monthly billing, annual is cheaper | Claude Team: save Rs 2,359/mo on 5 seats |
| Unused Seats | activeUsers < teamSize | 8 unused Copilot seats = Rs 14,344/mo wasted |
| API Right-Sizing | Premium API model | Sonnet → Haiku saves Rs 4,152/mo for routine tasks |
| Cross-Category | IDE includes built-in AI chat | Cursor has Claude — may not need standalone |
| Smart Overlap (IDE) | Using Cursor + Copilot | Keeps cheaper tool, cancels the other |
| Smart Overlap (Chatbot) | Using ChatGPT + Claude | Keeps cheaper tool, cancels the other |

---

## 📁 Project Files

| File | Purpose |
|:-----|:--------|
| [ARCHITECTURE.md](ARCHITECTURE.md) | System design, data flow, component hierarchy |
| [DEVLOG.md](DEVLOG.md) | Daily development log (Days 1-7) |
| [REFLECTION.md](REFLECTION.md) | Technical reflection and self-assessment |
| [TESTS.md](TESTS.md) | Test strategy and coverage report |
| [PRICING_DATA.md](PRICING_DATA.md) | Verified pricing sources for all AI tools |
| [PROMPTS.md](PROMPTS.md) | AI prompts used during development |
| [GTM.md](GTM.md) | Go-to-market strategy |
| [ECONOMICS.md](ECONOMICS.md) | Unit economics and ARR model |
| [USER_INTERVIEWS.md](USER_INTERVIEWS.md) | User research insights |
| [METRICS.md](METRICS.md) | Product metrics and instrumentation plan |
| [LANDING_COPY.md](LANDING_COPY.md) | Marketing copy for landing page |

---

## 📄 License

MIT © 2026 Saravanakumar
