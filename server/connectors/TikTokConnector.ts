import { eventBus } from "@/server/events/EventBus";
import { playerManager } from "@/server/game/PlayerManager";
import { gameManager } from "@/server/game/GameManager";
import { bingoManager } from "@/server/game/BingoManager";
import { storeEvent } from "@/app/api/events/feed/route";

import {
  WebcastPushConnection,
} from "tiktok-live-connector";

export class TikTokConnector {
  private streamerId: string;

  private username: string;

  private connected = false;

  private client:
    | WebcastPushConnection
    | null = null;

  private gameId: string;

  constructor(
    streamerId: string,
    username: string,
    gameId?: string
  ) {
    this.streamerId =
      streamerId;

    this.username = username;

    this.gameId =
      gameId ||
      `game-${username}-${Date.now()}`;
  }

  async connect() {
    if (this.connected) {
      console.log(
        `[TikTokConnector] Already connected ${this.username}`
      );

      return;
    }

    console.log(
      `[TikTokConnector] Connecting ${this.username}`
    );

    try {
      this.client =
        new WebcastPushConnection(
          this.username
        );

      await this.client.connect();

      this.connected = true;

      console.log(
        `[TikTokConnector] Connected ${this.username}`
      );

      // GIFT EVENT
      this.client.on(
        "gift",
        (data) => {
          const payload = {
            type: "gift",
            streamer:
              this.username,
            user:
              data.uniqueId,
            gift:
              data.giftName,
            amount:
              data.repeatCount,
            sessionId: this.gameId,
          };

          console.log(
            "[GIFT EVENT]",
            payload
          );

          eventBus.emit(
            "tiktok-event",
            payload
          );

          // Store event for polling
          storeEvent(
            this.username,
            "tiktok-gift",
            payload
          );

          bingoManager.lockInGiftPlayer(
            this.username,
            data.uniqueId,
            data.uniqueId
          );

          // Add to player system if not exists
          const players =
            playerManager.getPlayers(
              this.username
            );
          const exists =
            players.some(
              (p) =>
                p.tiktokUsername ===
                data.uniqueId
            );

          if (!exists) {
            playerManager.addPlayer(
              this.username,
              data.uniqueId,
              data.uniqueId
            );
          }
        }
      );

      // CHAT EVENT
      this.client.on(
        "chat",
        (data) => {
          const payload = {
            type: "chat",
            streamer:
              this.username,
            user:
              data.uniqueId,
            comment:
              data.comment,
          };

          console.log(
            "[CHAT EVENT]",
            payload
          );

          eventBus.emit(
            "tiktok-event",
            payload
          );

          // Store event for polling
          storeEvent(
            this.username,
            "tiktok-chat",
            payload
          );

          // Parse commands from chat
          this.parseCommand(
            data.uniqueId,
            data.uniqueId,
            data.comment
          );

          // Add to player system if not exists
          const players =
            playerManager.getPlayers(
              this.username
            );
          const exists =
            players.some(
              (p) =>
                p.tiktokUsername ===
                data.uniqueId
            );

          if (!exists) {
            playerManager.addPlayer(
              this.username,
              data.uniqueId,
              data.uniqueId
            );
          }
        }
      );

      // LIKE EVENT
      this.client.on(
        "like",
        (data) => {
          const payload = {
            type: "like",
            streamer:
              this.username,
            user:
              data.uniqueId,
            likes:
              data.likeCount,
          };

          console.log(
            "[LIKE EVENT]",
            payload
          );

          eventBus.emit(
            "tiktok-event",
            payload
          );

          // Store event for polling
          storeEvent(
            this.username,
            "tiktok-like",
            payload
          );
        }
      );

      // FOLLOW EVENT
      this.client.on(
        "follow",
        (data) => {
          const payload = {
            type: "follow",
            streamer:
              this.username,
            user:
              data.uniqueId,
          };

          console.log(
            "[FOLLOW EVENT]",
            payload
          );

          eventBus.emit(
            "tiktok-event",
            payload
          );

          // Store event for polling
          storeEvent(
            this.username,
            "tiktok-follow",
            payload
          );

          // Add as player
          const players =
            playerManager.getPlayers(
              this.username
            );
          const exists =
            players.some(
              (p) =>
                p.tiktokUsername ===
                data.uniqueId
            );

          if (!exists) {
            playerManager.addPlayer(
              this.username,
              data.uniqueId,
              data.uniqueId
            );
          }
        }
      );

      // STREAM END
      this.client.on(
        "streamEnd",
        () => {
          console.log(
            `[STREAM END] ${this.username}`
          );

          this.disconnect();
        }
      );
    } catch (error) {
      console.error(
        `[TikTokConnector] Failed connection ${this.username}`,
        error
      );
    }
  }

