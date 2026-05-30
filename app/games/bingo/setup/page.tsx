"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PRIZE_REGISTRY } from "@/lib/giftRegistry";

export default function BingoSetupPage() {
  const router = useRouter();
  const [username, setUsername] = useState("demo");
  const [selectedLinePrizeGift, setSelectedLinePrizeGift] = useState(PRIZE_REGISTRY[0]?.id || "");
  const [selectedHousePrizeGift, setSelectedHousePrizeGift] = useState(PRIZE_REGISTRY[1]?.id || "");
  const [selectedTriggerGift, setSelectedTriggerGift] = useState(PRIZE_REGISTRY[2]?.id || "");
  const [status, setStatus] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const enabledGifts = PRIZE_REGISTRY.filter(g => g.enabled);

  async function createSession() {
    if (!selectedLinePrizeGift || !selectedHousePrizeGift || !selectedTriggerGift) {
      setStatus("Please select all prizes and trigger gift");
      return;
    }

    setCreating(true);
    setStatus(null);

    try {
      // Get gift names
      const linePrizeGift = enabledGifts.find(g => g.id === selectedLinePrizeGift);
      const housePrizeGift = enabledGifts.find(g => g.id === selectedHousePrizeGift);
      const triggerGift = enabledGifts.find(g => g.id === selectedTriggerGift);

      const res = await fetch("/api/bingo/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          streamerUsername: username,
          linePrizeGift: linePrizeGift?.name,
          housePrizeGift: housePrizeGift?.name,
          triggerGift: triggerGift?.name,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setStatus(`Error creating session: ${data.error || "Unknown error"}`);
        setCreating(false);
        return;
      }

      // Auto-start TikTok connector for the streamer so overlay events flow immediately
      try {
        await fetch("/api/connectors/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ streamerUsername: username, sessionCode: data.gameId }),
        });
      } catch (err) {
        console.error("Failed to auto-start connector", err);
      }

      // Open overlay in a new tab and copy URL to clipboard for easy OBS setup
      try {
        const overlayUrl = `${window.location.origin}/overlay/bingo/${username}`;
        window.open(overlayUrl, "_blank");
        await navigator.clipboard.writeText(overlayUrl);
        setStatus("Created. Overlay URL opened and copied to clipboard.");
      } catch (err) {
        console.warn("Could not open or copy overlay URL", err);
      }

      router.push(`/games/bingo/session/${data.gameId}`);
    } catch (error) {
      console.error(error);
      setStatus("Unable to create bingo session.");
      setCreating(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white p-4 sm:p-6">
      <div className="mx-auto max-w-5xl space-y-6">
        <section className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-8 shadow-2xl backdrop-blur-xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-5xl font-black tracking-tight">Bingo Setup</h1>
              <p className="mt-3 text-slate-400 max-w-3xl">
                Launch an 8-player gift-trigger bingo session. Configure your prizes, set a trigger gift, and viewers can lock in cards. Streamer can start anytime with 2+ contestants!
              </p>
            </div>
            <div className="rounded-3xl border border-cyan-500/20 bg-black/30 p-4 text-center">
              <p className="text-sm uppercase tracking-[0.2em] text-cyan-300">Ready for broadcast</p>
              <p className="mt-2 text-2xl font-black text-white">Bingo</p>
            </div>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <label className="space-y-2 text-sm text-slate-300">
              Streamer username
              <input
                value={username}
                onChange={(event) => setUsername(event.target.value.trim())}
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-500"
              />
            </label>

            <label className="space-y-2 text-sm text-slate-300">
              Trigger Gift (contestants lock in with this)
              <select
                value={selectedTriggerGift}
                onChange={(event) => setSelectedTriggerGift(event.target.value)}
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-500"
              >
                <option value="">Select trigger gift...</option>
                {enabledGifts.map((gift) => (
                  <option key={gift.id} value={gift.id}>
                    {gift.name} ({gift.value} pts)
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2 text-sm text-slate-300">
              Line Winner Prize
              <select
                value={selectedLinePrizeGift}
                onChange={(event) => setSelectedLinePrizeGift(event.target.value)}
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-500"
              >
                <option value="">Select line prize...</option>
                {enabledGifts.map((gift) => (
                  <option key={gift.id} value={gift.id}>
                    {gift.name} ({gift.value} pts)
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2 text-sm text-slate-300">
              Full House Winner Prize
              <select
                value={selectedHousePrizeGift}
                onChange={(event) => setSelectedHousePrizeGift(event.target.value)}
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-500"
              >
                <option value="">Select house prize...</option>
                {enabledGifts.map((gift) => (
                  <option key={gift.id} value={gift.id}>
                    {gift.name} ({gift.value} pts)
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-8 rounded-3xl border border-slate-700 bg-black/40 p-6">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="mt-1 rounded-full bg-cyan-500/20 px-2 py-1 text-xs text-cyan-300">1</div>
                <div>
                  <p className="font-semibold text-white">Viewers send trigger gift to lock in</p>
                  <p className="text-sm text-slate-400 mt-1">Max 8 contestants, game starts when 2+ join or streamer clicks "Eyes Down"</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 rounded-full bg-cyan-500/20 px-2 py-1 text-xs text-cyan-300">2</div>
                <div>
                  <p className="font-semibold text-white">Streamer calls numbers during the game</p>
                  <p className="text-sm text-slate-400 mt-1">Each called number is drawn every ~4.5 seconds</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 rounded-full bg-cyan-500/20 px-2 py-1 text-xs text-cyan-300">3</div>
                <div>
                  <p className="font-semibold text-white">Line winner appears for 20 seconds with prize</p>
                  <p className="text-sm text-slate-400 mt-1">Game continues until full house is completed</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 rounded-full bg-cyan-500/20 px-2 py-1 text-xs text-cyan-300">4</div>
                <div>
                  <p className="font-semibold text-white">House winner appears for 20 seconds with prize</p>
                  <p className="text-sm text-slate-400 mt-1">Streamer can restart to begin new round</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-slate-400">Configure all fields above, then create the session.</p>
            </div>
            <button
              type="button"
              onClick={createSession}
              disabled={creating || !selectedLinePrizeGift || !selectedHousePrizeGift || !selectedTriggerGift}
              className="inline-flex items-center justify-center rounded-2xl bg-cyan-500 px-6 py-4 text-sm font-semibold text-slate-950 hover:bg-cyan-400 transition disabled:cursor-not-allowed disabled:opacity-50"
            >
              {creating ? "Creating…" : "Create Bingo Session"}
            </button>
          </div>

          {status && <p className="mt-4 text-sm text-rose-400">{status}</p>}
        </section>
      </div>
    </main>
  );
}
