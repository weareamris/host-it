import { NextResponse } from "next/server";

import {
  startConnector,
} from "@/lib/connectorManager";

export async function POST(
  request: Request
) {
  try {
    const body =
      await request.json();

    const streamerUsername =
      body.streamerUsername;

    const sessionCode =
      body.sessionCode;

    await startConnector(
      streamerUsername
    );

    return NextResponse.json({
      success: true,
      streamerUsername,
      sessionCode,
    });
  } catch (error) {
    console.error(
      "START CONNECTOR ERROR",
      error
    );

    return NextResponse.json(
      {
        success: false,
      },
      {
        status: 500,
      }
    );
  }
}