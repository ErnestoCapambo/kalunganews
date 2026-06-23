"use client";

import { Radio, Tv, Headphones } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LiveCompatibilityNotice } from "@/components/live/live-compatibility-notice";
import { LiveStudio } from "@/components/live/live-studio";
import { LiveViewer } from "@/components/live/live-viewer";
import type { StreamMode } from "@/components/live/live-studio";

interface LiveHubProps {
  initialRoom?: string;
  initialTab?: string;
  initialMode?: string;
}

export function LiveHub({ initialRoom, initialTab, initialMode }: LiveHubProps) {
  const mode = (initialMode === "audio" ? "audio" : "video") as StreamMode;
  const defaultTab = initialTab === "transmitir" ? "transmitir" : "assistir";

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-950/40 px-4 py-1.5 text-xs font-medium text-red-300">
          <Radio className="h-3 w-3 animate-pulse" />
          Transmissão em tempo real
        </div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          <span className="bg-gradient-to-r from-red-400 to-blue-500 bg-clip-text text-transparent">
            Ao Vivo
          </span>
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          Transmita ou assista transmissões de vídeo e áudio em tempo real.
          Partilhe o link da sala para o mundo inteiro acompanhar.
        </p>
      </div>

      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className="mb-8 grid w-full grid-cols-2 border border-white/10 bg-white/5">
          <TabsTrigger value="assistir" className="gap-2">
            <Tv className="h-4 w-4" />
            Assistir
          </TabsTrigger>
          <TabsTrigger value="transmitir" className="gap-2">
            <Headphones className="h-4 w-4" />
            Transmitir
          </TabsTrigger>
        </TabsList>

        <TabsContent value="assistir">
          <LiveViewer initialRoom={initialRoom} initialMode={mode} />
        </TabsContent>

        <TabsContent value="transmitir">
          <LiveStudio />
        </TabsContent>
      </Tabs>

      <div className="mt-10">
        <LiveCompatibilityNotice />
      </div>
    </div>
  );
}
