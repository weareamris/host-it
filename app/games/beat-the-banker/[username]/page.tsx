"use client";

import {
  use,
  useEffect,
  useMemo,
  useState,
} from "react";

import { motion } from "framer-motion";

export default function Page(
  {
    params,
  }: any
) {

  const resolvedParams =
    use(params);

  const username =
    resolvedParams.username;

  /* =========================================
     STATE
  ========================================= */

  const [boxes, setBoxes] =
    useState<any[]>([]);

  const [
    contestantBox,
    setContestantBox,
  ] = useState<number | null>(
    null
  );

  const [
    gameStarted,
    setGameStarted,
  ] = useState(false);

  const [
    round,
    setRound,
  ] = useState(1);

  const [
    boxesOpenedThisRound,
    setBoxesOpenedThisRound,
  ] = useState(0);

  const [
    bankerPhase,
    setBankerPhase,
  ] = useState(false);

  const [
    gameMessage,
    setGameMessage,
  ] = useState(
    "Choose your safe box"
  );

  const [
    loading,
    setLoading,
  ] = useState(true);

  /* =========================================
     LOAD SESSION
  ========================================= */

  useEffect(() => {

    const loadSession =
      async () => {

        try {

          const response =
            await fetch(
              "/api/games/beat-the-banker/session/" +
              username
            );

          const data =
            await response.json();

          console.log(
            "[SESSION]",
            data
          );

          if (
            !data ||
            !Array.isArray(
              data.boxes
            )
          ) {

            console.error(
              "Invalid session"
            );

            setLoading(
              false
            );

            return;
          }

          const safeBoxes =
            data.boxes.filter(
              (box: any) =>

                box &&
                box.prize &&
                typeof box.prize.value ===
                  "number"
            );

          setBoxes(
            safeBoxes
          );

        } catch (error) {

          console.error(
            "Session load failed",
            error
          );

        } finally {

          setLoading(
            false
          );
        }
      };

    loadSession();

  }, [username]);

  /* =========================================
     SORTED PRIZES
  ========================================= */

  const sortedPrizes =
    useMemo(() => {

      const unique =
        new Map();

      boxes.forEach(
        (b) => {

          if (
            !b?.prize
          ) {
            return;
          }

          if (
            !unique.has(
              b.prize.id
            )
          ) {

            unique.set(
              b.prize.id,
              b.prize
            );
          }
        }
      );

      return Array.from(
        unique.values()
      ).sort(
        (
          a: any,
          b: any
        ) =>
          a.value -
          b.value
      );

    }, [boxes]);

  /* =========================================
     RARITY COLORS
  ========================================= */

  const rarityClass =
    (
      value: number
    ) => {

      if (value <= 100)
        return "text-green-400";

      if (value <= 1000)
        return "text-cyan-400";

      if (value <= 10000)
        return "text-violet-400";

      if (value <= 30000)
        return "text-red-400";

      return "text-yellow-300";
    };

  /* =========================================
     BOX CLICK
  ========================================= */

  const handleBoxClick =
    (
      clickedBox: any
    ) => {

      // PICK SAFE BOX FIRST

      if (
        !gameStarted
      ) {

        setContestantBox(
          clickedBox.boxNumber
        );

        setGameStarted(
          true
        );

        setGameMessage(
          "Open 6 boxes"
        );

        return;
      }

      // BANKER PHASE LOCK

      if (
        bankerPhase
      ) {
        return;
      }

      // DON'T OPEN SAFE BOX

      if (
        contestantBox ===
        clickedBox.boxNumber
      ) {
        return;
      }

      // DON'T REOPEN

      if (
        clickedBox.opened
      ) {
        return;
      }

      // OPEN BOX

      const updatedBoxes =
        boxes.map(
          (box) => {

            if (
              box.boxNumber ===
              clickedBox.boxNumber
            ) {

              return {
                ...box,
                opened: true,
              };
            }

            return box;
          }
        );

      setBoxes(
        updatedBoxes
      );

      // TRACK ROUND PROGRESS

      const newOpened =
        boxesOpenedThisRound + 1;

      setBoxesOpenedThisRound(
        newOpened
      );

      // ROUND RULES

      const roundRequirements: any = {
        1: 6,
        2: 5,
        3: 4,
        4: 3,
        5: 2,
        6: 1,
      };

      const required =
        roundRequirements[
          round
        ] || 1;

      // BANKER PHASE

      if (
        newOpened >=
        required
      ) {

        setBankerPhase(
          true
        );

        setGameMessage(
          "BANKER CALL..."
        );

      } else {

        setGameMessage(
          `${required - newOpened} boxes remaining`
        );
      }
    };

  /* =========================================
     RENDER BOX
  ========================================= */

  const renderBox =
    (
      box: any
    ) => {

      return (
        <motion.button
          key={
            box.boxNumber
          }
          whileHover={{
            scale: 1.03,
          }}
          whileTap={{
            scale: 0.96,
          }}
          onClick={() =>
            handleBoxClick(
              box
            )
          }
          className="relative h-[140px]"
        >

          {!box.opened && (
            <div
              className={`absolute inset-0 rounded-[18px] border-[3px]
              ${
                contestantBox ===
                box.boxNumber
                  ? "border-cyan-400"
                  : "border-yellow-200"
              }
              bg-gradient-to-b from-yellow-100 via-yellow-400 to-yellow-700
              flex items-center justify-center shadow-xl`}
            >

              <div className="text-5xl font-black text-black">
                {
                  box.boxNumber
                }
              </div>

            </div>
          )}

          {box.opened && (
            <div
              className="absolute inset-0 rounded-[18px]
              border border-fuchsia-500/20
              bg-[#080b12]
              flex flex-col items-center justify-center"
            >

              <div
                className={`text-[18px] font-black ${rarityClass(
                  box.prize.value
                )}`}
              >

                {
                  box.prize.name
                }

              </div>

              <div className="text-white font-black text-xl mt-2">

                {
                  box.prize.value.toLocaleString()
                }

              </div>

            </div>
          )}

        </motion.button>
      );
    };

  /* =========================================
     LOADING
  ========================================= */

  if (loading) {

    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">

        <div className="text-3xl font-black">
          Loading...
        </div>

      </main>
    );
  }

  /* =========================================
     NO SESSION
  ========================================= */

  if (
    boxes.length === 0
  ) {

    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">

        <div className="text-3xl font-black text-red-400">
          No Active Game Session
        </div>

      </main>
    );
  }

  /* =========================================
     PAGE
  ========================================= */

  return (
    <main className="min-h-screen bg-[#04060b] text-white p-6">

      <div className="max-w-[1500px] mx-auto">

        <div className="grid grid-cols-[350px_260px_1fr] gap-6">

          {/* LEFT PANEL */}

          <div className="rounded-[28px] border border-fuchsia-500/20 bg-[#0b0f18] p-5">

            <div className="text-3xl font-black mb-6">
              PRIZES
            </div>

            <div className="space-y-2">

              {sortedPrizes.map(
                (
                  prize: any
                ) => (

                  <div
                    key={
                      prize.id
                    }
                    className={`text-[22px] font-black ${rarityClass(
                      prize.value
                    )}`}
                  >

                    {
                      prize.name
                    }

                    {" — "}

                    {
                      prize.value.toLocaleString()
                    }

                  </div>
                )
              )}

            </div>

          </div>

          {/* STATUS */}
          {/* STATUS */}

          <div className="rounded-[28px] border border-cyan-500/20 bg-[#0b0f18] p-5">

            <div className="text-3xl font-black mb-4">
              GAME STATUS
            </div>

            <div className="space-y-4">

              <div>

                <div className="text-cyan-400 font-black">
                  ROUND
                </div>

                <div className="text-4xl font-black">
                  {round}
                </div>

              </div>

              <div>

                <div className="text-cyan-400 font-black">
                  OPENED
                </div>

                <div className="text-4xl font-black">
                  {boxesOpenedThisRound}
                </div>

              </div>

              <div className="pt-3 text-fuchsia-300 font-black text-xl">
                {gameMessage}
              </div>

            </div>

          </div>

          
          {/* BOARD */}

          <div className="rounded-[28px] border border-cyan-500/20 bg-[#0b0f18] p-5">

            <div className="grid grid-cols-6 gap-4">

              {boxes.map(
                renderBox
              )}

            </div>

          </div>

        </div>

      </div>

    </main>
  );
}