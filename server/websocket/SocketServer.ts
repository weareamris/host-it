import { Server as SocketIOServer } from "socket.io";
import { Server as HTTPServer } from "http";
import type { NextApiRequest, NextApiResponse } from "next";
import { gameManager } from "@/server/game/GameManager";
import { playerManager } from "@/server/game/PlayerManager";

let io: SocketIOServer | null = null;

export function initSocketServer(server: HTTPServer | NextApiRequest | NextApiResponse) {
  // Handle both HTTP server and NextApiRequest/Response
  if ("io" in server && server.io instanceof SocketIOServer) {
    io = server.io;
    return io;
  }

  io = new SocketIOServer(server as HTTPServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  // Connection handling
  io.on("connection", (socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    // Join game room
    socket.on("join-game", (data: { username: string; gameId: string }) => {
      const { username, gameId } = data;
      socket.join(`game:${gameId}`);
      socket.join(`overlay:${username}`);

      console.log(`[Socket] ${username} joined game ${gameId}`);

      // Notify everyone in the overlay
      io?.to(`overlay:${username}`).emit("player-joined", {
        username,
        timestamp: new Date().toISOString(),
      });
    });

    // Player action
    socket.on("player-action", (data: { gameId: string; action: string; playerId: string }) => {
      console.log(`[Socket] Player action:`, data);
      const { gameId, action, playerId } = data;

      // Process through game manager
      gameManager.processPlayerAction(gameId, playerId, action);

      // Broadcast to all players in this game
      io?.to(`game:${gameId}`).emit("action-processed", {
        playerId,
        action,
        timestamp: new Date().toISOString(),
      });
    });

    // Game control
    socket.on("game-control", (data: { username: string; command: string; payload?: unknown }) => {
      console.log(`[Socket] Game control:`, data);
      const { username, command, payload } = data;

      io?.to(`overlay:${username}`).emit("game-command", {
        command,
        payload,
        timestamp: new Date().toISOString(),
      });
    });

    // Disconnect
    socket.on("disconnect", () => {
      console.log(`[Socket] Client disconnected: ${socket.id}`);
    });
  });

  return io;
}

export function getIO() {
  return io;
}

export function broadcastToOverlay(username: string, eventType: string, data: unknown) {
  io?.to(`overlay:${username}`).emit(eventType, {
    ...(typeof data === 'object' && data !== null ? data : {}),
    timestamp: new Date().toISOString(),
  });
}

export function broadcastToGame(gameId: string, eventType: string, data: unknown) {
  io?.to(`game:${gameId}`).emit(eventType, {
    ...(typeof data === 'object' && data !== null ? data : {}),
    timestamp: new Date().toISOString(),
  });
}
