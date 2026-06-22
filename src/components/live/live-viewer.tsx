"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Peer, { type MediaConnection } from "peerjs";
import { Video, Mic, Radio, Link2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AudioVisualizer } from "@/components/live/audio-visualizer";
import { ExternalStreamPlayer } from "@/components/live/external-stream-player";
import type { StreamMode } from "@/components/live/live-studio";
import { cn } from "@/lib/utils";

const PEER_CONFIG = {
  config: {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" },
      { urls: "stun:global.stun.twilio.com:3478" },
    ],
  },
};

const MAX_RETRIES = 6;
const RETRY_DELAY_MS = 2000;
const CONNECT_TIMEOUT_MS = 15000;

interface LiveViewerProps {
  initialRoom?: string;
  initialMode?: StreamMode;
}

function attachStreamToVideo(
  stream: MediaStream,
  videoRef: React.RefObject<HTMLVideoElement | null>
) {
  if (videoRef.current && stream.getVideoTracks().length > 0) {
    videoRef.current.srcObject = stream;
    void videoRef.current.play();
  }
}

export function LiveViewer({ initialRoom, initialMode }: LiveViewerProps) {
  const [mode, setMode] = useState<StreamMode>(initialMode ?? "video");
  const [roomId, setRoomId] = useState(initialRoom ?? "");
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const peerRef = useRef<Peer | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryRef = useRef(0);
  const activeRef = useRef(false);

  const clearConnectTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const disconnect = useCallback(() => {
    activeRef.current = false;
    clearConnectTimeout();
    peerRef.current?.destroy();
    peerRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setRemoteStream(null);
    setConnected(false);
    setConnecting(false);
    retryRef.current = 0;
  }, [clearConnectTimeout]);

  const handleCall = useCallback(
    (call: MediaConnection | undefined, targetRoom: string, retry: () => void) => {
      if (!call) {
        if (retryRef.current < MAX_RETRIES && activeRef.current) {
          retryRef.current += 1;
          retry();
          return;
        }
        disconnect();
        setError(
          "Sala não encontrada ou transmissão ainda não iniciada. Confirme o código e se o emissor está ao vivo."
        );
        return;
      }

      call.on("stream", (stream) => {
        clearConnectTimeout();
        setConnected(true);
        setConnecting(false);
        setRemoteStream(stream);
        attachStreamToVideo(stream, videoRef);
      });

      call.on("close", () => {
        disconnect();
        setError("Transmissão terminada.");
      });

      call.on("error", () => {
        if (retryRef.current < MAX_RETRIES && activeRef.current) {
          retryRef.current += 1;
          retry();
          return;
        }
        disconnect();
        setError("Não foi possível conectar à transmissão.");
      });
    },
    [clearConnectTimeout, disconnect]
  );

  const connect = useCallback(
    (targetRoom: string) => {
      const room = targetRoom.trim();
      if (!room) {
        setError("Introduza o código da sala.");
        return;
      }

      disconnect();
      activeRef.current = true;
      setError(null);
      setConnecting(true);

      const attempt = () => {
        if (!activeRef.current) return;

        peerRef.current?.destroy();
        const peer = new Peer(PEER_CONFIG);
        peerRef.current = peer;

        peer.on("open", () => {
          if (!activeRef.current) return;

          const emptyStream = new MediaStream();
          let call: MediaConnection | undefined;

          try {
            call = peer.call(room, emptyStream);
          } catch {
            call = undefined;
          }

          handleCall(call, room, attempt);
        });

        peer.on("error", () => {
          if (!activeRef.current) return;

          if (retryRef.current < MAX_RETRIES) {
            retryRef.current += 1;
            setTimeout(attempt, RETRY_DELAY_MS);
            return;
          }

          disconnect();
          setError("Sala não encontrada ou transmissão indisponível.");
        });

        clearConnectTimeout();
        timeoutRef.current = setTimeout(() => {
          if (!activeRef.current || connected) return;

          if (retryRef.current < MAX_RETRIES) {
            retryRef.current += 1;
            attempt();
            return;
          }

          disconnect();
          setError("Tempo esgotado. Verifique se a transmissão está ativa.");
        }, CONNECT_TIMEOUT_MS);
      };

      attempt();
    },
    [clearConnectTimeout, connected, disconnect, handleCall]
  );

  useEffect(() => {
    if (initialRoom) {
      connect(initialRoom);
    }
    return () => disconnect();
  }, [initialRoom, connect, disconnect]);

  const hasVideoStream = connected && (remoteStream?.getVideoTracks().length ?? 0) > 0;
  const hasAudioStream =
    connected && remoteStream && remoteStream.getAudioTracks().length > 0;

  return (
    <div className="space-y-6">
      <ExternalStreamPlayer mode={mode} />

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/10" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-background px-3 text-xs uppercase tracking-wider text-muted-foreground">
            ou conecte via WebRTC
          </span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          variant={mode === "video" ? "default" : "outline"}
          size="sm"
          onClick={() => setMode("video")}
          disabled={connected}
          className={cn(
            mode === "video" && "bg-gradient-to-r from-red-600 to-red-500"
          )}
        >
          <Video className="mr-2 h-4 w-4" />
          Vídeo
        </Button>
        <Button
          variant={mode === "audio" ? "default" : "outline"}
          size="sm"
          onClick={() => setMode("audio")}
          disabled={connected}
          className={cn(
            mode === "audio" && "bg-gradient-to-r from-blue-600 to-blue-500"
          )}
        >
          <Mic className="mr-2 h-4 w-4" />
          Áudio
        </Button>
      </div>

      {!connected && (
        <div className="flex flex-col gap-3 sm:flex-row">
          <Input
            placeholder="Código da sala (ex: kn-a3b9x2)"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            className="border-white/10 bg-white/5"
            onKeyDown={(e) => e.key === "Enter" && connect(roomId)}
          />
          <Button
            onClick={() => connect(roomId)}
            disabled={connecting}
            className="shrink-0"
          >
            {connecting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Link2 className="mr-2 h-4 w-4" />
            )}
            Conectar
          </Button>
        </div>
      )}

      {connecting && !connected && (
        <p className="text-center text-xs text-muted-foreground">
          A conectar… a transmissão precisa de estar ativa no emissor.
        </p>
      )}

      {error && (
        <p className="rounded-lg border border-red-500/30 bg-red-950/30 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      )}

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/40">
        {mode === "video" ? (
          <div className="relative aspect-video bg-black">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="h-full w-full object-contain"
            />
            {!hasVideoStream && !connecting && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                <Video className="h-12 w-12 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">
                  Aguardando transmissão de vídeo…
                </p>
              </div>
            )}
            {connecting && !hasVideoStream && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                <Loader2 className="h-10 w-10 animate-spin text-red-400" />
              </div>
            )}
            {hasVideoStream && (
              <Badge className="absolute left-4 top-4 border-0 bg-red-600 text-white">
                <Radio className="mr-1 h-3 w-3 animate-pulse" />
                AO VIVO
              </Badge>
            )}
            {connected && hasAudioStream && !hasVideoStream && remoteStream && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/80">
                <Badge className="border-0 bg-blue-600 text-white">
                  ÁUDIO AO VIVO
                </Badge>
                <AudioVisualizer stream={remoteStream} />
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-6 p-10">
            {hasAudioStream && remoteStream ? (
              <>
                <Badge className="border-0 bg-blue-600 text-white">
                  <Radio className="mr-1 h-3 w-3 animate-pulse" />
                  ÁUDIO AO VIVO
                </Badge>
                <AudioVisualizer stream={remoteStream} />
              </>
            ) : connecting ? (
              <Loader2 className="h-10 w-10 animate-spin text-blue-400" />
            ) : (
              <>
                <Mic className="h-12 w-12 text-muted-foreground/50" />
                <p className="text-sm text-muted-foreground">
                  Aguardando transmissão de áudio…
                </p>
              </>
            )}
          </div>
        )}
      </div>

      {connected && (
        <Button variant="outline" onClick={disconnect}>
          Desconectar
        </Button>
      )}
    </div>
  );
}
