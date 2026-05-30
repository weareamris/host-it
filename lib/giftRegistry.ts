export type PrizeRarity =
  | "common"
  | "uncommon"
  | "rare"
  | "epic"
  | "legendary"
  | "mythic";

export type Prize = {
  id: string;

  name: string;

  value: number;

  rarity: PrizeRarity;

  enabled: boolean;
};

export const PRIZE_REGISTRY: Prize[] = [

  /* =========================================
     COMMON
  ========================================= */

  {
    id: "rose",
    name: "Rose",
    value: 1,
    rarity: "common",
    enabled: true,
  },

  {
    id: "finger-heart",
    name: "Finger Heart",
    value: 5,
    rarity: "common",
    enabled: true,
  },

  {
    id: "perfume",
    name: "Perfume",
    value: 20,
    rarity: "common",
    enabled: true,
  },

  {
    id: "doughnut",
    name: "Doughnut",
    value: 30,
    rarity: "common",
    enabled: true,
  },

  {
    id: "tiny-diny",
    name: "Tiny Diny",
    value: 10,
    rarity: "common",
    enabled: true,
  },

  {
    id: "crocodile",
    name: "Crocodile",
    value: 10,
    rarity: "common",
    enabled: true,
  },

  {
    id: "paper-crane",
    name: "Paper Crane",
    value: 99,
    rarity: "common",
    enabled: true,
  },

  {
    id: "cap",
    name: "Cap",
    value: 99,
    rarity: "common",
    enabled: true,
  },

  {
    id: "little-crown",
    name: "Little Crown",
    value: 99,
    rarity: "common",
    enabled: true,
  },

  {
    id: "fruit-friends",
    name: "Fruit Friends",
    value: 99,
    rarity: "common",
    enabled: true,
  },

  /* =========================================
     UNCOMMON
  ========================================= */

  {
    id: "travel-with-you",
    name: "Travel With You",
    value: 299,
    rarity: "uncommon",
    enabled: true,
  },

  {
    id: "forever-rosa",
    name: "Forever Rosa",
    value: 299,
    rarity: "uncommon",
    enabled: true,
  },

  {
    id: "magic-rhythm",
    name: "Magic Rhythm",
    value: 299,
    rarity: "uncommon",
    enabled: true,
  },

  {
    id: "fire-up",
    name: "Fire Up",
    value: 399,
    rarity: "uncommon",
    enabled: true,
  },

  {
    id: "coral",
    name: "Coral",
    value: 499,
    rarity: "uncommon",
    enabled: true,
  },

  {
    id: "birthday-cake",
    name: "Birthday Cake",
    value: 500,
    rarity: "uncommon",
    enabled: true,
  },

  {
    id: "good-morning",
    name: "Good Morning",
    value: 399,
    rarity: "uncommon",
    enabled: true,
  },

  {
    id: "lock-and-key",
    name: "Lock & Key",
    value: 199,
    rarity: "uncommon",
    enabled: true,
  },

  /* =========================================
     RARE
  ========================================= */

  {
    id: "sports-car",
    name: "Sports Car",
    value: 1000,
    rarity: "rare",
    enabled: true,
  },

  {
    id: "gold-mine",
    name: "Gold Mine",
    value: 1000,
    rarity: "rare",
    enabled: true,
  },

  {
    id: "red-nose-cannon",
    name: "Red Nose Cannon",
    value: 1000,
    rarity: "rare",
    enabled: true,
  },

  {
    id: "yacht",
    name: "Yacht",
    value: 2000,
    rarity: "rare",
    enabled: true,
  },

  {
    id: "castle-fantasy",
    name: "Castle Fantasy",
    value: 2000,
    rarity: "rare",
    enabled: true,
  },

  {
    id: "adam-dream",
    name: "Adam's Dream",
    value: 25999,
    rarity: "rare",
    enabled: true,
  },

  /* =========================================
     EPIC
  ========================================= */

  {
    id: "phoenix",
    name: "Phoenix",
    value: 25999,
    rarity: "epic",
    enabled: true,
  },

  {
    id: "dragon-flame",
    name: "Dragon Flame",
    value: 26999,
    rarity: "epic",
    enabled: true,
  },

  {
    id: "lion",
    name: "Lion",
    value: 29999,
    rarity: "epic",
    enabled: true,
  },

  {
    id: "gorilla",
    name: "Gorilla",
    value: 30000,
    rarity: "epic",
    enabled: true,
  },

  {
    id: "sam-whale",
    name: "Sam The Whale",
    value: 30000,
    rarity: "epic",
    enabled: true,
  },

  /* =========================================
     LEGENDARY
  ========================================= */

  {
    id: "lion-lion",
    name: "Lion & Lion",
    value: 34000,
    rarity: "legendary",
    enabled: true,
  },

  {
    id: "zeus",
    name: "Zeus",
    value: 34500,
    rarity: "legendary",
    enabled: true,
  },

  {
    id: "seal-whale",
    name: "Seal & Whale",
    value: 34500,
    rarity: "legendary",
    enabled: true,
  },

  /* =========================================
     MYTHIC
  ========================================= */

  {
    id: "tiktok-universe",
    name: "TikTok Universe",
    value: 44999,
    rarity: "mythic",
    enabled: true,
  },

];

export const ACTIVE_PRIZES =
  PRIZE_REGISTRY.filter(
    (p) => p.enabled
  );

/* =========================================
   SHUFFLE
========================================= */

export function shuffleArray<T>(
  array: T[]
): T[] {

  const copy =
    [...array];

  for (
    let i =
      copy.length - 1;
    i > 0;
    i--
  ) {

    const j =
      Math.floor(
        Math.random() *
        (i + 1)
      );

    [
      copy[i],
      copy[j],
    ] = [
      copy[j],
      copy[i],
    ];
  }

  return copy;
}

/* =========================================
   BUILD DUPLICATE PRIZE POOL
========================================= */

export function buildPrizePool(
  selectedPrize: Prize
): Prize[] {

  return Array.from(
    { length: 22 },
    (_, index) => ({

      ...selectedPrize,

      id:
        `${selectedPrize.id}-${index}`,

    })
  );
}

/* =========================================
   GENERATE GAME BOARD
========================================= */

export function generateGameBoard(
  selectedPrize?: Prize
) {

  // STREAMER PICKED
  // A SINGLE PRIZE

  if (
    selectedPrize
  ) {

    const duplicatedPool =
      buildPrizePool(
        selectedPrize
      );

    const shuffled =
      shuffleArray(
        duplicatedPool
      );

    return shuffled.map(
      (
        prize,
        index
      ) => ({

        boxNumber:
          index + 1,

        opened: false,

        prize,

      })
    );
  }

  // NORMAL RANDOM BOARD

  const shuffled =
    shuffleArray(
      ACTIVE_PRIZES
    );

  return shuffled
    .slice(0, 22)
    .map(
      (
        prize,
        index
      ) => ({

        boxNumber:
          index + 1,

        opened: false,

        prize,

      })
    );
}
