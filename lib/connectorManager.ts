import {
  WebcastPushConnection,
} from "tiktok-live-connector";

type ConnectorMap = {
  [key: string]:
    WebcastPushConnection;
};

const activeConnectors: ConnectorMap =
  {};

export async function startConnector(
  streamerUsername: string
) {
  if (
    activeConnectors[
      streamerUsername
    ]
  ) {
    console.log(
      `Connector already running for ${streamerUsername}`
    );

    return;
  }

  console.log(
    `Starting connector for ${streamerUsername}`
  );

  const tiktokLive =
    new WebcastPushConnection(
      streamerUsername
    );

  activeConnectors[
    streamerUsername
  ] = tiktokLive;

  try {
    await tiktokLive.connect();

    console.log(
      `Connected to ${streamerUsername}`
    );

    // GIFT EVENT
    tiktokLive.on(
      "gift",
      (data) => {
        console.log(
          `[GIFT] ${streamerUsername}`,
          {
            user:
              data.uniqueId,

            gift:
              data.giftName,

            amount:
              data.repeatCount,
          }
        );

        /*
          FUTURE:
          Route into game engine
        */
      }
    );

    // CHAT EVENT
    tiktokLive.on(
      "chat",
      (data) => {
        console.log(
          `[CHAT] ${streamerUsername}`,
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
    tiktokLive.on(
      "like",
      (data) => {
        console.log(
          `[LIKE] ${streamerUsername}`,
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
    tiktokLive.on(
      "follow",
      (data) => {
        console.log(
          `[FOLLOW] ${streamerUsername}`,
          {
            user:
              data.uniqueId,
          }
        );
      }
    );

    // STREAM END
    tiktokLive.on(
      "streamEnd",
      () => {
        console.log(
          `${streamerUsername} stream ended`
        );

        stopConnector(
          streamerUsername
        );
      }
    );
  } catch (error) {
    console.error(
      `Failed connection for ${streamerUsername}`,
      error
    );
  }
}

export async function stopConnector(
  streamerUsername: string
) {
  const connector =
    activeConnectors[
      streamerUsername
    ];

  if (!connector) {
    return;
  }

  console.log(
    `Stopping connector for ${streamerUsername}`
  );

  connector.disconnect();

  delete activeConnectors[
    streamerUsername
  ];
}

export function getActiveConnectors() {
  return Object.keys(
    activeConnectors
  );
}