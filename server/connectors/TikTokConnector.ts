import { eventBus } from "@/server/events/EventBus";

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

  constructor(
    streamerId: string,
    username: string
  ) {
    this.streamerId =
      streamerId;

    this.username = username;
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
          };

          console.log(
            "[GIFT EVENT]",
            payload
          );

          eventBus.emit(
            "tiktok-event",
            payload
          );
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
  }

  isConnected() {
    return this.connected;
  }
}