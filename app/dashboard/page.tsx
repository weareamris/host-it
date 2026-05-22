"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import { supabase } from "@/lib/supabase";

type Streamer = {
  id: string;

  auth_user_id: string;

  email: string;

  tiktok_username: string;
};

export default function DashboardPage() {

  const router = useRouter();

  const [streamer,
    setStreamer] =
    useState<Streamer | null>(
      null
    );

  const [loading,
    setLoading] =
    useState(true);

  useEffect(() => {

    const loadStreamer =
      async () => {

      const {
        data: authData,
      } =
        await supabase.auth.getUser();

      const user =
        authData.user;

      if (!user) {
        router.push("/login");
        return;
      }

      const {
        data,
        error,
      } = await supabase
        .from("streamers")
        .select("*")
        .eq(
          "auth_user_id",
          user.id
        )
        .single();

      if (error) {
        console.error(error);
      }

      if (data) {
        setStreamer(data);
      }

      setLoading(false);
    };

    loadStreamer();

  }, [router]);

  const launchGame =
    async () => {

    if (!streamer) return;

    await fetch(
      "/api/connectors/start",
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          streamerUsername:
            streamer.tiktok_username,
        }),
      }
    );

    router.push(
      `/games/beat-the-banker/${streamer.tiktok_username}`
    );
  };

  const logout =
    async () => {

    await supabase.auth.signOut();

    router.push("/login");
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">

        <p className="text-2xl">
          Loading...
        </p>

      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white p-10">

      <div className="max-w-7xl mx-auto">

        <div className="flex items-start justify-between mb-12">

          <div>

            <h1 className="text-6xl font-black">

              HOST
              <span className="bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-violet-400 bg-clip-text text-transparent">
                {" "}
                IT!
              </span>

            </h1>

            <p className="mt-4 text-2xl text-zinc-400">

              STREAMER ADMIN
              {" "}
              @
              {streamer?.tiktok_username}

            </p>

          </div>

          <button
            onClick={logout}
            className="px-6 py-3 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition"
          >
            Logout
          </button>

        </div>

        <div className="grid md:grid-cols-3 gap-8">

          <button
            onClick={launchGame}
            className="rounded-3xl border border-cyan-400/20 bg-white/5 p-10 hover:bg-white/10 transition text-left shadow-[0_0_40px_rgba(34,211,238,0.15)]"
          >

            <h2 className="text-3xl font-black mb-4">

              Beat The Banker

            </h2>

            <p className="text-zinc-400">

              Launch streamer control panel

            </p>

          </button>

        </div>
      </div>
    </main>
  );
}