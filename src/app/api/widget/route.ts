/**
 * GET /api/widget/:auditId — Embeddable Widget Script
 *
 * Returns a JavaScript snippet that bloggers/marketers can embed.
 * The snippet creates a lightweight iframe showing key audit metrics.
 */

import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const auditId = request.nextUrl.searchParams.get("auditId");
    const origin = request.nextUrl.origin;

    if (!auditId) {
      return NextResponse.json(
        { error: "Missing auditId parameter" },
        { status: 400 }
      );
    }

    // Generate the embeddable widget script
    const widgetScript = `
(function() {
  // Create container
  const container = document.currentScript.parentNode;
  const iframe = document.createElement('iframe');
  
  iframe.src = '${origin}/widget/${auditId}';
  iframe.style.cssText = 'width: 100%; height: 400px; border: 1px solid #e5e7eb; border-radius: 8px; margin: 20px 0;';
  iframe.loading = 'lazy';
  iframe.frameBorder = '0';
  iframe.title = 'Saravanakumar AI Spend Audit Widget';
  
  container.appendChild(iframe);
  
  // Responsive sizing
  window.addEventListener('message', function(event) {
    if (event.origin !== '${origin}') return;
    if (event.data.type === 'widget-resize') {
      iframe.style.height = event.data.height + 'px';
    }
  });
})();
    `.trim();

    return NextResponse.json(
      {
        embedCode: `<script>${widgetScript}</script>`,
        htmlExample: `<!-- Embed this in your blog post -->
<script>${widgetScript}</script>`,
        usage: "Copy and paste the embed code into your blog post HTML",
      },
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (error) {
    console.error("Widget API error:", error);
    return NextResponse.json(
      { error: "Failed to generate widget" },
      { status: 500 }
    );
  }
}
