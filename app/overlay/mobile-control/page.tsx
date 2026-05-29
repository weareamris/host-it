"use client";

import { useState } from "react";

const EVENT_TYPES = [
  { value: "gift", label: "Gift Alert" },
  { value: "like", label: "Like Burst" },
  { value: "follow", label: "Follow Alert" },
  { value: "banker-offer", label: "Banker Offer" },
  { value: "tts", label: "TTS Announcement" },
];

const GAME_COMMANDS = [
  { value: "start-game", label: "Start Game" },
  { value: "reveal-offer", label: "Reveal Offer" },
  { value: "next-round", label: "Next Round" },
  { value: "end-game", label: "End Game" },
];

export default function MobileControlPage() {
  const [username, setUsername] = useState("demo");
  const [eventType, setEventType] = useState("gift");
  const [gift, setGift] = useState("Golden Idol");
  const [message, setMessage] = useState("Viewer hype incoming!");
  const [amount, setAmount] = useState(10);
  const [response, setResponse] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState("demo-session");
  const [controlResponse, setControlResponse] = useState<string | null>(null);

  const overlayUrl = `/overlay/mobile-view/${username}`;

  async function sendOverlayEvent() {
    setResponse("Sending...");

    const payload = {
      username,
      eventType,
      data: {
        gift,
        message,
        amount,
      },
    };

    const result = await fetch("/api/events/trigger", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const json = await result.json();

    if (!result.ok) {
      setResponse(`Error: ${json.error || "Unable to send event"}`);
      return;
    }

    setResponse(`Event sent: ${json.eventType} to @${json.username}`);
  }

  async function sendGameCommand(command: string) {
    setControlResponse("Sending...");

    const result = await fetch("/api/game/control", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        command,
        gameId: sessionId,
      }),
    });

    const json = await result.json();

    if (!result.ok) {
      setControlResponse(`Error: ${json.error || "Unable to control game"}`);
      return;
    }

    setControlResponse(`Game command sent: ${json.command}`);
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white p-4 sm:p-6">
      <div className="mx-auto flex max-w-6xl flex-col gap-6">
        <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-xl">
          <h1 className="text-4xl font-black tracking-tight text-cyan-300">
            Mobile Overlay Control
          </h1>
          <p className="mt-3 text-slate-400 max-w-3xl">
            Control your OBS/mobile overlay experience from the phone. Trigger alerts, send viewer hype, and manage Beat The Banker game commands from any device.
          </p>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6 rounded-[2rem] border border-cyan-500/10 bg-slate-900/80 p-6 shadow-2xl">
            <div>
              <h2 className="text-2xl font-black text-white">Overlay Target</h2>
              <p className="mt-2 text-slate-400">Enter the streamer overlay username used by your OBS browser source.</p>
            </div>

            <label className="space-y-2 text-sm text-slate-300">
              Overlay Username
              <input
                value={username}
                onChange={(event) => setUsername(event.target.value.trim())}
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-500"
              />
            </label>

            <div className="space-y-4 rounded-3xl border border-white/10 bg-black/20 p-4">
              <p className="text-sm uppercase tracking-[0.2em] text-cyan-300 font-semibold">Quick Overlay Links</p>
              <div className="space-y-3">
                <a
                  href={overlayUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="block rounded-2xl bg-cyan-500 px-4 py-3 text-center text-sm font-semibold text-slate-950 hover:bg-cyan-400 transition"
                >
                  Open Mobile Overlay Preview
                </a>
                <a
                  href={`/overlay/mobile-control/qr?username=${username}`}
                  className="block rounded-2xl border border-violet-500 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-violet-500/20 transition"
                >
                  Open QR Code Route
                </a>
                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(window.location.origin + overlayUrl)}
                  className="w-full rounded-2xl border border-cyan-500 px-4 py-3 text-sm font-semibold text-white hover:bg-white/5 transition"
                >
                  Copy Preview URL
                </button>
              </div>
            </div>

            <div className="grid gap-4 rounded-[2rem] border border-white/10 bg-slate-950/80 p-6">
              <div>
                <h3 className="text-xl font-black text-white">Overlay Event Test</h3>
                <p className="mt-2 text-slate-400">Simulate alerts that will show in the overlay feed.</p>
              </div>

              <label className="space-y-2 text-sm text-slate-300">
                Event type
                <select
                  value={eventType}
                  onChange={(event) => setEventType(event.target.value)}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-cyan-500"
                >
                  {EVENT_TYPES.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              {eventType === "gift" && (
                <label className="space-y-2 text-sm text-slate-300">
                  Gift name
                  <input
                    value={gift}
                    onChange={(event) => setGift(event.target.value)}
                    className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-cyan-500"
                  />
                </label>
              )}

              {(eventType === "like" || eventType === "banker-offer" || eventType === "tts") && (
                <label className="space-y-2 text-sm text-slate-300">
                  Message
                  <input
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-cyan-500"
                  />
                </label>
              )}

              <label className="space-y-2 text-sm text-slate-300">
                Amount
                <input
                  type="number"
                  min={1}
                  value={amount}
                  onChange={(event) => setAmount(Number(event.target.value))}
                  className="w-full rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-cyan-500"
                />
              </label>

              <button
                type="button"
                onClick={sendOverlayEvent}
                className="w-full rounded-2xl bg-fuchsia-500 px-4 py-3 text-sm font-semibold text-white hover:bg-fuchsia-400 transition"
              >
                Send Overlay Event
              </button>

              {response && <p className="text-sm text-slate-300">{response}</p>}
            </div>
          </div>

          <div className="space-y-6 rounded-[2rem] border border-violet-500/10 bg-slate-900/80 p-6 shadow-xl">
            <div>
              <h2 className="text-2xl font-black text-white">Game Control</h2>
              <p className="mt-2 text-slate-400">Use your phone to control the Beat The Banker session directly.</p>
            </div>

            <label className="space-y-2 text-sm text-slate-300">
              Session ID
              <input
                value={sessionId}
                onChange={(event) => setSessionId(event.target.value.trim())}
                className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-violet-500"
              />
            </label>

            <div className="grid gap-3">
              {GAME_COMMANDS.map((command) => (
                <button
                  key={command.value}
                  type="button"
                  onClick={() => sendGameCommand(command.value)}
                  className="w-full rounded-2xl bg-cyan-500 px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-cyan-400 transition"
                >
                  {command.label}
                </button>
              ))}
            </div>

            {controlResponse && <p className="text-sm text-slate-300">{controlResponse}</p>}

            <div className="rounded-3xl border border-white/10 bg-black/20 p-4">
              <p className="text-sm uppercase tracking-[0.2em] text-violet-200 font-semibold">Mobile Tips</p>
              <ul className="mt-3 space-y-2 text-slate-400 text-sm">
                <li>Open this page on your phone for low-latency control.</li>
                <li>Use the preview URL in a mobile browser capture or companion stream app.</li>
                <li>Keep the overlay URL linked to the same username for consistent stream visuals.</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
