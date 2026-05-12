/**
 * Widget Page — /widget/[id]
 *
 * Lightweight embeddable version of audit report for bloggers.
 * Stripped of all identifying information, focused on metrics only.
 */

"use client";

import { useEffect, useState } from "react";
import { calculateAudit } from "@/lib/audit-engine";
import type {
  AuditFormData,
  AuditResult,
  ToolAuditResult,
} from "@/lib/validators";
import { formatUsd } from "@/lib/format-usd";

interface WidgetPageProps {
  params: { id: string };
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

export default function WidgetPage({ params }: WidgetPageProps) {
  const { id } = params;
  const [result, setResult] = useState<AuditResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const input = decodePayload(id);
      if (input) {
        const audit = await calculateAudit({
          ...input,
          teamSize: input.teamSize ?? 1,
        });
        setResult(audit);
      }
      setLoading(false);

      // Notify parent frame of height
      if (window.parent !== window) {
        window.parent.postMessage(
          { type: "widget-resize", height: 400 },
          "*"
        );
      }
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-[400px] bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin mb-4">⚙️</div>
          <p>Analyzing...</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-[400px] bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center p-6">
        <div className="text-white text-center">
          <p>Audit data unavailable</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[400px] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: transparent; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
      `}</style>

      <div className="max-w-md mx-auto text-white">
        {/* Header */}
        <div className="mb-6">
          <div className="text-xs font-bold text-indigo-300 mb-2">
            SARAVANAKUMAR AI AUDIT
          </div>
          <h3 className="text-2xl font-bold mb-1">Spending Analysis</h3>
          <p className="text-xs text-slate-400">
            Privacy-safe report | No identifying details
          </p>
        </div>

        {/* Key Metric */}
        <div className="bg-gradient-to-br from-indigo-600 to-pink-600 rounded-lg p-6 mb-4">
          <div className="text-sm text-indigo-100 mb-1">Monthly Savings</div>
          <div className="text-4xl font-bold">
            {formatUsd(result.totalMonthlySavings)}
          </div>
          <div className="text-xs text-indigo-100 mt-2">
            {formatUsd(result.totalAnnualSavings)} annualized
          </div>
        </div>

        {/* Top Tools */}
        <div className="space-y-2 mb-4">
          <div className="text-xs font-semibold text-slate-300">
            TOP OPTIMIZATIONS
          </div>
          {result.toolResults.slice(0, 3).map((tool: ToolAuditResult) => (
            <div
              key={tool.toolName}
              className="bg-slate-700/50 rounded p-3 text-sm"
            >
              <div className="font-semibold text-white">{tool.toolName}</div>
              <div className="text-slate-300 text-xs">
                → {tool.recommendedPlan || "Lighter plan"}
              </div>
              <div className="text-indigo-300 font-semibold text-xs mt-1">
                Save {formatUsd(tool.monthlySavings)}/mo
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="bg-slate-700/30 border border-slate-600 rounded p-4 text-center">
          <div className="text-xs text-slate-300 mb-2">
            Run your own audit
          </div>
          <a
            href={`${
              process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
            }/`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2 rounded transition-colors"
          >
            Free Audit →
          </a>
        </div>

        {/* Attribution */}
        <div className="mt-4 pt-4 border-t border-slate-700 text-center text-xs text-slate-400">
          Powered by{" "}
          <a
            href="https://saravanakumar-v-portfolio.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-400 hover:text-indigo-300"
          >
            Saravanakumar
          </a>
        </div>
      </div>
    </div>
  );
}
