import { broadcastToGame, broadcastToOverlay } from "@/server/websocket/SocketServer";
import { storeEvent } from "@/app/api/events/feed/route";

type BingoPhase = "waiting" | "locked" | "ready" | "started" | "ended";

type BingoPlayer = {
  id: string;
  tiktokUsername: string;
  displayName: string;
  card: number[][];
  lineClaimed: boolean;
  fullHouseClaimed: boolean;
  lockedAt: string;
};

type BingoGame = {
  id: string;
  streamer: string;
  phase: BingoPhase;
  players: BingoPlayer[];
  calledNumbers: number[];
  availableNumbers: number[];
  currentNumber: number | null;
  linePrize: string;
  housePrize: string;
  createdAt: string;
  callInterval: ReturnType<typeof setInterval> | null;
};

class BingoManager {
  private games = new Map<string, BingoGame>();

  createGame(
    gameId: string,
    streamer: string,
    linePrize: string = "Line Prize",
    housePrize: string = "Full House Prize"
  ) {
    const game: BingoGame = {
      id: gameId,
      streamer,
      phase: "waiting",
      players: [],
      calledNumbers: [],
      availableNumbers: this.shuffle(Array.from({ length: 75 }, (_, index) => index + 1)),
      currentNumber: null,
      linePrize,
      housePrize,
      createdAt: new Date().toISOString(),
      callInterval: null,
    };

    this.games.set(gameId, game);
    console.log(`[BingoManager] Created bingo game: ${gameId}`);

    return game;
  }

  getGame(gameId: string) {
    return this.games.get(gameId) ?? null;
  }

  getActiveGameForStreamer(streamer: string) {
    return Array.from(this.games.values()).find(
      (game) =>
        game.streamer === streamer &&
        game.phase !== "ended"
    ) ?? null;
  }

  lockInGiftPlayer(streamer: string, tiktokUsername: string, displayName: string) {
    const game = this.getActiveGameForStreamer(streamer);
    if (!game || game.phase === "ended" || game.phase === "started") {
      return null;
    }

    const exists = game.players.some(
      (player) => player.tiktokUsername === tiktokUsername
    );
    if (exists) {
      return null;
    }

    if (game.players.length >= 8) {
      return null;
    }

    const player: BingoPlayer = {
      id: `bingo-player-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      tiktokUsername,
      displayName,
      card: this.generateBingoCard(),
      lineClaimed: false,
      fullHouseClaimed: false,
      lockedAt: new Date().toISOString(),
    };

    game.players.push(player);
    game.phase = game.players.length === 8 ? "ready" : "locked";

    const message = `${displayName} has locked in a bingo card (${game.players.length}/8)!`;

    broadcastToOverlay(streamer, "bingo-player-locked", {
      player: {
        id: player.id,
        displayName: player.displayName,
      },
      totalPlayers: game.players.length,
      message,
    });

    storeEvent(streamer, "bingo-lockin", {
      type: "bingo-lockin",
      user: displayName,
      message,
      players: game.players.length,
    });

    if (game.phase === "ready") {
      const readyMessage = `Eight players are locked in. Eyes down when you're ready!`;
      broadcastToOverlay(streamer, "bingo-ready", {
        message: readyMessage,
        players: game.players.length,
      });
      storeEvent(streamer, "bingo-ready", {
        type: "bingo-ready",
        message: readyMessage,
        players: game.players.length,
      });
    }

    return player;
  }

  startGame(gameId: string) {
    const game = this.games.get(gameId);
    if (!game || game.phase === "ended") {
      return null;
    }

    game.phase = "started";
    game.calledNumbers = [];
    game.currentNumber = null;
    game.availableNumbers = this.shuffle(Array.from({ length: 75 }, (_, index) => index + 1));

    broadcastToGame(gameId, "bingo-game-started", {
      gameId,
      players: game.players.map((player) => ({ id: player.id, displayName: player.displayName })),
      linePrize: game.linePrize,
      housePrize: game.housePrize,
    });

    storeEvent(game.streamer, "bingo-game-start", {
      type: "bingo-game-start",
      message: `Bingo has started! Line prize: ${game.linePrize}, House prize: ${game.housePrize}`,
      players: game.players.length,
    });

    this.callNextNumber(gameId);

    if (game.callInterval) {
      clearInterval(game.callInterval);
    }

    game.callInterval = setInterval(() => {
      this.callNextNumber(gameId);
    }, 4500);

    return game;
  }

