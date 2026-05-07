/**
 * AuditForm — Client Component
 *
 * Multi-step form for collecting AI tool usage data.
 * Validates input on the client with Zod, then submits to POST /api/audit.
 *
 * NOTE: This is a placeholder component. The full implementation will include:
 * - Multi-step form flow (company info → tool selection → review & submit)
 * - Real-time cost preview as tools are selected
 * - Animated transitions between steps
 * - Client-side validation with error messages
 */

"use client";

import { useState } from "react";

export default function AuditForm() {
  const [step, setStep] = useState(1);
  const totalSteps = 3;

  return (
    <div className="glass rounded-2xl p-8 animate-slide-up" id="audit-form">
      {/* Step Progress Indicator */}
      <div className="mb-8 flex items-center justify-center gap-2">
        {Array.from({ length: totalSteps }, (_, i) => (
          <div key={i} className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-all duration-300 ${
                i + 1 <= step
                  ? "bg-accent-primary text-white"
                  : "bg-surface-elevated text-foreground/40"
              }`}
            >
              {i + 1}
            </div>
            {i < totalSteps - 1 && (
              <div
                className={`h-0.5 w-8 rounded transition-all duration-300 ${
                  i + 1 < step ? "bg-accent-primary" : "bg-border"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step Labels */}
      <div className="mb-8 text-center">
        <h3 className="text-xl font-bold text-foreground">
          {step === 1 && "About Your Team"}
          {step === 2 && "Your AI Tools"}
          {step === 3 && "Review & Submit"}
        </h3>
        <p className="mt-1 text-sm text-foreground/50">
          {step === 1 && "Tell us about your startup and team size"}
          {step === 2 && "Select the AI tools your team uses"}
          {step === 3 && "Review your selections and get your audit"}
        </p>
      </div>

      {/* Step 1: Company Info */}
      {step === 1 && (
        <div className="space-y-4 animate-fade-in">
          <div>
            <label
              htmlFor="company-name"
              className="block text-sm font-medium text-foreground/70 mb-1"
            >
              Company Name
            </label>
            <input
              id="company-name"
              type="text"
              placeholder="Acme Corp"
              className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-foreground placeholder:text-foreground/30 focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary transition-colors"
            />
          </div>
          <div>
            <label
              htmlFor="team-size"
              className="block text-sm font-medium text-foreground/70 mb-1"
            >
              Engineering Team Size
            </label>
            <input
              id="team-size"
              type="number"
              min={1}
              placeholder="12"
              className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-foreground placeholder:text-foreground/30 focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary transition-colors"
            />
          </div>
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-foreground/70 mb-1"
            >
              Work Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="you@startup.com"
              className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-foreground placeholder:text-foreground/30 focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary transition-colors"
            />
          </div>
        </div>
      )}

      {/* Step 2: Tool Selection Placeholder */}
      {step === 2 && (
        <div className="animate-fade-in">
          <p className="text-center text-foreground/50 py-8">
            Tool selector component will be built here.
            <br />
            <span className="text-sm">
              Users will select tools from categorized lists and choose their
              plans.
            </span>
          </p>
        </div>
      )}

      {/* Step 3: Review Placeholder */}
      {step === 3 && (
        <div className="animate-fade-in">
          <p className="text-center text-foreground/50 py-8">
            Review summary will show all selections before submission.
          </p>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="mt-8 flex justify-between">
        <button
          onClick={() => setStep(Math.max(1, step - 1))}
          disabled={step === 1}
          className="rounded-lg border border-border px-6 py-2.5 text-sm font-medium text-foreground/60 transition-colors hover:border-border-accent hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Back
        </button>
        <button
          onClick={() => setStep(Math.min(totalSteps, step + 1))}
          className="rounded-lg bg-accent-primary px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-accent-primary-hover hover:shadow-lg hover:shadow-accent-glow animate-pulse-glow"
        >
          {step === totalSteps ? "Get My Audit →" : "Continue →"}
        </button>
      </div>
    </div>
  );
}
