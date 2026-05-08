/**
 * Landing Page — AI Spend Audit by Saravanakumar
 *
 * Statically generated (SSG) for instant load and SEO indexing.
 * Contains the marketing hero, value propositions, and the audit form.
 */

import AuditForm from "@/components/AuditForm";
import CTASection from "@/components/CTASection";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border/50 px-6 py-4">
        <div className="mx-auto max-w-5xl flex items-center justify-between">
          <span className="text-lg font-bold gradient-text">
            Saravanakumar
          </span>
          <a
            href="#audit-form"
            className="rounded-lg bg-accent-primary/10 px-4 py-2 text-sm font-medium text-accent-primary transition-colors hover:bg-accent-primary/20"
          >
            Start Audit →
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-6 pt-20 pb-16 sm:pt-28 sm:pb-20">
        {/* Background glow */}
        <div
          className="absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(99, 102, 241, 0.12) 0%, transparent 70%)",
          }}
        />

        <div className="mx-auto max-w-3xl text-center animate-slide-up">
          <div className="inline-flex items-center gap-2 rounded-full bg-accent-glow border border-accent-primary/20 px-4 py-1.5 text-xs font-medium text-accent-primary mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-primary"></span>
            </span>
            Free for startups — no credit card required
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.1]">
            Your team is{" "}
            <span className="gradient-text">overspending</span>
            <br />
            on AI tools.
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-foreground/60 max-w-xl mx-auto leading-relaxed">
            Cursor, Copilot, ChatGPT, Claude — the average startup spends{" "}
            <span className="text-warning font-semibold">Rs 2.2L/dev/year</span>{" "}
            on AI subscriptions. Most of it is wasted.
          </p>

          <p className="mt-4 text-sm text-foreground/40">
            Get a free, personalized audit in 2 minutes. Shareable report with
            your team.
          </p>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-y border-border/50 bg-surface/50 px-6 py-8">
        <div className="mx-auto max-w-4xl grid grid-cols-2 sm:grid-cols-4 gap-6 text-center stagger-children">
          {[
            { value: "8+", label: "AI tools analyzed" },
            { value: "35%", label: "avg. savings found" },
            { value: "2 min", label: "to complete" },
            { value: "Free", label: "always" },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="text-2xl sm:text-3xl font-bold gradient-text">
                {stat.value}
              </p>
              <p className="text-xs sm:text-sm text-foreground/40 mt-1">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* What We Analyze */}
      <section className="px-6 py-16 sm:py-20">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground text-center mb-4">
            We analyze your entire AI stack
          </h2>
          <p className="text-center text-foreground/50 mb-12 max-w-lg mx-auto">
            From IDE plugins to API keys to chatbot subscriptions — we compare
            every plan against alternatives you might be missing.
          </p>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 stagger-children">
            {[
              {
                icon: "💻",
                title: "IDE Assistants",
                tools: "Cursor · Copilot · Windsurf",
              },
              {
                icon: "💬",
                title: "AI Chatbots",
                tools: "ChatGPT · Claude · Gemini",
              },
              {
                icon: "⚡",
                title: "API Platforms",
                tools: "OpenAI · Anthropic · Google",
              },
              {
                icon: "🎨",
                title: "Code Gen",
                tools: "v0 · and more",
              },
            ].map((category) => (
              <div
                key={category.title}
                className="glass rounded-xl p-5 text-center transition-all hover:border-accent-primary/30 hover:-translate-y-0.5"
              >
                <div className="text-3xl mb-3">{category.icon}</div>
                <h3 className="font-semibold text-foreground mb-1">
                  {category.title}
                </h3>
                <p className="text-xs text-foreground/40">{category.tools}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Audit Form Section */}
      <section className="px-6 py-16 sm:py-20 bg-surface/30">
        <div className="mx-auto max-w-lg">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground text-center mb-2">
            Start your free audit
          </h2>
          <p className="text-center text-foreground/50 mb-8">
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
      <footer className="border-t border-border/50 px-6 py-8">
        <div className="mx-auto max-w-5xl flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-foreground/40">
          <span>© 2026 Saravanakumar. All rights reserved.</span>
          <div className="flex gap-6">
            <a href="#" className="hover:text-foreground transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              Terms
            </a>
            <a
              href="https://saravanakumar.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              Saravanakumar →
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
