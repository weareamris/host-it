import Image from "next/image";
import LoginForm from "@/components/LoginForm";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#050816] text-white">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.18),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(236,72,153,0.16),transparent_30%)]" />
        <div className="relative z-10 mx-auto max-w-7xl px-6 py-10 lg:px-8">
          <header className="flex flex-col gap-6 border-b border-white/10 pb-8 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="inline-flex items-center gap-3 rounded-full border border-cyan-400/15 bg-cyan-400/5 px-4 py-2 text-sm font-semibold text-cyan-200 shadow-sm shadow-cyan-500/5">
                Host It
              </div>
            </div>
            <nav className="flex flex-wrap items-center gap-4 text-sm text-slate-300">
              <a href="#features" className="transition hover:text-white">Features</a>
              <a href="#pricing" className="transition hover:text-white">Pricing</a>
              <a href="/signup" className="transition hover:text-white">Sign Up</a>
              <a href="#login" className="transition hover:text-white">Login</a>
            </nav>
          </header>

          <section className="grid gap-10 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className="space-y-8">
              <div className="max-w-2xl space-y-4">
                <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">Live stream game hosting for creators</p>
                <h1 className="text-5xl font-black tracking-tight text-white sm:text-6xl">
                  Host contests, sell experiences, and keep the hype real.
                </h1>
                <p className="text-lg leading-8 text-slate-300">
                  Host It makes it simple to run interactive prize shows, banker games, and chat-powered experiences for live audiences. Launch a stream-ready game in seconds with subscription tools built for creators.
                </p>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row">
                <a
                  href="/signup"
                  className="inline-flex items-center justify-center rounded-full bg-cyan-400 px-6 py-3 text-base font-semibold text-slate-950 transition hover:bg-cyan-300"
                >
                  Sign Up Free
                </a>
                <a
                  href="#login"
                  className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-6 py-3 text-base font-semibold text-white transition hover:border-cyan-400 hover:text-cyan-200"
                >
                  Login to Host It
                </a>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-cyan-500/5">
                  <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">Live-ready</p>
                  <p className="mt-3 text-2xl font-semibold text-white">Stream-friendly dashboard</p>
                  <p className="mt-2 text-slate-300">Run real-time rounds, manage offers, and keep your audience engaged from one clean interface.</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl shadow-fuchsia-500/5">
                  <p className="text-sm uppercase tracking-[0.35em] text-fuchsia-300">Secure</p>
                  <p className="mt-3 text-2xl font-semibold text-white">Creator-first controls</p>
                  <p className="mt-2 text-slate-300">Protect your game flow with safe box selection, banker offers, and session persistence for every show.</p>
                </div>
              </div>
            </div>

            <div className="rounded-[32px] border border-white/10 bg-[#0b1220]/80 p-8 shadow-2xl shadow-black/40">
              <div className="mb-6 flex items-center justify-between gap-4 rounded-3xl border border-slate-700/50 bg-slate-950/40 p-5">
                <div>
                  <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Live preview</p>
                  <p className="mt-2 text-2xl font-bold text-white">Host It Game Lobby</p>
                </div>
                <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-sm text-cyan-200">Hosted</span>
              </div>
              <div className="grid gap-4">
                <div className="rounded-3xl bg-white/5 p-5 text-slate-300">
                  <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Contestant</p>
                  <p className="mt-2 text-xl font-semibold text-white">@bigdaddytee</p>
                  <p className="mt-3 text-sm leading-6">Safe box selected, banker offer ready, and the audience is locked in for the next round.</p>
                </div>
                <div className="rounded-3xl bg-white/5 p-5 text-slate-300">
                  <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Status</p>
                  <p className="mt-2 text-3xl font-bold text-cyan-300">Round 2</p>
                  <p className="mt-3 text-sm leading-6">10 boxes remain — final decision mode coming soon.</p>
                </div>
              </div>
            </div>
          </section>

          <section id="features" className="space-y-8 py-16">
            <div className="max-w-3xl">
              <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">Why Host It</p>
              <h2 className="mt-4 text-4xl font-black text-white">Everything creators need to entertain, convert, and retain viewers.</h2>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
                <h3 className="text-xl font-semibold text-white">Interactive Games</h3>
                <p className="mt-3 text-slate-300">Host banker-style prize games, choose-your-own-adventure rounds, and live audience challenges.</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
                <h3 className="text-xl font-semibold text-white">Billing & access</h3>
                <p className="mt-3 text-slate-300">Built-in membership tiers, recurring plans, and premium room access for subscribers.</p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
                <h3 className="text-xl font-semibold text-white">Audience growth</h3>
                <p className="mt-3 text-slate-300">Turn viewers into active participants with chat commands, live prizes, and accelerating excitement.</p>
              </div>
            </div>
          </section>

          <section id="pricing" className="space-y-8 py-16">
            <div className="max-w-3xl">
              <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">Pricing</p>
              <h2 className="mt-4 text-4xl font-black text-white">Plans for every creator and show size.</h2>
            </div>

            <div className="grid gap-6 xl:grid-cols-3">
              <div className="rounded-[28px] border border-white/10 bg-white/5 p-8 text-center">
                <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Starter</p>
                <p className="mt-4 text-5xl font-black text-white">Free</p>
                <p className="mt-3 text-slate-300">Basic game room, chat support, and session persistence for smaller streams.</p>
                <ul className="mt-6 space-y-3 text-left text-slate-300">
                  <li>1 active game</li>
                  <li>Standard prize pools</li>
                  <li>Community chat</li>
                </ul>
              </div>
              <div className="rounded-[28px] border border-cyan-400/20 bg-cyan-500/10 p-8 text-center shadow-xl shadow-cyan-500/20">
                <p className="text-sm uppercase tracking-[0.35em] text-cyan-200">Creator</p>
                <p className="mt-4 text-5xl font-black text-white">$24/mo</p>
                <p className="mt-3 text-slate-200">Perfect for recurring shows with premium game controls and audience tools.</p>
                <ul className="mt-6 space-y-3 text-left text-slate-200">
                  <li>Unlimited games</li>
                  <li>Premium banker rounds</li>
                  <li>Custom prizes</li>
                </ul>
              </div>
              <div className="rounded-[28px] border border-white/10 bg-white/5 p-8 text-center">
                <p className="text-sm uppercase tracking-[0.35em] text-slate-400">Enterprise</p>
                <p className="mt-4 text-5xl font-black text-white">Custom</p>
                <p className="mt-3 text-slate-300">White-label streams, branded experiences, and premium host support.</p>
                <ul className="mt-6 space-y-3 text-left text-slate-300">
                  <li>Custom integrations</li>
                  <li>Dedicated onboarding</li>
                  <li>Priority uptime</li>
                </ul>
              </div>
            </div>
          </section>

          <section id="login" className="grid gap-10 rounded-[32px] border border-white/10 bg-[#0b1220]/80 p-10 shadow-2xl shadow-black/40 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-6">
              <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">Login</p>
              <h2 className="text-3xl font-black text-white">Access your Host It creator console.</h2>
              <p className="text-slate-300">Sign in to manage games, view analytics, and keep your live event going without missing a beat.</p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
              <LoginForm />
            </div>
          </section>

          <footer className="mt-16 border-t border-white/10 pt-8 text-center text-sm text-slate-400">
            © 2026 Host It. Built for creators who stream, entertain, and grow.
          </footer>
        </div>
      </div>
    </main>
  );
}
