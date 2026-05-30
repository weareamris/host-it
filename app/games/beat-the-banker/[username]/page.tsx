"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";
import { motion } from "framer-motion";
import { Mic2 } from "lucide-react";

import {
  getBoxesToOpen,
  shouldCallBanker,
} from "@/lib/gameEngine";

import {
  playBoxOpen,
  playReveal,
  playBankerCall,
  speak,
  speakBankerOffer,
} from "@/lib/audio";

export default function Page(
  {
    params,
  }: {
    params: { username: string };
  }
) {
  const username = params.username;

  const [boxes, setBoxes] =
    useState<any[]>([]);

  const [contestantBox, setContestantBox] =
    useState<number | null>(null);

  const [round, setRound] =
    useState(1);

  const [boxesOpenedThisRound, setBoxesOpenedThisRound] =
    useState(0);

  const [gameStarted, setGameStarted] =
    useState(false);

  const [offer, setOffer] =
    useState<number | null>(null);

  const [swapMode, setSwapMode] =
    useState(false);

  const [finalBox, setFinalBox] =
    useState<any | null>(null);

  const [gameEnded, setGameEnded] =
    useState(false);

  const [gameMessage, setGameMessage] =
    useState("Choose your safe box");

  const [audioBusy, setAudioBusy] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const normalizeBoxes =
    (boxes: any[]) =>
      boxes.map((box: any) => ({
        boxNumber: box.boxNumber,
        opened: box.opened,
        prize: {
          id: box.prize?.id ?? box.gift?.id,
          name: box.prize?.name ?? box.gift?.name,
          value: box.prize?.value ?? box.gift?.value,
          image: box.prize?.image ?? box.gift?.image,
          rarity: box.prize?.rarity ?? box.gift?.rarity,
        },
      }));

  const getMessageFromSession =
    (data: any) => {
      if (!data) {
        return "Choose your safe box";
      }

      if (data.status === "deal-accepted") {
        return `DEAL ACCEPTED — ${data.bankerOffer?.toLocaleString() ?? "?"} COINS`;
      }

      if (data.status === "final-kept") {
        return `YOU KEPT BOX ${data.selectedBox}`;
      }

      if (data.status === "final-swapped") {
        return `YOU SWAPPED TO BOX ${data.selectedBox}`;
      }

      if (data.bankerOffer !== null) {
        return `BANKER OFFER — ${data.bankerOffer.toLocaleString()} COINS`;
      }

      if (data.selectedBox !== null) {
        return `Open ${getBoxesToOpen(data.currentRound)} boxes`;
      }

      return "Choose your safe box";
    };

  const applySessionData =
    (data: any) => {
      if (!data) {
        return;
      }

      if (data.boxes) {
        setBoxes(normalizeBoxes(data.boxes));
      }

      setContestantBox(data.selectedBox ?? null);
      setRound(data.currentRound ?? 1);
      setOffer(data.bankerOffer ?? null);
      setBoxesOpenedThisRound(
        data.boxesOpenedThisRound ?? 0
      );
      setGameStarted(
        data.selectedBox !== null
      );
      setGameEnded(
        data.status !== "in-progress"
      );
      setGameMessage(
        getMessageFromSession(data)
      );
    };

  const updateSession = async (
    payload: any
  ) => {
    try {
      const response = await fetch(
        `/api/games/beat-the-banker/session/${username}`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (!data?.success) {
        return null;
      }

      applySessionData(data);
      return data;
    } catch (err) {
      console.error(
        "Failed to update session",
        err
      );
      return null;
    }
  };

  const handleResetGame = async () => {
    const data = await updateSession({
      action: "reset",
    });

    if (!data) {
      return;
    }

    setGameEnded(false);
    setSwapMode(false);
    setFinalBox(null);
    setGameMessage("Choose your safe box");
  };

  useEffect(() => {
    const loadSession = async () => {
      try {
        const response = await fetch(
          `/api/games/beat-the-banker/session/${username}`
        );
        const data = await response.json();

        if (!data?.boxes) {
          return;
        }

        applySessionData(data);
      } catch (err) {
        console.error("Failed to load session", err);
      } finally {
        setLoading(false);
      }
    };

    loadSession();
  }, [username]);

  const sortedPrizes =
    useMemo(() => {
      const uniquePrizeMap = new Map();

      boxes.forEach((b) => {
        if (!b.prize || !b.prize.id) {
          return;
        }

        if (!uniquePrizeMap.has(b.prize.id)) {
          uniquePrizeMap.set(b.prize.id, b.prize);
        }
      });

      const rarityOrder: any = {
        common: 1,
        uncommon: 2,
        rare: 3,
        epic: 4,
        legendary: 5,
      };

      return Array.from(uniquePrizeMap.values()).sort(
        (a: any, b: any) => {
          const rarityDiff =
            (rarityOrder[a.rarity] || 999) -
            (rarityOrder[b.rarity] || 999);

          if (rarityDiff !== 0)
            return rarityDiff;

          return a.value - b.value;
        }
      );
    }, [boxes]);

  const rarityClass =
    (value: number) => {
      if (value <= 100) return "text-green-400";
      if (value <= 1000) return "text-cyan-400";
      if (value <= 10000) return "text-violet-400";
      if (value <= 30000) return "text-red-400";
      return "text-yellow-300";
    };

  const calculateRealisticOffer =
    (
      currentBoxes: any[],
      currentRound: number
    ) => {
      const remaining =
        currentBoxes.filter(
          (b) => !b.opened
        );

      const values =
        remaining.map((b) => b.prize.value);

      const average =
        values.reduce((a, b) => a + b, 0) / values.length;

      const multipliers: any = {
        1: 0.18,
        2: 0.32,
        3: 0.48,
        4: 0.67,
        5: 0.9,
      };

      let offer =
        average *
        (multipliers[currentRound] || 0.95);

      const highest =
        Math.max(...values);
      offer = Math.min(
        offer,
        highest * 0.95
      );

      const lowest =
        Math.min(...values);
      offer = Math.max(
        offer,
        lowest
      );

      return Math.floor(offer);
    };

  const revealFinalResult =
    async (
      chosenBoxNumber: number
    ) => {
      const chosenBox =
        boxes.find(
          (b) =>
            b.boxNumber ===
            chosenBoxNumber
        );

      if (!chosenBox)
        return;

      const updatedBoxes =
        boxes.map((b) => {
          if (
            b.boxNumber ===
            chosenBox.boxNumber
          ) {
            return {
              ...b,
              opened: true,
            };
          }
          return b;
        });

      setBoxes(updatedBoxes);
      setGameEnded(true);

      await new Promise(
        (resolve) =>
          setTimeout(resolve, 1000)
      );

      playReveal();

      await new Promise(
        (resolve) =>
          setTimeout(resolve, 1800)
      );

      speak(
        `You won ${chosenBox.prize.name}`
      );

      setGameMessage(
        `YOU WON ${chosenBox.prize.name}`
      );
    };

  const handleBoxClick = async (
    box: any
  ) => {
    if (gameEnded) return;
    if (audioBusy) return;

    if (!gameStarted) {
      const data = await updateSession({
        action: "chooseBox",
        boxNumber: box.boxNumber,
      });

      if (!data) {
        return;
      }

      setGameMessage(
        `Open ${getBoxesToOpen(
          data.currentRound ?? 1
        )} boxes`
      );

      return;
    }

    if (contestantBox === box.boxNumber) {
      return;
    }

    if (offer !== null) {
      return;
    }

    if (swapMode) {
      return;
    }

    if (box.opened) {
      return;
    }

    setAudioBusy(true);
    playBoxOpen();

    const data = await updateSession({
      action: "openBox",
      boxNumber: box.boxNumber,
    });

    if (!data) {
      setAudioBusy(false);
      return;
    }

    await new Promise((resolve) =>
      setTimeout(resolve, 1400)
    );

    playReveal();

    await new Promise((resolve) =>
      setTimeout(resolve, 1800)
    );

    speak(`${box.prize.name}`);

    await new Promise((resolve) =>
      setTimeout(resolve, 2500)
    );

    const updatedBoxes =
      normalizeBoxes(data.boxes || boxes);
    const newOpened =
      data.boxesOpenedThisRound ??
      boxesOpenedThisRound + 1;

    setBoxesOpenedThisRound(newOpened);

    const required =
      getBoxesToOpen(
        data.currentRound ?? round
      );

    const remainingClosed =
      updatedBoxes.filter(
        (b) => !b.opened
      );

    if (remainingClosed.length === 2) {
      const otherBox =
        remainingClosed.find(
          (b) =>
            b.boxNumber !==
            contestantBox
        );

      if (otherBox) {
        setTimeout(() => {
          setSwapMode(true);
          setFinalBox(otherBox);
          setGameMessage(
            `FINAL DECISION — SWAP BOX ${contestantBox} FOR BOX ${otherBox.boxNumber}?`
          );
          speak(
            "Final decision. Swap or no swap?"
          );
        }, 1500);

        setAudioBusy(false);
        return;
      }
    }

    if (data.bankerOffer !== null) {
      setGameMessage(
        "The banker is thinking..."
      );

      await new Promise((resolve) =>
        setTimeout(resolve, 15000)
      );

      setGameMessage(
        "Banker is calling..."
      );

      playBankerCall();

      await new Promise((resolve) =>
        setTimeout(resolve, 6000)
      );

      setOffer(data.bankerOffer);
      speakBankerOffer(data.bankerOffer);
    } else {
      setGameMessage(
        `${required - newOpened} boxes remaining`
      );
    }

    setAudioBusy(false);
  };

  const handleDeal = async () => {
    if (offer === null) return;

    const data = await updateSession({
      action: "deal",
    });

    if (!data) {
      return;
    }

    setGameEnded(true);
    speak(
      `Deal accepted for ${offer.toLocaleString()} coins`
    );
    setGameMessage(
      `DEAL ACCEPTED — ${offer.toLocaleString()} COINS`
    );
    setOffer(null);
  };

  const handleNoDeal = async () => {
    const data = await updateSession({
      action: "noDeal",
    });

    if (!data) {
      return;
    }

    setGameMessage(
      `Open ${getBoxesToOpen(
        data.currentRound
      )} boxes`
    );
  };

  const handleSwap = async () => {
    if (!finalBox) return;

    const data = await updateSession({
      action: "swap",
      boxNumber: finalBox.boxNumber,
    });

    if (!data) {
      return;
    }

    speak("Contestant chooses to swap!");
    setSwapMode(false);
    revealFinalResult(finalBox.boxNumber);
  };

  const handleKeepBox = async () => {
    const data = await updateSession({
      action: "keep",
    });

    if (!data) {
      return;
    }

    speak("Contestant keeps their safe box!");
    setSwapMode(false);
    revealFinalResult(contestantBox!);
  };

  const renderBox = (box: any) => {
    const isOpened = box.opened;
    const isSafe = contestantBox === box.boxNumber;

    return (
      <motion.button
        key={box.boxNumber}
        whileHover={{
          scale: !isOpened ? 1.03 : 1,
        }}
        whileTap={{
          scale: !isOpened ? 0.97 : 1,
        }}
        onClick={() =>
          handleBoxClick(box)
        }
        className="relative h-[145px]"
      >
        {!isOpened && (
          <>
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-[36%] h-[10px] rounded-full border-[2px] border-yellow-100 bg-gradient-to-b from-yellow-100 to-yellow-700 z-20" />
            <div className="absolute inset-0 rounded-[14px] border-[3px] border-yellow-100 bg-gradient-to-b from-yellow-100 via-yellow-400 to-yellow-700 shadow-[0_0_18px_rgba(255,215,0,0.18)]" />
            <div className="absolute inset-[4px] rounded-[10px] border border-yellow-100/40 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.28),transparent_55%)]" />
            <div className="absolute inset-0 flex items-center justify-center z-30">
              <div className="text-4xl font-black text-black">
                {box.boxNumber}
              </div>
            </div>
          </>
        )}

        {isOpened && (
          <div className="absolute inset-0 rounded-[14px] border border-fuchsia-500/20 bg-[#080b12] flex flex-col items-center justify-center">
            <div className={`text-[18px] font-black ${rarityClass(box.prize.value)}`}>
              {box.prize.name}
            </div>
            <div className="text-[16px] text-white font-black mt-2">
              {box.prize.value.toLocaleString()}
            </div>
          </div>
        )}

        {isSafe && (
          <div className="absolute inset-0 rounded-[14px] border-[4px] border-cyan-400 shadow-[0_0_25px_rgba(0,255,255,0.3)] z-40 pointer-events-none" />
        )}
      </motion.button>
    );
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-3xl font-black">Loading...</div>
      </main>
    );
  }

  if (boxes.length === 0) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-3xl font-black text-red-400">No Active Game Session</div>
      </main>
    );
  }

  return (
    <main className="h-screen overflow-hidden bg-[#04060b] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,255,255,0.08),transparent_40%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(255,0,255,0.06),transparent_40%)]" />
      <div className="relative z-10 w-[1360px] h-screen mx-auto px-3 py-2">
        <div className="grid grid-cols-[420px_1fr_320px] gap-3 h-full">
          <div className="flex flex-col gap-3">
            <div className="rounded-[24px] border border-fuchsia-500/20 bg-[#0b0f18]/95 px-4 py-3 h-[645px]">
              <div className="text-center text-[18px] font-black leading-[20px] mb-3">
                PRIZES
                <br />
                REMAINING
              </div>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1">
                {sortedPrizes.map((prize: any) => {
                  const removed =
                    boxes.find(
                      (b) =>
                        b.prize.id ===
                          prize.id &&
                        b.opened
                    );

                  return (
                    <div
                      key={prize.id}
                      className={`text-[20px] leading-[38px] font-black ${
                        removed
                          ? "opacity-20 line-through"
                          : rarityClass(prize.value)
                      }`}
                    >
                      {prize.value <= 1000
                        ? prize.name
                        : `${prize.value.toLocaleString()} COINS`}
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="rounded-[24px] border border-fuchsia-500/20 bg-[#0b0f18]/95 p-3 flex justify-center items-center">
              <div className="relative w-[210px] h-[180px]">
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-[40%] h-[8px] rounded-full border border-yellow-100 bg-gradient-to-b from-yellow-100 to-yellow-700 z-20" />
                <div className="absolute inset-0 rounded-[12px] border-[3px] border-yellow-100 bg-gradient-to-b from-yellow-100 via-yellow-400 to-yellow-700" />
                <div className="absolute inset-0 flex flex-col items-center justify-center text-black z-30">
                  <div className="text-4xl font-black leading-none">{contestantBox || "?"}</div>
                  <div className="text-[22px] font-black">SAFE BOX</div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-3 items-center">
            <div className="w-full rounded-[28px] border border-fuchsia-500/20 bg-[#0b0f18]/95 px-4 py-3">
              <div className="grid grid-cols-6 gap-3">
                {boxes.slice(0, 18).map(renderBox)}
              </div>
              <div className="grid grid-cols-4 gap-3 w-[67%] mx-auto mt-3">
                {boxes.slice(18).map(renderBox)}
              </div>
            </div>
            <div className="grid grid-cols-[300px_300px_300px] gap-4 items-center justify-center w-full">
              <div className="rounded-[24px] border border-cyan-500/20 bg-[#0b0f18]/95 p-4 text-center h-[210px] flex flex-col justify-center">
                <div className="text-[22px] font-black">HOSTED BY</div>
                <div className="mt-3 text-[28px] leading-[24px] font-black text-cyan-300 break-words">@s1lvabu113tgaming</div>
              </div>
              <div className="rounded-[36px] border border-fuchsia-500/20 bg-[#0b0f18]/95 p-4 flex items-center justify-center h-[210px]">
                <div className="relative w-[180px] h-[180px] rounded-full border-[3px] border-cyan-400 flex items-center justify-center shadow-[0_0_25px_rgba(0,255,255,0.20)]">
                  <div className="absolute inset-[10px] rounded-full border border-fuchsia-500/40" />
                  <Mic2 size={28} className="absolute top-[18px] text-cyan-300" />
                  <div className="text-center">
                    <div className="text-[32px] font-black leading-none">HOST</div>
                    <div className="text-[46px] font-black leading-none text-fuchsia-300">IT!</div>
                  </div>
                </div>
              </div>
              <div className="rounded-[24px] border border-cyan-500/20 bg-[#0b0f18]/95 p-3 text-center h-[210px] flex flex-col items-center justify-center">
                <div className="text-[22px] font-black">WHO'S PLAYING</div>
                <div className="mt-3 w-22 h-14 rounded-full border border-cyan-400 bg-cyan-500/10 flex items-center justify-center text-3xl">👤</div>
                <div className="mt-3 text-[28px] font-black">@bigdaddytee</div>
                <div className="text-cyan-400 text-[18px] font-black">CURRENT CONTESTANT</div>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <div className="rounded-[24px] border border-cyan-500/20 bg-[#0b0f18]/95 p-3 text-center h-[300px] flex flex-col justify-center">
              <div className="text-[22px] font-black mb-1">GAME STATUS</div>
              <div className="text-cyan-400 text-[22px] font-black">ROUND</div>
              <div className="text-4xl font-black leading-none mb-2">{round}</div>
              <div className="text-cyan-400 text-[22px] font-black">BOXES OPENED</div>
              <div className="text-3xl font-black leading-none">{boxesOpenedThisRound}/{getBoxesToOpen(round)}</div>
              <div className="mt-4 text-[16px] text-fuchsia-300 font-black">{gameMessage}</div>
            </div>
            <div className="rounded-[24px] border border-yellow-500/20 bg-[#0b0f18]/95 p-4 h-[240px] flex flex-col items-center justify-center text-center shadow-[0_0_25px_rgba(255,215,0,0.08)]">
              <div className="text-[22px] font-black text-yellow-300 tracking-wide">{swapMode ? "FINAL DECISION" : "BANKER OFFER"}</div>
              <div className="mt-5 text-[62px] font-black leading-none text-white">
                {!swapMode ? (offer ? offer.toLocaleString() : "----") : "SWAP?"}
              </div>
              <div className="mt-3 text-[18px] font-black text-yellow-400">
                {swapMode ? `BOX ${contestantBox} ↔ BOX ${finalBox?.boxNumber}` : "COINS"}
              </div>
              <div className="mt-5 w-full grid grid-cols-2 gap-3">
                {!swapMode ? (
                  <>
                    <button
                      onClick={handleDeal}
                      disabled={offer === null}
                      className="rounded-xl border border-green-500/30 bg-green-500/10 py-2 disabled:opacity-30"
                    >
                      <div className="font-black text-green-300 text-[22px]">DEAL</div>
                    </button>
                    <button
                      onClick={handleNoDeal}
                      disabled={offer === null}
                      className="rounded-xl border border-red-500/30 bg-red-500/10 py-2 disabled:opacity-30"
                    >
                      <div className="font-black text-red-300 text-[22px]">NO DEAL</div>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleSwap}
                      className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 py-2"
                    >
                      <div className="font-black text-cyan-300 text-[22px]">SWAP</div>
                    </button>
                    <button
                      onClick={handleKeepBox}
                      className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 py-2"
                    >
                      <div className="font-black text-yellow-300 text-[22px]">NO SWAP</div>
                    </button>
                  </>
                )}
              </div>
            </div>
            <div className="rounded-[24px] border border-fuchsia-500/20 bg-[#0b0f18]/95 p-3 h-[300px]">
              <div className="text-center text-[18px] font-black mb-2">CHAT COMMANDS</div>
              <div className="space-y-2">
                <button className="w-full rounded-lg border border-yellow-500/30 bg-yellow-500/10 py-1 text-left px-3">
                  <div className="font-black text-yellow-300 text-[16px]">OPEN &lt;BOX #&gt;</div>
                </button>
                <button className="w-full rounded-lg border border-violet-500/30 bg-violet-500/10 py-1 text-left px-3">
                  <div className="font-black text-violet-300 text-[16px]">KEEP &lt;BOX #&gt;</div>
                </button>
                <button
                  onClick={handleResetGame}
                  className="w-full rounded-lg border border-sky-400/30 bg-sky-400/10 py-2 text-center text-sky-200 font-black"
                >
                  RESET GAME
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
