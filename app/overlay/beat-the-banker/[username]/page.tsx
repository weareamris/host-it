import OverlayClient from "@/components/OverlayClient";

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
    <OverlayClient username={username} />
  );
}