  async disconnect() {
    if (!this.connected) {
      return;
    }

    console.log(
      `[TikTokConnector] Disconnecting ${this.username}`
    );

    if (this.client) {
      this.client.disconnect();
    }

    this.connected = false;

    this.client = null;

    // Clear players for this streamer
    playerManager.clearStreamer(
      this.username
    );
  }

  isConnected() {
    return this.connected;
  }

  getGameId() {
    return this.gameId;
  }

  private parseCommand(
    userId: string,
    displayName: string,
    comment: string
  ) {
    const trimmed =
      comment.toLowerCase().trim();

    // Join game command
    if (
      trimmed ===
        "!join" ||
      trimmed === "!play"
    ) {
      const player =
        playerManager.addPlayer(
          this.username,
          userId,
          displayName
        );

      if (player) {
        gameManager.addPlayer(
          this.gameId,
          player.id,
          displayName
        );
      }

      console.log(
        `[COMMAND] ${displayName} joined`
      );
    }

    // Box selection (e.g., "!box 1" or "1")
    const boxMatch =
      trimmed.match(
        /!?box\s*(\d+)|^(\d)$/
      );

    if (boxMatch) {
      const boxNum = boxMatch[1] ||
        boxMatch[2];
      const players =
        playerManager.getPlayers(
          this.username
        );
      const player =
        players.find(
          (p) =>
            p.tiktokUsername ===
            userId
        );

      if (player) {
        gameManager.processPlayerAction(
          this.gameId,
          player.id,
          `choose-box-${boxNum}`
        );

        storeEvent(
          this.username,
          "command-executed",
          {
            command: "box-chosen",
            user: displayName,
            box: boxNum,
          }
        );

        console.log(
          `[COMMAND] ${displayName} chose box ${boxNum}`
        );
      }
    }

    // Accept offer
    if (trimmed === "!yes" ||
      trimmed === "!accept"
    ) {
      const players =
        playerManager.getPlayers(
          this.username
        );
      const player =
        players.find(
          (p) =>
            p.tiktokUsername ===
            userId
        );

      if (player) {
        gameManager.processPlayerAction(
          this.gameId,
          player.id,
          "accept-offer"
        );

        storeEvent(
          this.username,
          "command-executed",
          {
            command: "offer-accepted",
            user: displayName,
          }
        );

        console.log(
          `[COMMAND] ${displayName} accepted offer`
        );
      }
    }

    // Reject offer
    if (trimmed === "!no" ||
      trimmed === "!reject"
    ) {
      const players =
        playerManager.getPlayers(
          this.username
        );
      const player =
        players.find(
          (p) =>
            p.tiktokUsername ===
            userId
        );

      if (player) {
        gameManager.processPlayerAction(
          this.gameId,
          player.id,
          "reject-offer"
        );

        storeEvent(
          this.username,
          "command-executed",
          {
            command: "offer-rejected",
            user: displayName,
          }
        );

        console.log(
          `[COMMAND] ${displayName} rejected offer`
        );
      }
    }

    // Set as controller
    if (trimmed === "!control") {
      const players =
        playerManager.getPlayers(
          this.username
        );
      const player =
        players.find(
          (p) =>
            p.tiktokUsername ===
            userId
        );

      if (player) {
        playerManager.setController(
          this.username,
          player.id
        );

        console.log(
          `[COMMAND] ${displayName} is now controller`
        );
      }
    }
  }
}