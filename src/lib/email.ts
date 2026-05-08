/**
 * Transactional Email Draft — AI Spend Audit
 * 
 * Uses Resend to send a confirmation email containing the
 * audit results to the user once their lead is captured.
 */

// import { Resend } from 'resend';
import type { AuditResult } from './validators';

// const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Sends the personalized AI spend audit report email.
 * 
 * @param toEmail The email address to send the report to.
 * @param auditResult The computed audit result object.
 * @param auditUrl A unique shareable URL for the audit.
 */
export async function sendAuditEmail(
  toEmail: string,
  auditResult: AuditResult,
  auditUrl: string
): Promise<void> {
  // Stub implementation for Day 3 requirement
  console.log(`[EMAIL STUB] Sending Audit Email to ${toEmail}`);
  console.log(`[EMAIL STUB] Found $${auditResult.totalMonthlySavings}/mo in savings.`);
  console.log(`[EMAIL STUB] Report URL: ${auditUrl}`);

  /*
  try {
    const { data, error } = await resend.emails.send({
      from: 'AI Spend Audit <audit@yourdomain.com>',
      to: [toEmail],
      subject: 'Your AI Spend Audit Report',
      html: `
        <div>
          <h2>Your AI Spend Audit is ready</h2>
          <p>We found potential savings of <strong>$${auditResult.totalMonthlySavings}/mo</strong>!</p>
          <p>View your full interactive report here:</p>
          <a href="${auditUrl}">${auditUrl}</a>
        </div>
      `,
    });

    if (error) {
      console.error("Resend API error:", error);
    }
  } catch (error) {
    console.error("Failed to send email", error);
  }
  */
}
