/**
 * GET /api/benchmark — Benchmark Data Endpoint
 *
 * Returns industry benchmarks for AI spend per developer by team size and use case.
 * Used for displaying "Your AI spend per developer is $X — companies your size average $Y"
 */

import { NextRequest, NextResponse } from "next/server";

interface BenchmarkData {
  teamSize: number;
  avgSpendPerDeveloper: number;
  medianSpendPerDeveloper: number;
  percentile75: number;
  percentile90: number;
  topTools: string[];
}

// Sample benchmark data (May 2026)
const BENCHMARKS: Record<string, BenchmarkData[]> = {
  seed: [
    {
      teamSize: 2,
      avgSpendPerDeveloper: 450,
      medianSpendPerDeveloper: 380,
      percentile75: 650,
      percentile90: 850,
      topTools: ["Copilot Individual", "ChatGPT Plus", "Cursor Pro"],
    },
    {
      teamSize: 5,
      avgSpendPerDeveloper: 420,
      medianSpendPerDeveloper: 350,
      percentile75: 620,
      percentile90: 800,
      topTools: ["Copilot Individual", "ChatGPT Plus", "Claude Pro"],
    },
    {
      teamSize: 10,
      avgSpendPerDeveloper: 380,
      medianSpendPerDeveloper: 320,
      percentile75: 550,
      percentile90: 700,
      topTools: ["Copilot Teams", "ChatGPT Business", "Claude Team"],
    },
  ],
  series_a: [
    {
      teamSize: 15,
      avgSpendPerDeveloper: 420,
      medianSpendPerDeveloper: 380,
      percentile75: 600,
      percentile90: 800,
      topTools: ["Copilot Enterprise", "ChatGPT Business", "Claude Team"],
    },
    {
      teamSize: 25,
      avgSpendPerDeveloper: 380,
      medianSpendPerDeveloper: 340,
      percentile75: 540,
      percentile90: 720,
      topTools: ["Copilot Enterprise", "ChatGPT Business", "API spend"],
    },
  ],
  series_b: [
    {
      teamSize: 50,
      avgSpendPerDeveloper: 350,
      medianSpendPerDeveloper: 310,
      percentile75: 480,
      percentile90: 620,
      topTools: ["Copilot Enterprise", "Claude API", "Custom LLM"],
    },
    {
      teamSize: 100,
      avgSpendPerDeveloper: 320,
      medianSpendPerDeveloper: 280,
      percentile75: 420,
      percentile90: 550,
      topTools: ["Copilot Enterprise", "Claude API", "Internal LLM"],
    },
  ],
};

export async function GET(request: NextRequest) {
  try {
    const stage = request.nextUrl.searchParams.get("stage") || "series_a";
    const teamSize = parseInt(
      request.nextUrl.searchParams.get("teamSize") || "0"
    );

    const benchmarks = BENCHMARKS[stage] || BENCHMARKS.series_a;

    if (teamSize && teamSize > 0) {
      // Find closest matching benchmark
      const closest = benchmarks.reduce((prev, curr) =>
        Math.abs(curr.teamSize - teamSize) <
        Math.abs(prev.teamSize - teamSize)
          ? curr
          : prev
      );

      return NextResponse.json(
        {
          stage,
          teamSize,
          benchmark: closest,
          message: `Your team size of ${teamSize} closely matches companies with ${closest.teamSize} engineers`,
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        stage,
        benchmarks,
        dataAsOf: "May 2026",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Benchmark API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch benchmarks" },
      { status: 500 }
    );
  }
}
