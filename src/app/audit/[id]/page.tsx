/**
 * Audit Report Page - /audit/[id]
 */

import type { Metadata } from "next";
import Link from "next/link";

import { calculateAudit } from "@/lib/audit-engine";
import { generateAISummary } from "@/lib/ai-summary";
import type { AuditFormData } from "@/lib/validators";
import SavingsChart from "@/components/SavingsChart";
import CopyLinkButton from "@/components/CopyLinkButton";
import OptimizationNotifySignup from "@/components/OptimizationNotifySignup";
import { formatUsd } from "@/lib/format-usd";
import {
  MONTHLY_SAVINGS_SARAVANAKUMAR_HIGHLIGHT_USD,
  MONTHLY_SAVINGS_HONEST_SMALL_USD,
} from "@/lib/savings-thresholds";

interface AuditPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: AuditPageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `AI Spend Audit — ${id.slice(0, 8)}`,
    description: "USD-native AI procurement audit tuned for Saravanakumar benchmarks.",
  };
}

export const revalidate = 3600;

export default async function AuditReportPage({ params }: AuditPageProps) {
  const { id } = await params;

  let parsedInput: AuditFormData | null = null;
  try {
    const decoded = Buffer.from(
      decodeURIComponent(id),
      "base64url"
    ).toString("utf-8");
    parsedInput = JSON.parse(decoded) as AuditFormData;
  } catch {
    console.log("Invalid URL payload. Falling back to mock data.");
  }

  const inputData: AuditFormData = parsedInput ?? {
    companyName: "Acme Corp",
    teamSize: 6,
    email: "founder@acmecorp.com",
    primaryUseCase: "coding",
    tools: [
      {
        toolSlug: "copilot",
        planName: "enterprise",
        quantity: 6,
        seatCount: 6,
        billingCycle: "monthly",
      },
      {
        toolSlug: "claude",
        planName: "team",
        quantity: 6,
        seatCount: 6,
        billingCycle: "monthly",
      },
    ],
  };

  const result = await calculateAudit({
    ...inputData,
    teamSize: inputData.teamSize ?? 1,
  });
  const aiSummary = await generateAISummary(result);

  const totalMonthlySavings = result.totalMonthlySavings;
  const totalAnnualSavings = result.totalAnnualSavings;

  const isAlreadyOptimal =
    totalMonthlySavings < MONTHLY_SAVINGS_HONEST_SMALL_USD;
  const shouldHighlightSaravanakumar =
    totalMonthlySavings > MONTHLY_SAVINGS_SARAVANAKUMAR_HIGHLIGHT_USD;

  const shareUrl = `/share/${id}`;

  const toolBreakdowns = result.toolResults.map((t) => ({
    toolName: t.toolName,
    currentCost: t.currentMonthlyCost,
    optimizedCost: t.recommendedMonthlyCost ?? t.currentMonthlyCost,
    savings: t.monthlySavings,
  }));

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-surface/80 backdrop-blur-md px-6 py-4 sticky top-0 z-50">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link href="/" className="text-xl font-bold gradient-text">
            Saravanakumar · AI Spend Lab
          </Link>
          <div className="flex items-center gap-3">
            <CopyLinkButton url={shareUrl} label="Copy share link" />
            <a
              href={`/api/pdf/${id}`}
              className="rounded-full bg-surface-elevated px-4 py-2 text-sm font-medium text-foreground/70 transition-all duration-300 hover:bg-accent-primary/20 hover:text-accent-primary border border-border"
            >
              Export PDF
            </a>
            <Link
              href={`/share/${id}`}
              className="rounded-full bg-surface-elevated px-4 py-2 text-sm font-medium text-foreground/70 transition-all duration-300 hover:bg-accent-primary/20 hover:text-accent-primary border border-border"
            >
              Open public view ↗
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-12 space-y-12 animate-slide-up">
        <section className="relative overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-br from-surface via-background to-surface-elevated shadow-[0_40px_120px_rgba(15,23,42,0.45)]">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-32 right-0 h-72 w-72 rounded-full bg-accent-primary/25 blur-[120px]" />
            <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-accent-secondary/20 blur-[100px]" />
          </div>

          <div className="relative px-6 py-12 sm:px-12 sm:py-16 space-y-10">
            <div className="text-center space-y-4 max-w-3xl mx-auto">
              <p className="text-xs font-semibold tracking-[0.35em] uppercase text-accent-primary/80">
                USD benchmark · {result.pricingReferenceDate}
              </p>
              <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
                {isAlreadyOptimal ? (
                  <>You&apos;re already running a lean stack.</>
                ) : (
                  <>
                    Unlock{" "}
                    <span className="gradient-text">
                      {formatUsd(totalMonthlySavings)}
                    </span>{" "}
                    / month
                  </>
                )}
              </h1>
              <p className="text-lg text-foreground/70 leading-relaxed">
                {aiSummary}
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              <div className="rounded-2xl border border-white/5 bg-white/5 p-6 backdrop-blur-xl">
                <p className="text-xs uppercase tracking-wide text-foreground/50 mb-2">
                  Current monthly (USD)
                </p>
                <p className="text-4xl font-black text-danger">
                  {formatUsd(result.totalCurrentMonthlySpend)}
                </p>
              </div>
              <div className="rounded-2xl border border-accent-primary/40 bg-accent-primary/10 p-6 backdrop-blur-xl shadow-[0_20px_80px_rgba(99,102,241,0.35)]">
                <p className="text-xs uppercase tracking-wide text-accent-primary mb-2">
                  Monthly savings
                </p>
                <p className="text-5xl font-black text-white">
                  {formatUsd(totalMonthlySavings)}
                </p>
                <p className="text-sm text-white/80 mt-2">
                  ≈ {formatUsd(totalAnnualSavings)} annualized runway
                </p>
              </div>
              <div className="rounded-2xl border border-white/5 bg-white/5 p-6 backdrop-blur-xl">
                <p className="text-xs uppercase tracking-wide text-foreground/50 mb-2">
                  Optimized monthly
                </p>
                <p className="text-4xl font-black text-success">
                  {formatUsd(result.totalOptimizedMonthlySpend)}
                </p>
              </div>
            </div>
          </div>
        </section>

        {shouldHighlightSaravanakumar && (
          <section className="relative overflow-hidden rounded-3xl border border-accent-secondary/40 bg-gradient-to-br from-accent-primary/25 via-accent-secondary/10 to-accent-tertiary/20 px-8 py-10 text-center shadow-glow space-y-5">
            <div className="absolute inset-y-10 right-0 w-1/3 bg-white/15 blur-[90px]" />
            <div className="relative space-y-3">
              <p className="text-xs font-semibold tracking-[0.4em] uppercase text-white/70">
                Enterprise leverage window
              </p>
              <h2 className="text-3xl md:text-4xl font-black text-white leading-tight">
                Capture more than slide math with Saravanakumar
              </h2>
              <p className="text-white/85 text-lg leading-relaxed max-w-3xl mx-auto">
                When modeled savings crest{" "}
                <span className="font-bold">
                  {formatUsd(MONTHLY_SAVINGS_SARAVANAKUMAR_HIGHLIGHT_USD)}
                </span>
                , procurement execution matters as much as the benchmark.
                Saravanakumar stages renewals, contract floors, and usage guardrails so
                the dollars actually hit your runway — not slides.
              </p>
              <div className="flex flex-wrap justify-center gap-4 pt-4">
                <a
                  href="https://saravanakumar-v-portfolio.vercel.app/"
                  className="inline-flex items-center justify-center rounded-full bg-white px-8 py-3 text-base font-semibold text-slate-900 shadow-lg shadow-black/30 transition hover:-translate-y-0.5"
                >
                  Contact Saravanakumar
                </a>
                <Link
                  href="/"
                  className="inline-flex items-center justify-center rounded-full border border-white/40 px-8 py-3 text-base font-semibold text-white hover:bg-white/10"
                >
                  Run another stack
                </Link>
              </div>
            </div>
          </section>
        )}

        {isAlreadyOptimal && (
          <OptimizationNotifySignup
            defaultEmail={parsedInput?.email ?? inputData.email}
          />
        )}

        {!isAlreadyOptimal && !shouldHighlightSaravanakumar && (
          <section className="rounded-3xl border border-border/70 bg-surface/70 p-10 text-center space-y-5">
            <h3 className="text-2xl font-bold">Meaningful, not theatrical</h3>
            <p className="text-foreground/70 max-w-2xl mx-auto">
              Savings sit between pragmatic double digits and Saravanakumar-worthy
              triple digits in USD — still worth enforcing, especially before
              your next renewal window.
            </p>
          </section>
        )}

        {result.toolResults.length > 0 && (
          <SavingsChart
            currentSpend={result.totalCurrentMonthlySpend}
            optimizedSpend={result.totalOptimizedMonthlySpend}
            savings={totalMonthlySavings}
            toolBreakdowns={toolBreakdowns}
          />
        )}

        <section className="space-y-6">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-foreground/50">
                Per-tool playbook
              </p>
              <h3 className="text-3xl font-black">Spend → Action → Savings</h3>
            </div>
            <p className="text-sm text-foreground/60 max-w-lg">
              Every row pairs your modeled USD invoice with one decisive move.
              Reasons stay one sentence — perfect for Slack forwards.
            </p>
          </div>

          <div className="space-y-5">
            {result.toolResults.map((tool, idx) => (
              <div
                key={`${tool.toolSlug}-${idx}`}
                className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-surface via-background to-surface p-6 sm:p-8 shadow-xl"
              >
                <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
                  <div className="space-y-2 min-w-[220px]">
                    <p className="text-xs font-semibold text-accent-secondary uppercase tracking-wide">
                      {tool.toolName}
                    </p>
                    <h4 className="text-2xl font-black">{tool.currentPlan}</h4>
                    <p className="text-sm text-foreground/60">
                      Current modeled spend
                    </p>
                    <p className="text-3xl font-black text-danger">
                      {formatUsd(tool.currentMonthlyCost)}{" "}
                      <span className="text-base font-semibold text-foreground/60">
                        / mo
                      </span>
                    </p>
                  </div>

                  <div className="flex-1 space-y-5">
                    <div className="flex flex-wrap items-center gap-3 text-sm md:text-base">
                      {tool.monthlySavings > 0 ? (
                        <>
                          <span className="rounded-full bg-white/10 px-4 py-1 font-semibold text-white">
                            Action · {tool.recommendedAction}
                          </span>
                          <span className="text-xl text-accent-primary font-black">
                            Save {formatUsd(tool.monthlySavings)} / mo
                          </span>
                        </>
                      ) : (
                        <span className="rounded-full border border-white/25 px-4 py-2 text-sm font-semibold text-white/85">
                          {tool.recommendedAction} — deterministic list-price
                          model shows no uplift to chase this cycle.
                        </span>
                      )}
                    </div>
                    <p className="text-base text-foreground/80 leading-relaxed border border-border/60 rounded-xl p-4 bg-surface/40">
                      {tool.reasoning}
                    </p>
                    {tool.crossCategoryNote && (
                      <p className="text-xs text-warning border border-warning/30 rounded-lg px-4 py-3 bg-warning/5">
                        {tool.crossCategoryNote}
                      </p>
                    )}
                    {tool.toolSlug.startsWith("api_") && (
                      <p className="text-[11px] text-foreground/45">
                        * API rows default to moderate throughput (≈10M in · 2M
                        out) unless your form overrides tokens.
                      </p>
                    )}
                  </div>

                  <div className="text-right min-w-[160px]">
                    <p className="text-xs uppercase tracking-wide text-foreground/50">
                      After optimization
                    </p>
                    <p className="text-4xl font-black text-success mt-2">
                      {formatUsd(
                        Math.max(
                          tool.currentMonthlyCost - tool.monthlySavings,
                          0
                        )
                      )}
                    </p>
                    <p className="text-[11px] text-foreground/50 mt-1">
                      {tool.monthlySavings > 0
                        ? `${Math.round(tool.savingsPercentage)}% of row spend`
                        : "Already tuned"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {result.recommendations.length > 0 && (
          <section className="glass rounded-2xl p-8 border border-accent-secondary/20 space-y-4">
            <h3 className="text-2xl font-bold flex items-center gap-2">
              <span>💡</span> Recommendations queue
            </h3>
            <ul className="space-y-3">
              {result.recommendations.map((rec, idx) => (
                <li
                  key={`${idx}-rec`}
                  className="flex items-start gap-3 text-foreground/80 text-sm leading-relaxed"
                >
                  <span className="text-accent-primary font-bold mt-0.5">→</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <p className="text-center text-xs text-foreground/40 font-inter">
          Pricing snapshot {result.pricingReferenceDate}. All figures are modeled
          in USD for apples-to-apples vendor comparisons — Saravanakumar overlays your
          contract reality during implementation.
        </p>
      </div>
    </main>
  );
}
