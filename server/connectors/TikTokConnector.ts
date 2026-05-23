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
          console.log(
            `[GIFT] ${this.username}`,
            {
              user:
                data.uniqueId,

              gift:
                data.giftName,

              amount:
                data.repeatCount,
            }
          );
        }
      );

      // CHAT EVENT
      this.client.on(
        "chat",
        (data) => {
          console.log(
            `[CHAT] ${this.username}`,
            {
              user:
                data.uniqueId,

              comment:
                data.comment,
            }
          );
        }
      );

      // LIKE EVENT
      this.client.on(
        "like",
        (data) => {
          console.log(
            `[LIKE] ${this.username}`,
            {
              user:
                data.uniqueId,

              likes:
                data.likeCount,
            }
          );
        }
      );

      // FOLLOW EVENT
      this.client.on(
        "follow",
        (data) => {
          console.log(
            `[FOLLOW] ${this.username}`,
            {
              user:
                data.uniqueId,
            }
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