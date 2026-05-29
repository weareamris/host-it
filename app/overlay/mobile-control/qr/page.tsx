import QRCodePreview from "./QRCodePreview";

type Props = {
  searchParams: {
    username?: string;
  };
};

export default function MobileControlQrPage({ searchParams }: Props) {
  const username = searchParams?.username || "demo";

  return <QRCodePreview username={username} />;
}