  callNextNumber(gameId: string) {
    const game = this.games.get(gameId);
    if (!game || game.phase !== "started") {
      return null;
    }

    if (game.availableNumbers.length === 0) {
      return this.endGame(gameId);
    }

    const nextNumber = game.availableNumbers.shift() as number;
    game.calledNumbers.push(nextNumber);
    game.currentNumber = nextNumber;

    const callPhrase = this.getCallerPhrase(nextNumber, game.calledNumbers.length);

    broadcastToGame(gameId, "bingo-number-called", {
      number: nextNumber,
      message: callPhrase,
      calledNumbers: game.calledNumbers,
    });

    storeEvent(game.streamer, "bingo-number", {
      type: "bingo-number",
      message: callPhrase,
      number: nextNumber,
      players: game.players.length,
    });

    this.checkWinners(game);

    return nextNumber;
  }

  endGame(gameId: string) {
    const game = this.games.get(gameId);
    if (!game || game.phase === "ended") {
      return null;
    }

    if (game.callInterval) {
      clearInterval(game.callInterval);
      game.callInterval = null;
    }

    game.phase = "ended";

    const winners = game.players.filter((player) => player.fullHouseClaimed);
    const winnersText = winners.length
      ? winners.map((player) => player.displayName).join(", ")
      : "No winner yet.";

    broadcastToGame(gameId, "bingo-game-ended", {
      winners: winners.map((player) => ({ id: player.id, displayName: player.displayName })),
      message: winners.length
        ? `Full house! ${winnersText} completed the card.`
        : "The bingo session has ended.",
    });

    storeEvent(game.streamer, "bingo-game-end", {
      type: "bingo-game-end",
      message: winners.length
        ? `Full house! ${winnersText} takes the house prize.`
        : "The bingo game has ended.",
      players: game.players.length,
    });

    setTimeout(() => {
      this.games.delete(gameId);
      console.log(`[BingoManager] Cleaned up bingo game: ${gameId}`);
    }, 5 * 60 * 1000);

    return game;
  }

  private checkWinners(game: BingoGame) {
    const calledSet = new Set(game.calledNumbers);
    let foundLine = false;
    let foundHouse = false;

    game.players.forEach((player) => {
      const card = player.card;
      const isMarked = (value: number) => value === 0 || calledSet.has(value);

      const rows = card.map((row) => row.every(isMarked));
      const cols = card[0].map((_, colIndex) => card.every((row) => isMarked(row[colIndex])));
      const diag1 = card.every((row, index) => isMarked(row[index]));
      const diag2 = card.every((row, index) => isMarked(row[4 - index]));
      const lineComplete = rows.some(Boolean) || cols.some(Boolean) || diag1 || diag2;
      const houseComplete = card.every((row) => row.every(isMarked));

      if (lineComplete && !player.lineClaimed) {
        player.lineClaimed = true;
        foundLine = true;

        const lineMessage = `${player.displayName} has a bingo line! ${game.linePrize} is on the line.`;
        broadcastToGame(game.id, "bingo-line", {
          playerId: player.id,
          displayName: player.displayName,
          message: lineMessage,
        });
        storeEvent(game.streamer, "bingo-line", {
          type: "bingo-line",
          message: lineMessage,
          user: player.displayName,
          players: game.players.length,
        });
      }

      if (houseComplete && !player.fullHouseClaimed) {
        player.fullHouseClaimed = true;
        foundHouse = true;

        const houseMessage = `${player.displayName} has a FULL HOUSE! ${game.housePrize} is won.`;
        broadcastToGame(game.id, "bingo-house", {
          playerId: player.id,
          displayName: player.displayName,
          message: houseMessage,
        });
        storeEvent(game.streamer, "bingo-house", {
          type: "bingo-house",
          message: houseMessage,
          user: player.displayName,
          players: game.players.length,
        });
      }
    });

    if (foundHouse) {
      this.endGame(game.id);
    }

    return {
      foundLine,
      foundHouse,
    };
  }

  private generateBingoCard() {
    const ranges = [
      [1, 15],
      [16, 30],
      [31, 45],
      [46, 60],
      [61, 75],
    ];

    const columns = ranges.map(([start, end]) => this.shuffle(Array.from({ length: end - start + 1 }, (_, index) => start + index)).slice(0, 5));
    const card: number[][] = Array.from({ length: 5 }, (_, rowIndex) => columns.map((col) => col[rowIndex]));

    card[2][2] = 0;
    return card;
  }

  private shuffle<T>(items: T[]) {
    const list = [...items];
    for (let i = list.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [list[i], list[j]] = [list[j], list[i]];
    }
    return list;
  }

  private getCallerPhrase(number: number, count: number) {
    const markers = ["Eyes down", "Eyes down", "Eyes down", "Numbers ready", "Here we go", "Take your cards"].join(" ");
    return `Bingo caller says: ${number}! ${count === 1 ? "Eyes down!" : count === 2 ? "Two numbers on the board." : "Keep them locked in."}`;
  }
}

const globalForBingo = globalThis as typeof globalThis & {
  bingoManager?: BingoManager;
};

export const bingoManager =
  globalForBingo.bingoManager ?? new BingoManager();

if (process.env.NODE_ENV !== "production") {
  globalForBingo.bingoManager = bingoManager;
}
