import { broadcastToOverlay } from "@/server/websocket/SocketServer";

export type Player = {
  id: string;
  tiktokUsername: string;
  displayName: string;
  joinedAt: Date;
  isController: boolean;
};

class PlayerManager {
  private players = new Map<string, Player[]>(); // streamer -> players
  private controllers = new Map<string, string>(); // streamer -> controllerId

  addPlayer(streamer: string, tiktokUsername: string, displayName: string) {
    const playerId = `player-${Date.now()}-${Math.random()}`;

    const player: Player = {
      id: playerId,
      tiktokUsername,
      displayName,
      joinedAt: new Date(),
      isController: false,
    };

    const streamerPlayers = this.players.get(streamer) || [];
    streamerPlayers.push(player);
    this.players.set(streamer, streamerPlayers);

    broadcastToOverlay(streamer, "player-joined-stream", {
      player,
      totalPlayers: streamerPlayers.length,
    });

    console.log(
      `[PlayerManager] ${tiktokUsername} joined stream ${streamer}`
    );

    return player;
  }

  setController(streamer: string, playerId: string) {
    const players = this.players.get(streamer);
    if (!players) return false;

    const player = players.find((p) => p.id === playerId);
    if (!player) return false;

    // Unset previous controller
    const oldControllerId = this.controllers.get(streamer);
    if (oldControllerId) {
      const oldPlayer = players.find((p) => p.id === oldControllerId);
      if (oldPlayer) {
        oldPlayer.isController = false;
      }
    }

    // Set new controller
    player.isController = true;
    this.controllers.set(streamer, playerId);

    broadcastToOverlay(streamer, "controller-changed", {
      controllerId: playerId,
      controller: player,
    });

    console.log(
      `[PlayerManager] ${player.tiktokUsername} is now controller`
    );

    return true;
  }

  getPlayers(streamer: string) {
    return this.players.get(streamer) || [];
  }

  getController(streamer: string) {
    const controllerId = this.controllers.get(streamer);
    if (!controllerId) return null;

    const players = this.players.get(streamer) || [];
    return players.find((p) => p.id === controllerId) || null;
  }

  removePlayer(streamer: string, playerId: string) {
    const players = this.players.get(streamer) || [];
    const index = players.findIndex((p) => p.id === playerId);

    if (index === -1) return false;

    const removed = players.splice(index, 1)[0];

    if (this.controllers.get(streamer) === playerId) {
      this.controllers.delete(streamer);
    }

    this.players.set(streamer, players);

    broadcastToOverlay(streamer, "player-left-stream", {
      playerId,
      username: removed.tiktokUsername,
      totalPlayers: players.length,
    });

    return true;
  }

  clearStreamer(streamer: string) {
    this.players.delete(streamer);
    this.controllers.delete(streamer);
  }
}

const globalForPlayers = globalThis as typeof globalThis & {
  playerManager?: PlayerManager;
};

export const playerManager =
  globalForPlayers.playerManager ?? new PlayerManager();

if (process.env.NODE_ENV !== "production") {
  globalForPlayers.playerManager = playerManager;
}
