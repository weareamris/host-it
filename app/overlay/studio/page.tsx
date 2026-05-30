"use client";

import { useEffect, useState, useRef } from "react";
import { PRIZE_REGISTRY } from "@/lib/giftRegistry";

const DEFAULT_LIKE_GOAL = 1000;
const THEME_PRESETS = [
  { id: "neon", label: "Neon Pulse", accent: "cyan" },
  { id: "vapor", label: "Vapor Glow", accent: "fuchsia" },
  { id: "midnight", label: "Midnight Edge", accent: "violet" },
  { id: "retro", label: "Retro Pop", accent: "amber" },
];
const ALERT_STYLES = [
  { id: "popup", label: "Pop-up" },
  { id: "lower-third", label: "Lower Third" },
  { id: "full-screen", label: "Full Screen" },
];
const SAMPLE_CHAT_MESSAGES = [
  { user: "rachael", message: "Let's gooooo!" },
  { user: "kingston", message: "Banker is sweating 😂" },
  { user: "luna", message: "Drop the jackpot!" },
  { user: "echo", message: "This overlay is fire 🔥" },
];
const STICKER_OPTIONS = [
  { id: "hearts", label: "Hearts" },
  { id: "sparkles", label: "Sparkles" },
  { id: "fireworks", label: "Fireworks" },
];

type GiftSound = {
  giftId: string;
  giftName: string;
  audioUrl: string;
};

