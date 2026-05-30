import { NextResponse } from "next/server";
import { bingoManager } from "@/server/game/BingoManager";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const streamerUsername = body.streamerUsername || "demo";
    const linePrize = body.linePrize || "£250 line prize";
    const housePrize = body.housePrize || "£1,000 house prize";
    const gameId = body.gameId || `bingo-${streamerUsername}-${Date.now()}`;

    const game = bingoManager.createGame(gameId, streamerUsername, linePrize, housePrize);

    return NextResponse.json({
      success: true,
      gameId: game.id,
      streamer: game.streamer,
      linePrize: game.linePrize,
      housePrize: game.housePrize,
    });
  } catch (error) {
    console.error("[Bingo API] Create session error", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
