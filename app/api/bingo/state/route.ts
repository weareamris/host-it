import { NextResponse } from "next/server";
import { bingoManager } from "@/server/game/BingoManager";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const gameId = searchParams.get("gameId");

  if (!gameId) {
    return NextResponse.json({ error: "gameId required" }, { status: 400 });
  }

  const game = bingoManager.getGame(gameId);
  if (!game) {
    return NextResponse.json({ error: "game not found" }, { status: 404 });
  }

  return NextResponse.json({
    game: {
      id: game.id,
      streamer: game.streamer,
      phase: game.phase,
      players: game.players,
      calledNumbers: game.calledNumbers,
      currentNumber: game.currentNumber,
      linePrize: game.linePrize,
      housePrize: game.housePrize,
      createdAt: game.createdAt,
      totalPlayers: game.players.length,
    },
  });
}
