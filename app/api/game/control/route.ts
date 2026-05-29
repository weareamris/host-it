import { NextResponse } from "next/server";
import { gameManager } from "@/server/game/GameManager";
import { broadcastToGame } from "@/server/websocket/SocketServer";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { command, gameId, username } = body;

    console.log(`[Game API] Command: ${command}, Game: ${gameId}`);

    if (command === "start-game") {
      gameManager.startGame(gameId);
      broadcastToGame(gameId, "game-started", {
        round: 1,
        totalRounds: 5,
      });
    } else if (command === "reveal-offer") {
      gameManager.revealOffer(gameId);
    } else if (command === "next-round") {
      gameManager.nextRound(gameId);
    } else if (command === "end-game") {
      gameManager.endGame(gameId);
    }

    return NextResponse.json({
      success: true,
      command,
      gameId,
    });
  } catch (error) {
    console.error("[Game API] Error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      {
        status: 500,
      }
    );
  }
}
