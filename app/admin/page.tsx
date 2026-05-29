"use client";

import { useEffect, useState } from "react";

import { supabase } from "../../lib/supabase";

export const dynamic = "force-dynamic";

export default function AdminPage() {
  const [username, setUsername] =
    useState("");

  async function loadUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const { data } = await supabase
      .from("streamers")
      .select("*")
      .eq("auth_user_id", user.id)
      .single();

    if (data) {
      setUsername(
        data.tiktok_username
      );
    }
  }

  useEffect(() => {
    loadUser();
  }, []);

  return (
    <main className="min-h-screen text-white px-6 py-8">

      {/* HEADER */}
      <div className="max-w-7xl mx-auto mb-10">

        <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl p-8 shadow-[0_0_80px_rgba(34,211,238,0.12)]">

          <h1 className="text-6xl font-black tracking-tight">

            HOST
            <span className="bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-violet-400 bg-clip-text text-transparent">
              {" "}
              IT!
            </span>
          </h1>

          <p className="text-zinc-400 mt-4 text-xl">
            Streamer Admin Panel
          </p>

          <div className="mt-6 inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-black/40 border border-cyan-400/20">

            <div className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse" />

            <span className="text-lg">
              @{username || "streamer"}
            </span>
          </div>
        </div>
      </div>

      {/* PLACEHOLDER */}
      <div className="max-w-7xl mx-auto rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-10">

        <h2 className="text-4xl font-black mb-4">
          Beat The Banker
        </h2>

        <p className="text-zinc-400 text-lg mb-8">
          Access your live game setup tools for TikTok audience control and prize board configuration.
        </p>

        <div className="flex flex-wrap gap-4">
          <a
            href="/games/beat-the-banker/setup"
            className="inline-flex items-center justify-center rounded-2xl bg-cyan-500 px-6 py-4 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
          >
            Open Beat The Banker Setup
          </a>
          <a
            href="/overlay/studio"
            className="inline-flex items-center justify-center rounded-2xl bg-fuchsia-500 px-6 py-4 text-sm font-semibold text-white transition hover:bg-fuchsia-400"
          >
            Open Overlay Studio
          </a>
          <a
            href="/overlay/mobile-control"
            className="inline-flex items-center justify-center rounded-2xl bg-violet-500 px-6 py-4 text-sm font-semibold text-white transition hover:bg-violet-400"
          >
            Open Mobile Companion
          </a>
          <a
            href="/games/beat-the-banker/setup?sessionId=demo"
            className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Quick Demo Setup
          </a>
        </div>
      </div>
    </main>
  );
}