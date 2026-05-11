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
      [key]:
        type === "number" ? (value === "" ? undefined : Number(value)) : value,
    }));
  };

  const handleHoneypotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setHoneypot(e.target.value);
  };

  const addTool = (
    toolSlug: string,
    planName: string,
    quantity: number,
    estimatedMonthlyTokens?: { inputTokens: number; outputTokens: number },
    billingCycle: "monthly" | "annual" = "monthly",
    activeUsers?: number
  ) => {
    setFormData((prev) => {
      // Avoid duplicates for MVP
      if (prev.tools.find((t) => t.toolSlug === toolSlug)) return prev;
      return {
        ...prev,
        tools: [
          ...prev.tools,
          { toolSlug, planName, quantity, billingCycle, estimatedMonthlyTokens, activeUsers },
        ],
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

      // Clear local storage on success
      localStorage.removeItem("auditFormData");
      
      // Redirect to the dynamic audit result page
      router.push(`/audit/${data.auditId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate audit");
      setIsSubmitting(false);
    }
  };

  // Prevent flash of empty content during SSR hydration
  if (!isHydrated) {
    return <div className="glass rounded-2xl p-8 h-[400px] animate-pulse" />;
  }

  return (
    <div className="glass-elevated rounded-2xl p-8 animate-slide-up shadow-2xl border border-accent-primary/20" id="audit-form">
      {/* Step Progress Indicator */}
      <div className="mb-8 flex items-center justify-center gap-3">
        {Array.from({ length: totalSteps }, (_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition-all duration-500 ${
                i + 1 <= step
                  ? "bg-gradient-to-br from-accent-primary to-accent-secondary text-white shadow-lg shadow-accent-glow scale-110 font-poppins"
                  : i + 1 === step + 1 
                  ? "bg-surface-elevated text-accent-primary border-2 border-accent-primary/40 font-poppins"
                  : "bg-surface text-foreground/40 font-poppins"
              }`}
            >
              {i + 1 <= step ? "✓" : i + 1}
            </div>
            {i < totalSteps - 1 && (
              <div
                className={`h-1 w-12 rounded-full transition-all duration-500 ${
                  i + 1 < step ? "bg-gradient-to-r from-accent-primary to-accent-secondary shadow-md shadow-accent-glow" : "bg-border"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step Labels */}
      <div className="mb-8 text-center animate-fade-in">
        <h3 className="text-2xl font-bold text-foreground font-display">
          {step === 1 && "👥 About Your Team"}
          {step === 2 && "🔧 Your AI Tools"}
          {step === 3 && "✨ Review & Submit"}
        </h3>
        <p className="mt-2 text-sm text-foreground/60 font-inter">
          {step === 1 && "Tell us about your startup and team size"}
          {step === 2 && "Select the AI tools your team currently uses"}
          {step === 3 && "Review your selections and get your personalized audit"}
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-danger/10 border border-danger/30 text-danger text-sm font-medium flex items-start gap-3 animate-bounce-in">
          <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Step 1: Company Info */}
      {step === 1 && (
        <div className="space-y-5 animate-fade-in">
          <div className="group">
            <label
              htmlFor="email"
              className="block text-sm font-semibold text-foreground/80 mb-2 font-poppins"
            >
              Work Email <span className="text-danger font-bold">*</span>
            </label>
            <div className="relative">
              <input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="you@startup.com"
                className="w-full rounded-xl border border-border/50 bg-surface/50 px-4 py-3 text-foreground placeholder:text-foreground/30 focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/30 transition-all duration-300 hover:border-border backdrop-blur-sm font-inter"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/30 group-hover:text-accent-primary transition-colors">
                📧
              </div>
            </div>
          </div>

          <div className="group">
            <label
              htmlFor="company-name"
              className="block text-sm font-semibold text-foreground/80 mb-2 font-poppins"
            >
              Company Name
              <span className="text-foreground/40 text-xs font-normal ml-1">(Optional)</span>
            </label>
            <div className="relative">
              <input
                id="company-name"
                type="text"
                value={formData.companyName || ""}
                onChange={handleChange}
                placeholder="Acme Corp"
                className="w-full rounded-xl border border-border/50 bg-surface/50 px-4 py-3 text-foreground placeholder:text-foreground/30 focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/30 transition-all duration-300 hover:border-border backdrop-blur-sm font-inter"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/30 group-hover:text-accent-primary transition-colors">
                🏢
              </div>
            </div>
          </div>

          <div className="group">
            <label
              htmlFor="role"
              className="block text-sm font-semibold text-foreground/80 mb-2 font-poppins"
            >
              Your Role
              <span className="text-foreground/40 text-xs font-normal ml-1">(Optional)</span>
            </label>
            <div className="relative">
              <input
                id="role"
                type="text"
                value={formData.role || ""}
                onChange={handleChange}
                placeholder="CTO, Founder, Tech Lead..."
                className="w-full rounded-xl border border-border/50 bg-surface/50 px-4 py-3 text-foreground placeholder:text-foreground/30 focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/30 transition-all duration-300 hover:border-border backdrop-blur-sm font-inter"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/30 group-hover:text-accent-primary transition-colors">
                👔
              </div>
            </div>
          </div>

          <div className="group">
            <label
              htmlFor="team-size"
              className="block text-sm font-semibold text-foreground/80 mb-2 font-poppins"
            >
              Engineering Team Size
              <span className="text-foreground/40 text-xs font-normal ml-1">(Optional)</span>
            </label>
            <div className="relative">
              <input
                id="team-size"
                type="number"
                min={1}
                value={formData.teamSize || ""}
                onChange={handleChange}
                placeholder="e.g., 12"
                className="w-full rounded-xl border border-border/50 bg-surface/50 px-4 py-3 text-foreground placeholder:text-foreground/30 focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/30 transition-all duration-300 hover:border-border backdrop-blur-sm font-inter"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/30 group-hover:text-accent-primary transition-colors">
                👥
              </div>
            </div>
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

      {/* Step 2: Tool Selection */}
      {step === 2 && (
        <div className="animate-fade-in space-y-3 max-h-[450px] overflow-y-auto pr-2 custom-scrollbar">
          <p className="text-sm text-foreground/70 mb-6 font-inter font-medium sticky top-0 bg-surface/50 backdrop-blur-sm p-3 rounded-lg">
            ✨ Select the tools your team currently uses
          </p>
          
          {[
            { slug: "cursor", name: "Cursor", icon: "💻", options: [{ name: "Pro", price: "Rs 1,887", slug: "pro", quantity: 1 }, { name: "Teams", price: "Rs 3,775/user", slug: "teams", quantity: formData.teamSize || 1 }] },
            { slug: "copilot", name: "GitHub Copilot", icon: "🐙", options: [{ name: "Individual", price: "Rs 944", slug: "individual", quantity: 1 }, { name: "Business", price: "Rs 1,793/user", slug: "business", quantity: formData.teamSize || 1 }, { name: "Enterprise", price: "Rs 3,680/user", slug: "enterprise", quantity: formData.teamSize || 1 }] },
            { slug: "claude", name: "Claude", icon: "🤖", options: [{ name: "Pro", price: "Rs 1,887", slug: "pro", quantity: 1 }, { name: "Team", price: "Rs 2,831/user", slug: "team_standard", quantity: formData.teamSize || 1 }] },
            { slug: "chatgpt", name: "ChatGPT", icon: "💬", options: [{ name: "Plus", price: "Rs 1,887", slug: "plus", quantity: 1 }, { name: "Business", price: "Rs 1,800/user/year", slug: "business", quantity: formData.teamSize || 1 }, { name: "Pro", price: "Rs 18,874", slug: "pro", quantity: 1 }] },
            { slug: "api_anthropic_sonnet", name: "Anthropic API", icon: "🔗", options: [{ name: "Moderate Usage", price: "~Rs 5,662/mo", slug: "api_usage", quantity: 1 }] },
            { slug: "api_openai_gpt5_4", name: "OpenAI API", icon: "🔌", options: [{ name: "Moderate Usage", price: "~Rs 5,190/mo", slug: "api_usage", quantity: 1 }] },
          ].map((tool, idx) => (
            <div
              key={tool.slug}
              className="p-4 rounded-xl border border-border/40 bg-surface/30 backdrop-blur-sm transition-all duration-300 hover:border-accent-primary/40 hover:bg-surface/50 group stagger-children"
              style={{animationDelay: `${idx * 0.05}s`}}
            >
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-semibold text-foreground flex items-center gap-2 font-poppins">
                  <span className="text-xl group-hover:scale-125 transition-transform">{tool.icon}</span>
                  {tool.name}
                </h4>
              </div>
              {!formData.tools.find(t => t.toolSlug === tool.slug) ? (
                <div className="flex flex-wrap gap-2">
                  {tool.options.map((opt) => (
                    <button 
                      key={opt.slug}
                      onClick={() => addTool(tool.slug, opt.slug, opt.quantity)}
                      className="px-3 py-2 text-xs font-semibold rounded-lg bg-accent-primary/10 text-accent-primary hover:bg-accent-primary/20 border border-accent-primary/20 hover:border-accent-primary/40 transition-all duration-300 hover:shadow-md hover:shadow-accent-glow/50 hover:-translate-y-0.5 font-inter"
                    >
                      + {opt.name}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-success font-semibold flex items-center gap-2 font-poppins">
                      ✓ Added: {formData.tools.find(t => t.toolSlug === tool.slug)?.planName?.replace("_", " ")}
                    </span>
                    <button 
                      onClick={() => removeTool(tool.slug)} 
                      className="text-danger/80 hover:text-danger font-semibold transition-colors font-poppins"
                    >
                      Remove
                    </button>
                  </div>
                  
                  {/* Billing Cycle Toggle — for subscription tools */}
                  {!tool.slug.startsWith("api_") && (
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-foreground/50 font-inter">Billing:</span>
                      <div className="flex rounded-lg border border-border/40 overflow-hidden">
                        {(["monthly", "annual"] as const).map((cycle) => (
                          <button
                            key={cycle}
                            onClick={() => {
                              setFormData((prev) => ({
                                ...prev,
                                tools: prev.tools.map((t) =>
                                  t.toolSlug === tool.slug ? { ...t, billingCycle: cycle } : t
                                ),
                              }));
                            }}
                            className={`px-3 py-1.5 text-xs font-medium transition-all ${
                              (formData.tools.find(t => t.toolSlug === tool.slug)?.billingCycle || "monthly") === cycle
                                ? "bg-accent-primary/20 text-accent-primary"
                                : "text-foreground/40 hover:text-foreground/60"
                            }`}
                          >
                            {cycle === "monthly" ? "Monthly" : "Annual"}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Active Users Input — for per-seat plans */}
                  {tool.options.find(o => o.slug === formData.tools.find(t => t.toolSlug === tool.slug)?.planName)?.quantity !== 1 && (
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-foreground/50 font-inter whitespace-nowrap">Active users:</span>
                      <input
                        type="number"
                        min={0}
                        max={formData.teamSize || 9999}
                        placeholder={`${formData.teamSize || "All"}`}
                        value={formData.tools.find(t => t.toolSlug === tool.slug)?.activeUsers ?? ""}
                        onChange={(e) => {
                          const val = e.target.value === "" ? undefined : Number(e.target.value);
                          setFormData((prev) => ({
                            ...prev,
                            tools: prev.tools.map((t) =>
                              t.toolSlug === tool.slug ? { ...t, activeUsers: val } : t
                            ),
                          }));
                        }}
                        className="w-20 rounded-lg border border-border/40 bg-surface/50 px-3 py-1.5 text-xs text-foreground placeholder:text-foreground/30 focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary/30 font-inter"
                      />
                      <span className="text-xs text-foreground/40 font-inter">
                        of {formData.teamSize || "?"} total
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Step 3: Review */}
      {step === 3 && (
        <div className="animate-fade-in space-y-5 text-sm">
          <div className="p-5 rounded-xl border border-accent-primary/20 bg-accent-primary/5 backdrop-blur-sm space-y-2">
            <h4 className="font-bold text-foreground font-poppins mb-3">📋 Your Information</h4>
            <p className="text-foreground/80"><span className="font-semibold">Email:</span> {formData.email}</p>
            {formData.companyName && <p className="text-foreground/80"><span className="font-semibold">Company:</span> {formData.companyName}</p>}
            {formData.role && <p className="text-foreground/80"><span className="font-semibold">Role:</span> {formData.role}</p>}
            {formData.teamSize && <p className="text-foreground/80"><span className="font-semibold">Team Size:</span> {formData.teamSize} engineers</p>}
          </div>
          
          <div className="p-5 rounded-xl border border-accent-secondary/20 bg-accent-secondary/5 backdrop-blur-sm space-y-3">
            <h4 className="font-bold text-foreground font-poppins mb-3">🔧 Selected Tools ({formData.tools.length})</h4>
            {formData.tools.length === 0 ? (
              <p className="text-danger font-semibold">⚠️ Please go back and select at least one tool.</p>
            ) : (
              <ul className="space-y-2">
                {formData.tools.map((tool, idx) => (
                  <li key={tool.toolSlug} className="flex items-start gap-2 text-foreground/80 animate-slide-left" style={{animationDelay: `${idx * 0.1}s`}}>
                    <span className="text-accent-primary font-bold mt-1">•</span>
                    <span><span className="font-semibold">{tool.toolSlug.replace("api_", "").toUpperCase()}</span> - {tool.planName.replace("_", " ")} {tool.planName !== "api_usage" ? `(${tool.quantity} seats)` : "(Estimated Tokens)"}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="p-5 rounded-xl border border-success/20 bg-success/5 backdrop-blur-sm">
            <p className="text-foreground/70 font-inter">
              ✨ Submit your information and we'll generate your personalized AI spend audit report in seconds!
            </p>
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="mt-10 flex justify-between gap-4">
        <button
          onClick={() => setStep(Math.max(1, step - 1))}
          disabled={step === 1 || isSubmitting}
          className="group flex-1 sm:flex-none rounded-xl border-2 border-border px-8 py-3 text-sm font-bold text-foreground/70 transition-all duration-300 hover:border-accent-primary/50 hover:text-foreground hover:bg-accent-primary/5 hover:shadow-md disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-border disabled:hover:text-foreground/70 disabled:hover:bg-transparent font-poppins"
        >
          ← Back
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
          className="group relative flex-1 sm:flex-none rounded-xl bg-gradient-to-r from-accent-primary to-accent-secondary px-8 py-3 text-sm font-bold text-white transition-all duration-300 hover:shadow-[0_10px_30px_rgba(99,102,241,0.3)] hover:-translate-y-1 disabled:opacity-50 disabled:hover:shadow-none disabled:hover:-translate-y-0 overflow-hidden font-poppins"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-accent-secondary to-accent-tertiary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <span className="relative flex items-center justify-center gap-2">
            {isSubmitting ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Generating...
              </>
            ) : step === totalSteps ? (
              <>
                Get My Audit
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </>
            ) : (
              <>
                Continue
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </>
            )}
          </span>
        </button>
      </div>
    </div>
  );
}
