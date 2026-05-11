# Unit Economics — AI Spend Audit

> **Author:** Saravanakumar  
> **Date:** 2026-05-11  
> **Status:** Pre-launch Economic Model

---

## Lead Value: What Is a Converted Lead Worth?

A "lead" is a founder/VPE who completes the audit and enters their work email. A "converted lead" is one who books a Credex consultation and purchases cloud credits or an optimization engagement.

**Credex revenue model (estimated):**
- **Cloud credits brokerage:** Credex earns a margin on discounted cloud/AI credits sold to startups. Estimated margin: 8–12% of contract value.
- **Optimization engagement:** One-time FinOps audit + vendor negotiation service. Estimated fee: Rs 50,000–1,50,000 per engagement.

**LTV calculation for a typical converted lead:**

| Component | Value | Reasoning |
|:----------|:------|:----------|
| Average annual AI spend of ICP | Rs 6,00,000 | Rs 50,000/mo across 5 tools for a 10-person team |
| Credex optimization fee (one-time) | Rs 75,000 | Mid-range engagement |
| Cloud credits margin (annual) | Rs 48,000 | 8% margin on Rs 6,00,000 in redirected spend |
| Retention period | 18 months | Startups churn fast, but optimized accounts stick ~1.5 years |
| **Estimated LTV per converted lead** | **Rs 1,47,000** | Rs 75,000 + (Rs 48,000 × 1.5) |

**Conservative adjusted LTV: Rs 1,20,000** (accounting for 20% discount negotiations and delayed payments).

---

## Customer Acquisition Cost (CAC)

The GTM strategy is deliberately zero-spend for the first 90 days. CAC is measured in time, not ad dollars.

| Channel | Cost per Lead | Cost per Converted Lead | Reasoning |
|:--------|:-------------|:----------------------|:----------|
| Slack communities | Rs 0 (time: ~2 hrs/week) | Rs 0 | Organic posts with data hooks. No ad spend. |
| LinkedIn DMs | Rs 0 (time: ~3 hrs/week) | Rs 0 | Personal outreach to ICPs who posted about AI tooling |
| Reddit / HN content | Rs 0 (time: ~4 hrs/post) | Rs 0 | Data-driven posts drive high-intent traffic |
| **Blended CAC (first 90 days)** | **Rs 0 monetary** | **~Rs 2,500 imputed** | Founder's time valued at Rs 1,000/hr, ~2.5 hrs per converted lead |

At scale (month 4+), if we add LinkedIn ads:

| Channel | CPM | CTR | CPC | Leads/click | CAC per lead | CAC per converted lead |
|:--------|:----|:----|:----|:------------|:-------------|:----------------------|
| LinkedIn Sponsored | Rs 600 | 0.8% | Rs 75 | 12% | Rs 625 | Rs 12,500 |

**Target CAC:LTV ratio: 1:10** (Rs 12,500 CAC vs. Rs 1,20,000 LTV). This is healthy for B2B SaaS-adjacent services.

---

## Conversion Funnel

The funnel has 4 stages. Each stage has a target conversion rate derived from B2B lead-gen benchmarks and adjusted for our tool's low-friction UX.

```
Landing Page Visitor
    │
    ▼  (35% start form — low friction, no signup required)
Form Started
    │
    ▼  (75% complete all 3 steps — form takes <60 seconds)
Audit Completed (LEAD CAPTURED — email collected)
    │
    ▼  (7.5% of savings-positive audits book consultation)
Consultation Booked
    │
    ▼  (25% of consultations convert to paid engagement)
Credit Purchase / Optimization Engagement
```

**Working the math:**

| Stage | Volume (per 1,000 visitors) | Conversion Rate |
|:------|:---------------------------|:----------------|
| Visit landing page | 1,000 | — |
| Start audit form | 350 | 35% |
| Complete audit (lead) | 263 | 75% of starters |
| Audit shows >Rs 8,350 savings | 184 | 70% of completed |
| Book consultation | 14 | 7.5% of savings-positive |
| Convert to paid | 3.5 | 25% of consultations |

**Per 1,000 visitors → 3.5 paying customers × Rs 1,20,000 LTV = Rs 4,20,000 revenue.**

---

## The Rs 1 Crore ARR Path (Rs 1,00,00,000 / 18 Months)

To reach Rs 1 Crore (~$120K USD) ARR in 18 months:

| Variable | Required Value | Reasoning |
|:---------|:--------------|:----------|
| Monthly revenue target | Rs 5,55,556 | Rs 1,00,00,000 ÷ 18 |
| Average contract value | Rs 1,20,000 | One optimization engagement + 12 months of credit margin |
| New customers per month | 4.6 → **5 customers/month** | Rs 5,55,556 ÷ Rs 1,20,000 |
| Consultations needed/month | 20 | At 25% close rate |
| Savings-positive audits/month | 267 | At 7.5% consultation rate |
| Completed audits/month | 381 | At 70% savings-positive rate |
| Monthly visitors needed | **1,450** | At 26.3% overall form completion |

**1,450 monthly visitors is achievable** through:
- 500 from Slack/Reddit/LinkedIn organic (saturates around month 6)
- 400 from SEO (blog content targeting "AI tool pricing comparison 2026," "startup AI spend benchmark")
- 350 from referrals (shareable audit URLs create viral loops)
- 200 from LinkedIn ads (modest Rs 15,000/mo budget starting month 4)

**Break-even timeline:** Month 5 (when organic channels mature and the first cohort of consultation leads close).

---

## Key Risks to the Model

| Risk | Impact | Mitigation |
|:-----|:-------|:-----------|
| Consultation-to-close rate below 15% | Revenue target slips 40% | Pre-qualify leads by phone before booking |
| AI tool vendors simplify pricing (less confusion) | Reduces savings opportunity | Expand to cloud infra audits (AWS/GCP) |
| Credex LTV lower than Rs 1,20,000 | CAC:LTV ratio deteriorates | Add recurring monitoring subscription (Rs 5,000/mo) |
| Competitors launch similar free tools | Traffic dilution | First-mover advantage + proprietary INR pricing database |
