/**
 * POST /api/audit — Audit Submission Endpoint
 *
 * Receives the audit form data, validates it, runs the audit engine,
 * stores the result in Supabase, and returns the audit ID for redirect.
 *
 * NOTE: The audit engine is not yet implemented. This route will
 * return a placeholder response until the engine is built.
 */

import { NextRequest, NextResponse } from "next/server";
import { AuditFormSchema } from "@/lib/validators";

export async function POST(request: NextRequest) {
  try {
    // 1. Parse and validate the request body
    const body = await request.json();
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

    // 2. TODO: Fetch pricing data for selected tools
    // const toolSlugs = formData.tools.map((t) => t.toolSlug);
    // const pricingData = await getPricingForTools(toolSlugs);

    // 3. TODO: Run the audit engine
    // const auditResult = await calculateAudit(formData, pricingData);

    // 4. TODO: Store the audit result in Supabase
    // const { data, error } = await supabaseAdmin
    //   .from("audits")
    //   .insert({
    //     company_name: formData.companyName,
    //     team_size: formData.teamSize,
    //     email: formData.email,
    //     tools_input: formData.tools,
    //     audit_result: auditResult,
    //     monthly_spend: auditResult.totalCurrentMonthlySpend,
    //     potential_savings: auditResult.totalMonthlySavings,
    //   })
    //   .select("id")
    //   .single();

    // 5. TODO: Send follow-up email via Resend
    // await sendAuditEmail(formData.email, auditId, auditResult);

    // PLACEHOLDER: Return a stub response
    return NextResponse.json(
      {
        message:
          "Audit engine not yet implemented. Form data was validated successfully.",
        validatedData: {
          companyName: formData.companyName,
          teamSize: formData.teamSize,
          email: formData.email,
          toolCount: formData.tools.length,
        },
        // auditId: data.id, // ← Will be returned once engine is built
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
