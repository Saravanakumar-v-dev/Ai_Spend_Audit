/**
 * Privacy-Safe Share Page — /share/[id]
 *
 * Public-facing shareable audit report. This route explicitly strips
 * all PII (email, company_name) before rendering. Only the tool
 * breakdown and aggregate savings are shown.
 *
 * Uses the same stateless base64url encoding strategy as /audit/[id].
 */

import type { Metadata } from "next";
import Link from "next/link";
import { calculateAudit } from "@/lib/audit-engine";
import { generateAISummary } from "@/lib/ai-summary";
import type { AuditFormData } from "@/lib/validators";

interface SharePageProps {
  params: Promise<{ id: string }>;
}

// ---------------------------------------------------------------------------
// Helper — decode the stateless URL payload
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Dynamic Open Graph + Twitter Card metadata (Step 3)
// ---------------------------------------------------------------------------

export async function generateMetadata({
  params,
}: SharePageProps): Promise<Metadata> {
  const { id } = await params;
  const input = decodePayload(id);

  let savingsText = "Run your free AI spend audit";
  if (input) {
    const result = await calculateAudit({
      ...input,
      teamSize: input.teamSize ?? 1,
    });
    if (result.totalMonthlySavings > 0) {
      savingsText = `We found Rs ${Math.round(result.totalMonthlySavings).toLocaleString("en-IN")}/mo in wasted AI spend. Run your audit.`;
    }
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  return {
    title: savingsText,
    description:
      "See the full breakdown of AI tool spending and savings opportunities. Free audit — no credit card required.",
    openGraph: {
      title: savingsText,
      description:
        "See the full breakdown of AI tool spending and savings opportunities.",
      type: "website",
      siteName: "Saravanakumar AI Spend Audit",
      url: `${baseUrl}/share/${id}`,
    },
    twitter: {
      card: "summary_large_image",
      title: savingsText,
      description:
        "See the full breakdown of AI tool spending and savings opportunities.",
    },
    robots: { index: true, follow: true },
  };
}

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

export default async function SharePage({ params }: SharePageProps) {
  const { id } = await params;
  const input = decodePayload(id);

  // If the URL is invalid, show a CTA to run their own audit
  if (!input) {
    return (
      <main className="min-h-screen bg-background text-foreground flex items-center justify-center px-6">
        <div className="glass rounded-2xl p-12 text-center max-w-md space-y-6 animate-slide-up">
          <h1 className="text-3xl font-extrabold">Report Not Found</h1>
          <p className="text-foreground/60">
            This audit link appears to be invalid or has expired.
          </p>
          <Link
            href="/"
            className="inline-block rounded-full bg-accent-primary px-8 py-3 font-semibold text-white transition-all hover:bg-accent-primary-hover hover:shadow-lg hover:shadow-accent-glow hover:-translate-y-0.5"
          >
            Run Your Free Audit →
          </Link>
        </div>
      </main>
    );
  }

  // ---- SECURITY: Strip PII before processing for the public page ----
  const sanitisedInput: AuditFormData = {
    ...input,
    email: "redacted@private.com", // strip real email
    companyName: undefined,        // strip company name
    role: undefined,               // strip role
    teamSize: input.teamSize ?? 1,
  };

  const result = await calculateAudit(sanitisedInput);
  const aiSummary = await generateAISummary(result);

  const totalMonthlySavings = result.totalMonthlySavings;
  const totalAnnualSavings = result.totalAnnualSavings;
  const HONESTY_THRESHOLD_INR = 8350;
  const HIGH_SAVINGS_THRESHOLD_INR = 41750;
  const isPerfectlyOptimised = totalMonthlySavings < HONESTY_THRESHOLD_INR;
  const isHighSavings = totalMonthlySavings > HIGH_SAVINGS_THRESHOLD_INR;

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-surface/80 backdrop-blur-md px-6 py-4 sticky top-0 z-50">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link href="/" className="text-xl font-bold gradient-text">
            Saravanakumar AI Audit
          </Link>
          <Link
            href="/"
            className="rounded-full bg-accent-primary/10 px-5 py-2 text-sm font-semibold text-accent-primary transition-all duration-300 hover:bg-accent-primary hover:text-white hover:shadow-[0_0_20px_var(--accent-glow)]"
          >
            Run Your Own Audit →
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-12 space-y-12 animate-slide-up">
        {/* HERO */}
        <section className="text-center space-y-6" aria-labelledby="share-hero-title">
          <div className="inline-flex items-center gap-2 rounded-full bg-accent-glow border border-accent-primary/20 px-4 py-1.5 text-xs font-medium text-accent-primary">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-primary"></span>
            </span>
            Shared Audit Report
          </div>

          <h1
            id="share-hero-title"
            className="text-4xl md:text-5xl font-extrabold tracking-tight"
          >
            {isPerfectlyOptimised ? (
              "This team is spending well."
            ) : (
              <>
                <span className="gradient-text">
                  Rs {Math.round(totalAnnualSavings).toLocaleString("en-IN")}
                </span>{" "}
                in annual savings found.
              </>
            )}
          </h1>

          <p className="text-lg text-foreground/60 max-w-2xl mx-auto leading-relaxed">
            {aiSummary}
          </p>

          {/* Stat cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 stagger-children">
            <div className="glass rounded-2xl p-8 border border-border" role="status" aria-label="Current monthly spend">
              <p className="text-sm font-medium text-foreground/50 uppercase tracking-wider mb-2">
                Current Monthly
              </p>
              <p className="text-4xl font-bold text-danger">
                Rs{" "}
                {Math.round(result.totalCurrentMonthlySpend).toLocaleString(
                  "en-IN"
                )}
              </p>
            </div>
            <div className="glass rounded-2xl p-8 border border-border ring-2 ring-accent-primary/20" role="status" aria-label="Monthly savings">
              <p className="text-sm font-medium text-accent-primary uppercase tracking-wider mb-2">
                Monthly Savings
              </p>
              <p className="text-4xl font-bold text-accent-primary">
                Rs{" "}
                {Math.round(totalMonthlySavings).toLocaleString("en-IN")}
              </p>
            </div>
            <div className="glass rounded-2xl p-8 border border-border" role="status" aria-label="Annual savings">
              <p className="text-sm font-medium text-success uppercase tracking-wider mb-2">
                Annual Savings
              </p>
              <p className="text-4xl font-bold text-success">
                Rs{" "}
                {Math.round(totalAnnualSavings).toLocaleString("en-IN")}
              </p>
            </div>
          </div>
        </section>

        {/* HONESTY FILTER / HIGH-SAVINGS CTA */}
        {isPerfectlyOptimised ? (
          <section className="glass rounded-2xl p-10 border border-success/30 bg-success/5 text-center" aria-label="Optimisation status">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-success/20 text-success mb-6">
              <svg
                className="w-8 h-8"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-3">Stack is well-optimised.</h2>
            <p className="text-foreground/70 max-w-xl mx-auto">
              No fake savings here. This AI stack is running efficiently for the
              current team size.
            </p>
          </section>
        ) : isHighSavings ? (
          <section className="glass rounded-2xl p-10 border border-accent-primary/30 bg-accent-primary/5 text-center" aria-label="High savings detected">
            <h2 className="text-3xl font-bold mb-4 text-accent-primary">
              Massive Savings Detected
            </h2>
            <p className="text-lg text-foreground/80 max-w-2xl mx-auto mb-8">
              This team is overspending by more than Rs 40,000 every month.
              Saravanakumar can help restructure licenses and negotiate
              enterprise volume discounts.
            </p>
            <Link
              href="/"
              className="inline-block bg-accent-primary hover:bg-accent-primary-hover text-white font-bold py-4 px-10 rounded-full shadow-lg shadow-accent-glow transition-all hover:-translate-y-1 text-lg animate-pulse-glow"
            >
              Run Your Own Audit
            </Link>
          </section>
        ) : null}

        {/* LINE-ITEM BREAKDOWN */}
        <section className="space-y-6" aria-label="Tool-by-tool analysis">
          <h3 className="text-2xl font-bold">Line-Item Analysis</h3>
          <div className="space-y-4 stagger-children">
            {result.toolResults.map((tool, idx) => (
              <div
                key={idx}
                className="glass p-6 rounded-xl border border-border flex flex-col md:flex-row gap-6 items-start md:items-center justify-between"
              >
                <div className="min-w-[140px]">
                  <h4 className="font-bold text-lg">{tool.toolName}</h4>
                  <p className="text-sm text-foreground/50">
                    Current: {tool.currentPlan}
                  </p>
                </div>

                <div className="flex-1 max-w-xl text-sm bg-background/50 p-4 rounded-lg border border-border/50">
                  <p className="font-medium text-foreground/80">
                    {tool.reasoning}
                  </p>
                </div>

                <div className="text-right min-w-[130px]">
                  <p className="text-sm text-foreground/50">
                    Potential Savings
                  </p>
                  <p
                    className={`font-bold text-lg ${
                      tool.monthlySavings > 0
                        ? "text-accent-primary"
                        : "text-foreground/30"
                    }`}
                  >
                    {tool.monthlySavings > 0
                      ? `+ Rs ${Math.round(tool.monthlySavings).toLocaleString("en-IN")}/mo`
                      : "Optimised"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Footer */}
        <section className="text-center pt-4 pb-8 space-y-4" aria-label="Call to action">
          <p className="text-foreground/50 text-sm">
            Want your own personalised audit?
          </p>
          <Link
            href="/"
            className="inline-block rounded-full bg-accent-primary px-10 py-4 font-bold text-white text-lg transition-all hover:bg-accent-primary-hover hover:shadow-lg hover:shadow-accent-glow hover:-translate-y-0.5"
          >
            Start Free Audit →
          </Link>
        </section>
      </div>

      <footer className="border-t border-border/50 px-6 py-6 text-center text-xs text-foreground/30">
        Pricing benchmarks verified May 2026. This report contains no
        personally identifiable information.
      </footer>
    </main>
  );
}
