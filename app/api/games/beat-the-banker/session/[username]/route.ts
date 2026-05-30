import { NextResponse } from "next/server";

import {
  generateGameBoard,
  shouldCallBanker,
  calculateBankerOffer,
  isFinalTwo,
} from "@/lib/gameEngine";
import { gameSessionManager } from "@/server/games/GameSessionManager";

export async function GET(
  request: Request,
  context: {
    params: Promise<{ username: string }>;
  }
) {
  const { username } = await context.params;

  let session =
    gameSessionManager.getSession(
      username
    );

  if (!session) {
    const boxes =
      generateGameBoard();

    session = {
      streamer: username,
      triggerGift: null,
      contestant: username,
      selectedBox: null,
      currentRound: 1,
      bankerOffer: null,
      boxesOpenedThisRound: 0,
      status: "in-progress",
      boxes,
    };

    gameSessionManager.setSession(
      username,
      session
    );
  }

  return NextResponse.json({
    success: true,
    ...session,
  });
}

export async function POST(
  request: Request,
  context: {
    params: Promise<{ username: string }>;
  }
) {
  const { username } = await context.params;

  const session =
    gameSessionManager.getSession(
      username
    );

  if (!session) {
    return NextResponse.json(
      {
        success: false,
        error: "Session not found",
      },
      { status: 404 }
    );
  }

  const body = await request.json();
  const action = body.action as string;
  const boxNumber = body.boxNumber as number | undefined;

  if (action === "reset") {
    const boxes = generateGameBoard();

    const newSession = {
      streamer: username,
      triggerGift: null,
      contestant: username,
      selectedBox: null,
      currentRound: 1,
      bankerOffer: null,
      boxesOpenedThisRound: 0,
      status: "in-progress",
      boxes,
    };

    gameSessionManager.setSession(username, newSession);

    return NextResponse.json({
      success: true,
      ...newSession,
    });
  }

  if (action === "chooseBox") {
    if (
      session.selectedBox === null &&
      typeof boxNumber === "number"
    ) {
      session.selectedBox = boxNumber;
      session.status = "in-progress";
      session.bankerOffer = null;
      session.boxesOpenedThisRound = 0;
    }
  }

  if (action === "openBox") {
    if (
      typeof boxNumber === "number" &&
      session.selectedBox !== null
    ) {
      const box = session.boxes.find(
        (b) => b.boxNumber === boxNumber
      );

      if (
        box &&
        !box.opened &&
        box.boxNumber !== session.selectedBox
      ) {
        box.opened = true;
        session.boxesOpenedThisRound =
          (session.boxesOpenedThisRound || 0) + 1;

        if (
          !isFinalTwo(
            session.boxes,
            session.selectedBox
          ) &&
          shouldCallBanker(
            session.boxes,
            session.currentRound
          )
        ) {
          session.bankerOffer =
            calculateBankerOffer(
              session.boxes,
              session.selectedBox,
              session.currentRound
            );
        } else {
          session.bankerOffer = null;
        }
      }
    }
  }

  if (action === "noDeal") {
    session.bankerOffer = null;
    session.currentRound += 1;
    session.boxesOpenedThisRound = 0;
    session.status = "in-progress";
  }

  if (action === "deal") {
    session.bankerOffer = null;
    session.status = "deal-accepted";
  }

  if (action === "swap") {
    if (typeof boxNumber === "number") {
      session.selectedBox = boxNumber;
      session.status = "final-swapped";
    }
  }

  if (action === "keep") {
    session.status = "final-kept";
  }

  gameSessionManager.setSession(
    username,
    session
  );

  return NextResponse.json({
    success: true,
    ...session,
  });
}
