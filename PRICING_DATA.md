# PRICING_DATA.md — AI Spend Audit Pricing Reference

> **Document Status:** Research Phase — Prices need verification before engine implementation  
> **Last Updated:** 2026-05-07  
> **Verification Method:** All prices must be cross-referenced against official pricing pages  
> **⚠️ IMPORTANT:** AI tool pricing changes frequently. Every price MUST include a `verified_at` date and `source_url`.

---

## Table of Contents

1. [IDE / Coding Assistants](#1-ide--coding-assistants)
2. [AI Chatbot Subscriptions](#2-ai-chatbot-subscriptions)
3. [API / Developer Platforms](#3-api--developer-platforms)
4. [UI/Code Generation Tools](#4-uicode-generation-tools)
5. [Research Checklist](#5-research-checklist)
6. [Pricing Model Notes](#6-pricing-model-notes)

---

## 1. IDE / Coding Assistants

### 1.1 Cursor (by Anysphere)

| Plan       | Monthly Price | Annual (per mo) | Billing Model | Key Limits |
| :--------- | :----------- | :-------------- | :------------ | :--------- |
| Hobby      | $0           | —               | flat          | Limited Agent requests, limited Tab completions |
| Pro        | $20          | $16             | flat + credits | Unlimited Tab, $20/mo credit pool, all frontier models |
| Pro+       | $60          | $48             | flat + credits | Everything in Pro, 3× usage credits |
| Ultra      | $200         | $160            | flat + credits | Everything in Pro, 20× credits, priority features |
| Teams      | $40/seat     | $32/seat        | per_seat + credits | Shared chats, RBAC, SAML/OIDC SSO, usage analytics |
| Enterprise | Custom       | Custom          | per_seat      | Pooled usage, SCIM, audit logs, dedicated support |

- **Source URL:** https://cursor.com/pricing
- **Verified At:** May 2026
- **Notes:**
  - "Auto" mode is unlimited on paid plans; manual premium model selection draws from credit pool
  - Overage: upgrade tier or enable pay-as-you-go
  - 20% savings on annual billing across all paid plans

---

### 1.2 GitHub Copilot (by GitHub/Microsoft)

| Plan       | Monthly Price | Annual (per mo) | Billing Model | Key Limits |
| :--------- | :----------- | :-------------- | :------------ | :--------- |
| Free       | $0           | —               | flat          | 2,000 completions/mo, limited chat |
| Pro        | $10          | $10             | flat + credits | Unlimited completions, $10/mo AI Credits |
| Pro+       | $39          | $39             | flat + credits | $39/mo AI Credits, advanced/reasoning models |
| Business   | $19/seat     | $19/seat        | per_seat      | Org controls, SSO, audit logs, IP indemnity |
| Enterprise | $39/seat     | $39/seat        | per_seat      | Knowledge bases, custom model fine-tuning |

- **Source URL:** https://github.com/features/copilot
- **Verified At:** May 2026
- **Notes:**
  - ⚠️ **MAJOR CHANGE:** Transitioning from request-based to usage-based billing (AI Credits) on June 1, 2026
  - Standard code completions and Next Edit suggestions are included in ALL plans (no credit consumption)
  - Enterprise requires separate GitHub Enterprise Cloud subscription ($$$)
  - Business/Enterprise: credits pooled across org

---

### 1.3 Windsurf (by Cognition AI)

| Plan       | Monthly Price | Annual (per mo) | Billing Model | Key Limits |
| :--------- | :----------- | :-------------- | :------------ | :--------- |
| Tab (Free) | $0           | —               | flat          | Limited Tab completions |
| Pro        | $20          | TBD             | flat + credits | Full Cascade access, credits for premium models |
| Max        | $200         | TBD             | flat + credits | Maximum usage limits |
| Teams      | $40/seat     | TBD             | per_seat      | Team collaboration, admin controls |
| Enterprise | Custom       | Custom          | per_seat      | Custom deployment, security, compliance |

- **Source URL:** https://windsurf.com/pricing
- **Verified At:** May 2026
- **Notes:**
  - Formerly "Codeium" before rebranding
  - SWE-1.5 Fast Agent model available
  - Referral program: $10 in extra usage per referral

---

## 2. AI Chatbot Subscriptions

### 2.1 ChatGPT (by OpenAI)

| Plan           | Monthly Price | Annual (per mo) | Billing Model | Key Limits |
| :------------- | :----------- | :-------------- | :------------ | :--------- |
| Free           | $0           | —               | flat          | GPT-5.3 Instant, usage caps, ad-supported (US) |
| Go             | $8           | TBD             | flat          | Higher limits, file uploads, image creation |
| Plus           | $20          | TBD             | flat          | GPT-5.5, 10 Deep Research runs/mo, Sora video |
| Pro ($100)     | $100         | TBD             | flat          | 5× Plus limits, GPT-5.5 Pro, o3-pro |
| Pro ($200)     | $200         | TBD             | flat          | 20× Plus limits, 250 Deep Research/mo, 1M context |
| Business       | $25/seat     | $20/seat        | per_seat      | SAML SSO, SOC 2, 60+ integrations, data exclusion |
| Enterprise     | Custom (~$40+/seat) | Custom   | per_seat      | Multi-region, RBAC, audit logs, 24/7 SLA, 150+ seat min |

- **Source URL:** https://openai.com/chatgpt/pricing
- **Verified At:** May 2026
- **Notes:**
  - Business pricing adjusted to $20/seat annual as of April 2026
  - Enterprise estimates based on industry reports (~$40+/seat, 150-seat minimum)
  - Multiple "Pro" tiers ($100 and $200) — audit form must distinguish these

---

### 2.2 Claude (by Anthropic)

| Plan           | Monthly Price | Annual (per mo) | Billing Model | Key Limits |
| :------------- | :----------- | :-------------- | :------------ | :--------- |
| Free           | $0           | —               | flat          | Limited usage |
| Pro            | $20          | $17             | flat          | 1× baseline usage, Claude Code access |
| Max 5×         | $100         | TBD             | flat          | 5× Pro usage, professional workflows |
| Max 20×        | $200         | TBD             | flat          | 20× Pro usage, all-day agentic dev |
| Team (Standard)| ~$25/seat    | TBD             | per_seat      | Centralized billing, admin controls, 5-seat min |
| Team (Premium) | ~$150/seat   | TBD             | per_seat      | Claude Code access, advanced tooling |
| Enterprise     | Custom       | Custom          | per_seat      | HIPAA, advanced security, high-volume |

- **Source URL:** https://anthropic.com/pricing
- **Verified At:** May 2026
- **Notes:**
  - Usage limits reset on a rolling 5-hour window (not monthly)
  - All paid individual tiers include Opus 4.6, Sonnet 4.6, Claude Code
  - Team pricing ranges widely — need to confirm exact tiers

---

### 2.3 Google Gemini

| Plan           | Monthly Price | Annual (per mo) | Billing Model | Key Limits |
| :------------- | :----------- | :-------------- | :------------ | :--------- |
| Free           | $0           | —               | flat          | Gemini Flash models, 15GB storage |
| AI Plus        | $7.99        | TBD             | flat          | Gemini Pro access, 200GB storage |
| AI Pro         | $19.99       | TBD             | flat          | Full Pro, 1M context, Workspace integration, 2TB |
| AI Ultra       | $249.99      | TBD             | flat          | Highest limits, 30TB, YouTube Premium |

- **Source URL:** https://one.google.com/about/plans
- **Verified At:** May 2026
- **Notes:**
  - Bundled with Google One storage — some users may already pay for storage
  - "AI Ultra Lite" (~$100/mo) reportedly in development
  - Workspace AI add-ons being restructured — may affect enterprise pricing
  - Promotional pricing frequently available (50% off first year)

---

## 3. API / Developer Platforms

### 3.1 OpenAI API

| Model          | Input ($/1M tokens) | Output ($/1M tokens) | Cached Input | Batch Discount |
| :------------- | :------------------ | :------------------- | :----------- | :------------- |
| GPT-5.5        | $5.00               | $30.00               | ~$2.50       | 50% off        |
| GPT-5.4        | $2.50               | $15.00               | ~$1.25       | 50% off        |
| GPT-4o (Legacy)| $2.50               | $10.00               | ~$1.25       | 50% off        |
| GPT-4o-mini    | $0.15               | $0.60                | ~$0.075      | 50% off        |

- **Source URL:** https://openai.com/api/pricing
- **Verified At:** May 2026
- **Notes:**
  - Batch API provides 50% cost reduction for async workloads
  - Prompt caching available for repeated contexts
  - Model deprecation happens frequently — check active model list
  - Nano/Mini models available for high-volume, low-cost tasks

---

### 3.2 Anthropic API (Claude)

| Model              | Input ($/1M tokens) | Output ($/1M tokens) | Cached Input | Batch Discount |
| :----------------- | :------------------ | :------------------- | :----------- | :------------- |
| Claude Opus 4.7    | $5.00               | $25.00               | up to 90% off | 50% off       |
| Claude Sonnet 4.6  | $3.00               | $15.00               | up to 90% off | 50% off       |
| Claude Haiku 4.5   | $1.00               | $5.00                | up to 90% off | 50% off       |

- **Source URL:** https://anthropic.com/pricing
- **Verified At:** May 2026
- **Notes:**
  - Up to 1M token context window at standard rates (no surcharge)
  - Prompt caching can reduce costs by 70–90% for repetitive tasks
  - Extended thinking tokens billed as output tokens
  - Batch API provides 50% reduction

---

### 3.3 Google Gemini API

| Model                 | Input ($/1M tokens) | Output ($/1M tokens) | Free Tier |
| :-------------------- | :------------------ | :------------------- | :-------- |
| Gemini 3.1 Pro        | TBD                 | TBD                  | Yes (limited RPM) |
| Gemini 3 Flash        | TBD                 | TBD                  | Yes (limited RPM) |
| Gemini 2.5 Pro        | TBD                 | TBD                  | Yes (limited RPM) |
| Gemini 2.5 Flash      | TBD                 | TBD                  | Yes (limited RPM) |
| Gemini 2.5 Flash Lite | TBD                 | TBD                  | Yes (limited RPM) |

- **Source URL:** https://ai.google.dev/pricing
- **Verified At:** May 2026
- **Notes:**
  - ⚠️ Gemini API pricing page uses Standard/Batch/Flex/Priority tiers but exact token prices were not extractable from the page — **MANUAL VERIFICATION REQUIRED**
  - Free tier available with rate limits (great for small startups)
  - Batch API offers 50% cost reduction
  - Context caching available for cost optimization
  - Flex inference available for non-latency-sensitive tasks

---

## 4. UI/Code Generation Tools

### 4.1 v0 (by Vercel)

| Plan       | Monthly Price | Credits/mo | Billing Model | Key Limits |
| :--------- | :----------- | :--------- | :------------ | :--------- |
| Free       | $0           | $5         | credit-based  | 7 messages/day |
| Premium    | $20          | $20        | credit-based  | Higher limits, Figma import |
| Team       | $30/seat     | $30/seat   | per_seat + credits | Shared credit pool, collaboration |
| Business   | $100/seat    | $30/seat   | per_seat + credits | Data opt-out for AI training |
| Enterprise | Custom       | Custom     | per_seat      | SAML SSO, priority access |

- **Source URL:** https://v0.app/pricing
- **Verified At:** May 2026
- **Notes:**
  - Credit-based system — usage varies by model tier (Mini/Pro/Max)
  - Unused credits roll over but expire after 65 days
  - Team plans share credit pool after individual credits exhausted

---

## 5. Research Checklist

### Plans That MUST Be Verified Before Engine Build

Use this checklist to track verification progress. Each item requires visiting the official pricing page and confirming the exact price.

#### IDE / Coding Assistants

- [ ] **Cursor** — Hobby, Pro ($20), Pro+ ($60), Ultra ($200), Teams ($40/seat), Enterprise
  - Source: https://cursor.com/pricing
  - Priority: 🔴 HIGH (most popular among target audience)

- [ ] **GitHub Copilot** — Free, Pro ($10), Pro+ ($39), Business ($19/seat), Enterprise ($39/seat)
  - Source: https://github.com/features/copilot
  - Priority: 🔴 HIGH
  - ⚠️ Verify new usage-based billing (June 2026 transition)

- [ ] **Windsurf** — Tab (Free), Pro ($20), Max ($200), Teams ($40/seat), Enterprise
  - Source: https://windsurf.com/pricing
  - Priority: 🟡 MEDIUM

#### AI Chatbots

- [ ] **ChatGPT** — Free, Go ($8), Plus ($20), Pro $100, Pro $200, Business ($20-25/seat), Enterprise
  - Source: https://openai.com/chatgpt/pricing
  - Priority: 🔴 HIGH
  - ⚠️ Confirm two separate "Pro" tiers ($100 vs. $200)

- [ ] **Claude** — Free, Pro ($20), Max 5× ($100), Max 20× ($200), Team Standard, Team Premium, Enterprise
  - Source: https://anthropic.com/pricing
  - Priority: 🔴 HIGH
  - ⚠️ Confirm exact Team pricing (ranges $25–$150/seat)

- [ ] **Google Gemini** — Free, AI Plus ($7.99), AI Pro ($19.99), AI Ultra ($249.99)
  - Source: https://one.google.com/about/plans
  - Priority: 🟡 MEDIUM
  - ⚠️ Bundled with Google One — need to separate AI value from storage

#### APIs

- [ ] **OpenAI API** — GPT-5.5, GPT-5.4, GPT-4o, GPT-4o-mini token pricing
  - Source: https://openai.com/api/pricing
  - Priority: 🔴 HIGH (many startups use API directly)

- [ ] **Anthropic API** — Claude Opus 4.7, Sonnet 4.6, Haiku 4.5 token pricing
  - Source: https://anthropic.com/pricing
  - Priority: 🔴 HIGH

- [ ] **Google Gemini API** — Gemini 3.1 Pro, 3 Flash, 2.5 Pro, 2.5 Flash, 2.5 Flash Lite
  - Source: https://ai.google.dev/pricing
  - Priority: 🟡 MEDIUM
  - ⚠️ Exact per-token prices need manual extraction

#### UI/Code Generation

- [ ] **v0 by Vercel** — Free, Premium ($20), Team ($30/seat), Business ($100/seat), Enterprise
  - Source: https://v0.app/pricing
  - Priority: 🟢 LOW (niche, but relevant for dev teams)

---

## 6. Pricing Model Notes

### Billing Model Categories

The audit engine must handle these distinct billing models:

| Model        | Description | Example Tools |
| :----------- | :---------- | :------------ |
| **flat**     | Fixed monthly price, no per-use charges | ChatGPT Plus, Claude Pro |
| **per_seat** | Fixed price × number of users | Copilot Business, Cursor Teams |
| **credit-based** | Monthly credit pool, usage draws from pool | Cursor Pro, v0 Premium |
| **per_token** | Pay-per-use based on token consumption | OpenAI API, Anthropic API |
| **hybrid**   | Flat subscription + usage-based overages | GitHub Copilot Pro (post June 2026) |

### Common Gotchas for Audit Accuracy

1. **Annual vs. Monthly billing** — Always capture both; many startups pay monthly (more expensive)
2. **Seat vs. flat** — Some tools charge per seat, others per org. The form must ask "how many seats?"
3. **Credit expiration** — Cursor/v0 credits expire; unused credits ≠ savings
4. **Bundling** — Gemini is bundled with Google One storage; ChatGPT Enterprise includes other OpenAI products
5. **API estimation** — Token-based pricing requires asking about monthly usage volume (est. tokens/month)
6. **Enterprise pricing** — Usually custom/negotiated. We should flag these as "Contact vendor for exact pricing"
7. **Free tiers** — Some teams use free tiers extensively. The audit should account for $0 spend on free plans
8. **Overlap detection** — Teams often pay for BOTH Claude Pro AND Anthropic API, or ChatGPT Plus AND OpenAI API. The audit should flag this as potential consolidation opportunity
