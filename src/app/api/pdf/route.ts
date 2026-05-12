/**
 * GET /api/pdf?auditId=... - PDF Export Endpoint
 *
 * Kept for compatibility. The working download route is /api/pdf/[auditId].
 */

import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const auditId = request.nextUrl.searchParams.get("auditId");

  if (!auditId) {
    return NextResponse.json(
      { error: "Missing auditId. Use /api/pdf/{auditId}." },
      { status: 400 }
    );
  }

  return NextResponse.redirect(new URL(`/api/pdf/${auditId}`, request.url));
}
