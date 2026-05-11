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
  if (!process.env.RESEND_API_KEY) {
    console.warn("[email] ⚠️ RESEND_API_KEY not set — skipping email delivery.");
    console.log(`[email] Would have sent audit to ${toEmail} | Savings: Rs ${Math.round(auditResult.totalMonthlySavings).toLocaleString("en-IN")}/mo | URL: ${auditUrl}`);
    return;
  }

  // Stub implementation for Day 3 requirement
  console.log(`[EMAIL STUB] Sending Audit Email to ${toEmail}`);
  console.log(
    `[EMAIL STUB] Found Rs ${Math.round(auditResult.totalMonthlySavings).toLocaleString("en-IN")}/mo in savings.`
  );
  console.log(`[EMAIL STUB] Report URL: ${auditUrl}`);

  /*
  try {
    const { data, error } = await resend.emails.send({
      from: 'AI Spend Audit <audit@yourdomain.com>',
      to: [toEmail],
      subject: 'Your AI Spend Audit Report',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Your AI Spend Audit is ready</h2>
          <p>We found potential savings of <strong>Rs ${auditResult.totalMonthlySavings}/mo</strong> for your stack!</p>
          
          <p>View your full interactive report here:</p>
          <a href="${auditUrl}" style="display: inline-block; padding: 10px 20px; background: #3b82f6; color: white; text-decoration: none; border-radius: 5px;">View Full Report</a>
          
          ${auditResult.totalMonthlySavings > 47000 ? `
            <div style="margin-top: 30px; padding: 20px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px;">
              <h3>Wow! You have massive savings potential.</h3>
              <p>Because your team has a high-savings case (>Rs 47,000/mo), <strong>Saravanakumar will reach out</strong> to you personally to help negotiate these enterprise rates and optimize your deployment.</p>
            </div>
          ` : ''}
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
