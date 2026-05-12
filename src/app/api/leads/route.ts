/**
 * POST /api/leads — Audit Submission Endpoint
 *
 * Receives the audit form data, validates it, runs the audit engine,
 * stores the result in Supabase (lead capture), and returns the audit ID.
 * Includes rate limiting and abuse protection.
 */

import { NextRequest, NextResponse } from "next/server";
import { AuditFormSchema } from "@/lib/validators";
import { calculateAudit } from "@/lib/audit-engine";
import { getSupabaseAdmin } from "@/lib/supabase";
import { sendAuditEmail } from "@/lib/email";
import { checkRateLimit } from "@/lib/rate-limit";
import { getHoneypotValue, isHoneypotTripped } from "@/lib/honeypot";

export async function POST(request: NextRequest) {
  try {
    // 0. Get client IP for rate limiting
    const clientIp = request.headers.get("x-forwarded-for") || 
                     request.headers.get("x-real-ip") || 
                     "unknown";

    // Check rate limit (max 5 audits per IP per hour)
    const rateLimitOk = await checkRateLimit(clientIp, 5, 3600);
    if (!rateLimitOk) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    // 1. Parse request body
    const body = await request.json();

    // 2. Honeypot Validation for Bot Protection
    if (isHoneypotTripped(getHoneypotValue(body))) {
      // Bot filled out the visually hidden field
      console.warn("Bot detected: Honeypot field filled.");
      return NextResponse.json({ error: "Bad Request" }, { status: 400 });
    }

    // 3. Validate structured data via Zod
    const parseResult = AuditFormSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: parseResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const formData = parseResult.data;

    // 4. Run the Audit Engine (hardcoded MVP pricing rules)
    const engineData = { ...formData, teamSize: formData.teamSize || 1 };
    const auditResult = await calculateAudit(engineData);
    const publicAuditId = Buffer.from(JSON.stringify(engineData)).toString(
      "base64url"
    );

    // 5. Store the lead in Supabase
    const supabaseAdmin = getSupabaseAdmin();
    let leadId = "";

    if (supabaseAdmin) {
      try {
        const { data, error } = await supabaseAdmin
          .from("leads")
          .insert({
            email: formData.email,
            company_name: formData.companyName || null,
            role: formData.role || null,
            team_size: formData.teamSize || null,
            input_data: formData.tools,
            total_savings: auditResult.totalMonthlySavings,
            is_high_savings: auditResult.totalMonthlySavings > 500,
            referral_code: generateReferralCode(),
            created_at: new Date().toISOString(),
          })
          .select("id")
          .single();

        if (error) {
          console.error("Supabase insert error:", error);
        } else if (data) {
          leadId = data.id;
        }
      } catch (err) {
        console.error("Supabase error:", err);
      }
    }

    const auditUrl = `${request.nextUrl.origin}/audit/${publicAuditId}`;

    // 6. Send follow-up email via Resend
    try {
      await sendAuditEmail(formData.email, auditResult, auditUrl);
    } catch (emailErr) {
      console.error("Email send error:", emailErr);
      // Don't fail the request if email fails
    }

    return NextResponse.json(
      {
        message: "Audit generated and lead saved successfully.",
        auditId: publicAuditId,
        leadId: leadId || undefined,
        shareUrl: auditUrl,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Audit API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Generates a unique referral code for sharing
 */
function generateReferralCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `SAI-${code}`;
}
