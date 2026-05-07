/**
 * CTASection — Call-to-Action for Credex Consulting
 *
 * Displayed at the bottom of audit reports to convert users
 * into Credex consulting leads. Server component — no client JS.
 */

export default function CTASection() {
  return (
    <section
      id="cta-section"
      className="relative overflow-hidden rounded-2xl border border-accent-primary/20 p-8 sm:p-12"
    >
      {/* Background gradient */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(99, 102, 241, 0.08) 0%, transparent 70%)",
        }}
      />

      <div className="text-center max-w-lg mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
          Want a deeper analysis?
        </h2>
        <p className="text-foreground/60 mb-8">
          Our AI cost consultants at Credex can help your team optimize
          spending, negotiate enterprise deals, and build an AI procurement
          strategy tailored to your roadmap.
        </p>

        <a
          href="https://credex.com/contact"
          target="_blank"
          rel="noopener noreferrer"
          id="cta-book-consultation"
          className="inline-flex items-center gap-2 rounded-lg bg-accent-primary px-8 py-3.5 text-base font-semibold text-white transition-all hover:bg-accent-primary-hover hover:shadow-lg hover:shadow-accent-glow hover:-translate-y-0.5"
        >
          Book a Free Consultation
          <svg
            className="h-4 w-4"
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
        </a>

        <p className="mt-4 text-xs text-foreground/40">
          No commitment required. 30-minute call with a Credex AI strategist.
        </p>
      </div>
    </section>
  );
}
