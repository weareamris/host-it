"use client";

import { useState } from "react";

import { supabase } from "../../lib/supabase";

import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [tiktokUsername,
    setTiktokUsername] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  async function handleSignup() {
    try {
      setLoading(true);

      // CREATE AUTH USER
      const {
        data,
        error,
      } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        alert(error.message);
        return;
      }

      const authUser =
        data.user;

      if (!authUser) {
        alert(
          "No auth user returned"
        );
        return;
      }

      // CREATE STREAMER PROFILE
      const {
        error: profileError,
      } = await supabase
        .from("streamers")
        .insert({
          auth_user_id:
            authUser.id,

          tiktok_username:
            tiktokUsername,

          display_name:
            tiktokUsername,
        });

      if (profileError) {
        console.error(
          profileError
        );

        alert(
          profileError.message
        );

        return;
      }

      // AUTO LOGIN
      await supabase.auth.signInWithPassword(
        {
          email,
          password,
        }
      );

      router.push(
        "/dashboard"
      );
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">

      <div className="w-full max-w-md rounded-3xl border border-cyan-400/20 bg-white/5 backdrop-blur-2xl p-10 shadow-[0_0_60px_rgba(34,211,238,0.15)]">

        <h1 className="text-5xl font-black mb-2">

          HOST
          <span className="bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-violet-400 bg-clip-text text-transparent">
            {" "}
            IT!
          </span>
        </h1>

        <p className="text-zinc-400 mb-8">
          Create your streamer account
        </p>

        <div className="space-y-4">

          <input
            type="text"
            placeholder="TikTok Username"
            value={tiktokUsername}
            onChange={(e) =>
              setTiktokUsername(
                e.target.value
              )
            }
            className="w-full rounded-2xl bg-black/40 border border-white/10 px-4 py-3 outline-none"
          />

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) =>
              setEmail(
                e.target.value
              )
            }
            className="w-full rounded-2xl bg-black/40 border border-white/10 px-4 py-3 outline-none"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) =>
              setPassword(
                e.target.value
              )
            }
            className="w-full rounded-2xl bg-black/40 border border-white/10 px-4 py-3 outline-none"
          />

          <button
            onClick={handleSignup}
            disabled={loading}
            className="w-full rounded-2xl bg-gradient-to-r from-cyan-500 via-fuchsia-500 to-violet-500 py-3 font-bold text-lg hover:opacity-90 transition"
          >
            {loading
              ? "Creating..."
              : "Create Account"}
          </button>
        </div>
      </div>
    </main>
  );
}