export default function OverlayStudioPage() {
  const [bannerText, setBannerText] = useState("Welcome to the stream!");
  const [bannerEnabled, setBannerEnabled] = useState(true);
  const [transparentOverlay, setTransparentOverlay] = useState(false);
  const [theme, setTheme] = useState(THEME_PRESETS[0].id);
  const [alertStyle, setAlertStyle] = useState(ALERT_STYLES[0].id);
  const [soundEffectsEnabled, setSoundEffectsEnabled] = useState(true);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [ttsMessage, setTtsMessage] = useState("Let's go, viewers!");
  const [likeGoal, setLikeGoal] = useState(DEFAULT_LIKE_GOAL);
  const [goalProgress, setGoalProgress] = useState(280);
  const [confettiEnabled, setConfettiEnabled] = useState(true);
  const [chatEnabled, setChatEnabled] = useState(true);
  const [stickerEnabled, setStickerEnabled] = useState(true);
  const [stickerType, setStickerType] = useState(STICKER_OPTIONS[0].id);
  const [previewEvent, setPreviewEvent] = useState("Ready for hype events.");
  const [mobilePreviewUsername, setMobilePreviewUsername] = useState("demo");
  const [copiedPreviewLink, setCopiedPreviewLink] = useState(false);
  const [chatMessages, setChatMessages] = useState(SAMPLE_CHAT_MESSAGES);
  const [stickerActive, setStickerActive] = useState(false);
  const [ttsVoiceEnabled, setTtsVoiceEnabled] = useState(true);
  const [audioPreview, setAudioPreview] = useState<HTMLAudioElement | null>(null);
  
  // Gift sound state
  const [giftSounds, setGiftSounds] = useState<GiftSound[]>([]);
  const [selectedGiftForSound, setSelectedGiftForSound] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const overlayUrl = `/overlay/mobile-view/${mobilePreviewUsername}`;

  // Initialize audio preview
  useEffect(() => {
    if (typeof window !== "undefined") {
      setAudioPreview(new Audio());
    }
  }, []);

  // Load gift sounds from localStorage
  useEffect(() => {
    const stored = window.localStorage.getItem("overlayStudioSettings");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setBannerText(parsed.bannerText ?? bannerText);
        setBannerEnabled(parsed.bannerEnabled ?? bannerEnabled);
        setTransparentOverlay(parsed.transparentOverlay ?? transparentOverlay);
        setTheme(parsed.theme ?? theme);
        setAlertStyle(parsed.alertStyle ?? alertStyle);
        setSoundEffectsEnabled(parsed.soundEffectsEnabled ?? soundEffectsEnabled);
        setTtsEnabled(parsed.ttsEnabled ?? ttsEnabled);
        setTtsMessage(parsed.ttsMessage ?? ttsMessage);
        setLikeGoal(parsed.likeGoal ?? likeGoal);
        setGoalProgress(parsed.goalProgress ?? goalProgress);
        setConfettiEnabled(parsed.confettiEnabled ?? confettiEnabled);
        setChatEnabled(parsed.chatEnabled ?? chatEnabled);
        setStickerEnabled(parsed.stickerEnabled ?? stickerEnabled);
        setStickerType(parsed.stickerType ?? stickerType);
        setTtsVoiceEnabled(parsed.ttsVoiceEnabled ?? ttsVoiceEnabled);
      } catch {
        // ignore malformed local storage
      }
    }

    const storedGiftSounds = window.localStorage.getItem("giftSounds");
    if (storedGiftSounds) {
      try {
        setGiftSounds(JSON.parse(storedGiftSounds));
      } catch {
        // ignore malformed data
      }
    }
  }, []);

  // Save overlay settings to localStorage
  useEffect(() => {
    window.localStorage.setItem(
      "overlayStudioSettings",
      JSON.stringify({
        bannerText,
        bannerEnabled,
        transparentOverlay,
        theme,
        alertStyle,
        soundEffectsEnabled,
        ttsEnabled,
        ttsMessage,
        likeGoal,
        goalProgress,
        confettiEnabled,
        chatEnabled,
        stickerEnabled,
        stickerType,
        ttsVoiceEnabled,
      })
    );
  }, [
    bannerText,
    bannerEnabled,
    transparentOverlay,
    theme,
    alertStyle,
    soundEffectsEnabled,
    ttsEnabled,
    ttsMessage,
    likeGoal,
    goalProgress,
    confettiEnabled,
    chatEnabled,
    stickerEnabled,
    stickerType,
    ttsVoiceEnabled,
  ]);

  // Save gift sounds to localStorage
  useEffect(() => {
    window.localStorage.setItem("giftSounds", JSON.stringify(giftSounds));
  }, [giftSounds]);

  // Sticker timeout
  useEffect(() => {
    if (!stickerActive) return;
    const timer = window.setTimeout(() => setStickerActive(false), 2500);
    return () => window.clearTimeout(timer);
  }, [stickerActive]);

  function handleAddGiftSound() {
    if (!selectedGiftForSound) {
      alert("Please select a gift first");
      return;
    }
    fileInputRef.current?.click();
  }

  function handleGiftAudioUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !selectedGiftForSound) return;

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      alert("Audio file must be less than 10MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      
      // Find the gift name
      const giftName = PRIZE_REGISTRY.find(g => g.id === selectedGiftForSound)?.name || selectedGiftForSound;
      
      // Check if this gift already has a sound, if so replace it
      setGiftSounds((prev) => {
        const filtered = prev.filter(gs => gs.giftId !== selectedGiftForSound);
        return [...filtered, {
          giftId: selectedGiftForSound,
          giftName,
          audioUrl: dataUrl,
        }];
      });

      setSelectedGiftForSound("");
    };
    reader.readAsDataURL(file);
    event.target.value = ""; // Reset file input
  }

  function handlePlayAudioPreview(audioUrl: string) {
    if (!audioPreview) return;
    audioPreview.src = audioUrl;
    audioPreview.play().catch(() => console.error("Audio playback failed"));
  }

  function handleRemoveGiftSound(giftId: string) {
    setGiftSounds((prev) => prev.filter((gs) => gs.giftId !== giftId));
  }

  function handleTestTTS() {
    setPreviewEvent("TTS: " + ttsMessage);
    if (ttsEnabled && typeof window !== "undefined" && "speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(ttsMessage);
      window.speechSynthesis.speak(utterance);
    }
    setStickerActive(stickerEnabled);
  }

  function handleActivateCannon() {
    setPreviewEvent(`CANNON ACTIVITY at ${likeGoal} likes!`);
    setStickerActive(confettiEnabled);
    setGoalProgress((current) => Math.min(likeGoal, current + 120));
  }

  function handleSendChat() {
    setChatMessages((prev) => [
      { user: "tiktokfan", message: "This is so slick!" },
      ...prev.slice(0, 4),
    ]);
  }

  async function handleCopyPreviewUrl() {
    const href = window.location.origin + overlayUrl;
    await navigator.clipboard.writeText(href);
    setCopiedPreviewLink(true);
    window.setTimeout(() => setCopiedPreviewLink(false), 1800);
  }

  const themeAccent = THEME_PRESETS.find((preset) => preset.id === theme)?.accent || "cyan";
  const enabledGifts = PRIZE_REGISTRY.filter(g => g.enabled);

  return (
    <main className="min-h-screen bg-slate-950 text-white p-4 sm:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-5xl font-black tracking-tight text-white">Overlay Studio</h1>
              <p className="mt-4 max-w-3xl text-slate-300 text-lg">
                Build Tikfinity-grade stream overlays for desktop and mobile. Configure alert styles, animated stickers, chat feed, goal meters, OBS transparency, gift-triggered sounds, and mobile preview links all in one place.
              </p>
            </div>
            <div className="rounded-3xl border border-cyan-500/15 bg-cyan-500/10 px-6 py-4 text-slate-100 shadow-xl">
              <p className="text-sm uppercase tracking-[0.2em] text-cyan-200">Preview route</p>
              <p className="mt-3 text-lg font-semibold text-white">/overlay/studio</p>
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-6">
            <div className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-6 shadow-xl">
              <h2 className="text-3xl font-black text-white">Overlay Configuration</h2>
              <p className="mt-3 text-slate-400">Fine-tune every detail of your stream overlay and alert presentation.</p>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-sm text-slate-300">
                  Theme preset
                  <select
                    value={theme}
                    onChange={(event) => setTheme(event.target.value)}
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-500"
                  >
                    {THEME_PRESETS.map((preset) => (
                      <option key={preset.id} value={preset.id}>
                        {preset.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-2 text-sm text-slate-300">
                  Alert style
                  <select
                    value={alertStyle}
                    onChange={(event) => setAlertStyle(event.target.value)}
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-500"
                  >
                    {ALERT_STYLES.map((style) => (
                      <option key={style.id} value={style.id}>
                        {style.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="inline-flex items-center gap-3 rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-300">
                  <input
                    type="checkbox"
                    checked={transparentOverlay}
                    onChange={(event) => setTransparentOverlay(event.target.checked)}
                    className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-cyan-400"
                  />
                  Transparent OBS overlay
                </label>
                <label className="inline-flex items-center gap-3 rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-300">
                  <input
                    type="checkbox"
                    checked={chatEnabled}
                    onChange={(event) => setChatEnabled(event.target.checked)}
                    className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-cyan-400"
                  />
                  Show chat feed
                </label>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <label className="inline-flex items-center gap-3 rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-300">
                  <input
                    type="checkbox"
                    checked={confettiEnabled}
                    onChange={(event) => setConfettiEnabled(event.target.checked)}
                    className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-cyan-400"
                  />
                  Confetti & effects
                </label>

                <label className="inline-flex items-center gap-3 rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-300">
                  <input
                    type="checkbox"
                    checked={stickerEnabled}
                    onChange={(event) => setStickerEnabled(event.target.checked)}
                    className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-cyan-400"
                  />
                  Animated stickers
                </label>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <label className="space-y-2 text-sm text-slate-300">
                  Sticker type
                  <select
                    value={stickerType}
                    onChange={(event) => setStickerType(event.target.value)}
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-500"
                  >
                    {STICKER_OPTIONS.map((option) => (
                      <option key={option.id} value={option.id}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-2 text-sm text-slate-300">
                  Likes goal meter
                  <input
                    type="number"
                    min={0}
                    value={likeGoal}
                    onChange={(event) => setLikeGoal(Number(event.target.value))}
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-500"
                  />
                </label>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-6 shadow-xl">
              <h2 className="text-3xl font-black text-white">Gift Sounds</h2>
              <p className="mt-3 text-slate-400">Assign custom audio alerts to specific TikTok gifts. When a gift is received during your stream, the assigned sound plays in real-time on your overlay.</p>

              <div className="mt-6 space-y-4">
                <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                  <label className="space-y-2 text-sm text-slate-300">
                    Add Gift Sound
                    <select
                      value={selectedGiftForSound}
                      onChange={(event) => setSelectedGiftForSound(event.target.value)}
                      className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-500"
                    >
                      <option value="">Select a gift...</option>
                      {enabledGifts.map((gift) => (
                        <option key={gift.id} value={gift.id}>
                          {gift.name} ({gift.value} pts)
                        </option>
                      ))}
                    </select>
                  </label>
                  <button
                    type="button"
                    onClick={handleAddGiftSound}
                    disabled={!selectedGiftForSound}
                    className="self-end rounded-2xl bg-cyan-500 px-6 py-3 text-sm font-semibold text-slate-950 hover:bg-cyan-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Upload Audio
                  </button>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*"
                  onChange={handleGiftAudioUpload}
                  className="hidden"
                />

                {giftSounds.length > 0 && (
                  <div className="rounded-3xl border border-slate-700 bg-slate-950/80 p-4">
                    <p className="text-sm uppercase tracking-[0.2em] text-slate-400 font-semibold mb-3">
                      Configured Sounds ({giftSounds.length})
                    </p>
                    <div className="space-y-2 max-h-72 overflow-y-auto">
                      {giftSounds.map((sound) => (
                        <div
                          key={sound.giftId}
                          className="flex items-center justify-between gap-3 rounded-2xl bg-black/40 px-4 py-3"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-300">
                              🎁 {sound.giftName}
                            </p>
                          </div>
                          <div className="flex gap-2 flex-shrink-0">
                            <button
                              type="button"
                              onClick={() => handlePlayAudioPreview(sound.audioUrl)}
                              className="rounded-lg bg-emerald-500/20 px-3 py-2 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/30 transition"
                            >
                              ▶ Play
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveGiftSound(sound.giftId)}
                              className="rounded-lg bg-red-500/20 px-3 py-2 text-xs font-semibold text-red-400 hover:bg-red-500/30 transition"
                            >
                              ✕ Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="rounded-3xl border border-slate-700 bg-black/60 p-4">
                  <p className="text-sm text-slate-400 mb-2">💡 <strong>How it works:</strong></p>
                  <ul className="text-xs text-slate-500 space-y-1 list-disc list-inside">
                    <li>Select a gift from your TikTok gift registry</li>
                    <li>Upload a custom audio file (max 10MB)</li>
                    <li>Add multiple gift sounds by repeating the process</li>
                    <li>When someone sends that gift during your stream, the sound plays automatically in real-time on your overlay</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-6 shadow-xl">
              <h2 className="text-3xl font-black text-white">Audio & Voice</h2>
              <p className="mt-3 text-slate-400">Configure text-to-speech voice announcements for stream events.</p>

              <div className="mt-6 grid gap-4">
                <label className="inline-flex items-center gap-3 rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-300">
                  <input
                    type="checkbox"
                    checked={ttsVoiceEnabled}
                    onChange={(event) => setTtsVoiceEnabled(event.target.checked)}
                    className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-cyan-400"
                  />
                  Enable TTS voice announcements
                </label>

                <label className="space-y-2 text-sm text-slate-300">
                  TTS Message
                  <input
                    value={ttsMessage}
                    onChange={(event) => setTtsMessage(event.target.value)}
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-500"
                    placeholder="Custom TTS announcement"
                  />
                </label>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-6 shadow-xl">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-2xl font-black text-white">Hype Trigger</h3>
                  <p className="mt-2 text-slate-400">Preview live alert and goal reactions instantly.</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setPreviewEvent("SUPER GIFT ALERT");
                    setStickerActive(true);
                  }}
                  className="rounded-2xl bg-fuchsia-500 px-4 py-3 text-sm font-semibold text-white hover:bg-fuchsia-400 transition"
                >
                  Preview Gift Alert
                </button>
              </div>

              <div className="mt-6 grid gap-4">
                <label className="space-y-2 text-sm text-slate-300">
                  Alert text
                  <input
                    value={previewEvent}
                    onChange={(event) => setPreviewEvent(event.target.value)}
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-500"
                  />
                </label>

                <button
                  type="button"
                  onClick={handleTestTTS}
                  className="w-full rounded-2xl bg-cyan-500 px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-cyan-400 transition"
                >
                  Play TTS Alert
                </button>

                <button
                  type="button"
                  onClick={handleActivateCannon}
                  className="w-full rounded-2xl bg-violet-500 px-4 py-3 text-sm font-semibold text-white hover:bg-violet-400 transition"
                >
                  Trigger Goal Reaction
                </button>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-6 shadow-xl">
              <h3 className="text-2xl font-black text-white">OBS / Mobile Preview</h3>
              <p className="mt-2 text-slate-400">Use the mobile preview route and QR generator to drive phones or browser sources.</p>
              <div className="mt-6 space-y-4">
                <div className="rounded-3xl border border-slate-700 bg-black/60 px-4 py-4 text-sm text-slate-300">
                  <div className="font-semibold text-white">Preview route</div>
                  <div className="mt-2 break-words">{overlayUrl}</div>
                </div>
                <button
                  type="button"
                  onClick={handleCopyPreviewUrl}
                  className="w-full rounded-2xl bg-cyan-500 px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-cyan-400 transition"
                >
                  {copiedPreviewLink ? "Link copied" : "Copy mobile preview link"}
                </button>
                <a
                  href={`/overlay/mobile-control/qr?username=${mobilePreviewUsername}`}
                  className="inline-flex w-full items-center justify-center rounded-2xl border border-violet-500 px-4 py-3 text-sm font-semibold text-white hover:bg-violet-500/10 transition"
                >
                  Open QR Code Generator
                </a>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-slate-900/80 p-6 shadow-xl">
            <div className="rounded-[2rem] overflow-hidden border border-slate-700 bg-black/40 shadow-[0_0_80px_rgba(0,0,0,0.35)]">
              <div className={`relative min-h-[760px] overflow-hidden p-6 ${transparentOverlay ? "bg-transparent" : "bg-slate-950/95"}`}>
                {confettiEnabled && stickerActive && (
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute inset-0 animate-burst opacity-70" />
                    <div className="absolute inset-0 animate-burst delay-200 opacity-50" />
                  </div>
                )}

                {bannerEnabled && (
                  <div className={`mb-6 rounded-full border px-4 py-3 text-sm uppercase tracking-[0.2em] ${themeAccent === "fuchsia" ? "border-fuchsia-500/40 bg-fuchsia-500/10 text-fuchsia-200" : themeAccent === "violet" ? "border-violet-500/40 bg-violet-500/10 text-violet-200" : themeAccent === "amber" ? "border-amber-500/40 bg-amber-500/10 text-amber-200" : "border-cyan-500/40 bg-cyan-500/10 text-cyan-200"}`}>
                    {bannerText}
                  </div>
                )}

                <div className="grid gap-4 lg:grid-cols-[0.68fr_0.32fr]">
                  <div className="space-y-4 rounded-[2rem] border border-slate-700 bg-slate-950/80 p-4">
                    <div className="flex items-center justify-between gap-3 rounded-3xl border border-white/10 bg-slate-900/90 px-4 py-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Live status</p>
                        <p className="mt-2 text-2xl font-black text-white">Stream Active</p>
                      </div>
                      <div className="rounded-2xl bg-cyan-500 px-3 py-2 text-sm font-semibold text-slate-950">LIVE</div>
                    </div>

                    <div className="rounded-3xl border border-slate-800 bg-black/60 p-4">
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Goal meter</p>
                      <div className="mt-3 rounded-full border border-slate-700 bg-slate-900/90 p-1">
                        <div className="h-4 rounded-full bg-cyan-400 transition-all" style={{ width: `${Math.min(100, (goalProgress / likeGoal) * 100)}%` }} />
                      </div>
                      <p className="mt-3 text-sm text-slate-300">{goalProgress} / {likeGoal} likes</p>
                    </div>

                    <div className="rounded-3xl border border-slate-800 bg-black/60 p-4">
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Current alert</p>
                      <div className="mt-3 rounded-3xl bg-slate-900/80 p-4 text-white">
                        <p className="text-xl font-black">{previewEvent}</p>
                        <p className="mt-2 text-sm text-slate-400">{alertStyle.replace("-", " ")} animation</p>
                      </div>
                    </div>
                  </div>

                  {chatEnabled && (
                    <div className="rounded-[2rem] border border-slate-700 bg-slate-950/90 p-4">
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Chat feed</p>
                      <div className="mt-4 space-y-3">
                        {chatMessages.map((chat, index) => (
                          <div key={index} className="rounded-3xl border border-slate-800 bg-black/50 px-4 py-3">
                            <p className="text-sm font-semibold text-white">@{chat.user}</p>
                            <p className="mt-1 text-sm text-slate-300">{chat.message}</p>
                          </div>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={handleSendChat}
                        className="mt-4 w-full rounded-2xl bg-cyan-500 px-4 py-3 text-sm font-semibold text-slate-950 hover:bg-cyan-400 transition"
                      >
                        Simulate chat burst
                      </button>
                    </div>
                  )}
                </div>

                {stickerEnabled && (
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
                    <div className={`pointer-events-none absolute inset-0 ${stickerActive ? "opacity-100" : "opacity-0"} transition-opacity duration-500`}>
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/30" />
                      <div className="absolute left-10 top-20 flex flex-col gap-4">
                        <span className="animate-pop text-6xl text-pink-300">💖</span>
                        <span className="animate-pop delay-100 text-6xl text-violet-300">✨</span>
                      </div>
                      <div className="absolute right-10 top-28 flex flex-col gap-4">
                        <span className="animate-pop delay-200 text-6xl text-amber-300">🎉</span>
                        <span className="animate-pop delay-300 text-6xl text-cyan-300">🔥</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }

        @keyframes burst {
          0% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-28px) scale(1.1); }
          100% { transform: translateY(0) scale(1); }
        }

        .animate-marquee {
          display: inline-block;
          white-space: nowrap;
          animation: marquee 14s linear infinite;
        }

        .animate-pop {
          animation: burst 1.2s ease-in-out infinite;
        }
      `}</style>
    </main>
  );
}
