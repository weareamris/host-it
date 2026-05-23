import { TikTokConnector } from "./TikTokConnector";

class ConnectorManager {
  private connectors =
    new Map<string, TikTokConnector>();

  async startConnection(
    streamerId: string,
    username: string
  ) {
    const existing =
      this.connectors.get(streamerId);

    if (existing) {
      console.log(
        `[ConnectorManager] Connection already exists for ${streamerId}`
      );

      return existing;
    }

    const connector =
      new TikTokConnector(
        streamerId,
        username
      );

    await connector.connect();

    this.connectors.set(
      streamerId,
      connector
    );

    console.log(
      `[ConnectorManager] Stored connection for ${streamerId}`
    );

    return connector;
  }

  async stopConnection(
    streamerId: string
  ) {
    const connector =
      this.connectors.get(streamerId);

    if (!connector) return;

    await connector.disconnect();

    this.connectors.delete(
      streamerId
    );

    console.log(
      `[ConnectorManager] Removed connection for ${streamerId}`
    );
  }

  getConnection(
    streamerId: string
  ) {
    return this.connectors.get(
      streamerId
    );
  }

  getAllConnections() {
    return Array.from(
      this.connectors.values()
    );
  }
}

const globalForConnectors =
  globalThis as typeof globalThis & {
    connectorManager?:
      ConnectorManager;
  };

export const connectorManager =
  globalForConnectors
    .connectorManager ??
  new ConnectorManager();

if (
  process.env.NODE_ENV !==
  "production"
) {
  globalForConnectors.connectorManager =
    connectorManager;
}