"use client";

import { use, useEffect, useMemo, useRef, useState } from "react";

type ControlRow = {
  id: number;
  session_id: string;
  username: string;
  queue_position: number;
  player_box: string | null;
  boxes_opened_this_round: number;
  current_round: number;
  deal_taken: boolean;
  game_state: string;
};

type BoxStateRow = {
  id: number;
  session_id: string;
  opened_box: string;
  opened_by: string;
  reward: string;
};

type RewardRow = {
  id: number;
  session_id: string;
  box_name: string;
  reward: string;
};

type CommandRow = {
  id: number;
  session_id: string;
  username: string;
  command_text: string;
  processed: boolean;
};

type StreamerSettings = {
  trigger_gift: string;
  jackpot_gift: string;
  box_count: number;
  banker_enabled: boolean;
};

type TikTokGift = {
  id: number;
  gift_name: string;
  gift_value: number;
  rarity: string;
  active: boolean;
  weight: number;
};

const ROUND_TARGETS = [5, 4, 3, 2, 1, 1];

export default function BeatTheBankerSessionPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = use(params);

  const [controller, setController] =
    useState<ControlRow | null>(null);

  const [queue, setQueue] =
    useState<ControlRow[]>([]);

  const [openedBoxes, setOpenedBoxes] =
    useState<BoxStateRow[]>([]);

  const [hiddenRewards, setHiddenRewards] =
    useState<RewardRow[]>([]);

  const [boxes, setBoxes] =
    useState<string[]>([]);

  const [message, setMessage] =
    useState("WAITING FOR PLAYER");

  const [openingBox, setOpeningBox] =
    useState<string | null>(null);

  const [revealedReward, setRevealedReward] =
    useState<string | null>(null);

  const [isRevealing, setIsRevealing] =
    useState(false);

  const [showBanker, setShowBanker] =
    useState(false);

  const [bankerCalling, setBankerCalling] =
    useState(false);

  const [finalReveal, setFinalReveal] =
    useState(false);

  const [finalReward, setFinalReward] =
    useState("");

  const [settings, setSettings] =
    useState<StreamerSettings | null>(null);

  const [giftCatalog, setGiftCatalog] =
    useState<TikTokGift[]>([]);

  const [jackpotExplosion, setJackpotExplosion] =
    useState(false);

  const bankerAudio =
    useRef<HTMLAudioElement | null>(null);

  const openAudio =
    useRef<HTMLAudioElement | null>(null);

  const jackpotAudio =
    useRef<HTMLAudioElement | null>(null);

  const dealAudio =
    useRef<HTMLAudioElement | null>(null);

  const noDealAudio =
    useRef<HTMLAudioElement | null>(null);

  const SUPABASE_URL =
    process.env.NEXT_PUBLIC_SUPABASE_URL;

  const SUPABASE_KEY =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  async function loadStreamerSettings() {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/streamer_game_settings?session_id=eq.${sessionId}&limit=1`,
      {
        headers: {
          apikey: SUPABASE_KEY as string,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
      }
    );

    const data = await res.json();

    if (data?.length) {
      setSettings(data[0]);
    }
  }

  async function loadGiftCatalog() {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/tiktok_gifts?active=eq.true&order=gift_value.asc`,
      {
        headers: {
          apikey: SUPABASE_KEY as string,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
      }
    );

    setGiftCatalog(await res.json());
  }

  async function loadGameConfig() {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/game_config?session_id=eq.${sessionId}`,
      {
        headers: {
          apikey: SUPABASE_KEY as string,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
      }
    );

    const data = await res.json();

    if (!data?.length) return;

    const generated: string[] = [];

    for (
      let i = 1;
      i <= data[0].box_count;
      i++
    ) {
      generated.push(`box ${i}`);
    }

    setBoxes(generated);
  }

  async function loadController() {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/game_control?session_id=eq.${sessionId}&order=queue_position.asc`,
      {
        headers: {
          apikey: SUPABASE_KEY as string,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
      }
    );

    const data = await res.json();

    setController(data?.[0] || null);
    setQueue(data || []);
  }

  async function loadBoxes() {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/mystery_box_state?session_id=eq.${sessionId}`,
      {
        headers: {
          apikey: SUPABASE_KEY as string,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
      }
    );

    setOpenedBoxes(await res.json());
  }

  async function loadRewards() {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/mystery_box_rewards?session_id=eq.${sessionId}`,
      {
        headers: {
          apikey: SUPABASE_KEY as string,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
      }
    );

    setHiddenRewards(await res.json());
  }

  async function markCommandProcessed(
    id: number
  ) {
    await fetch(
      `${SUPABASE_URL}/rest/v1/game_commands?id=eq.${id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          apikey: SUPABASE_KEY as string,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
        body: JSON.stringify({
          processed: true,
        }),
      }
    );
  }

  function currentRoundTarget() {
    if (!controller) return 5;

    return (
      ROUND_TARGETS[
        controller.current_round - 1
      ] || 1
    );
  }

  const remainingRewards = useMemo(() => {
    return hiddenRewards.filter((reward) => {
      if (
        reward.box_name ===
        controller?.player_box
      ) {
        return false;
      }

      return !openedBoxes.find(
        (o) =>
          o.opened_box === reward.box_name
      );
    });
  }, [hiddenRewards, openedBoxes, controller]);

  function calculateBankerOffer() {
    const values = remainingRewards
      .map((r) =>
        Number(r.reward.replace(/[^\d]/g, ""))
      )
      .filter((v) => !isNaN(v));

    const total =
      values.reduce((sum, val) => sum + val, 0);

    const remaining = remainingRewards.length;

    let multiplier = 0.2;

    if (remaining <= 15) multiplier = 0.35;
    if (remaining <= 9) multiplier = 0.55;
    if (remaining <= 5) multiplier = 0.75;
    if (remaining <= 2) multiplier = 0.9;

    return Math.round(total * multiplier);
  }

  function isLegendary(reward: string) {
    const found = giftCatalog.find(
      (g) => g.gift_name === reward
    );

    return found?.rarity === "legendary";
  }

  async function chooseSafeBox(box: string) {
    if (!controller) return;

    await fetch(
      `${SUPABASE_URL}/rest/v1/game_control?id=eq.${controller.id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          apikey: SUPABASE_KEY as string,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
        body: JSON.stringify({
          player_box: box,
          game_state: "opening_boxes",
        }),
      }
    );

    setMessage(`${controller.username} secured ${box}`);

    await loadController();
  }

  async function nextRound() {
    if (!controller) return;

    await fetch(
      `${SUPABASE_URL}/rest/v1/game_control?id=eq.${controller.id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          apikey: SUPABASE_KEY as string,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
        body: JSON.stringify({
          current_round:
            controller.current_round + 1,
          boxes_opened_this_round: 0,
          game_state: "opening_boxes",
        }),
      }
    );

    setShowBanker(false);

    await loadController();
  }

  async function startNextPlayer() {
    if (!controller) return;

    await fetch(
      `${SUPABASE_URL}/rest/v1/game_control?id=eq.${controller.id}`,
      {
        method: "DELETE",
        headers: {
          apikey: SUPABASE_KEY as string,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
      }
    );

    await fetch(
      `${SUPABASE_URL}/rest/v1/mystery_box_state?session_id=eq.${sessionId}`,
      {
        method: "DELETE",
        headers: {
          apikey: SUPABASE_KEY as string,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
      }
    );

    setMessage("NEXT PLAYER");

    await loadBoxes();
    await loadController();
  }

  async function takeDeal() {
    dealAudio.current?.play();

    setMessage("DEAL ACCEPTED");

    setTimeout(async () => {
      await startNextPlayer();
    }, 3000);
  }

  async function noDeal() {
    noDealAudio.current?.play();

    setMessage("NO DEAL");

    setShowBanker(false);

    await nextRound();
  }

  async function revealFinalBox() {
    if (!controller) return;

    const safeReward =
      hiddenRewards.find(
        (r) =>
          r.box_name === controller.player_box
      );

    if (!safeReward) return;

    setFinalReward(safeReward.reward);

    setFinalReveal(true);

    setTimeout(async () => {
      await startNextPlayer();
    }, 7000);
  }

  async function openBox(
    command: CommandRow,
    box: string
  ) {
    if (!controller) return;

    const hiddenReward =
      hiddenRewards.find(
        (r) => r.box_name === box
      );

    if (!hiddenReward) return;

    openAudio.current?.play();

    setOpeningBox(box);

    setTimeout(async () => {
      setRevealedReward(hiddenReward.reward);

      setIsRevealing(true);

      if (isLegendary(hiddenReward.reward)) {
        jackpotAudio.current?.play();

        setJackpotExplosion(true);

        setTimeout(() => {
          setJackpotExplosion(false);
        }, 4500);
      }

      await fetch(
        `${SUPABASE_URL}/rest/v1/mystery_box_state`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: SUPABASE_KEY as string,
            Authorization: `Bearer ${SUPABASE_KEY}`,
          },
          body: JSON.stringify({
            session_id: sessionId,
            opened_box: box,
            opened_by: command.username,
            reward: hiddenReward.reward,
          }),
        }
      );

      const openedCount =
        controller.boxes_opened_this_round + 1;

      await fetch(
        `${SUPABASE_URL}/rest/v1/game_control?id=eq.${controller.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            apikey: SUPABASE_KEY as string,
            Authorization: `Bearer ${SUPABASE_KEY}`,
          },
          body: JSON.stringify({
            boxes_opened_this_round: openedCount,
          }),
        }
      );

      await markCommandProcessed(command.id);

      await loadBoxes();
      await loadController();

      if (
        openedCount >= currentRoundTarget()
      ) {
        if (settings?.banker_enabled !== false) {
          setBankerCalling(true);

          bankerAudio.current?.play();

          setTimeout(() => {
            setBankerCalling(false);
            setShowBanker(true);
          }, 3500);
        }
      }

      setTimeout(() => {
        setOpeningBox(null);
        setIsRevealing(false);
      }, 2200);
    }, 700);
  }

  async function executeCommand(command: CommandRow) {
    if (command.processed) return;

    if (!controller) return;

    if (
      command.username !== controller.username
    ) {
      return;
    }

    const text =
      command.command_text.toLowerCase();

    if (
      controller.game_state ===
      "selecting_safe"
    ) {
      if (text.startsWith("safe ")) {
        const chosen =
          text.replace("safe ", "box ");

        await chooseSafeBox(chosen);

        await markCommandProcessed(command.id);

        return;
      }
    }

    if (
      controller.game_state ===
      "opening_boxes"
    ) {
      if (text.startsWith("open ")) {
        const selected =
          text.replace("open ", "box ");

        await openBox(command, selected);

        return;
      }
    }

    if (showBanker) {
      if (text === "deal") {
        await takeDeal();

        await markCommandProcessed(command.id);

        return;
      }

      if (text === "no deal") {
        if (
          boxes.length - openedBoxes.length <= 2
        ) {
          await revealFinalBox();
        } else {
          await noDeal();
        }

        await markCommandProcessed(command.id);

        return;
      }
    }
  }

  async function resetGame() {
    await fetch(
      `${SUPABASE_URL}/rest/v1/game_control?session_id=eq.${sessionId}`,
      {
        method: "DELETE",
        headers: {
          apikey: SUPABASE_KEY as string,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
      }
    );

    await fetch(
      `${SUPABASE_URL}/rest/v1/mystery_box_state?session_id=eq.${sessionId}`,
      {
        method: "DELETE",
        headers: {
          apikey: SUPABASE_KEY as string,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
      }
    );

    setMessage("RESET");
  }

  useEffect(() => {
    bankerAudio.current =
      new Audio("/sounds/banker-phone.mp3");

    openAudio.current =
      new Audio("/sounds/box-open.mp3");

    jackpotAudio.current =
      new Audio("/sounds/jackpot.mp3");

    dealAudio.current =
      new Audio("/sounds/deal.mp3");

    noDealAudio.current =
      new Audio("/sounds/no-deal.mp3");
  }, []);

  useEffect(() => {
    loadStreamerSettings();
    loadGiftCatalog();
    loadGameConfig();
    loadController();
    loadBoxes();
    loadRewards();

    const interval = setInterval(async () => {
      await loadController();
      await loadBoxes();

      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/game_commands?session_id=eq.${sessionId}&processed=eq.false&order=id.asc`,
        {
          headers: {
            apikey: SUPABASE_KEY as string,
            Authorization: `Bearer ${SUPABASE_KEY}`,
          },
        }
      );

      const commands =
        (await res.json()) as CommandRow[];

      for (const command of commands) {
        await executeCommand(command);
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [controller, openedBoxes, showBanker]);

  const visibleBoxes = boxes.filter(
    (box) => box !== controller?.player_box
  );

  const leftRewards = remainingRewards.filter(
    (_, index) => index % 2 === 0
  );

  const rightRewards = remainingRewards.filter(
    (_, index) => index % 2 !== 0
  );

  function rarityClass(reward: string) {
    const found = giftCatalog.find(
      (g) => g.gift_name === reward
    );

    if (!found)
      return "border-yellow-700 text-yellow-300";

    if (found.rarity === "legendary") {
      return "border-red-500 text-red-400 bg-red-950/30";
    }

    if (found.rarity === "epic") {
      return "border-purple-500 text-purple-300 bg-purple-950/20";
    }

    if (found.rarity === "rare") {
      return "border-cyan-500 text-cyan-300 bg-cyan-950/20";
    }

    return "border-yellow-700 text-yellow-300";
  }

  return (
    <main className="min-h-screen bg-black text-white overflow-hidden p-3 relative">

      {jackpotExplosion && (
        <div className="fixed inset-0 z-[70] pointer-events-none">

          <div className="absolute inset-0 bg-yellow-400/20 animate-pulse" />

          <div className="absolute inset-0 flex items-center justify-center">

            <div className="w-[500px] h-[500px] rounded-full bg-yellow-300/20 blur-3xl animate-ping" />

          </div>

          <div className="absolute top-0 left-0 w-full h-full overflow-hidden">

            {[...Array(40)].map((_, i) => (
              <div
                key={i}
                className="absolute bg-yellow-300 rounded-full animate-bounce"
                style={{
                  width: `${Math.random() * 14 + 6}px`,
                  height: `${Math.random() * 14 + 6}px`,
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDuration: `${
                    Math.random() * 2 + 1
                  }s`,
                }}
              />
            ))}
          </div>
        </div>
      )}

      {bankerCalling && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">

          <div className="text-center animate-pulse">

            <div className="text-8xl mb-8 animate-bounce">
              ☎️
            </div>

            <h1 className="text-6xl font-black text-yellow-400 tracking-widest">
              BANKER CALLING
            </h1>

          </div>
        </div>
      )}

      {finalReveal && (
        <div className="fixed inset-0 bg-black z-[60] flex flex-col items-center justify-center">

          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-black animate-pulse" />

          <h1 className="text-7xl font-black text-yellow-400 mb-10 animate-pulse">
            FINAL BOX
          </h1>

          <div className="border-[10px] border-yellow-500 bg-yellow-400 rounded-[40px] px-24 py-16 shadow-[0_0_80px_gold] animate-bounce">

            <h2 className="text-8xl font-black text-black">
              {finalReward}
            </h2>

          </div>
        </div>
      )}

      {isRevealing && revealedReward && (
        <div className="fixed inset-0 bg-black/90 z-40 flex items-center justify-center">

          <div className="border-4 border-yellow-500 bg-yellow-400 rounded-3xl px-24 py-14 animate-pulse shadow-[0_0_60px_gold]">

            <h1 className="text-7xl font-black text-black">
              {revealedReward}
            </h1>

          </div>
        </div>
      )}

      {showBanker && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">

          <div className="bg-zinc-900 border-4 border-yellow-500 rounded-[40px] p-10 w-[620px] text-center shadow-[0_0_60px_gold] animate-pulse">

            <h2 className="text-6xl font-black text-yellow-400 mb-6">
              BANKER OFFER
            </h2>

            <div className="text-7xl font-black text-green-400 mb-8">
              {calculateBankerOffer()}
            </div>

            <div className="flex justify-center gap-10 text-3xl font-black">

              <div className="text-green-400 animate-pulse">
                DEAL
              </div>

              <div className="text-red-400 animate-pulse">
                NO DEAL
              </div>

            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-2">

        <div>
          <h1 className="text-4xl font-black text-yellow-400 tracking-widest">
            BEAT THE BANKER
          </h1>

          <p className="text-xs text-gray-400">
            {message}
          </p>
        </div>

        <button
          onClick={resetGame}
          className="border border-red-500 text-red-400 px-3 py-1 text-xs hover:bg-red-500 hover:text-black transition-all"
        >
          RESET
        </button>
      </div>

      <div className="flex gap-3">

        <div className="w-[720px]">

          <div className="grid grid-cols-4 gap-2 mb-3">

            <InfoCard
              title="PLAYER SAFE"
              value={
                controller?.player_box || "CHOOSE"
              }
              color="cyan"
            />

            <InfoCard
              title="BANKER"
              value={String(
                calculateBankerOffer()
              )}
              color="yellow"
            />

            <InfoCard
              title="ROUND"
              value={String(
                controller?.current_round || 1
              )}
              color="purple"
            />

            <InfoCard
              title="TO OPEN"
              value={String(
                currentRoundTarget() -
                  (controller?.boxes_opened_this_round ||
                    0)
              )}
              color="green"
            />
          </div>

          <div className="grid grid-cols-6 gap-2">

            {visibleBoxes.map((box) => (
              <Box
                key={box}
                box={box}
                openedBoxes={openedBoxes}
                openingBox={openingBox}
              />
            ))}
          </div>

          <div className="mt-3 border border-zinc-700 bg-zinc-900 rounded-xl p-2">

            <p className="text-xs text-yellow-400 font-bold mb-2">
              NEXT PLAYERS
            </p>

            <div className="flex flex-wrap gap-2">

              {queue.map((q) => (
                <div
                  key={q.id}
                  className="border border-zinc-600 rounded px-2 py-1 text-[10px]"
                >
                  #{q.queue_position} @{q.username}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 border-4 border-yellow-500 bg-zinc-900 rounded-3xl p-4 h-fit">

          <h2 className="text-center text-yellow-400 font-black text-lg mb-3">
            REMAINING GIFTS
          </h2>

          <div className="grid grid-cols-2 gap-x-4">

            <div className="space-y-1">

              {leftRewards.map((reward) => (
                <div
                  key={reward.id}
                  className={`border rounded px-3 py-[2px] text-center text-xs font-bold ${rarityClass(
                    reward.reward
                  )}`}
                >
                  {reward.reward}
                </div>
              ))}
            </div>

            <div className="space-y-1">

              {rightRewards.map((reward) => (
                <div
                  key={reward.id}
                  className={`border rounded px-3 py-[2px] text-center text-xs font-bold ${rarityClass(
                    reward.reward
                  )}`}
                >
                  {reward.reward}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function InfoCard({
  title,
  value,
  color,
}: {
  title: string;
  value: string;
  color: string;
}) {
  return (
    <div
      className={`border border-${color}-500 bg-zinc-900 rounded-xl p-2 text-center`}
    >
      <p className={`text-[9px] text-${color}-300`}>
        {title}
      </p>

      <p
        className={`text-xl font-black text-${color}-400`}
      >
        {value}
      </p>
    </div>
  );
}

function Box({
  box,
  openedBoxes,
  openingBox,
}: {
  box: string;
  openedBoxes: BoxStateRow[];
  openingBox: string | null;
}) {
  const opened = openedBoxes.find(
    (b) => b.opened_box === box
  );

  const isOpening = openingBox === box;

  return (
    <div
      className={`h-16 rounded-xl border-2 flex items-center justify-center text-[11px] font-bold transition-all duration-700 shadow-lg ${
        opened
          ? "bg-green-700 border-green-400"
          : "bg-yellow-500 border-yellow-300 text-black"
      } ${
        isOpening
          ? "scale-110 animate-pulse ring-4 ring-yellow-300 rotate-2"
          : "hover:scale-105"
      }`}
    >
      {opened
        ? "OPENED"
        : isOpening
        ? "OPENING..."
        : box.toUpperCase()}
    </div>
  );
}