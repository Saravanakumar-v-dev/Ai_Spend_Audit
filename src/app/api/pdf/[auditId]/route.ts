/**
 * GET /api/pdf/[auditId] - PDF Export Endpoint
 *
 * Returns a small, dependency-free PDF generated from the stateless audit URL
 * payload. This keeps export working even when Supabase is not configured.
 */

import { NextRequest, NextResponse } from "next/server";

import { calculateAudit } from "@/lib/audit-engine";
import { formatUsd } from "@/lib/format-usd";
import type { AuditFormData } from "@/lib/validators";

interface PdfRouteProps {
  params: Promise<{ auditId: string }>;
}

function decodePayload(auditId: string): AuditFormData | null {
  try {
    const decoded = Buffer.from(
      decodeURIComponent(auditId),
      "base64url"
    ).toString("utf-8");
    return JSON.parse(decoded) as AuditFormData;
  } catch {
    return null;
  }
}

function cleanText(value: string): string {
  return value
    .replace(/[^\x20-\x7E]/g, "-")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

function wrapText(text: string, maxLength = 88): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxLength && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }

  if (current) lines.push(current);
  return lines;
}

function buildPdf(lines: string[]): Buffer {
  const pages: string[][] = [];
  for (let i = 0; i < lines.length; i += 42) {
    pages.push(lines.slice(i, i + 42));
  }

  const objects: string[] = [];
  const pageObjectNumbers: number[] = [];

  objects.push("<< /Type /Catalog /Pages 2 0 R >>");
  objects.push("");
  objects.push("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
  objects.push("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>");

  pages.forEach((pageLines) => {
    const pageObjectNumber = objects.length + 1;
    const contentObjectNumber = pageObjectNumber + 1;
    pageObjectNumbers.push(pageObjectNumber);

    const contentLines = [
      "BT",
      "/F2 18 Tf",
      "1 0 0 1 50 780 Tm",
      "(AI Spend Audit Report) Tj",
      "/F1 10 Tf",
    ];

    let y = 748;
    pageLines.forEach((line) => {
      contentLines.push(`1 0 0 1 50 ${y} Tm`);
      contentLines.push(`(${cleanText(line)}) Tj`);
      y -= 16;
    });
    contentLines.push("ET");

    const content = contentLines.join("\n");
    objects.push(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentObjectNumber} 0 R >>`
    );
    objects.push(
      `<< /Length ${Buffer.byteLength(content, "latin1")} >>\nstream\n${content}\nendstream`
    );
  });

  objects[1] =
    `<< /Type /Pages /Kids [${pageObjectNumbers
      .map((n) => `${n} 0 R`)
      .join(" ")}] /Count ${pageObjectNumbers.length} >>`;

  let pdf = "%PDF-1.4\n";
  const offsets = [0];

  objects.forEach((object, index) => {
    offsets.push(Buffer.byteLength(pdf, "latin1"));
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefOffset = Buffer.byteLength(pdf, "latin1");
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  for (let i = 1; i < offsets.length; i += 1) {
    pdf += `${offsets[i].toString().padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\n`;
  pdf += `startxref\n${xrefOffset}\n%%EOF`;

  return Buffer.from(pdf, "latin1");
}

export async function GET(
  _request: NextRequest,
  { params }: PdfRouteProps
) {
  try {
    const { auditId } = await params;
    const input = decodePayload(auditId);

    if (!input) {
      return NextResponse.json(
        { error: "This audit link cannot be exported. Regenerate the audit first." },
        { status: 400 }
      );
    }

    const result = await calculateAudit({
      ...input,
      teamSize: input.teamSize ?? 1,
    });

    const lines = [
      `Generated: ${new Date().toISOString().slice(0, 10)}`,
      `Pricing snapshot: ${result.pricingReferenceDate}`,
      `Team size: ${input.teamSize ?? 1}`,
      "",
      `Current monthly spend: ${formatUsd(result.totalCurrentMonthlySpend)}`,
      `Optimized monthly spend: ${formatUsd(result.totalOptimizedMonthlySpend)}`,
      `Monthly savings: ${formatUsd(result.totalMonthlySavings)}`,
      `Annual savings: ${formatUsd(result.totalAnnualSavings)}`,
      "",
      "Per-tool recommendations:",
    ];

    result.toolResults.forEach((tool) => {
      lines.push("");
      lines.push(`${tool.toolName} - ${tool.currentPlan}`);
      lines.push(`Current: ${formatUsd(tool.currentMonthlyCost)} / mo`);
      lines.push(`Recommended: ${tool.recommendedAction}`);
      lines.push(`Savings: ${formatUsd(tool.monthlySavings)} / mo`);
      wrapText(tool.reasoning).forEach((line) => lines.push(line));
      if (tool.crossCategoryNote) {
        wrapText(`Note: ${tool.crossCategoryNote}`).forEach((line) =>
          lines.push(line)
        );
      }
    });

    if (result.recommendations.length > 0) {
      lines.push("");
      lines.push("Recommendations queue:");
      result.recommendations.forEach((recommendation) => {
        wrapText(`- ${recommendation}`).forEach((line) => lines.push(line));
      });
    }

    const pdf = buildPdf(lines);
    const body = new Uint8Array(pdf);
    const filename = `ai-spend-audit-${auditId.slice(0, 8)}.pdf`;

    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "private, max-age=0, must-revalidate",
      },
    });
  } catch (error) {
    console.error("PDF API error:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}
