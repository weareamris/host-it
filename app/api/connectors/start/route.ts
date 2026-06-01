import { NextResponse } from "next/server";
import { connectorManager } from "@/server/connectors/ConnectorManager";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { streamerUsername, sessionCode, sessionId } = body;

    if (!streamerUsername) {
      return NextResponse.json(
        { success: false, error: "streamerUsername required" },
        { status: 400 }
      );
    }

    // Start the connector with optional sessionId for session-specific routing
    const connector = await connectorManager.startConnection(
      streamerUsername,
      streamerUsername,
      sessionId || sessionCode
    );

    return NextResponse.json({
      success: true,
      streamerUsername,
      sessionCode,
      sessionId,
      connected: connector?.isConnected() || false,
    });
  } catch (error) {
    console.error("START CONNECTOR ERROR", error);

    return NextResponse.json(
      { success: false, error: "Failed to start connector" },
      { status: 500 }
    );
  }
}
