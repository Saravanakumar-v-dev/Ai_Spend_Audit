import { NextResponse } from "next/server";

import { sendHelloWorldEmail } from "@/lib/email";

export async function POST() {
  try {
    const id = await sendHelloWorldEmail();

    if (!id) {
      return NextResponse.json(
        {
          error:
            "RESEND_API_KEY is not configured. Replace re_xxxxxxxxx with your real Resend API key.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({ message: "Email sent", id });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to send test email",
      },
      { status: 500 }
    );
  }
}
