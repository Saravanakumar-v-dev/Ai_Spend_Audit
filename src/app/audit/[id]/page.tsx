/**
 * Audit Report Page - /audit/[id]
 *
 * Server-rendered placeholder page for the personalized audit report.
 */

import type { Metadata } from "next";

interface AuditPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: AuditPageProps): Promise<Metadata> {
  const { id } = await params;

  void id;

  return {
    title: "AI Spend Audit Report - Saravanakumar",
    description:
      "Personalized AI spend audit report. See where your team can save on AI tools.",
    openGraph: {
      title: "AI Spend Audit Report - Saravanakumar",
      description:
        "See the full breakdown of AI tool spending and savings opportunities.",
      type: "website",
    },
    robots: {
      index: false,
      follow: false,
    },
  };
}

export const revalidate = 3600;

export default async function AuditReportPage({ params }: AuditPageProps) {
  const { id } = await params;

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border px-6 py-4">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <h1 className="text-xl font-bold gradient-text">
            Saravanakumar AI Spend Audit
          </h1>
          <span className="text-sm text-foreground/50">
            Report ID: {id.slice(0, 8)}...
          </span>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-6 py-16">
        <div className="glass rounded-2xl p-8 text-center animate-slide-up">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-accent-glow">
            <svg
              className="h-8 w-8 text-accent-primary"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0 1 12 15a9.065 9.065 0 0 0-6.23.693L5 14.5m14.8.8 1.402 1.402c1.232 1.232.65 3.318-1.067 3.611l-.772.13c-1.687.282-3.404.426-5.154.426s-3.467-.144-5.154-.426l-.772-.13c-1.717-.293-2.3-2.379-1.067-3.61L5 14.5"
              />
            </svg>
          </div>

          <h2 className="mb-3 text-2xl font-bold text-foreground">
            Audit Engine Coming Soon
          </h2>
          <p className="mx-auto mb-6 max-w-md text-foreground/60">
            This report page will display your personalized AI spend breakdown
            once the audit engine is implemented. The data validated
            successfully and the calculator now uses INR-based pricing.
          </p>

          <div className="inline-flex items-center gap-2 rounded-full bg-warning-bg px-4 py-2 text-sm text-warning">
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
              />
            </svg>
            Discovery and foundation phase - report UI still in progress
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3 stagger-children">
          {[
            {
              label: "Current Monthly Spend",
              value: "Rs --",
              color: "text-danger",
            },
            {
              label: "Optimized Spend",
              value: "Rs --",
              color: "text-success",
            },
            {
              label: "Monthly Savings",
              value: "Rs --",
              color: "text-accent-primary",
            },
          ].map((stat) => (
            <div key={stat.label} className="glass rounded-xl p-6 text-center">
              <p className="mb-1 text-sm text-foreground/50">{stat.label}</p>
              <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
