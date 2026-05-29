"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function BingoSetupPage() {
  const router = useRouter();
  const [username, setUsername] = useState("demo");
  const [linePrize, setLinePrize] = useState("£250 line prize");
  const [housePrize, setHousePrize] = useState("£1,000 full house prize");
  const [status, setStatus] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  async function createSession() {
    setCreating(true);
    setStatus(null);

    try {
      const res = await fetch("/api/bingo/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          streamerUsername: username,
          linePrize,
          housePrize,
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
                Launch an 8-player gift-trigger bingo session. Viewers gift to lock in a randomized card, and the game begins when 8 players are locked or you press Eyes Down.
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
              Line prize text
              <input
                value={linePrize}
                onChange={(event) => setLinePrize(event.target.value)}
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-500"
              />
            </label>

            <label className="space-y-2 text-sm text-slate-300 lg:col-span-2">
              Full house prize text
              <input
                value={housePrize}
                onChange={(event) => setHousePrize(event.target.value)}
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-500"
              />
            </label>
          </div>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-slate-400">After the session is created, viewers gift to lock in a card and the streamer can start the caller anytime.</p>
            </div>
            <button
              type="button"
              onClick={createSession}
              disabled={creating}
              className="inline-flex items-center justify-center rounded-2xl bg-cyan-500 px-6 py-4 text-sm font-semibold text-slate-950 hover:bg-cyan-400 transition disabled:cursor-not-allowed disabled:opacity-60"
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
