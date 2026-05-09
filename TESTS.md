# Automated Test Suite

This document catalogs the rigorous automated tests written to guarantee the defensibility of the deterministic AI Spend Audit Engine.

### 1. Zero Spend (Free/Unknown Plan)
- **Filename:** `src/lib/audit-engine.test.ts`
- **Coverage:** Verifies that if a user submits an unknown or free plan (e.g., Cursor Hobby), the engine falls back safely to $0 spend and does not divide by zero or crash the calculation.
- **Run Command:** `npx vitest run -t "fails safely for unknown plans"`

### 2. Standard Enterprise Usage
- **Filename:** `src/lib/audit-engine.test.ts`
- **Coverage:** Verifies the "Saravanakumar Discount" logic. If a massive 1000-seat team uses Copilot Enterprise, the engine must correctly apply a 20% savings margin reflecting negotiated enterprise rates.
- **Run Command:** `npx vitest run -t "keeps the enterprise negotiation rule in INR"`

### 3. The "Overkill" Catch (Most Expensive Tiers, 1 Seat)
- **Filename:** `src/lib/audit-engine.test.ts`
- **Coverage:** Verifies the exact scenario where a user is burning money by subscribing to Copilot Enterprise, Cursor Teams, Claude Team Premium, and ChatGPT Pro, all for a single seat. Tests that the engine successfully downgrades each of these to their respective individual/pro tiers.
- **Run Command:** `npx vitest run -t "handles a user on all the most expensive tiers with only 1 seat"`

### 4. Alternative Tool Suggestion
- **Filename:** `src/lib/audit-engine.test.ts`
- **Coverage:** Verifies that if a user is overpaying for a high-tier chatbot (ChatGPT Pro) but using it for standard mixed use-cases, the engine explicitly suggests downgrading to ChatGPT Plus.
- **Run Command:** `npx vitest run -t "uses current INR pricing for ChatGPT Pro vs Plus"`

### 5. Perfectly Optimized
- **Filename:** `src/lib/audit-engine.test.ts`
- **Coverage:** Verifies that if a 1-person team uses only Cursor Pro, their current spend matches their optimized spend, registering $0 (or Rs 0) in savings, successfully triggering the Honesty Filter on the UI.
- **Run Command:** `npx vitest run -t "handles a user who is already perfectly optimized"`

---
**To run the full suite:**
```bash
npx vitest run
```
