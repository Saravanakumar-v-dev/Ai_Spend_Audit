/**
 * Privacy-Safe Share Page — /share/[id]
 */

import type { Metadata } from "next";
import Link from "next/link";

import { calculateAudit } from "@/lib/audit-engine";
import { generateAISummary } from "@/lib/ai-summary";
import type { AuditFormData } from "@/lib/validators";
import OptimizationNotifySignup from "@/components/OptimizationNotifySignup";
import { formatUsd } from "@/lib/format-usd";
import {
  MONTHLY_SAVINGS_SARAVANAKUMAR_HIGHLIGHT_USD,
  MONTHLY_SAVINGS_HONEST_SMALL_USD,
} from "@/lib/savings-thresholds";

interface SharePageProps {
  params: Promise<{ id: string }>;
}

function decodePayload(id: string): AuditFormData | null {
  try {
    const decoded = Buffer.from(
      decodeURIComponent(id),
      "base64url"
    ).toString("utf-8");
    return JSON.parse(decoded) as AuditFormData;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: SharePageProps): Promise<Metadata> {
  const { id } = await params;
  const input = decodePayload(id);

  let savingsText = "Run your free AI spend audit";
  let savingsAmount = "$0";
  if (input) {
    const result = await calculateAudit({
      ...input,
      teamSize: input.teamSize ?? 1,
    });
    if (result.totalMonthlySavings > 0) {
      savingsAmount = formatUsd(result.totalMonthlySavings);
      savingsText = `We found ${savingsAmount}/mo in AI spending savings`;
    }
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const shareUrl = `${baseUrl}/share/${id}`;

  return {
    title: `${savingsText} — Saravanakumar Audit`,
    description:
      "USD-native Saravanakumar benchmarking for AI tooling across Cursor, Copilot, ChatGPT, and Claude. Deterministic math, zero guesswork.",
    alternates: {
      canonical: shareUrl,
    },
    openGraph: {
      title: savingsText,
      description:
        "Privacy-safe audit report showing AI spending optimization opportunities. Tools analyzed: Cursor, Copilot, ChatGPT, Claude, Gemini.",
      type: "website",
      siteName: "Saravanakumar Spend Lab",
      url: shareUrl,
      images: [
        {
          url: `${baseUrl}/og-image.png`,
          width: 1200,
          height: 630,
          alt: "Saravanakumar AI Spend Audit Report",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: savingsText,
      description: `Found potential AI spending savings of ${savingsAmount}/month. Compare with Saravanakumar benchmarks.`,
      images: [`${baseUrl}/og-image.png`],
    },
    robots: { index: true, follow: true },
  };
}

export default async function SharePage({ params }: SharePageProps) {
  const { id } = await params;
  const input = decodePayload(id);

  if (!input) {
    return (
      <main className="min-h-screen bg-background text-foreground flex items-center justify-center px-6">
        <div className="glass rounded-2xl p-12 text-center max-w-md space-y-6 animate-slide-up">
          <h1 className="text-3xl font-extrabold">Report unavailable</h1>
          <p className="text-foreground/60">
            Decode failed — regenerate from the Saravanakumar Spend Lab landing page.
          </p>
          <Link
            href="/"
            className="inline-block rounded-full bg-accent-primary px-8 py-3 font-semibold text-white transition-all hover:bg-accent-primary-hover hover:shadow-lg hover:shadow-accent-glow hover:-translate-y-0.5"
          >
            Run audit
          </Link>
        </div>
      </main>
    );
  }

  const sanitisedInput: AuditFormData = {
    ...input,
    email: "redacted@example.com",
    companyName: undefined,
    role: undefined,
    teamSize: input.teamSize ?? 1,
  };

  const result = await calculateAudit(sanitisedInput);
  const aiSummary = await generateAISummary(result);

  const monthly = result.totalMonthlySavings;
  const annual = result.totalAnnualSavings;
  const optimised = monthly < MONTHLY_SAVINGS_HONEST_SMALL_USD;
  const saravanakumarMoment = monthly > MONTHLY_SAVINGS_SARAVANAKUMAR_HIGHLIGHT_USD;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-surface/80 backdrop-blur-md px-6 py-4 sticky top-0 z-50">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link href="/" className="text-xl font-bold gradient-text">
            Saravanakumar · Share preview
          </Link>
          <div className="flex items-center gap-3">
            <a
              href={`/api/pdf/${id}`}
              className="rounded-full bg-surface-elevated px-4 py-2 text-sm font-medium text-foreground/70 transition-all duration-300 hover:bg-accent-primary/20 hover:text-accent-primary border border-border"
            >
              Export PDF
            </a>
            <Link
              href="/"
              className="rounded-full bg-accent-primary/10 px-5 py-2 text-sm font-semibold text-accent-primary transition-all duration-300 hover:bg-accent-primary hover:text-white hover:shadow-[0_0_20px_var(--accent-glow)]"
            >
              Run your audit
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-12 space-y-12 animate-slide-up">
        <section className="text-center space-y-6 rounded-[32px] border border-white/10 bg-gradient-to-br from-surface via-background to-surface-elevated p-10">
          <p className="text-xs uppercase tracking-[0.4em] text-accent-primary font-semibold">
            Sanitised Saravanakumar excerpt
          </p>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight">
            {optimised ? (
              "Spending calmly — benchmarks agree."
            ) : (
              <>
                <span className="gradient-text">{formatUsd(annual)}</span>{" "}
                modeled annual airflow
              </>
            )}
          </h1>
          <p className="text-lg text-foreground/70 max-w-2xl mx-auto leading-relaxed">
            {aiSummary}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            <div className="glass rounded-2xl p-8 border border-border">
              <p className="text-xs uppercase tracking-wide text-foreground/50 mb-3">
                Current USD / mo
              </p>
              <p className="text-4xl font-black text-danger">
                {formatUsd(result.totalCurrentMonthlySpend)}
              </p>
            </div>
            <div className="glass rounded-2xl p-8 border border-border ring-2 ring-accent-primary/30">
              <p className="text-xs uppercase tracking-wide text-accent-primary mb-3">
                Monthly savings
              </p>
              <p className="text-5xl font-black text-accent-primary">
                {formatUsd(monthly)}
              </p>
            </div>
            <div className="glass rounded-2xl p-8 border border-border">
              <p className="text-xs uppercase tracking-wide text-success mb-3">
                Annual savings
              </p>
              <p className="text-5xl font-black text-success">{formatUsd(annual)}</p>
            </div>
          </div>
        </section>

        {saravanakumarMoment && (
          <section className="rounded-3xl border border-accent-secondary/35 bg-accent-primary/15 px-8 py-10 text-center shadow-lg space-y-4">
            <h2 className="text-3xl font-black text-white">
              Saravanakumar is how teams monetize benchmarks
            </h2>
            <p className="text-white/85 text-lg max-w-3xl mx-auto">
              Forecasted savings crest{" "}
              <span className="font-semibold">{formatUsd(MONTHLY_SAVINGS_SARAVANAKUMAR_HIGHLIGHT_USD)}</span>{" "}
              / month — Saravanakumar plugs legal, procurement, and FinOps workflows so
              the upside survives signature.
            </p>
          </section>
        )}

        {optimised ? (
          <OptimizationNotifySignup muted />
        ) : null}

        <section className="space-y-4">
          <h3 className="text-2xl font-bold">Line items (USD)</h3>
          <div className="space-y-4">
            {result.toolResults.map((tool, idx) => (
              <div
                key={idx}
                className="glass p-6 rounded-xl border border-border flex flex-col gap-4 md:flex-row md:items-start md:justify-between"
              >
                <div className="min-w-[200px]">
                  <p className="text-xs uppercase text-foreground/50">
                    {tool.toolName}
                  </p>
                  <h4 className="text-xl font-black">{tool.currentPlan}</h4>
                  <p className="text-sm text-danger font-semibold mt-2">
                    {formatUsd(tool.currentMonthlyCost)} / mo modeled
                  </p>
                </div>
                <div className="flex-1 text-sm bg-background/50 p-4 rounded-lg border border-border/60 space-y-2">
                  <p className="text-xs uppercase text-foreground/50">
                    Action · savings
                  </p>
                  <p className="font-semibold text-foreground">
                    {tool.monthlySavings > 0
                      ? `${tool.recommendedAction} → save ${formatUsd(tool.monthlySavings)} / mo`
                      : `${tool.recommendedAction}`}
                  </p>
                  <p className="text-foreground/70 leading-relaxed">{tool.reasoning}</p>
                </div>
                <div className="text-right min-w-[140px]">
                  <p className="text-xs text-foreground/50 uppercase">Post move</p>
                  <p className="text-3xl font-black text-success">
                    {formatUsd(
                      Math.max(tool.currentMonthlyCost - tool.monthlySavings, 0)
                    )}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="text-center space-y-4 pb-12">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-accent-primary to-accent-secondary px-10 py-4 text-lg font-semibold text-white shadow-lg hover:-translate-y-0.5 transition"
          >
            Clone this audit stack
          </Link>
          <p className="text-sm text-foreground/50">
            Public link strips inbox + company specifics — deterministic math stays.
          </p>
        </section>
      </div>

      <footer className="border-t border-border/50 px-6 py-6 text-center text-xs text-foreground/30">
        Benchmarks anchored {result.pricingReferenceDate}. No PII in this route.
      </footer>
    </main>
  );
}
