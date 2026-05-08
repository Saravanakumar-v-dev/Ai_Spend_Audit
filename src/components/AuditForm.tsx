/**
 * AuditForm — Client Component
 *
 * Multi-step form for collecting AI tool usage data.
 * Validates input on the client with Zod, then submits to POST /api/leads.
 *
 * Persists form data to localStorage so progress survives page reloads.
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { AuditFormData } from "@/lib/validators";
import { useLocalStorage } from "@/hooks/useLocalStorage";

export default function AuditForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const totalSteps = 3;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use custom hook for form persistence
  const [formData, setFormData, isHydrated] = useLocalStorage<AuditFormData>(
    "auditFormData",
    {
      companyName: "",
      role: "",
      teamSize: 1,
      email: "",
      tools: [],
    }
  );

  // Honeypot field state for basic bot validation
  const [honeypot, setHoneypot] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value, type } = e.target;
    
    // Map HTML IDs back to state properties
    let key = id;
    if (id === "company-name") key = "companyName";
    if (id === "team-size") key = "teamSize";

    setFormData((prev) => ({
      ...prev,
      [key]: type === "number" ? (value === "" ? "" : Number(value)) : value,
    }));
  };

  const handleHoneypotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHoneypot(e.target.value);
  };

  const addTool = (toolSlug: string, planName: string, quantity: number) => {
    setFormData((prev) => {
      // Avoid duplicates for MVP
      if (prev.tools.find((t) => t.toolSlug === toolSlug)) return prev;
      return {
        ...prev,
        tools: [...prev.tools, { toolSlug, planName, quantity, billingCycle: "monthly" }],
      };
    });
  };

  const removeTool = (toolSlug: string) => {
    setFormData((prev) => ({
      ...prev,
      tools: prev.tools.filter((t) => t.toolSlug !== toolSlug),
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const payload = {
        ...formData,
        website_url: honeypot, // The honeypot field
      };

      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to generate audit");
      }

      // Clear local storage on success (optional, but good practice)
      localStorage.removeItem("auditFormData");
      
      // Redirect to the dynamic audit result page
      router.push(`/audit/${data.auditId}`);
    } catch (err: any) {
      setError(err.message);
      setIsSubmitting(false);
    }
  };

  // Prevent flash of empty content during SSR hydration
  if (!isHydrated) {
    return <div className="glass rounded-2xl p-8 h-[400px] animate-pulse" />;
  }

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

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
          {error}
        </div>
      )}

      {/* Step 1: Company Info */}
      {step === 1 && (
        <div className="space-y-4 animate-fade-in">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-foreground/70 mb-1"
            >
              Work Email <span className="text-red-400">*</span>
            </label>
            <input
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="you@startup.com"
              className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-foreground placeholder:text-foreground/30 focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary transition-colors"
            />
          </div>
          <div>
            <label
              htmlFor="company-name"
              className="block text-sm font-medium text-foreground/70 mb-1"
            >
              Company Name <span className="text-foreground/40 text-xs font-normal">(Optional)</span>
            </label>
            <input
              id="company-name"
              type="text"
              value={formData.companyName || ""}
              onChange={handleChange}
              placeholder="Acme Corp"
              className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-foreground placeholder:text-foreground/30 focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary transition-colors"
            />
          </div>
          <div>
            <label
              htmlFor="role"
              className="block text-sm font-medium text-foreground/70 mb-1"
            >
              Your Role <span className="text-foreground/40 text-xs font-normal">(Optional)</span>
            </label>
            <input
              id="role"
              type="text"
              value={formData.role || ""}
              onChange={handleChange}
              placeholder="CTO, Founder, etc."
              className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-foreground placeholder:text-foreground/30 focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary transition-colors"
            />
          </div>
          <div>
            <label
              htmlFor="team-size"
              className="block text-sm font-medium text-foreground/70 mb-1"
            >
              Engineering Team Size <span className="text-foreground/40 text-xs font-normal">(Optional)</span>
            </label>
            <input
              id="team-size"
              type="number"
              min={1}
              value={formData.teamSize || ""}
              onChange={handleChange}
              placeholder="12"
              className="w-full rounded-lg border border-border bg-surface px-4 py-3 text-foreground placeholder:text-foreground/30 focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary transition-colors"
            />
          </div>
          
          {/* Honeypot field - visually hidden to catch bots */}
          <div className="absolute left-[-9999px] top-[-9999px]" aria-hidden="true">
            <label htmlFor="website_url">Do not fill this out if you are human</label>
            <input
              type="text"
              id="website_url"
              name="website_url"
              tabIndex={-1}
              autoComplete="off"
              value={honeypot}
              onChange={handleHoneypotChange}
            />
          </div>
        </div>
      )}

      {/* Step 2: Tool Selection Placeholder */}
      {step === 2 && (
        <div className="animate-fade-in space-y-4">
          <p className="text-sm text-foreground/70 mb-4">
            Select the tools your team currently pays for.
          </p>
          
          <div className="p-4 rounded-xl border border-border bg-surface">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-semibold text-foreground">Cursor</h4>
            </div>
            {!formData.tools.find(t => t.toolSlug === "cursor") ? (
              <div className="flex gap-2">
                <button 
                  onClick={() => addTool("cursor", "pro", 1)}
                  className="px-3 py-1.5 text-xs font-medium rounded-md bg-accent-primary/10 text-accent-primary hover:bg-accent-primary/20"
                >
                  Add Pro ($20)
                </button>
                <button 
                  onClick={() => addTool("cursor", "teams", formData.teamSize || 1)}
                  className="px-3 py-1.5 text-xs font-medium rounded-md bg-accent-primary/10 text-accent-primary hover:bg-accent-primary/20"
                >
                  Add Teams ($40/seat)
                </button>
              </div>
            ) : (
              <div className="flex justify-between items-center text-sm text-accent-primary">
                <span>Added: {formData.tools.find(t => t.toolSlug === "cursor")?.planName}</span>
                <button onClick={() => removeTool("cursor")} className="text-red-400 hover:text-red-300">Remove</button>
              </div>
            )}
          </div>

          <div className="p-4 rounded-xl border border-border bg-surface">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-semibold text-foreground">Claude</h4>
            </div>
            {!formData.tools.find(t => t.toolSlug === "claude") ? (
              <div className="flex gap-2">
                <button 
                  onClick={() => addTool("claude", "pro", 1)}
                  className="px-3 py-1.5 text-xs font-medium rounded-md bg-accent-primary/10 text-accent-primary hover:bg-accent-primary/20"
                >
                  Add Pro ($20)
                </button>
                <button 
                  onClick={() => addTool("claude", "team_standard", formData.teamSize || 1)}
                  className="px-3 py-1.5 text-xs font-medium rounded-md bg-accent-primary/10 text-accent-primary hover:bg-accent-primary/20"
                >
                  Add Team ($30/seat)
                </button>
              </div>
            ) : (
              <div className="flex justify-between items-center text-sm text-accent-primary">
                <span>Added: {formData.tools.find(t => t.toolSlug === "claude")?.planName}</span>
                <button onClick={() => removeTool("claude")} className="text-red-400 hover:text-red-300">Remove</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 3: Review */}
      {step === 3 && (
        <div className="animate-fade-in space-y-4 text-sm text-foreground/80">
          <div className="p-4 rounded-xl border border-border bg-surface space-y-2">
            <p><strong>Email:</strong> {formData.email}</p>
            {formData.companyName && <p><strong>Company:</strong> {formData.companyName}</p>}
            {formData.teamSize && <p><strong>Team Size:</strong> {formData.teamSize}</p>}
          </div>
          
          <div className="p-4 rounded-xl border border-border bg-surface space-y-2">
            <h4 className="font-semibold text-foreground mb-2">Selected Tools ({formData.tools.length})</h4>
            {formData.tools.length === 0 ? (
              <p className="text-red-400">Please go back and select at least one tool.</p>
            ) : (
              <ul className="list-disc list-inside">
                {formData.tools.map(tool => (
                  <li key={tool.toolSlug}>
                    <span className="capitalize">{tool.toolSlug}</span> - {tool.planName} ({tool.quantity} seats)
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="mt-8 flex justify-between">
        <button
          onClick={() => setStep(Math.max(1, step - 1))}
          disabled={step === 1 || isSubmitting}
          className="rounded-lg border border-border px-6 py-2.5 text-sm font-medium text-foreground/60 transition-colors hover:border-border-accent hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Back
        </button>
        <button
          onClick={() => {
            if (step === totalSteps) {
              if (formData.tools.length > 0 && formData.email) {
                handleSubmit();
              } else {
                setError("Please ensure you have entered an email and selected at least one tool.");
              }
            } else {
              setStep(Math.min(totalSteps, step + 1));
            }
          }}
          disabled={isSubmitting}
          className="rounded-lg bg-accent-primary px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-accent-primary-hover hover:shadow-lg hover:shadow-accent-glow animate-pulse-glow disabled:opacity-50 disabled:animate-none"
        >
          {isSubmitting ? "Generating..." : step === totalSteps ? "Get My Audit →" : "Continue →"}
        </button>
      </div>
    </div>
  );
}
