type GameSession = {
  streamer: string;

  triggerGift: any;

  contestant: string | null;

  selectedBox: number | null;

  currentRound: number;

  bankerOffer: number | null;

  boxesOpenedThisRound: number;

  status: string;

  boxes: {
    boxNumber: number;

    opened: boolean;

    prize: any;
  }[];
};

class GameSessionManager {

  private sessions =
    new Map<
      string,
      GameSession
    >();

  setSession(
    username: string,
    session: GameSession
  ) {

    this.sessions.set(
      username,
      session
    );
  }

  getSession(
    username: string
  ) {

    return this.sessions.get(
      username
    );
  }

  removeSession(
    username: string
  ) {

    this.sessions.delete(
      username
    );
  }

  hasSession(
    username: string
  ) {

    return this.sessions.has(
      username
    );
  }
}

export const gameSessionManager =
  new GameSessionManager();