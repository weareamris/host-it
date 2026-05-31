export {
  generateGameBoard,
  PRIZE_REGISTRY,
  ACTIVE_PRIZES,
  shuffleArray,
  buildPrizePool,
  type Prize,
  type PrizeRarity,
} from "./prizeRegistry";

export const ROUND_CONFIG = [
  5,
  5,
  4,
  3,
  3,
];

export function getBoxesToOpen(
  round: number
) {
  return (
    ROUND_CONFIG[
      round - 1
    ] || 0
  );
}

export function getTotalRequiredOpened(
  round: number
) {
  let total = 0;
  for (
    let i = 0;
    i < round;
    i++
  ) {
    total +=
      ROUND_CONFIG[i] ||
      0;
  }
  return total;
}

export function getOpenedCount(
  boxes: any[]
) {
  return boxes.filter(
    (b) => b.opened
  ).length;
}

export function shouldCallBanker(
  boxes: any[],
  round: number
) {
  const opened =
    getOpenedCount(
      boxes
    );
  return (
    opened >=
    getTotalRequiredOpened(
      round
    )
  );
}

export function calculateExpectedValue(
  boxes: any[]
) {
  if (
    boxes.length === 0
  ) {
    return 0;
  }
  const total =
    boxes.reduce(
      (
        sum,
        box
      ) =>
        sum +
        box.prize.value,
      0
    );
  return Math.floor(
    total /
      boxes.length
  );
}

export function calculateBankerOffer(
  boxes: any[],
  contestantBox: number,
  round: number
) {
  const remaining =
    boxes.filter(
      (b) =>
        !b.opened &&
        b.boxNumber !==
          contestantBox
    );

  const expectedValue =
    calculateExpectedValue(
      remaining
    );

  let multiplier =
    0.45;

  if (round === 2)
    multiplier = 0.58;
  if (round === 3)
    multiplier = 0.68;
  if (round === 4)
    multiplier = 0.82;
  if (round >= 5)
    multiplier = 0.92;

  return Math.floor(
    expectedValue *
      multiplier
  );
}

export function isFinalTwo(
  boxes: any[],
  contestantBox: number
) {
  const remaining =
    boxes.filter(
      (b) =>
        !b.opened &&
        b.boxNumber !==
          contestantBox
    );
  return (
    remaining.length === 1
  );
}

export function getFinalBox(
  boxes: any[],
  contestantBox: number
) {
  return boxes.find(
    (b) =>
      !b.opened &&
      b.boxNumber !==
        contestantBox
  );
}

export function swapBoxes(
  contestantBox: number,
  boxes: any[]
) {
  const otherBox =
    getFinalBox(
      boxes,
      contestantBox
    );
  return otherBox?.boxNumber ??
    contestantBox;
}

export function getRemainingBoxes(
  boxes: any[]
) {
  return boxes.filter(
    (box) => !box.opened
  );
}
