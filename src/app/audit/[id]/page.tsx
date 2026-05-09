/**
 * Audit Report Page - /audit/[id]
 *
 * Server-rendered page for the personalized audit report.
 */

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

// For MVP, we use a mocked data fallback so the UI works 
// even if the database is not fully connected with Service Keys.
import { calculateAudit } from "@/lib/audit-engine";
import { AuditFormData } from "@/lib/validators";

interface AuditPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: AuditPageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `AI Spend Audit Report - ${id.slice(0, 8)}`,
    description: "Personalized AI spend audit report.",
  };
}

export const revalidate = 3600;

export default async function AuditReportPage({ params }: AuditPageProps) {
  const { id } = await params;

  // We use our stateless URL encoding strategy to parse the data from the URL
  let parsedInput: AuditFormData | null = null;
  try {
    // Attempt to decode the id parameter. 
    // This will throw if the ID is an old stub (e.g., 'stub-id-123') or invalid base64.
    const decoded = Buffer.from(decodeURIComponent(id), 'base64url').toString('utf-8');
    parsedInput = JSON.parse(decoded) as AuditFormData;
  } catch (error) {
    // Silently catch to avoid Next.js dev overlay intercepting console.error
    console.log("Invalid URL payload. Falling back to mock data.");
  }

  // Fallback to mock data if someone hits a bad URL directly
  const inputData = parsedInput || {
    companyName: "Acme Corp",
    teamSize: 5,
    email: "founder@acmecorp.com",
    tools: [
      { toolSlug: "copilot", planName: "enterprise", quantity: 5, billingCycle: "monthly" },
      { toolSlug: "claude", planName: "team_premium", quantity: 5, billingCycle: "monthly" }
    ]
  };
  
  const result = await calculateAudit(inputData);

  const totalMonthlySavings = result.totalMonthlySavings;
  const totalAnnualSavings = result.totalAnnualSavings;
  
  // Thresholds based on INR (~$100 and ~$500)
  const HONESTY_THRESHOLD_INR = 8350;
  const HIGH_SAVINGS_THRESHOLD_INR = 41750;

  const isPerfectlyOptimized = totalMonthlySavings < HONESTY_THRESHOLD_INR;
  const isHighSavings = totalMonthlySavings > HIGH_SAVINGS_THRESHOLD_INR;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-surface px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link href="/" className="text-xl font-bold gradient-text">
            Saravanakumar AI Audit
          </Link>
          <span className="text-sm text-foreground/50">
            Report ID: {id.slice(0, 8)}
          </span>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-12 space-y-12 animate-slide-up">
        
        {/* HERO SECTION */}
        <section className="text-center space-y-6">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            Your AI Spend Analysis
          </h1>
          <p className="text-lg text-foreground/60 max-w-2xl mx-auto">
            Based on our May 2026 pricing benchmarks, here is the objective breakdown of your stack's financial efficiency.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8">
            <div className="glass rounded-2xl p-8 border border-border">
              <p className="text-sm font-medium text-foreground/50 uppercase tracking-wider mb-2">Current Monthly</p>
              <p className="text-4xl font-bold text-danger">
                Rs {result.totalCurrentMonthlySpend.toLocaleString('en-IN')}
              </p>
            </div>
            <div className="glass rounded-2xl p-8 border border-border ring-2 ring-accent-primary/20">
              <p className="text-sm font-medium text-accent-primary uppercase tracking-wider mb-2">Monthly Savings</p>
              <p className="text-4xl font-bold text-accent-primary">
                Rs {totalMonthlySavings.toLocaleString('en-IN')}
              </p>
            </div>
            <div className="glass rounded-2xl p-8 border border-border">
              <p className="text-sm font-medium text-success uppercase tracking-wider mb-2">Annual Savings</p>
              <p className="text-4xl font-bold text-success">
                Rs {totalAnnualSavings.toLocaleString('en-IN')}
              </p>
            </div>
          </div>
        </section>

        {/* HONESTY FILTER OR HIGH SAVINGS CTA */}
        {isPerfectlyOptimized ? (
          <section className="glass rounded-2xl p-10 border border-success/30 bg-success/5 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-success/20 text-success mb-6">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-4">You're spending well.</h2>
            <p className="text-foreground/70 max-w-xl mx-auto mb-8">
              We don't manufacture fake savings. Your current AI stack is highly optimized for your team size. There are no major changes we recommend right now.
            </p>
            <div className="max-w-md mx-auto">
              <form className="flex gap-2">
                <input 
                  type="email" 
                  placeholder="Notify me when new optimizations apply" 
                  className="flex-1 rounded-lg border border-border bg-background px-4 py-3 focus:ring-2 focus:ring-accent-primary outline-none"
                  required
                />
                <button type="submit" className="bg-surface-elevated hover:bg-border px-6 py-3 rounded-lg font-medium transition-colors">
                  Notify Me
                </button>
              </form>
            </div>
          </section>
        ) : isHighSavings ? (
          <section className="glass rounded-2xl p-10 border border-accent-primary/30 bg-accent-primary/5 text-center">
            <h2 className="text-3xl font-bold mb-4 text-accent-primary">Massive Savings Detected</h2>
            <p className="text-lg text-foreground/80 max-w-2xl mx-auto mb-8">
              Your team is overspending by more than Rs 40,000 every month. Saravanakumar can help you restructure your licenses and negotiate enterprise volume discounts.
            </p>
            <button className="bg-accent-primary hover:bg-accent-primary-hover text-white font-bold py-4 px-10 rounded-full shadow-lg shadow-accent-glow transition-all hover:-translate-y-1 text-lg animate-pulse-glow">
              Book a Credex Consultation
            </button>
          </section>
        ) : null}

        {/* DETAILED BREAKDOWN */}
        <section className="space-y-6">
          <h3 className="text-2xl font-bold">Line-Item Analysis</h3>
          <div className="space-y-4">
            {result.toolResults.map((tool, idx) => (
              <div key={idx} className="glass p-6 rounded-xl border border-border flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                <div>
                  <h4 className="font-bold text-lg">{tool.toolName}</h4>
                  <p className="text-sm text-foreground/50">Current: {tool.currentPlan}</p>
                </div>
                
                <div className="flex-1 max-w-xl text-sm bg-background/50 p-4 rounded-lg border border-border/50">
                  <p className="font-medium text-foreground/80">{tool.reasoning}</p>
                </div>

                <div className="text-right min-w-[120px]">
                  <p className="text-sm text-foreground/50">Potential Savings</p>
                  <p className={`font-bold text-lg ${tool.monthlySavings > 0 ? 'text-accent-primary' : 'text-foreground/30'}`}>
                    {tool.monthlySavings > 0 ? `+ Rs ${tool.monthlySavings.toLocaleString('en-IN')}/mo` : 'Optimized'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </main>
  );
}
