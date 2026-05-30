import { broadcastToGame } from "@/server/websocket/SocketServer";

export type GamePhase =
  | "waiting"
  | "started"
  | "playing"
  | "revealing"
  | "ended";

export type GamePlayer = {
  id: string;
  username: string;
  choice?: string;
  score: number;
  status: "active" | "eliminated";
};

export type GameState = {
  id: string;
  streamer: string;
  gameType: string;
  phase: GamePhase;
  players: GamePlayer[];
  bankerOffer?: number;
  boxValues?: number[];
  revealedBoxes?: string[];
  currentRound: number;
  totalRounds: number;
  winner?: string;
  createdAt: Date;
};

class GameManager {
  private games = new Map<string, GameState>();

  createGame(gameId: string, streamer: string, gameType: string = "beat-the-banker") {
    const game: GameState = {
      id: gameId,
      streamer,
      gameType,
      phase: "waiting",
      players: [],
      currentRound: 0,
      totalRounds: 5,
      boxValues: this.generateBoxValues(),
      revealedBoxes: [],
      createdAt: new Date(),
    };

    this.games.set(gameId, game);
    console.log(`[GameManager] Created game: ${gameId}`);

    return game;
  }

  getGame(gameId: string) {
    return this.games.get(gameId);
  }

  addPlayer(gameId: string, playerId: string, username: string) {
    const game = this.games.get(gameId);
    if (!game) return null;

    const player: GamePlayer = {
      id: playerId,
      username,
      score: 0,
      status: "active",
    };

    game.players.push(player);
    broadcastToGame(gameId, "player-added", { player });

    return player;
  }

  processPlayerAction(gameId: string, playerId: string, action: string) {
    const game = this.games.get(gameId);
    if (!game) return;

    const player = game.players.find((p) => p.id === playerId);
    if (!player) return;

    console.log(`[GameManager] Processing action for ${player.username}: ${action}`);

    if (action.startsWith("choose-box-")) {
      const boxIndex = parseInt(action.replace("choose-box-", ""));
      player.choice = boxIndex.toString();

      broadcastToGame(gameId, "box-chosen", {
        playerId,
        username: player.username,
        box: boxIndex,
      });
    } else if (action === "accept-offer") {
      player.score += game.bankerOffer || 0;
      broadcastToGame(gameId, "offer-accepted", {
        playerId,
        username: player.username,
        amount: game.bankerOffer,
      });
    } else if (action === "reject-offer") {
      broadcastToGame(gameId, "offer-rejected", {
        playerId,
        username: player.username,
      });
    }
  }

  startGame(gameId: string) {
    const game = this.games.get(gameId);
    if (!game) return;

    game.phase = "started";
    game.currentRound = 1;
    game.boxValues = this.generateBoxValues();
    game.revealedBoxes = [];

    broadcastToGame(gameId, "game-started", {
      round: game.currentRound,
      totalRounds: game.totalRounds,
      players: game.players.map((p) => ({ id: p.id, username: p.username })),
    });

    console.log(`[GameManager] Game started: ${gameId}`);
  }

  revealOffer(gameId: string) {
    const game = this.games.get(gameId);
    if (!game) return;

    game.phase = "revealing";
    const offer = this.generateBankerOffer(game.boxValues || []);
    game.bankerOffer = offer;

    broadcastToGame(gameId, "banker-offer", {
      amount: offer,
      message: `Banker offers £${offer}!`,
    });

    console.log(`[GameManager] Banker offer for ${gameId}: £${offer}`);
  }

  nextRound(gameId: string) {
    const game = this.games.get(gameId);
    if (!game) return;

    game.currentRound += 1;
    game.phase = game.currentRound > game.totalRounds ? "ended" : "playing";
    game.boxValues = this.generateBoxValues();
    game.revealedBoxes = [];

    if (game.phase === "ended") {
      this.endGame(gameId);
    } else {
      broadcastToGame(gameId, "round-started", {
        round: game.currentRound,
        totalRounds: game.totalRounds,
      });
    }
  }

  endGame(gameId: string) {
    const game = this.games.get(gameId);
    if (!game) return;

    game.phase = "ended";

    // Find winner (highest score)
    const winner = game.players.reduce((prev, current) =>
      current.score > prev.score ? current : prev
    );

    game.winner = winner.username;

    broadcastToGame(gameId, "game-ended", {
      winner: winner.username,
      finalScores: game.players.map((p) => ({
        username: p.username,
        score: p.score,
      })),
    });

    console.log(`[GameManager] Game ended: ${gameId}, Winner: ${winner.username}`);

    // Clean up after 5 minutes
    setTimeout(() => {
      this.games.delete(gameId);
    }, 5 * 60 * 1000);
  }

  private generateBoxValues(): number[] {
    const values = [
      1, 5, 10, 25, 50, 75, 100, 250, 500, 1000, 5000, 10000, 25000, 50000, 100000,
    ];
    return values.sort(() => Math.random() - 0.5).slice(0, 6);
  }

  private generateBankerOffer(boxValues: number[]): number {
    const avgValue = boxValues.reduce((a, b) => a + b, 0) / boxValues.length;
    return Math.round(avgValue * (0.8 + Math.random() * 0.4));
  }
}

const globalForGame = globalThis as typeof globalThis & {
  gameManager?: GameManager;
};

export const gameManager =
  globalForGame.gameManager ?? new GameManager();

if (process.env.NODE_ENV !== "production") {
  globalForGame.gameManager = gameManager;
}
