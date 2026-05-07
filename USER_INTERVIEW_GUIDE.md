# User Interview Guide — AI Spend Audit Discovery

> **Purpose:** Uncover surprising details about how startup teams manage (or don't manage) their AI spending, and what would make them trust a third-party audit tool.  
> **Target Interviewees:** 3 startup founders/CTOs/engineering leads who use ≥3 AI tools  
> **Interview Length:** 20–30 minutes  
> **Last Updated:** 2026-05-07

---

## Pre-Interview Setup

- **Recording consent:** "Is it okay if I take notes? This is for internal product research only."
- **Warm-up:** "Tell me about your role and what your team is building."
- **Framing:** Do NOT mention "AI Spend Audit" by name. Don't lead with "we think you're overspending." Start exploratory.

---

## The 7 Questions

### Q1 — The Inventory Question (Discovery)
> **"Walk me through every AI tool your team is paying for right now. Take your time — I mean everything, from IDE plugins to API keys to ChatGPT subscriptions."**

**What you're listening for:**
- Do they know the full list off the top of their head? (If they struggle → they lack visibility)
- Do they mention tools others on the team use that they don't? (Shadow AI spending)
- Are there overlapping tools? (e.g., paying for both Copilot AND Cursor)
- Do they mention personal subscriptions the company reimburses?

**Follow-up probes:**
- "Is that everything, or might some team members have their own subscriptions?"
- "Who manages the billing for these? Is it one person or spread across credit cards?"

---

### Q2 — The Tracking Question (Process)
> **"How do you currently track what your team spends on AI tools each month? Is there a spreadsheet, a dashboard, or is it more... vibes-based?"**

**What you're listening for:**
- Most will say "we don't really track it" — that's the pain point
- Do they use any expense management tool? (Brex, Ramp, etc.)
- Is AI spending categorized separately or lumped into "software subscriptions"?
- Who approves new AI tool purchases?

**Follow-up probes:**
- "If I asked you to tell me your total AI spend last month within $50, could you?"
- "Has anyone ever done an audit or review of these costs?"

---

### Q3 — The Surprise Bill Question (Pain)
> **"Tell me about a time when an AI-related bill surprised you — either the amount was higher than expected, or you realized you were paying for something nobody was using."**

**What you're listening for:**
- Emotional response — frustration, embarrassment, or resignation tells you the pain is real
- Specific dollar amounts (this calibrates our "savings" estimates)
- API overages vs. unused seats — different problems, different solutions
- Was the surprise caught quickly or did it compound for months?

**Follow-up probes:**
- "How much money was involved?"
- "What did you do about it? Did anything change?"
- "How would you have wanted to find out about it instead?"

---

### Q4 — The Decision Question (Buying Behavior)
> **"When you're choosing between AI tools — say, Cursor vs. Copilot, or Claude vs. ChatGPT — what actually drives the decision? Is it price, features, what your engineers prefer, or something else?"**

**What you're listening for:**
- Price sensitivity vs. "let engineers use whatever they want" culture
- Are decisions made top-down (CTO picks) or bottom-up (engineers just start using things)?
- Do they compare plans systematically or just pick "Pro" for everyone?
- Do they consider annual billing vs. monthly?

**Follow-up probes:**
- "Have you ever downgraded a plan or switched tools to save money?"
- "Is there a dollar threshold where you'd say 'this is too much for an AI tool per developer'?"

---

### Q5 — The Trust Question (Critical for Lead Gen)
> **"Imagine a tool that could analyze your AI subscriptions and tell you where you're overspending. What would it need to show you for you to actually trust its recommendations?"**

**What you're listening for:**
- Do they need to see the methodology? (Transparency → show pricing sources)
- Do they want personalized recommendations or just raw numbers?
- Are they worried about data privacy? (Entering company spend data into a third-party tool)
- Would they trust an automated tool, or does it need a human review component?
- Is the bar "save me time" or "save me money"?

**Follow-up probes:**
- "Would you share your actual spend data, or would you prefer to just input what tools you use and get estimates?"
- "If it said 'you could save $3,000/month by switching from X to Y,' would you act on that?"
- "Would you want a PDF report you could show your CFO, or is a web link enough?"

---

### Q6 — The Share-ability Question (Viral/Lead-Gen Mechanics)
> **"If you got a report like this — a personalized breakdown of your AI spend with savings opportunities — who else in your company would you share it with? Would you share it publicly, like on LinkedIn or Twitter?"**

**What you're listening for:**
- Internal sharing targets: CFO, co-founder, board members (validates B2B lead gen)
- Public sharing appetite: "I'd share it if it made us look smart" vs. "No, spend data is private"
- What format makes it shareable? (Unique URL vs. PDF vs. screenshot-friendly charts)
- Would they share a benchmark comparison? ("Your team spends 40% more than the median Series A startup")

**Follow-up probes:**
- "What would make you NOT share it?"
- "Would you share it if it was anonymized — like 'a 15-person engineering team' instead of your company name?"

---

### Q7 — The Magic Wand Question (Aspiration)
> **"If you could wave a magic wand and instantly know ONE thing about your team's AI tool usage that you don't know today, what would it be?"**

**What you're listening for:**
- This reveals the #1 unmet need — don't try to guess it, let them tell you
- Common answers: "Which tools are actually being used," "ROI per tool," "Cost per developer"
- Unexpected answers are gold — they reveal features you haven't thought of
- Do they care more about utilization (are people using what we pay for?) or optimization (are we on the right plans)?

**Follow-up probes:**
- "Why that specifically? What would you do with that information?"
- "Who else on your team would want to know that?"

---

## Post-Interview Debrief Template

Complete this within 1 hour of each interview:

```markdown
### Interview #[X] — [Date]

**Interviewee:** [Name, Role, Company Size]
**AI Tools Used:** [List]
**Estimated Monthly AI Spend:** $[X]

#### Key Surprises
1. [Something unexpected they said]
2. [Something unexpected they said]

#### Pain Level (1-5): [X]
#### Trust Requirements
- [ ] Needs to see pricing sources
- [ ] Wants PDF/downloadable report
- [ ] Concerned about data privacy
- [ ] Needs human review, not just automation
- [ ] Wants benchmarks vs. peers

#### Would Share Report?
- Internally: [Yes/No — with whom?]
- Publicly: [Yes/No — under what conditions?]

#### Top Quote (verbatim)
> "[Their most insightful quote]"

#### Implications for Product
- [How this changes our assumptions]
```

---

## Analysis Framework

After all 3 interviews, synthesize findings using this matrix:

| Theme                    | Interviewee 1 | Interviewee 2 | Interviewee 3 | Pattern? |
| :----------------------- | :------------ | :------------ | :------------ | :------- |
| Knows full tool inventory | | | | |
| Tracks AI spend          | | | | |
| Has been surprised by a bill | | | | |
| Price drives tool decisions | | | | |
| Would trust automated audit | | | | |
| Would share report internally | | | | |
| Would share report publicly | | | | |
| Top "magic wand" wish   | | | | |
