# Product Metrics — AI Spend Audit

> **Author:** Saravanakumar  
> **Date:** 2026-05-11  
> **Status:** Pre-launch Instrumentation Plan

---

## North Star Metric

**Total Rupee Value of Wasted Spend Surfaced (Monthly)**

This is the aggregate Rs amount of savings identified across all completed audits in a calendar month. Example: if 200 users complete audits in May and the engine identifies a combined Rs 29,00,000 in annual wasted spend, our North Star for May is **Rs 29,00,000**.

### Why This and Not "Number of Audits Completed"

"Audits completed" is a vanity metric — it measures volume, not value. A month with 500 audits where each shows Rs 0 savings is worthless for lead generation. We need audits that surface **real, actionable waste**, because those are the audits that convert to consultations.

This metric directly ties to revenue: the higher the wasted spend surfaced, the more compelling our consultation pitch ("We found Rs 2,40,000/year in waste — let's fix it"). It also aligns the product team's incentives with the business — improving the engine's detection rules directly improves the North Star.

---

## 3 Input Metrics That Drive the North Star

### 1. Audit Completion Rate
**Definition:** Percentage of users who start the form (Step 1) and complete all 3 steps.  
**Current Target:** 75%  
**Why it matters:** Every abandoned form is a lost lead. A 5% improvement in completion rate at 1,000 monthly visitors = 50 more leads = ~4 more consultations.

### 2. Savings-Positive Rate
**Definition:** Percentage of completed audits where `totalMonthlySavings > Rs 8,350` (the Honesty Filter threshold).  
**Current Target:** 70%  
**Why it matters:** This metric reflects the quality of our tool selection UI and engine rules. If it drops below 50%, our tool catalog doesn't match real-world stacks, or our pricing data is stale. It is the clearest signal of engine accuracy.

### 3. Consultation Booking Rate
**Definition:** Percentage of savings-positive audits that result in a consultation request (clicking the "Book a Credex Consultation" CTA).  
**Current Target:** 7.5%  
**Why it matters:** This is the conversion from product to revenue. It measures whether the report is compelling enough to make a founder take the next step. If savings are surfaced but nobody books, the problem is trust or CTA design, not the engine.

---

## Instrumentation Plan (First 7 Days)

These are the exact PostHog events we track from day 1:

| Event Name | Trigger | Properties |
|:-----------|:--------|:-----------|
| `audit_form_started` | User clicks "Start Free Audit" or scrolls to form | `referrer`, `utm_source` |
| `audit_form_step_completed` | User advances from Step 1→2 or 2→3 | `step_number`, `tools_count` (step 2 only) |
| `audit_form_abandoned` | User leaves page with incomplete form | `last_step`, `time_on_form_seconds` |
| `audit_completed` | Form submitted successfully, audit generated | `tools_count`, `team_size`, `total_savings_inr` |
| `audit_report_viewed` | User lands on `/audit/[id]` page | `savings_bracket` (zero / low / medium / high) |
| `consultation_cta_clicked` | User clicks "Book a Credex Consultation" | `total_savings_inr`, `tools_count` |
| `share_report_clicked` | User clicks "Share Report" link | `destination` (copy_link / linkedin / twitter) |
| `honesty_filter_shown` | Report shows "You're spending well" (no savings) | `tools_count`, `total_spend_inr` |

### Funnel We Build First

```
audit_form_started → audit_form_step_completed (step 2) → audit_form_step_completed (step 3) → audit_completed → consultation_cta_clicked
```

This 5-event funnel gives us the entire conversion path from interest to revenue intent. We can identify exactly where users drop off.

---

## Pivot Triggers

These are the specific failure thresholds that would force a strategic change. They are measured after 500 completed audits (statistically significant sample).

| Metric | Failure Threshold | Pivot Action |
|:-------|:------------------|:-------------|
| Audit completion rate | Below 50% | Reduce form to 2 steps; eliminate optional fields entirely |
| Savings-positive rate | Below 40% | Engine rules are wrong or tool catalog is incomplete; add 5+ more tools and re-verify all pricing |
| Consultation booking rate (savings >Rs 8,350) | Below 1.5% | CTA is not compelling; A/B test consultation vs. "Download PDF report" vs. "Email me recommendations" |
| Total wasted spend surfaced (monthly) | Below Rs 5,00,000 after month 3 | Tool is not reaching high-spend ICPs; pivot outreach to Series A+ companies with >20 engineers |
| Share rate | Below 2% of completed audits | Shareability is not a growth channel; redirect effort to SEO content and LinkedIn ads |

### The "Kill the Product" Signal

If after 1,000 completed audits (approximately month 3–4), the consultation booking rate remains below 1% AND the average savings surfaced per audit is below Rs 5,000/mo, the tool is not generating leads worth pursuing. At that point, pivot the tool into a **content marketing asset** (publish aggregate benchmarks as blog posts) rather than a direct lead-gen funnel.
