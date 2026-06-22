"use client";

import { useEffect, useRef } from "react";
import Hls from "hls.js";
import { Radio } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { StreamMode } from "@/components/live/live-studio";

interface ExternalStreamPlayerProps {
  mode: StreamMode;
}

export function ExternalStreamPlayer({ mode }: ExternalStreamPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsUrl = process.env.NEXT_PUBLIC_LIVE_HLS_URL;
  const audioUrl = process.env.NEXT_PUBLIC_LIVE_AUDIO_URL;
  const youtubeId = process.env.NEXT_PUBLIC_YOUTUBE_LIVE_ID;

  useEffect(() => {
    const video = videoRef.current;
    if (mode !== "video" || !video || !hlsUrl) return;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = hlsUrl;
    } else if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(hlsUrl);
      hls.attachMedia(video);
      return () => hls.destroy();
    }
  }, [mode, hlsUrl]);

  if (mode === "video" && youtubeId) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Badge className="border-0 bg-red-600 text-white">
            <Radio className="mr-1 h-3 w-3 animate-pulse" />
            STREAM OFICIAL
          </Badge>
        </div>
        <div className="aspect-video overflow-hidden rounded-2xl border border-white/10">
          <iframe
            src={`https://www.youtube.com/embed/${youtubeId}?autoplay=0`}
            title="Transmissão ao vivo"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="h-full w-full"
          />
        </div>
      </div>
    );
  }

  if (mode === "video" && hlsUrl) {
    return (
      <div className="space-y-3">
        <Badge className="border-0 bg-red-600 text-white">
          <Radio className="mr-1 h-3 w-3 animate-pulse" />
          STREAM HLS
        </Badge>
        <div className="aspect-video overflow-hidden rounded-2xl border border-white/10 bg-black">
          <video
            ref={videoRef}
            controls
            playsInline
            className="h-full w-full"
          />
        </div>
      </div>
    );
  }

  if (mode === "audio" && audioUrl) {
    return (
      <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-6">
        <Badge className="border-0 bg-blue-600 text-white">
          <Radio className="mr-1 h-3 w-3 animate-pulse" />
          RÁDIO AO VIVO
        </Badge>
        <audio controls autoPlay src={audioUrl} className="w-full" />
      </div>
    );
  }

  return null;
}
