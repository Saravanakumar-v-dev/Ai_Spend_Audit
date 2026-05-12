/**
 * POST /api/referral — Referral Code Tracking
 *
 * Tracks referral usage and rewards.
 * When a user signs up with a referral code, both parties get a perk.
 */

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

interface ReferralReward {
  referrerEmail: string;
  referrerCode: string;
  referredEmail: string;
  rewardType: "consultation_credit" | "priority_support";
  rewardValue: string;
  redeemed: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { referralCode, newEmail } = body;

    if (!referralCode || !newEmail) {
      return NextResponse.json(
        { error: "Missing referral code or email" },
        { status: 400 }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: "Referral system not available" },
        { status: 503 }
      );
    }

    // Look up the referrer by code
    const { data: referrer, error: lookupError } = await supabaseAdmin
      .from("leads")
      .select("email, referral_code")
      .eq("referral_code", referralCode)
      .single();

    if (lookupError || !referrer) {
      return NextResponse.json(
        { error: "Invalid referral code" },
        { status: 404 }
      );
    }

    // Check if this email was already referred
    const { data: existing } = await supabaseAdmin
      .from("referral_rewards")
      .select("id")
      .eq("referred_email", newEmail)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "Email already used for a referral" },
        { status: 409 }
      );
    }

    // Create referral reward for both parties
    const reward: ReferralReward = {
      referrerEmail: referrer.email,
      referrerCode: referrer.referral_code,
      referredEmail: newEmail,
      rewardType: "consultation_credit",
      rewardValue: "$50 credit toward consultation",
      redeemed: false,
    };

    const { error: insertError } = await supabaseAdmin
      .from("referral_rewards")
      .insert([
        {
          referrer_email: reward.referrerEmail,
          referred_email: reward.referredEmail,
          reward_type: reward.rewardType,
          reward_value: reward.rewardValue,
          created_at: new Date().toISOString(),
        },
      ]);

    if (insertError) {
      console.error("Referral insert error:", insertError);
      throw insertError;
    }

    return NextResponse.json(
      {
        message: "Referral tracked successfully",
        reward: {
          for_referrer: `${reward.referrerEmail} earned ${reward.rewardValue}`,
          for_referred: `${reward.referredEmail} also gets ${reward.rewardValue}`,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Referral API error:", error);
    return NextResponse.json(
      { error: "Failed to process referral" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/referral?code=XXX — Check referral status
 */
export async function GET(request: NextRequest) {
  try {
    const referralCode = request.nextUrl.searchParams.get("code");

    if (!referralCode) {
      return NextResponse.json(
        { error: "Missing referral code" },
        { status: 400 }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();

    if (!supabaseAdmin) {
      return NextResponse.json(
        {
          status: "valid",
          message:
            "This referral code is valid. Sign up to claim your reward.",
        },
        { status: 200 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("leads")
      .select("email, referral_code")
      .eq("referral_code", referralCode)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { status: "invalid", message: "This referral code is not found." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        status: "valid",
        message: `Referred by ${data.email}. Both parties get $50 consultation credit.`,
        referralCode: data.referral_code,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Referral status check error:", error);
    return NextResponse.json(
      { error: "Failed to check referral status" },
      { status: 500 }
    );
  }
}
