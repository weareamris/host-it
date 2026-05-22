"use client";

import { useEffect, useState } from "react";

import { supabase } from "../../lib/supabase";

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

        <p className="text-zinc-400 text-lg">
          Your live game configuration tools will appear here.
        </p>
      </div>
    </main>
  );
}