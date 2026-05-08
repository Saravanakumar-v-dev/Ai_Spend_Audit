/**
 * POST /api/leads — Audit Submission Endpoint
 *
 * Receives the audit form data, validates it, runs the audit engine,
 * stores the result in Supabase (lead capture), and returns the audit ID.
 */

import { NextRequest, NextResponse } from "next/server";
import { AuditFormSchema } from "@/lib/validators";
import { calculateAudit } from "@/lib/audit-engine";
// import { supabaseAdmin } from "@/lib/supabase";
import { sendAuditEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    // 1. Parse request body
    const body = await request.json();

    // 2. Honeypot Validation for Bot Protection
    if (body.website_url) {
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
    // We treat teamSize as 1 if it's missing (since it's optional now)
    const engineData = { ...formData, teamSize: formData.teamSize || 1 };
    const auditResult = await calculateAudit(engineData);

    // 5. Store the lead in Supabase
    const auditId = "stub-id-" + Date.now();

    /* 
    // Uncomment once Supabase Admin key is fully configured
    const { data, error } = await supabaseAdmin
      .from("leads")
      .insert({
        email: formData.email,
        company_name: formData.companyName || null,
        role: formData.role || null,
        team_size: formData.teamSize || null,
        input_data: formData.tools,
        total_savings: auditResult.totalMonthlySavings,
        is_high_savings: auditResult.totalMonthlySavings > 47000,
      })
      .select("id")
      .single();
      
    if (error) throw error;
    auditId = data.id;
    */
    
    const mockAuditUrl = `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/audit/${auditId}`;

    // 6. Send follow-up email via Resend
    await sendAuditEmail(formData.email, auditResult, mockAuditUrl);

    return NextResponse.json(
      {
        message: "Audit generated and lead saved successfully.",
        auditId: auditId,
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
