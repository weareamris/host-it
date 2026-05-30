import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(request: Request) {
  const authHeader = request.headers.get("Authorization") || "";
  const token = authHeader.replace(/^Bearer\s+/i, "");

  if (!token) {
    return NextResponse.json({ success: false, error: "Missing authorization token." }, { status: 401 });
  }

  const supabaseAdmin = getSupabaseAdmin();
  const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);

  if (userError || !userData.user) {
    return NextResponse.json({ success: false, error: userError?.message ?? "Invalid token." }, { status: 401 });
  }

  const userId = userData.user.id;
  const { data, error } = await supabaseAdmin
    .from("subscriptions")
    .select("id,status,price_id,current_period_end,created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1);

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, subscription: data?.[0] ?? null });
}
