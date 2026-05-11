# User Interviews — AI Spend Audit Discovery

> **Conducted:** May 2026  
> **Interviewer:** Saravanakumar  
> **Method:** 20–30 minute semi-structured calls using the [User Interview Guide](./USER_INTERVIEW_GUIDE.md)  
> **Note:** Interviewee names are anonymized to initials. Companies are described by stage and team size only.

---

## Interview #1 — R.K., CTO, Seed-Stage AI Startup (12 engineers)

**AI Tools Used:** Cursor Pro, Claude Pro, Anthropic API, ChatGPT Plus (3 seats)  
**Estimated Monthly AI Spend:** Rs 55,000–65,000  

### Key Quotes

> "Honestly? I had to check three different credit card statements to answer your question about total spend. Two tools are on my personal card from when we were pre-funding."

> "We're paying for Claude Pro AND the Anthropic API. I know that sounds dumb. The engineers use the API for production and Claude for thinking through architecture. It feels wasteful but nobody wants to give up either."

> "If your tool told me I could save Rs 15,000 a month, I'd share it with my co-founder in about 30 seconds. That's a junior developer's monthly stipend."

### Most Surprising Thing

R.K. did not know that Cursor Pro includes Claude Sonnet via "Auto" mode — meaning the team is double-paying for Claude access through both Cursor and a standalone Claude Pro subscription. When I pointed this out, he said: *"Wait — seriously? That alone would save us Rs 1,887 per person."* This was not a cost he was ignoring; he simply **didn't know about the overlap.**

### What This Changed in My Product

This interview directly led to the **overlap detection engine** in `audit-engine.ts`. The `detectOverlaps()` function now flags when a user selects both an IDE assistant (Cursor, Copilot) and a standalone chatbot (Claude, ChatGPT) in the same audit, with a specific recommendation to consolidate. Without this interview, I would have treated each tool in isolation.

---

## Interview #2 — P.S., VP Engineering, Series A Fintech (38 engineers)

**AI Tools Used:** GitHub Copilot Business (38 seats), ChatGPT Business (12 seats), OpenAI API, Claude Team Standard (5 seats)  
**Estimated Monthly AI Spend:** Rs 1,50,000+  

### Key Quotes

> "I can tell you our AWS bill to the penny. Our AI tool spend? No idea. It's scattered across three cost centers and nobody owns it."

> "The thing that would make me trust your tool is if you showed me exactly where the price came from. Like, link me to the pricing page. Don't just say 'you could save 20%' — show me the math."

> "We have 38 Copilot Business seats but our GitHub analytics show only 22 engineers used it in the last 30 days. That's 16 wasted seats at $19 each — I just never looked."

### Most Surprising Thing

P.S. revealed that his company pays for **ChatGPT Business for only 12 of 38 engineers** — the rest use personal ChatGPT Plus accounts and expense them. This creates a nightmare for the finance team: some charges appear on the corporate card, others appear as individual reimbursements, and nobody has a single view of the total. He called it *"the shadow AI budget."*

### What This Changed in My Product

Two direct impacts:

1. **The "Shadow Bill" GTM messaging** in `GTM.md` came directly from P.S.'s quote. The phrase "shadow AI budget" became our wedge positioning.
2. **The transparency requirement** shaped the audit report UI. Each tool result in `/audit/[id]/page.tsx` now shows the `reasoning` field — a plain-English explanation of why the engine recommends a change, with the exact pricing math visible. I added this because P.S. said he would not trust a tool that just said "save 20%" without showing the source.

---

## Interview #3 — A.M., Technical Co-Founder, Pre-Seed DevTools Startup (4 engineers)

**AI Tools Used:** Cursor Teams, Claude Pro (personal), Anthropic API  
**Estimated Monthly AI Spend:** Rs 25,000–30,000  

### Key Quotes

> "We're four people. I put everyone on Cursor Teams because I thought we needed the admin dashboard. Turns out I've never opened it once."

> "Rs 25,000 a month on AI tools for a 4-person team feels insane when I say it out loud. That's Rs 3 lakh a year. We haven't even launched yet."

> "I'd share the audit publicly on LinkedIn if it made us look like we're being smart about spending. Founders love flex posts about being capital-efficient."

### Most Surprising Thing

A.M. is paying for **Cursor Teams at Rs 3,775/seat/month for 4 engineers**, when Cursor Pro at Rs 1,887/seat would give each engineer the same coding functionality. The only feature Teams adds is the admin dashboard and RBAC — which A.M. admitted he has "never opened." That's Rs 7,552/month in pure waste on a 4-person team, or Rs 90,624/year.

### What This Changed in My Product

This interview validated the **"Overkill" detection rule** in the audit engine. The logic at line ~198 of `audit-engine.ts` now checks: if `teamSize <= 2` and the user is on a Teams/Business/Enterprise plan, the engine automatically recommends the individual/Pro tier equivalent. A.M.'s scenario (small team, enterprise plan, zero admin usage) is exactly the case this rule catches.

It also influenced the **shareability design** — A.M.'s willingness to share publicly (as a "capital efficiency flex") confirmed that the `/share/[id]` route with PII stripping and OG meta tags would drive organic virality among founders.

---

## Cross-Interview Synthesis

| Theme | R.K. (Seed, 12 eng) | P.S. (Series A, 38 eng) | A.M. (Pre-seed, 4 eng) | Pattern |
|:------|:---------------------|:------------------------|:------------------------|:--------|
| Knows full tool inventory | ❌ Missed overlap | ❌ Scattered billing | ⚠️ Knew tools, not total cost | **Universal blind spot** |
| Tracks AI spend | ❌ 3 credit cards | ❌ 3 cost centers | ❌ Founder's personal card | **Nobody tracks this** |
| Surprised by a bill | ✅ Double-paying Claude | ✅ 16 unused Copilot seats | ✅ Rs 3L/year pre-launch | **100% pain confirmation** |
| Would trust automated audit | ✅ If numbers are sourced | ✅ Must show pricing links | ✅ Yes, immediately | **Transparency = trust** |
| Would share publicly | ⚠️ Internally only | ❌ Too sensitive | ✅ LinkedIn flex | **Mixed — need PII stripping** |
| Top "magic wand" wish | "Which tools overlap" | "Utilization per seat" | "Am I overpaying per person" | **Spend visibility** |
