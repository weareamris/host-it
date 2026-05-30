import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

const validPromoCode = "amris001";
const freePriceId = "promo-amris001";

export async function POST(request: Request) {
  const body = await request.json();
  const { email, password, promoCode } = body as {
    email: string;
    password: string;
    promoCode?: string;
  };

  if (!email || !password) {
    return NextResponse.json(
      { success: false, error: "Email and password are required." },
      { status: 400 }
    );
  }

  const supabaseAdmin = getSupabaseAdmin();
  const userResult = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (userResult.error) {
    return NextResponse.json(
      { success: false, error: userResult.error.message },
      { status: 400 }
    );
  }

  const user = userResult.data.user;
  let subscription = null;

  if (promoCode === validPromoCode) {
    const currentPeriodEnd = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();

    const subscriptionResult = await supabaseAdmin
      .from("subscriptions")
      .insert([
        {
          user_id: user.id,
          status: "active",
          price_id: freePriceId,
          current_period_end: currentPeriodEnd,
          created_at: new Date().toISOString(),
        },
      ]);

    if (subscriptionResult.error) {
      return NextResponse.json(
        { success: false, error: subscriptionResult.error.message },
        { status: 500 }
      );
    }

    subscription = subscriptionResult.data?.[0] ?? null;
  }

  return NextResponse.json({
    success: true,
    user: {
      id: user.id,
      email: user.email,
    },
    subscription,
    promoApplied: promoCode === validPromoCode,
  });
}
