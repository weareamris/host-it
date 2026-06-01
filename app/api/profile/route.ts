import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "No authorization token" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: "Missing Supabase configuration" },
        { status: 500 }
      );
    }

    // Use service role key to access user metadata
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from token
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 401 }
      );
    }

    // Get streamer profile
    const { data: streamer, error: streamerError } = await supabase
      .from("streamers")
      .select("tiktok_username")
      .eq("auth_user_id", user.id)
      .single();

    if (streamerError) {
      // No streamer profile found, return user metadata
      const tiktokUsername = user.user_metadata?.tiktok_username || null;
      return NextResponse.json({
        email: user.email,
        tiktokUsername: tiktokUsername,
        userId: user.id,
      });
    }

    return NextResponse.json({
      email: user.email,
      tiktokUsername: streamer.tiktok_username,
      userId: user.id,
    });

  } catch (error: any) {
    console.error("Profile fetch error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}