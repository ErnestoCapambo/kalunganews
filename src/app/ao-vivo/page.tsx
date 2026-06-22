import type { Metadata } from "next";
import { LiveHub } from "@/components/live/live-hub";
import { SITE_NAME } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Ao Vivo",
  description: `Transmissões ao vivo de vídeo e áudio — ${SITE_NAME}`,
};

interface AoVivoPageProps {
  searchParams: Promise<{
    room?: string;
    tab?: string;
    mode?: string;
  }>;
}

export default async function AoVivoPage({ searchParams }: AoVivoPageProps) {
  const params = await searchParams;

  return (
    <LiveHub
      initialRoom={params.room}
      initialTab={params.tab}
      initialMode={params.mode}
    />
  );
}
