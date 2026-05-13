/**
 * CTASection — Call-to-Action for Saravanakumar Consulting
 *
 * Displayed at the bottom of audit reports to convert users
 * into Saravanakumar consulting leads. Server component — no client JS.
 */

export default function CTASection() {
  return (
    <section
      id="cta-section"
      className="relative overflow-hidden rounded-2xl border border-accent-primary/20 p-8 sm:p-12 glass-elevated animate-fade-in card-hover"
      aria-labelledby="cta-heading"
    >
      {/* Animated background gradient */}
      <div
        className="absolute inset-0 -z-10 bg-gradient-to-br from-accent-primary/8 via-background to-accent-tertiary/5 pointer-events-none"
        aria-hidden="true"
      />

      {/* Floating accent orbs */}
      <div className="absolute top-10 right-10 w-40 h-40 bg-accent-primary/10 rounded-full blur-2xl opacity-40 animate-float pointer-events-none" aria-hidden="true" />
      <div className="absolute bottom-10 left-10 w-40 h-40 bg-accent-tertiary/10 rounded-full blur-2xl opacity-30 animate-float-slow pointer-events-none" aria-hidden="true" />

      <div className="text-center max-w-lg mx-auto relative z-10">
        <div className="inline-flex items-center gap-2 rounded-full bg-accent-glow border border-accent-primary/30 px-4 py-1.5 text-xs font-bold text-accent-primary mb-6 font-poppins">
          <span className="relative flex h-2 w-2" aria-hidden="true">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-primary"></span>
          </span>
          Take it to the next level
        </div>

        <h2 id="cta-heading" className="text-3xl sm:text-4xl font-bold text-foreground mb-4 font-display">
          Want a <span className="gradient-text-fast">deeper analysis?</span>
        </h2>
        <p className="text-foreground/70 mb-10 text-lg leading-relaxed font-inter">
          Our AI cost consultants at Saravanakumar can help your team optimize
          spending, negotiate enterprise deals, and build an AI procurement
          strategy tailored to your roadmap.
        </p>

        <a
          href="https://saravanakumar-v-portfolio.vercel.app/"
          target="_blank"
          rel="noopener noreferrer"
          id="cta-book-consultation"
          aria-label="Contact Saravanakumar for consultation (opens in new window)"
          className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-accent-primary to-accent-secondary px-8 py-4 text-base font-bold text-white transition-all duration-300 hover:shadow-[0_10px_30px_rgba(99,102,241,0.3)] hover:-translate-y-1 relative overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent-primary"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-accent-secondary to-accent-tertiary opacity-0 group-hover:opacity-100 transition-opacity duration-300" aria-hidden="true" />
          <span className="relative flex items-center gap-2 font-poppins">
            Contact Saravanakumar
            <svg
              className="h-5 w-5 group-hover:translate-x-1 transition-transform"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
              />
            </svg>
          </span>
        </a>

        <p className="mt-6 text-sm text-foreground/50 font-inter">
          ✨ No commitment required. 30-minute call with a Saravanakumar AI strategist.
        </p>

        {/* Trust badges */}
        <div className="mt-10 pt-8 border-t border-border/30 flex flex-wrap items-center justify-center gap-4">
          <span className="text-xs text-foreground/40 font-inter" aria-label="Trusted by">Trusted by:</span>
          <div className="flex gap-4 flex-wrap justify-center" role="list">
            {["Startups", "Scale-ups", "Enterprises"].map((badge) => (
              <span
                key={badge}
                className="text-xs font-semibold text-accent-primary-hover bg-accent-glow px-3 py-1 rounded-full border border-accent-primary/20 font-poppins"
                role="listitem"
              >
                {badge}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
