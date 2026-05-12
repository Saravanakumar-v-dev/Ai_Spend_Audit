/**
 * Transactional Email - AI Spend Audit
 *
 * Uses the official Resend SDK to send audit confirmation emails.
 */

import { Resend } from "resend";

import { formatUsd } from "./format-usd";
import { MONTHLY_SAVINGS_SARAVANAKUMAR_HIGHLIGHT_USD } from "./savings-thresholds";
import type { AuditResult } from "./validators";

function getResendClient(): Resend | null {
  const resendApiKey = process.env.RESEND_API_KEY;

  if (!resendApiKey || resendApiKey === "re_xxxxxxxxx") {
    console.warn("[email] RESEND_API_KEY not set - skipping email delivery.");
    return null;
  }

  return new Resend(resendApiKey);
}

/**
 * Sends the personalized AI spend audit report email via Resend.
 */
export async function sendAuditEmail(
  toEmail: string,
  auditResult: AuditResult,
  auditUrl: string
): Promise<void> {
  const resend = getResendClient();

  if (!resend) {
    console.log(
      `[email] Would have sent audit to ${toEmail} | Savings ${formatUsd(
        auditResult.totalMonthlySavings
      )}/mo | URL: ${auditUrl}`
    );
    return;
  }

  try {
    const { data, error } = await resend.emails.send({
      from: "Saravanakumar AI Audit <onboarding@resend.dev>",
      to: [toEmail],
      subject: `Your AI Spend Audit: ${formatUsd(
        auditResult.totalMonthlySavings
      )}/mo in potential savings`,
      html: generateEmailHtml(auditResult, auditUrl),
    });

    if (error) {
      console.error("[email] Resend API error:", error);
      throw new Error(`Resend error: ${error.message}`);
    }

    console.log(`[email] Email sent to ${toEmail}, ID: ${data?.id}`);
  } catch (error) {
    console.error("[email] Failed to send email:", error);
    // Let the audit succeed even if email delivery fails.
  }
}

/**
 * Sends Resend's starter "Hello World" test email.
 */
export async function sendHelloWorldEmail(
  toEmail = "saravanadaaa7@gmail.com"
): Promise<string | null> {
  const resend = getResendClient();

  if (!resend) {
    return null;
  }

  const { data, error } = await resend.emails.send({
    from: "onboarding@resend.dev",
    to: toEmail,
    subject: "Hello World",
    html: "<p>Congrats on sending your <strong>first email</strong>!</p>",
  });

  if (error) {
    console.error("[email] Resend test email error:", error);
    throw new Error(`Resend error: ${error.message}`);
  }

  return data?.id ?? null;
}

function generateEmailHtml(auditResult: AuditResult, auditUrl: string): string {
  const highSavings =
    auditResult.totalMonthlySavings >
    MONTHLY_SAVINGS_SARAVANAKUMAR_HIGHLIGHT_USD;
  const topSaver = auditResult.toolResults.reduce(
    (max, tool) => (tool.monthlySavings > max.monthlySavings ? tool : max),
    auditResult.toolResults[0]
  );

  const topOptimization = topSaver
    ? `
      <p><strong>Top optimization:</strong></p>
      <div class="tool-item">
        <strong>${topSaver.toolName}</strong><br>
        Recommended: ${topSaver.recommendedPlan || "a lighter SKU"}<br>
        Monthly savings: <strong>${formatUsd(topSaver.monthlySavings)}</strong>
      </div>
    `
    : "";

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.5; color: #1f2937; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #6366f1 0%, #ec4899 100%); color: white; padding: 30px; border-radius: 12px; text-align: center; }
    .content { padding: 30px; background: #f9fafb; border-radius: 8px; margin-top: 20px; }
    .cta-button { display: inline-block; padding: 12px 24px; background: #6366f1; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
    .highlight { background: #f0fdf4; border: 1px solid #bbf7d0; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .footer { text-align: center; font-size: 12px; color: #6b7280; margin-top: 30px; }
    .savings { font-size: 32px; font-weight: bold; color: #059669; }
    .tool-item { padding: 15px; background: white; margin: 10px 0; border-radius: 8px; border-left: 4px solid #6366f1; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0; font-size: 28px;">Your AI Spend Audit is Ready</h1>
      <p style="margin: 10px 0 0 0; font-size: 14px; opacity: 0.9;">We found potential savings for your stack</p>
    </div>

    <div class="content">
      <p>Hello,</p>
      <p>We've completed your AI spending analysis. Here's what we found:</p>

      <div style="text-align: center; padding: 20px; background: white; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0; font-size: 14px; color: #6b7280;">Potential Monthly Savings</p>
        <div class="savings">${formatUsd(auditResult.totalMonthlySavings)}</div>
        <p style="margin: 5px 0 0 0; color: #6b7280; font-size: 12px;">
          or ${formatUsd(auditResult.totalAnnualSavings)} annualized
        </p>
      </div>

      ${topOptimization}

      <p>View your complete interactive report with all recommendations:</p>
      <div style="text-align: center;">
        <a href="${auditUrl}" class="cta-button">View Full Report</a>
      </div>

      ${
        highSavings
          ? `
        <div class="highlight">
          <h3 style="margin-top: 0; color: #059669;">High-Impact Savings Detected</h3>
          <p>Your audit uncovered <strong>${formatUsd(
            auditResult.totalMonthlySavings
          )}/month</strong> in potential savings. This is a good time to discuss procurement optimization with Saravanakumar.</p>
          <a href="https://saravanakumar-v-portfolio.vercel.app/?source=high-savings&potential=${Math.round(
            auditResult.totalMonthlySavings
          )}" class="cta-button">Contact Saravanakumar</a>
        </div>
      `
          : `
        <p style="background: #eff6ff; padding: 15px; border-radius: 8px; border-left: 4px solid #3b82f6;">
          <strong>Next Steps:</strong> Share this report with your finance and engineering teams.
        </p>
      `
      }

      <p style="margin-top: 30px; font-size: 12px; color: #6b7280;">
        <strong>Data Privacy:</strong> This audit includes identifying details that have been stripped from the publicly shareable version of your report.
      </p>
    </div>

    <div class="footer">
      <p style="margin: 0;">2026 Saravanakumar. All rights reserved.</p>
      <p style="margin: 5px 0 0 0;">
        <a href="https://saravanakumar-v-portfolio.vercel.app/" style="color: #6366f1; text-decoration: none;">Visit our portfolio</a> |
        <a href="https://saravanakumar-v-portfolio.vercel.app/" style="color: #6366f1; text-decoration: none;">Contact us</a>
        
      </p>
    </div>
  </div>
</body>
</html>
  `;
}
