import { NextResponse } from "next/server";
import { storeEvent } from "@/app/api/events/feed/route";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, eventType, data } = body;

    if (!username || !eventType) {
      return NextResponse.json(
        { error: "username and eventType are required" },
        { status: 400 }
      );
    }

    storeEvent(username, eventType, data ?? {});

    return NextResponse.json({
      success: true,
      username,
      eventType,
    });
  } catch (error) {
    console.error("[Overlay Event API] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
