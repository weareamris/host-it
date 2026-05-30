"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

export default function QRCodePreview({ username }: { username: string }) {
  const [origin, setOrigin] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const overlayTarget = `${origin}/overlay/mobile-view/${username}`;

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  useEffect(() => {
    if (!origin) return;

    QRCode.toDataURL(overlayTarget, {
      margin: 2,
      scale: 10,
      color: {
        dark: "#ffffff",
        light: "#00000000",
      },
    })
      .then(setQrDataUrl)
      .catch((error) => {
        console.error("QR code generation failed", error);
      });
  }, [origin, overlayTarget]);

  async function copyLink() {
    await navigator.clipboard.writeText(overlayTarget);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white p-4 sm:p-6">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-xl backdrop-blur-xl">
          <h1 className="text-4xl font-black tracking-tight text-cyan-300">
            Mobile Overlay QR Code
          </h1>
          <p className="mt-3 text-slate-400 max-w-3xl">
            Scan this QR code to open the mobile overlay preview on any phone. Perfect for streamers and viewers to access a live overlay companion quickly.
          </p>
        </section>

        <section className="rounded-[2rem] border border-cyan-500/10 bg-slate-900/80 p-6 shadow-2xl">
          <div className="grid gap-4 md:grid-cols-[1.2fr_0.8fr] items-start">
            <div className="space-y-4">
              <div>
                <div className="text-sm uppercase tracking-[0.2em] text-cyan-300 font-semibold">
                  Target overlay username
                </div>
                <div className="mt-2 rounded-3xl border border-slate-700 bg-black/70 px-4 py-3 text-base text-white">
                  @{username}
                </div>
              </div>

              <div>
                <div className="text-sm uppercase tracking-[0.2em] text-cyan-300 font-semibold">
                  Mobile preview link
                </div>
                <div className="mt-2 rounded-3xl border border-slate-700 bg-black/70 px-4 py-3 text-sm text-slate-200 break-words">
                  {overlayTarget}
                </div>
              </div>

              <button
                type="button"
                onClick={copyLink}
                className="rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-cyan-400 transition"
              >
                {copied ? "Copied to clipboard" : "Copy preview URL"}
              </button>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-black/30 p-4 flex items-center justify-center min-h-[280px]">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="Mobile overlay QR code"
                  className="h-64 w-64 rounded-3xl bg-white p-4"
                />
              ) : (
                <div className="text-slate-400">Generating QR code...</div>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
