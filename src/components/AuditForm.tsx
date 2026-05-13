/**
 * AuditForm — Client Component
 *
 * Multi-step form for collecting AI tool usage data.
 * Persists to localStorage (fields + wizard step) across reloads.
 */

"use client";

import { useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { AuditFormData, ToolSelection } from "@/lib/validators";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { AUDIT_TOOL_CHOICES } from "@/data/audit-tools";
import type { AuditToolChoice } from "@/data/audit-tools";
import { formatUsd } from "@/lib/format-usd";
import { HONEYPOT_FIELD_NAME } from "@/lib/honeypot";

export default function AuditForm() {
  const router = useRouter();
  const totalSteps = 3;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData, formHydrated] = useLocalStorage<AuditFormData>(
    "auditFormData",
    {
      companyName: "",
      role: "",
      teamSize: 1,
      email: "",
      primaryUseCase: "mixed",
      tools: [],
    }
  );

  const [step, setStep, stepHydrated] = useLocalStorage<number>(
    "auditFormStep",
    1
  );

  const [honeypot, setHoneypot] = useState("");

  const hydrated = formHydrated && stepHydrated;

  const normalizedStep = Math.min(Math.max(step, 1), totalSteps);

  const auditToolLookup = useMemo(() => {
    const map = new Map<string, AuditToolChoice>();
    AUDIT_TOOL_CHOICES.forEach((t) => map.set(t.slug, t));
    return map;
  }, []);

  const handleChange = useCallback(
    (
      e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
      const { id, value, type } = e.target;
      let key = id;
      if (id === "company-name") key = "companyName";
      if (id === "team-size") key = "teamSize";
      if (id === "primary-use-case") key = "primaryUseCase";

      setFormData((prev) => ({
        ...prev,
        [key]:
          type === "number"
            ? value === ""
              ? undefined
              : Number(value)
            : value,
      }));
    },
    [setFormData]
  );

  const handleHoneypotChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setHoneypot(e.target.value);
  }, []);

  const addTool = useCallback((choice: AuditToolChoice, planName: string) => {
    const option = choice.options.find((o) => o.planName === planName);
    if (!option) return;
    const team = formData.teamSize || 1;
    const qty = option.perSeat ? team : 1;
    const newTool: ToolSelection = {
      toolSlug: choice.slug,
      planName,
      quantity: qty,
      billingCycle: "monthly",
      seatCount: option.perSeat ? qty : undefined,
      estimatedMonthlyTokens: choice.slug.startsWith("api_")
        ? { inputTokens: 10_000_000, outputTokens: 2_000_000 }
        : undefined,
    };

    setFormData((prev) => {
      if (prev.tools.find((t) => t.toolSlug === choice.slug)) return prev;
      return { ...prev, tools: [...prev.tools, newTool] };
    });
  }, [formData.teamSize, setFormData]);

  const removeTool = useCallback((toolSlug: string) => {
    setFormData((prev) => ({
      ...prev,
      tools: prev.tools.filter((t) => t.toolSlug !== toolSlug),
    }));
  }, [setFormData]);

  const updateTool = useCallback(
    (
      slug: string,
      patch: Partial<ToolSelection>
    ) => {
      setFormData((prev) => ({
        ...prev,
        tools: prev.tools.map((t) =>
          t.toolSlug === slug ? { ...t, ...patch } : t
        ),
      }));
    },
    [setFormData]
  );

  const goStep = useCallback((next: number) => {
    const clamped = Math.min(Math.max(next, 1), totalSteps);
    setStep(clamped);
  }, [setStep, totalSteps]);

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const payload = {
        ...formData,
        [HONEYPOT_FIELD_NAME]: honeypot,
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

      localStorage.removeItem("auditFormData");
      localStorage.removeItem("auditFormStep");
      router.push(`/audit/${data.auditId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate audit");
      setIsSubmitting(false);
    }
  }, [formData, honeypot, router, setFormData, setStep]);

  if (!hydrated) {
    return <div className="glass rounded-2xl p-8 h-[400px] animate-pulse" />;
  }

  return (
    <div
      className="glass-elevated rounded-2xl p-8 animate-slide-up shadow-2xl border border-accent-primary/20"
      id="audit-form"
    >
      <div className="mb-8 flex items-center justify-center gap-3">
        {Array.from({ length: totalSteps }, (_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition-all duration-500 ${
                i + 1 <= normalizedStep
                  ? "bg-gradient-to-br from-accent-primary to-accent-secondary text-white shadow-lg shadow-accent-glow scale-110 font-poppins"
                  : i + 1 === normalizedStep + 1
                    ? "bg-surface-elevated text-accent-primary border-2 border-accent-primary/40 font-poppins"
                    : "bg-surface text-foreground/40 font-poppins"
              }`}
            >
              {i + 1 <= normalizedStep ? "✓" : i + 1}
            </div>
            {i < totalSteps - 1 && (
              <div
                className={`h-1 w-12 rounded-full transition-all duration-500 ${
                  i + 1 < normalizedStep
                    ? "bg-gradient-to-r from-accent-primary to-accent-secondary shadow-md shadow-accent-glow"
                    : "bg-border"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <div className="mb-8 text-center animate-fade-in">
        <h3 className="text-2xl font-bold text-foreground font-display">
          {normalizedStep === 1 && "👥 Team & mission"}
          {normalizedStep === 2 && "🔧 AI stack (USD-native)"}
          {normalizedStep === 3 && "✨ Review & generate"}
        </h3>
        <p className="mt-2 text-sm text-foreground/60 font-inter">
          {normalizedStep === 1 &&
            "We size seats and savings using your real headcount + use case."}
          {normalizedStep === 2 &&
            "Every label lists US list pricing as of May 2026 — override with your invoice if needed."}
          {normalizedStep === 3 &&
            "We never fabricate savings; everything is benchmark-driven."}
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-danger/10 border border-danger/30 text-danger text-sm font-medium flex items-start gap-3 animate-bounce-in">
          <span>{error}</span>
        </div>
      )}

      <div className="absolute left-[-9999px] top-[-9999px]" aria-hidden="true">
        <label htmlFor={HONEYPOT_FIELD_NAME}>Website</label>
        <input
          type="text"
          id={HONEYPOT_FIELD_NAME}
          name={HONEYPOT_FIELD_NAME}
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={handleHoneypotChange}
        />
      </div>

      {normalizedStep === 1 && (
        <div className="space-y-5 animate-fade-in">
          <div className="group">
            <label
              htmlFor="email"
              className="block text-sm font-semibold text-foreground/80 mb-2 font-poppins"
            >
              Work Email <span className="text-danger font-bold">*</span>
            </label>
            <input
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="you@startup.com"
              className="w-full rounded-xl border border-border/50 bg-surface/50 px-4 py-3 text-foreground placeholder:text-foreground/30 focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/30 transition-all duration-300 font-inter"
            />
          </div>

          <div className="group">
            <label
              htmlFor="company-name"
              className="block text-sm font-semibold text-foreground/80 mb-2 font-poppins"
            >
              Company{" "}
              <span className="text-foreground/60 text-xs font-normal">
                (optional)
              </span>
            </label>
            <input
              id="company-name"
              type="text"
              value={formData.companyName || ""}
              onChange={handleChange}
              placeholder="Acme Corp"
              className="w-full rounded-xl border border-border/50 bg-surface/50 px-4 py-3 text-foreground placeholder:text-foreground/30 focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/30 transition-all duration-300 font-inter"
            />
          </div>

          <div className="group">
            <label
              htmlFor="role"
              className="block text-sm font-semibold text-foreground/80 mb-2 font-poppins"
            >
              Role{" "}
              <span className="text-foreground/60 text-xs font-normal">
                (optional)
              </span>
            </label>
            <input
              id="role"
              type="text"
              value={formData.role || ""}
              onChange={handleChange}
              placeholder="CTO, Staff Engineer…"
              className="w-full rounded-xl border border-border/50 bg-surface/50 px-4 py-3 text-foreground placeholder:text-foreground/30 focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/30 transition-all duration-300 font-inter"
            />
          </div>

          <div className="group">
            <label
              htmlFor="team-size"
              className="block text-sm font-semibold text-foreground/80 mb-2 font-poppins"
            >
              Engineering team size{" "}
              <span className="text-foreground/60 text-xs font-normal">
                (seats)
              </span>
            </label>
            <input
              id="team-size"
              type="number"
              min={1}
              value={formData.teamSize ?? ""}
              onChange={handleChange}
              placeholder="12"
              className="w-full rounded-xl border border-border/50 bg-surface/50 px-4 py-3 text-foreground placeholder:text-foreground/30 focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/30 transition-all duration-300 font-inter"
            />
          </div>

          <div className="group">
            <label
              htmlFor="primary-use-case"
              className="block text-sm font-semibold text-foreground/80 mb-2 font-poppins"
            >
              Primary use case
            </label>
            <select
              id="primary-use-case"
              value={formData.primaryUseCase ?? "mixed"}
              onChange={handleChange}
              className="w-full rounded-xl border border-border/50 bg-surface/50 px-4 py-3 text-foreground focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/30 transition-all duration-300 font-inter"
            >
              <option value="coding">Coding / shipping software</option>
              <option value="writing">Writing / GTM</option>
              <option value="data">Data / analytics</option>
              <option value="research">Research / strategy</option>
              <option value="mixed">Mixed workflows</option>
            </select>
          </div>
        </div>
      )}

      {normalizedStep === 2 && (
        <div className="animate-fade-in space-y-3 max-h-[520px] overflow-y-auto pr-2 custom-scrollbar">
          <p className="text-sm text-foreground/70 mb-4 font-inter font-medium sticky top-0 bg-surface/60 backdrop-blur-sm p-3 rounded-xl border border-border/40">
            Minimum coverage for submission week benchmarks: Cursor, Copilot,
            Claude, ChatGPT, Anthropic & OpenAI APIs, Gemini (subscription +
            API), plus v0. Reference rates stay in USD to avoid FX confusion on
            screenshots.
          </p>

          {AUDIT_TOOL_CHOICES.map((tool, idx) => {
            const active = formData.tools.find((t) => t.toolSlug === tool.slug);
            const isApi = tool.slug.startsWith("api_");

            return (
              <div
                key={tool.slug}
                className="p-4 rounded-xl border border-border/40 bg-surface/30 backdrop-blur-sm transition-all duration-300 hover:border-accent-primary/40 hover:bg-surface/50 group"
                style={{ animationDelay: `${idx * 0.03}s` }}
              >
                <div className="flex justify-between items-start mb-3 gap-3">
                  <div>
                    <h4 className="font-semibold text-foreground flex items-center gap-2 font-poppins text-base">
                      <span className="text-xl">{tool.icon}</span>
                      {tool.name}
                    </h4>
                    <p className="text-xs text-foreground/50 mt-1 font-inter leading-relaxed">
                      {tool.headline}
                    </p>
                  </div>
                </div>
                {!active ? (
                  <div className="flex flex-col gap-3">
                    {tool.modelRatesNote && (
                      <p className="text-[11px] text-foreground/45 font-mono leading-snug border border-border/40 rounded-lg px-3 py-2 bg-background/40">
                        {tool.modelRatesNote}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {tool.options.map((opt) => (
                        <button
                          key={opt.planName}
                          type="button"
                          onClick={() => addTool(tool, opt.planName)}
                          className="px-3 py-2 text-xs font-semibold rounded-lg bg-accent-primary/10 text-accent-primary hover:bg-accent-primary/20 border border-accent-primary/20 hover:border-accent-primary/40 transition-all duration-300 font-inter text-left"
                        >
                          + {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm gap-2">
                      <span className="text-success font-semibold font-poppins">
                        ✓ {active.planName.replaceAll("_", " ")}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeTool(tool.slug)}
                        className="text-danger/80 hover:text-danger font-semibold transition-colors font-poppins"
                      >
                        Remove
                      </button>
                    </div>

                    {!isApi && (
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="text-xs text-foreground/50 font-inter">
                          Billing
                        </span>
                        <div className="flex rounded-lg border border-border/40 overflow-hidden">
                          {(["monthly", "annual"] as const).map((cycle) => (
                            <button
                              key={cycle}
                              type="button"
                              onClick={() =>
                                updateTool(tool.slug, { billingCycle: cycle })
                              }
                              className={`px-3 py-1.5 text-xs font-medium transition-all ${
                                (active.billingCycle || "monthly") === cycle
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

                    {!isApi ? (
                      <div className="grid sm:grid-cols-2 gap-3">
                        <div>
                          <label htmlFor={`seats-${tool.slug}`} className="text-[11px] uppercase tracking-wide text-foreground/40 font-semibold">
                            Billed seats / licenses
                          </label>
                          <input
                            id={`seats-${tool.slug}`}
                            type="number"
                            min={1}
                            value={active.seatCount ?? active.quantity}
                            onChange={(e) => {
                              const val = Number(e.target.value) || 1;
                              updateTool(tool.slug, {
                                seatCount: val,
                                quantity: val,
                              });
                            }}
                            className="mt-1 w-full rounded-lg border border-border/40 bg-surface/50 px-3 py-2 text-sm text-foreground focus:border-accent-primary focus:outline-none font-inter"
                          />
                        </div>
                        <div>
                          <label htmlFor={`invoice-${tool.slug}`} className="text-[11px] uppercase tracking-wide text-foreground/40 font-semibold">
                            Invoice (USD / mo, optional)
                          </label>
                          <input
                            id={`invoice-${tool.slug}`}
                            type="number"
                            min={0}
                            step="0.01"
                            placeholder="Overrides list-price math"
                            value={active.reportedMonthlySpendUsd ?? ""}
                            onChange={(e) => {
                              const raw = e.target.value;
                              updateTool(tool.slug, {
                                reportedMonthlySpendUsd:
                                  raw === "" ? undefined : Number(raw),
                              });
                            }}
                            className="mt-1 w-full rounded-lg border border-border/40 bg-surface/50 px-3 py-2 text-sm text-foreground focus:border-accent-primary focus:outline-none font-inter"
                          />
                        </div>
                      </div>
                    ) : (
                      <div>
                        <label htmlFor={`api-invoice-${tool.slug}`} className="text-[11px] uppercase tracking-wide text-foreground/40 font-semibold">
                          Cloud invoice (USD / mo, optional)
                        </label>
                        <input
                          id={`api-invoice-${tool.slug}`}
                          type="number"
                          min={0}
                          step="0.01"
                          placeholder="Paste last month's API bill"
                          value={active.reportedMonthlySpendUsd ?? ""}
                          onChange={(e) => {
                            const raw = e.target.value;
                            updateTool(tool.slug, {
                              reportedMonthlySpendUsd:
                                raw === "" ? undefined : Number(raw),
                            });
                          }}
                          className="mt-1 w-full rounded-lg border border-border/40 bg-surface/50 px-3 py-2 text-sm text-foreground focus:border-accent-primary focus:outline-none font-inter"
                        />
                      </div>
                    )}

                    {auditToolLookup
                      .get(tool.slug)
                      ?.options.find((o) => o.planName === active.planName)
                      ?.perSeat && (
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-xs text-foreground/50 font-inter whitespace-nowrap">
                          Active users (optional)
                        </span>
                        <input
                          type="number"
                          min={0}
                          max={active.seatCount ?? active.quantity}
                          placeholder="Seats in use"
                          value={active.activeUsers ?? ""}
                          onChange={(e) => {
                            const raw = e.target.value;
                            updateTool(tool.slug, {
                              activeUsers:
                                raw === "" ? undefined : Number(raw),
                            });
                          }}
                          className="w-28 rounded-lg border border-border/40 bg-surface/50 px-3 py-1.5 text-xs text-foreground focus:border-accent-primary focus:outline-none font-inter"
                        />
                        <span className="text-xs text-foreground/40 font-inter">
                          of {active.seatCount ?? active.quantity} billed
                        </span>
                      </div>
                    )}

                    {isApi && (
                      <div className="grid sm:grid-cols-2 gap-3">
                        <div>
                          <label htmlFor={`input-tokens-${tool.slug}`} className="text-[11px] uppercase tracking-wide text-foreground/40 font-semibold">
                            Input tokens / mo (millions)
                          </label>
                          <input
                            id={`input-tokens-${tool.slug}`}
                            type="number"
                            min={0}
                            step={0.1}
                            value={
                              (active.estimatedMonthlyTokens?.inputTokens ??
                                0) / 1_000_000
                            }
                            onChange={(e) => {
                              const m = Number(e.target.value);
                              updateTool(tool.slug, {
                                estimatedMonthlyTokens: {
                                  inputTokens: Math.round(m * 1_000_000),
                                  outputTokens:
                                    active.estimatedMonthlyTokens
                                      ?.outputTokens ?? 2_000_000,
                                },
                              });
                            }}
                            className="mt-1 w-full rounded-lg border border-border/40 bg-surface/50 px-3 py-2 text-sm text-foreground focus:border-accent-primary focus:outline-none font-inter"
                          />
                        </div>
                        <div>
                          <label htmlFor={`output-tokens-${tool.slug}`} className="text-[11px] uppercase tracking-wide text-foreground/40 font-semibold">
                            Output tokens / mo (millions)
                          </label>
                          <input
                            id={`output-tokens-${tool.slug}`}
                            type="number"
                            min={0}
                            step={0.1}
                            value={
                              (active.estimatedMonthlyTokens?.outputTokens ??
                                0) / 1_000_000
                            }
                            onChange={(e) => {
                              const m = Number(e.target.value);
                              updateTool(tool.slug, {
                                estimatedMonthlyTokens: {
                                  inputTokens:
                                    active.estimatedMonthlyTokens
                                      ?.inputTokens ?? 10_000_000,
                                  outputTokens: Math.round(m * 1_000_000),
                                },
                              });
                            }}
                            className="mt-1 w-full rounded-lg border border-border/40 bg-surface/50 px-3 py-2 text-sm text-foreground focus:border-accent-primary focus:outline-none font-inter"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {normalizedStep === 3 && (
        <div className="animate-fade-in space-y-5 text-sm">
          <div className="p-5 rounded-xl border border-accent-primary/20 bg-accent-primary/5 backdrop-blur-sm space-y-2">
            <h4 className="font-bold text-foreground font-poppins mb-3">
              📋 Snapshot
            </h4>
            <p className="text-foreground/80">
              <span className="font-semibold">Email:</span> {formData.email}
            </p>
            {formData.companyName && (
              <p className="text-foreground/80">
                <span className="font-semibold">Company:</span>{" "}
                {formData.companyName}
              </p>
            )}
            {formData.role && (
              <p className="text-foreground/80">
                <span className="font-semibold">Role:</span> {formData.role}
              </p>
            )}
            {formData.teamSize && (
              <p className="text-foreground/80">
                <span className="font-semibold">Team size:</span>{" "}
                {formData.teamSize} seats
              </p>
            )}
            {formData.primaryUseCase && (
              <p className="text-foreground/80">
                <span className="font-semibold">Primary use case:</span>{" "}
                {formData.primaryUseCase}
              </p>
            )}
          </div>

          <div className="p-5 rounded-xl border border-accent-secondary/20 bg-accent-secondary/5 backdrop-blur-sm space-y-3">
            <h4 className="font-bold text-foreground font-poppins mb-3">
              🔧 Selected tools ({formData.tools.length})
            </h4>
            {formData.tools.length === 0 ? (
              <p className="text-danger font-semibold">
                Please add at least one tool on the previous step.
              </p>
            ) : (
              <ul className="space-y-2">
                {formData.tools.map((tool) => {
                  const meta = auditToolLookup.get(tool.toolSlug);
                  return (
                    <li
                      key={tool.toolSlug}
                      className="flex flex-col gap-1 text-foreground/80"
                    >
                      <span className="font-semibold">
                        {meta?.name ?? tool.toolSlug} ·{" "}
                        {tool.planName.replaceAll("_", " ")}
                      </span>
                      <span className="text-xs text-foreground/50">
                        Seats/licenses: {tool.seatCount ?? tool.quantity}
                        {tool.reportedMonthlySpendUsd != null && (
                          <>
                            {" "}
                            · Declared spend{" "}
                            {formatUsd(tool.reportedMonthlySpendUsd)}
                          </>
                        )}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="p-5 rounded-xl border border-success/20 bg-success/5 backdrop-blur-sm">
            <p className="text-foreground/70 font-inter">
              Output is screenshot-ready: USD totals, per-tool actions, and
              explicit honesty when you are already optimal.
            </p>
          </div>
        </div>
      )}

      <div className="mt-10 flex justify-between gap-4">
        <button
          type="button"
          onClick={() => goStep(Math.max(1, normalizedStep - 1))}
          disabled={normalizedStep === 1 || isSubmitting}
          className="group flex-1 sm:flex-none rounded-xl border-2 border-border px-8 py-3 text-sm font-bold text-foreground/70 transition-all duration-300 hover:border-accent-primary/50 hover:text-foreground hover:bg-accent-primary/5 hover:shadow-md disabled:opacity-30 disabled:cursor-not-allowed font-poppins"
        >
          ← Back
        </button>
        <button
          type="button"
          onClick={() => {
            if (normalizedStep === totalSteps) {
              if (formData.tools.length > 0 && formData.email) {
                handleSubmit();
              } else {
                setError(
                  "Add at least one tool and a work email before generating the audit."
                );
              }
            } else {
              goStep(Math.min(totalSteps, normalizedStep + 1));
            }
          }}
          disabled={isSubmitting}
          className="group relative flex-1 sm:flex-none rounded-xl bg-gradient-to-r from-accent-primary to-accent-secondary px-8 py-3 text-sm font-bold text-white transition-all duration-300 hover:shadow-[0_10px_30px_rgba(99,102,241,0.3)] hover:-translate-y-1 disabled:opacity-50 disabled:hover:shadow-none disabled:hover:-translate-y-0 overflow-hidden font-poppins"
        >
          <span className="relative flex items-center justify-center gap-2">
            {isSubmitting ? (
              <>Generating…</>
            ) : normalizedStep === totalSteps ? (
              <>
                Generate audit
                <svg
                  className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                  />
                </svg>
              </>
            ) : (
              <>
                Continue
                <svg
                  className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                  />
                </svg>
              </>
            )}
          </span>
        </button>
      </div>
    </div>
  );
}
