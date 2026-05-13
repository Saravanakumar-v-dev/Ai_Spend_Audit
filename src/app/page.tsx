/**
 * Landing Page — Saravanakumar AI Spend Audit
 *
 * Statically generated (SSG) for instant load and SEO indexing.
 * Contains the marketing hero, value propositions, and the audit form.
 */

import dynamic from "next/dynamic";
import CTASection from "@/components/CTASection";
import { Metadata } from "next";

/* Lazy-load the heavy AuditForm client component (31 KB, 735 LOC)
   to reduce Total Blocking Time and improve Lighthouse performance. */
const AuditForm = dynamic(() => import("@/components/AuditForm"), {
  loading: () => (
    <div className="glass-elevated rounded-2xl p-8 h-[400px] animate-pulse border border-accent-primary/20" />
  ),
});

export const metadata: Metadata = {
  title: "Free AI Spend Audit for Your Team | Saravanakumar",
  description: "Audit your AI tool spending in 2 minutes. Get personalized savings recommendations for Cursor, Copilot, Claude, ChatGPT, and more.",
  openGraph: {
    title: "Free AI Spend Audit | Saravanakumar",
    description: "Find out how much your team is overspending on AI tools.",
  },
};

export default function HomePage() {
  return (
    <main id="main-content" className="min-h-screen bg-background overflow-hidden">
      {/* Navigation */}
      <nav className="border-b border-border/50 px-6 py-4 sticky top-0 z-50 backdrop-blur-sm bg-background/90" aria-label="Main navigation">
        <div className="mx-auto max-w-5xl flex items-center justify-between">
          <a href="https://saravanakumar-v-portfolio.vercel.app/" target="_blank" rel="noopener noreferrer" className="text-xl font-bold gradient-text-fast font-display hover:opacity-80 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:rounded" aria-label="Saravanakumar Spend Lab - Home">
            Saravanakumar Spend Lab
          </a>
          <a
            href="#audit-form"
            className="group relative rounded-full bg-accent-primary/10 px-5 py-2.5 text-sm font-semibold text-accent-primary transition-all duration-300 hover:bg-accent-primary hover:text-white hover:shadow-[0_0_20px_var(--accent-glow)] hover:-translate-y-0.5 border border-accent-primary/20 hover:border-accent-primary/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent-primary"
            aria-label="Start Free Audit"
          >
            <span className="relative z-10 flex items-center gap-2">
              Start Free Audit
              <svg className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </span>
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-6 pt-20 pb-16 sm:pt-28 sm:pb-20 overflow-hidden" aria-labelledby="hero-title">
        {/* Animated background gradient orbs */}
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-gradient-to-br from-accent-primary/20 to-accent-secondary/10 rounded-full blur-2xl opacity-40 animate-float-slow" aria-hidden="true" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-gradient-to-tr from-accent-tertiary/15 to-accent-quaternary/10 rounded-full blur-2xl opacity-30 animate-float" aria-hidden="true" />

        <div className="mx-auto max-w-3xl text-center relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full bg-accent-glow border border-accent-primary/20 px-4 py-1.5 text-xs font-medium text-accent-primary mb-6 backdrop-blur-sm hover:border-accent-primary/40 transition-all animate-bounce-in">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent-primary"></span>
            </span>
            <span className="font-poppins">✨ Free for startups — no credit card required</span>
          </div>

          <h1 id="hero-title" className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-foreground leading-[1.05] font-display mb-6">
            Your team is{" "}
            <span className="gradient-text animate-gradient-shift">overspending</span>
            <br />
            on AI tools.
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-foreground/70 max-w-xl mx-auto leading-relaxed font-inter animate-fade-in" style={{animationDelay: "0.15s"}}>
            Cursor, Copilot, ChatGPT, Claude, Gemini — the typical dev shop now layers{" "}
            <span className="text-warning font-bold bg-warning/10 px-2 py-1 rounded-lg">$600–1,500 / seat / year</span>{" "}
            in AI subscriptions. <span className="text-danger">Most can be right-sized.</span>
          </p>

          <p className="mt-4 text-sm text-foreground/50 font-inter animate-fade-in" style={{animationDelay: "0.25s"}}>
            Get a free, personalized audit in 2 minutes. Shareable report with your team.
          </p>

          {/* Scroll indicator */}
          <div className="mt-12 flex justify-center animate-bounce" aria-hidden="true">
            <svg className="w-6 h-6 text-accent-primary/50" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3" />
            </svg>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-y border-border/50 bg-surface/50 backdrop-blur-sm px-6 py-12 sm:py-16" aria-labelledby="stats-title">
        <div className="mx-auto max-w-4xl">
          <h2 id="stats-title" className="sr-only">Key Statistics</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-center stagger-children">
            {[
              { value: "8+", label: "AI tools analyzed", icon: "🔍" },
              { value: "35%", label: "avg. savings found", icon: "💰" },
              { value: "2 min", label: "to complete", icon: "⚡" },
              { value: "Free", label: "always", icon: "🎁" },
            ].map((stat, idx) => (
              <div key={stat.label} className="group" style={{animationDelay: `${idx * 0.1}s`}}>
                <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">{stat.icon}</div>
                <p className="text-3xl sm:text-4xl font-bold gradient-text-fast font-display">
                  {stat.value}
                </p>
                <p className="text-xs sm:text-sm text-foreground/50 mt-2 font-poppins">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What We Analyze */}
      <section className="px-6 py-16 sm:py-20" aria-labelledby="analyze-title">
        <div className="mx-auto max-w-4xl">
          <h2 id="analyze-title" className="text-3xl sm:text-4xl font-bold text-foreground text-center mb-4 font-display">
            We analyze your entire{" "}
            <span className="gradient-text-fast">AI stack</span>
          </h2>
          <p className="text-center text-foreground/60 mb-12 max-w-lg mx-auto font-inter text-lg">
            From IDE plugins to API keys to chatbot subscriptions — we compare
            every plan against alternatives you might be missing.
          </p>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 stagger-children">
            {[
              {
                icon: "💻",
                title: "IDE Assistants",
                tools: "Cursor · Copilot · v0",
                color: "from-accent-primary/20 to-accent-secondary/10",
              },
              {
                icon: "💬",
                title: "AI Chatbots",
                tools: "ChatGPT · Claude · Gemini",
                color: "from-accent-secondary/20 to-accent-tertiary/10",
              },
              {
                icon: "⚡",
                title: "API Platforms",
                tools: "OpenAI · Anthropic · Google",
                color: "from-accent-tertiary/20 to-accent-quaternary/10",
              },
              {
                icon: "🎨",
                title: "Code Gen",
                tools: "v0 · and more",
                color: "from-accent-quaternary/20 to-accent-primary/10",
              },
            ].map((category, idx) => (
              <div
                key={category.title}
                className={`glass rounded-2xl p-6 text-center transition-all duration-300 card-hover card-glow group border border-border/30 hover:border-accent-primary/40 overflow-hidden relative`}
                style={{animationDelay: `${idx * 0.1}s`, animationFillMode: "both"}}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10`} />
                <div className="text-4xl mb-4 group-hover:scale-125 transition-transform duration-300">{category.icon}</div>
                <h3 className="font-bold text-foreground mb-2 font-display text-lg">
                  {category.title}
                </h3>
                <p className="text-xs text-foreground/60 font-inter">{category.tools}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Audit Form Section */}
      <section className="px-6 py-16 sm:py-20 bg-gradient-bg relative overflow-hidden" aria-labelledby="form-title">
        <div className="absolute -top-32 right-0 w-64 h-64 bg-accent-primary/10 rounded-full blur-3xl opacity-40 pointer-events-none" />
        
        <div className="mx-auto max-w-lg relative z-10">
          <h2 id="form-title" className="text-3xl sm:text-4xl font-bold text-foreground text-center mb-3 font-display">
            Start your <span className="gradient-text-fast">free audit</span>
          </h2>
          <p className="text-center text-foreground/60 mb-10 font-inter text-lg">
            Takes less than 2 minutes. No credit card, no BS.
          </p>
          <AuditForm />
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl">
          <CTASection />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 px-6 py-10 bg-surface/20 backdrop-blur-sm mt-16" aria-label="Site footer">
        <div className="mx-auto max-w-5xl flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-foreground/50 font-inter">
          <p>© 2026 Saravanakumar Spend Lab. All rights reserved.</p>
          <nav className="flex gap-8" aria-label="Footer navigation">
            <span className="text-foreground/50 cursor-default" title="Privacy policy coming soon">
              Privacy
            </span>
            <span className="text-foreground/50 cursor-default" title="Terms of service coming soon">
              Terms
            </span>
            <a
              href="https://saravanakumar-v-portfolio.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-accent-primary transition-colors duration-300 flex items-center gap-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:rounded"
              aria-label="Contact Saravanakumar (opens in new window)"
            >
              Contact Saravanakumar
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6 7.5-7.5m0 0-7.5 7.5" />
              </svg>
            </a>
          </nav>
        </div>
      </footer>
    </main>
  );
}
