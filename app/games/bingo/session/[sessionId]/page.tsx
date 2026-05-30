import BingoSessionClient from "@/components/BingoSessionClient";

type Props = {
  params: Promise<{ sessionId: string }>; 
};

export default async function BingoSessionPage({ params }: Props) {
  const { sessionId } = await params;

  return <BingoSessionClient gameId={sessionId} />;
}
