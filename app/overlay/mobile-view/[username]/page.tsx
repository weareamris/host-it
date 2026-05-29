import OverlayClient from "@/components/OverlayClient";

type Props = {
  params: Promise<{
    username: string;
  }>;
};

export default async function MobileViewPage({ params }: Props) {
  const { username } = await params;

  return (
    <div className="min-h-screen bg-black">
      <div className="pointer-events-none absolute inset-x-0 top-4 z-10 flex justify-center lg:justify-start px-4">
        <div className="rounded-full border border-white/10 bg-black/40 px-4 py-2 text-xs text-slate-300 backdrop-blur-xl sm:text-sm">
          Mobile Overlay Preview — @{username}
        </div>
      </div>
      <OverlayClient username={username} />
    </div>
  );
}
