type Props = {
  params: Promise<{
    username: string;
  }>;
};

export default async function OverlayPage({
  params,
}: Props) {
  const { username } =
    await params;

  return (
    <main className="w-screen h-screen overflow-hidden bg-transparent text-white">

      {/* TOP LEFT OVERLAY */}
      <div className="absolute top-10 left-10 px-6 py-4 rounded-3xl border border-cyan-400/20 bg-black/30 backdrop-blur-2xl shadow-[0_0_40px_rgba(34,211,238,0.15)]">

        <div className="text-sm text-cyan-300 font-bold tracking-widest">
          HOST IT!
        </div>

        <div className="text-3xl font-black mt-1">
          @{username}
        </div>

        <div className="text-zinc-400 text-sm mt-2">
          Beat The Banker Overlay
        </div>
      </div>

      {/* FUTURE ALERT AREA */}
      <div className="absolute bottom-10 right-10 rounded-3xl border border-fuchsia-500/20 bg-black/30 backdrop-blur-2xl px-6 py-4 shadow-[0_0_40px_rgba(217,70,239,0.15)]">

        <div className="text-fuchsia-400 font-bold">
          LIVE ALERT SYSTEM READY
        </div>
      </div>
    </main>
  );
}