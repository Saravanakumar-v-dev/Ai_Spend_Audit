# PROMPTS.md — AI Spend Audit

> **Verified Date:** 2026-05-10  
> **Model Used:** Claude Sonnet 4 (`claude-sonnet-4-20250514`) via Anthropic Messages API  
> **Timeout:** 10 seconds hard limit  
> **Fallback:** Deterministic template string (no LLM involved)

---

## System Prompt

```
You are a senior FinOps analyst writing a short executive summary for a startup founder.
Rules:
1. Use ONLY the numbers provided in the JSON — never invent or extrapolate savings.
2. Refer to currency as "Rs" (Indian Rupees).
3. Keep the summary between 80 and 120 words.
4. Use a professional but warm tone — no buzzwords, no hype.
5. Mention the specific tools where savings were found.
6. If total savings are zero, congratulate the founder on a well-optimised stack.
7. Never mention email addresses, company names, or any personally identifiable information.
```

## User Prompt (Template)

```
Here is the audit result. Write the executive summary now.

Total current monthly spend: Rs {totalCurrentMonthlySpend}
Total optimised monthly spend: Rs {totalOptimizedMonthlySpend}
Total monthly savings: Rs {totalMonthlySavings}
Total annual savings: Rs {totalAnnualSavings}

Tool breakdown:
- {toolName} ({currentPlan}): current Rs {currentMonthlyCost}/mo, potential saving Rs {monthlySavings}/mo by switching to {recommendedPlan}
```

---

## Why I Wrote the Prompt This Way

The prompt is deliberately constrained to **financial literacy, not creativity**. Every rule in the system prompt exists to prevent a specific failure mode:

- **Rule 1** ("Use ONLY the numbers provided") prevents the model from hallucinating savings figures. In our first iteration, the AI would infer that "if they save on Copilot, they probably waste money on other tools too" and fabricate additional line items. Restricting it to the exact JSON eliminated this entirely.
- **Rule 3** (80–120 words) forces conciseness. A CFO scanning a report will not read 500 words.
- **Rule 7** (no PII) is a hard security requirement since these summaries appear on the public `/share/` route.

The user prompt feeds **pre-calculated deterministic numbers** — the LLM never does any math. It only writes prose around numbers that our hardcoded engine already validated. This separation of concerns (engine calculates, AI narrates) ensures the financial figures are always 100% reproducible.

---

## What I Tried First That Didn't Work

Initially, I passed the raw form data (tool slugs, plan names, seat counts) directly to the AI and asked it to **calculate** the savings itself. The results were catastrophic:

1. The AI hallucinated plan prices (e.g., it quoted Cursor Pro at "$15/mo" instead of the verified Rs 1,887.40).
2. It invented percentage savings that didn't match our engine.
3. It sometimes recommended tools that weren't even in our pricing database.

The fix was simple but critical: **never let the LLM do math**. The deterministic engine handles all calculations; the AI only receives the final, validated result object and writes a human-readable narrative around it. This pattern — "compute deterministically, narrate with AI" — is the only defensible approach for financial tooling.
