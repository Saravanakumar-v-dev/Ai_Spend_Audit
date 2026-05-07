/**
 * SavingsChart — Placeholder Component
 *
 * Will render a visual breakdown of current spend vs. optimized spend.
 * Planned implementation: Recharts bar/donut chart.
 *
 * NOTE: Placeholder — requires audit engine output data to render.
 */

interface SavingsChartProps {
  currentSpend?: number;
  optimizedSpend?: number;
  savings?: number;
}

export default function SavingsChart({
  currentSpend = 0,
  optimizedSpend = 0,
  savings = 0,
}: SavingsChartProps) {
  void currentSpend;
  void optimizedSpend;
  void savings;

  return (
    <div className="glass rounded-xl p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">
        Spend Breakdown
      </h3>
      <div className="flex items-center justify-center py-12 text-foreground/30">
        <div className="text-center">
          <svg
            className="mx-auto h-12 w-12 mb-3"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z"
            />
          </svg>
          <p className="text-sm">
            Chart will render once the audit engine is implemented.
          </p>
          <p className="text-xs mt-1 text-foreground/20">
            Planned: Recharts bar chart with current vs. optimized spend
          </p>
        </div>
      </div>
    </div>
  );
}
