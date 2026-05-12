/**
 * SavingsChart — Visual Breakdown Component
 *
 * Renders a CSS-only bar chart comparing current spend vs. optimized
 * spend per tool. No external chart library required.
 */

"use client";

import { formatUsd } from "@/lib/format-usd";

interface ToolBreakdown {
  toolName: string;
  currentCost: number;
  optimizedCost: number;
  savings: number;
}

interface SavingsChartProps {
  currentSpend: number;
  optimizedSpend: number;
  savings: number;
  toolBreakdowns: ToolBreakdown[];
}

export default function SavingsChart({
  currentSpend,
  optimizedSpend,
  savings,
  toolBreakdowns,
}: SavingsChartProps) {
  const maxCost = Math.max(
    ...toolBreakdowns.map((t) => t.currentCost),
    1 // prevent division by zero
  );

  const savingsPercent =
    currentSpend > 0 ? Math.round((savings / currentSpend) * 100) : 0;

  return (
    <div className="glass-elevated rounded-2xl p-8 border border-accent-primary/20">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-2xl font-bold text-foreground font-display">
          💰 Spend Breakdown
        </h3>
        {savingsPercent > 0 && (
          <span className="text-sm font-bold text-accent-primary bg-accent-primary/10 px-3 py-1 rounded-full border border-accent-primary/20">
            {savingsPercent}% savings potential
          </span>
        )}
      </div>
      <p className="text-sm text-foreground/60 mb-8 font-inter">
        Current spend vs. optimized — per tool
      </p>

      {/* Summary bar */}
      <div className="mb-8 p-4 rounded-xl bg-surface/50 border border-border/40">
        <div className="flex items-center justify-between text-sm mb-3">
          <span className="text-foreground/60 font-inter">Total Monthly</span>
          <div className="flex gap-6 text-xs font-semibold">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-danger/60 inline-block" />
              Current {formatUsd(currentSpend)}
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm bg-success/60 inline-block" />
              Optimized {formatUsd(optimizedSpend)}
            </span>
          </div>
        </div>
        <div className="relative h-6 bg-surface rounded-full overflow-hidden border border-border/30">
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-danger/40 to-danger/60 rounded-full transition-all duration-1000 ease-out"
            style={{ width: "100%" }}
          />
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-success/50 to-success/70 rounded-full transition-all duration-1000 ease-out delay-300"
            style={{
              width:
                currentSpend > 0
                  ? `${Math.round((optimizedSpend / currentSpend) * 100)}%`
                  : "100%",
            }}
          />
        </div>
      </div>

      {/* Per-tool bars */}
      <div className="space-y-5">
        {toolBreakdowns.map((tool, idx) => {
          const currentWidth = Math.max(
            (tool.currentCost / maxCost) * 100,
            2
          );
          const optimizedWidth = Math.max(
            ((tool.currentCost - tool.savings) / maxCost) * 100,
            2
          );
          const hasSavings = tool.savings > 0;

          return (
            <div
              key={tool.toolName}
              className="animate-fade-in"
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-foreground font-poppins">
                  {tool.toolName}
                </span>
                <span className="text-xs text-foreground/50 font-inter">
                  {formatUsd(tool.currentCost)}/mo
                  {hasSavings && (
                    <span className="text-accent-primary ml-2 font-semibold">
                      → {formatUsd(tool.currentCost - tool.savings)}
                    </span>
                  )}
                </span>
              </div>

              {/* Stacked bar */}
              <div className="relative h-4 bg-surface/80 rounded-full overflow-hidden border border-border/20">
                <div
                  className="absolute inset-y-0 left-0 bg-danger/40 rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${currentWidth}%` }}
                />
                {hasSavings && (
                  <div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-accent-primary/50 to-accent-secondary/50 rounded-full transition-all duration-700 ease-out delay-200"
                    style={{ width: `${optimizedWidth}%` }}
                  />
                )}
                {!hasSavings && (
                  <div
                    className="absolute inset-y-0 left-0 bg-success/40 rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${currentWidth}%` }}
                  />
                )}
              </div>

              {hasSavings && (
                <p className="text-xs text-accent-primary/80 mt-1 font-inter">
                  Save {formatUsd(tool.savings)}/mo
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
