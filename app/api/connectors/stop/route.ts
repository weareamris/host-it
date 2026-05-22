import { NextResponse } from "next/server";

import {
  stopConnector,
} from "@/lib/connectorManager";

export async function POST(
  request: Request
) {
  try {
    const body =
      await request.json();

    const streamerUsername =
      body.streamerUsername;

    await stopConnector(
      streamerUsername
    );

    return NextResponse.json({
      success: true,
      streamerUsername,
    });
  } catch (error) {
    console.error(
      "STOP CONNECTOR ERROR",
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