import { NextResponse } from "next/server";
import { bingoManager } from "@/server/game/BingoManager";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { command, gameId } = body;

    if (!command || !gameId) {
      return NextResponse.json(
        { success: false, error: "command and gameId are required" },
        { status: 400 }
      );
    }

    if (command === "start-game" || command === "eyes-down") {
      bingoManager.startGame(gameId);
    } else if (command === "call-next") {
      bingoManager.callNextNumber(gameId);
    } else if (command === "end-game") {
      bingoManager.endGame(gameId);
    } else {
      return NextResponse.json(
        { success: false, error: "Unknown command" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, command, gameId });
  } catch (error) {
    console.error("[Bingo API] Control error", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
