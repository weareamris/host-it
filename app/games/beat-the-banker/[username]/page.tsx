type Props = {
  params: Promise<{
    username: string;
  }>;
};

export default async function Page({
  params,
}: Props) {

  const {
    username,
  } = await params;

  return (
    <main className="min-h-screen bg-black text-white p-10">

      <div className="max-w-7xl mx-auto">

        <div className="mb-10">

          <h1 className="text-6xl font-black">

            HOST
            <span className="bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-violet-400 bg-clip-text text-transparent">
              {" "}
              IT!
            </span>

          </h1>

          <p className="mt-4 text-2xl text-zinc-400">

            Beat The Banker
            {" "}
            @
            {username}

          </p>

        </div>

        <div className="grid lg:grid-cols-3 gap-8">

          <div className="rounded-3xl border border-cyan-400/20 bg-white/5 p-8">

            <h2 className="text-3xl font-black mb-6">
              Game Controls
            </h2>

            <div className="space-y-4">

              <button className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-400 to-fuchsia-500 text-black font-bold">
                Start Game
              </button>

              <button className="w-full py-4 rounded-2xl bg-white/10">
                Next Round
              </button>

              <button className="w-full py-4 rounded-2xl bg-white/10">
                Reveal Banker Offer
              </button>

              <button className="w-full py-4 rounded-2xl bg-red-500/80">
                End Game
              </button>

            </div>

          </div>

          <div className="rounded-3xl border border-cyan-400/20 bg-white/5 p-8">

            <h2 className="text-3xl font-black mb-6">
              Live TikTok Feed
            </h2>

            <div className="space-y-3 text-zinc-300">

              <p>
                Waiting for live events...
              </p>

            </div>

          </div>

          <div className="rounded-3xl border border-cyan-400/20 bg-white/5 p-8">

            <h2 className="text-3xl font-black mb-6">
              Game State
            </h2>

            <div className="space-y-4 text-zinc-300">

              <p>
                Players: 0
              </p>

              <p>
                Current Round: 0
              </p>

              <p>
                Banker Offer: £0
              </p>

              <p>
                Status: Waiting
              </p>

            </div>

          </div>

        </div>

      </div>
    </main>
  );
}