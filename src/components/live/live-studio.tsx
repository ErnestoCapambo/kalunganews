"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Peer, { type MediaConnection } from "peerjs";
import {
  Video,
  Mic,
  Radio,
  Square,
  Copy,
  Check,
  Users,
  SwitchCamera,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AudioVisualizer } from "@/components/live/audio-visualizer";
import {
  getMediaStream,
  isMobileDevice,
  listAudioInputDevices,
  listVideoInputDevices,
  primeMediaPermissions,
  stopMediaStream,
  type CaptureMode,
} from "@/lib/media-devices";
import { cn } from "@/lib/utils";

export type StreamMode = CaptureMode;

export function LiveStudio() {
  const [mode, setMode] = useState<StreamMode>("video");
  const [isLive, setIsLive] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [roomId, setRoomId] = useState("");
  const [viewers, setViewers] = useState(0);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedMic, setSelectedMic] = useState("");
  const [selectedCamera, setSelectedCamera] = useState("");
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [isMobile, setIsMobile] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const previewStreamRef = useRef<MediaStream | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const peerRef = useRef<Peer | null>(null);
  const callsRef = useRef<MediaConnection[]>([]);

  const refreshDevices = useCallback(async () => {
    try {
      await primeMediaPermissions(mode);
      const [audio, video] = await Promise.all([
        listAudioInputDevices(),
        listVideoInputDevices(),
      ]);
      setAudioDevices(audio);
      setVideoDevices(video);
      if (audio.length > 0 && !selectedMic) {
        setSelectedMic(audio[0].deviceId);
      }
      if (video.length > 0 && !selectedCamera) {
        setSelectedCamera(video[0].deviceId);
      }
    } catch {
      setAudioDevices([]);
      setVideoDevices([]);
    }
  }, [mode, selectedMic, selectedCamera]);

  useEffect(() => {
    setIsMobile(isMobileDevice());
    void refreshDevices();

    navigator.mediaDevices?.addEventListener("devicechange", refreshDevices);
    return () => {
      navigator.mediaDevices?.removeEventListener("devicechange", refreshDevices);
    };
  }, [refreshDevices]);

  const stopPreview = useCallback(() => {
    stopMediaStream(previewStreamRef.current);
    previewStreamRef.current = null;
    if (!isLive && videoRef.current) videoRef.current.srcObject = null;
    setIsPreviewing(false);
  }, [isLive]);

  const stopBroadcast = useCallback(() => {
    callsRef.current.forEach((call) => call.close());
    callsRef.current = [];
    stopMediaStream(streamRef.current);
    streamRef.current = null;
    setLocalStream(null);
    peerRef.current?.destroy();
    peerRef.current = null;
    stopPreview();
    if (videoRef.current) videoRef.current.srcObject = null;
    setIsLive(false);
    setViewers(0);
    setRoomId("");
  }, [stopPreview]);

  const buildMediaOptions = useCallback(() => {
    return {
      audioDeviceId: selectedMic || undefined,
      videoDeviceId:
        mode === "video" && !isMobile ? selectedCamera || undefined : undefined,
      facingMode: mode === "video" && isMobile ? facingMode : undefined,
    };
  }, [mode, selectedMic, selectedCamera, facingMode, isMobile]);

  const startPreview = async () => {
    if (mode !== "video") return;
    try {
      setError(null);
      stopPreview();
      const stream = await getMediaStream("video", buildMediaOptions());
      previewStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setIsPreviewing(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro na pré-visualização.");
    }
  };

  const switchMobileCamera = async () => {
    if (isLive) return;
    const next = facingMode === "user" ? "environment" : "user";
    setFacingMode(next);

    if (isPreviewing) {
      stopMediaStream(previewStreamRef.current);
      previewStreamRef.current = null;

      const stream = await getMediaStream("video", {
        audioDeviceId: selectedMic || undefined,
        facingMode: next,
      });

      previewStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    }
  };

  const startBroadcast = async () => {
    try {
      setError(null);
      stopPreview();
      const id = `kn-${Math.random().toString(36).slice(2, 8)}`;

      const peer = new Peer(id, {
        config: {
          iceServers: [
            { urls: "stun:stun.l.google.com:19302" },
            { urls: "stun:global.stun.twilio.com:3478" },
          ],
        },
      });
      peerRef.current = peer;

      await new Promise<void>((resolve, reject) => {
        peer.on("open", () => resolve());
        peer.on("error", (err) => reject(err));
      });

      const stream = await getMediaStream(mode, buildMediaOptions());
      streamRef.current = stream;
      setLocalStream(stream);

      if (mode === "video" && videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      await refreshDevices();

      peer.on("call", (call) => {
        if (!streamRef.current) return;
        call.answer(streamRef.current);
        callsRef.current.push(call);
        setViewers((v) => v + 1);
        call.on("close", () => {
          callsRef.current = callsRef.current.filter((c) => c !== call);
          setViewers((v) => Math.max(0, v - 1));
        });
      });

      setRoomId(id);
      setIsLive(true);
    } catch (err) {
      peerRef.current?.destroy();
      peerRef.current = null;
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível aceder à câmara ou microfone."
      );
    }
  };

  useEffect(() => () => stopBroadcast(), [stopBroadcast]);

  const copyLink = async () => {
    const url = `${window.location.origin}/ao-vivo?room=${roomId}&tab=assistir&mode=${mode}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <Button
          variant={mode === "video" ? "default" : "outline"}
          size="sm"
          onClick={() => {
            if (!isLive) {
              stopPreview();
              setMode("video");
            }
          }}
          disabled={isLive}
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
          onClick={() => {
            if (!isLive) {
              stopPreview();
              setMode("audio");
            }
          }}
          disabled={isLive}
          className={cn(
            mode === "audio" && "bg-gradient-to-r from-blue-600 to-blue-500"
          )}
        >
          <Mic className="mr-2 h-4 w-4" />
          Áudio
        </Button>
      </div>

      {mode === "video" && !isLive && (
        <div className="grid gap-4 sm:grid-cols-2">
          {!isMobile && (
            <div className="space-y-2 sm:col-span-2">
              <label
                htmlFor="camera-select"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                Câmara
              </label>
              {videoDevices.length > 0 ? (
                <select
                  id="camera-select"
                  value={selectedCamera}
                  onChange={(e) => {
                    setSelectedCamera(e.target.value);
                    stopPreview();
                  }}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-red-500/50"
                >
                  {videoDevices.map((device) => (
                    <option key={device.deviceId} value={device.deviceId}>
                      {device.label ||
                        `Câmara ${device.deviceId.slice(0, 8)}`}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="rounded-lg border border-amber-500/30 bg-amber-950/20 px-3 py-2 text-sm text-amber-200">
                  Nenhuma câmara detetada. Ligue USB, webcam ou capture card.
                </p>
              )}
            </div>
          )}

          {isMobile && (
            <div className="space-y-2 sm:col-span-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Câmara do telemóvel
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={facingMode === "user" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFacingMode("user")}
                >
                  Frontal
                </Button>
                <Button
                  type="button"
                  variant={facingMode === "environment" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFacingMode("environment")}
                >
                  Traseira
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={switchMobileCamera}
                  disabled={!isPreviewing || isLive}
                >
                  <SwitchCamera className="mr-2 h-4 w-4" />
                  Alternar
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label
              htmlFor="video-mic-select"
              className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
            >
              Microfone
            </label>
            <select
              id="video-mic-select"
              value={selectedMic}
              onChange={(e) => setSelectedMic(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-red-500/50"
            >
              {audioDevices.map((device) => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label || `Microfone ${device.deviceId.slice(0, 8)}`}
                </option>
              ))}
            </select>
          </div>

          {!isLive && (
            <div className="flex items-end">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={startPreview}
              >
                <Eye className="mr-2 h-4 w-4" />
                Pré-visualizar câmara
              </Button>
            </div>
          )}
        </div>
      )}

      {mode === "audio" && !isLive && (
        <div className="space-y-2">
          <label
            htmlFor="mic-select"
            className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
          >
            Microfone
          </label>
          {audioDevices.length > 0 ? (
            <select
              id="mic-select"
              value={selectedMic}
              onChange={(e) => setSelectedMic(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-blue-500/50"
            >
              {audioDevices.map((device) => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label || `Microfone ${device.deviceId.slice(0, 8)}`}
                </option>
              ))}
            </select>
          ) : (
            <p className="rounded-lg border border-amber-500/30 bg-amber-950/20 px-3 py-2 text-sm text-amber-200">
              Nenhum microfone detetado. O browser irá pedir permissão ao iniciar.
            </p>
          )}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/40">
        {mode === "video" ? (
          <div className="relative aspect-video bg-black">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="h-full w-full object-cover"
            />
            {!isLive && !isPreviewing && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/60">
                <Video className="h-12 w-12 text-muted-foreground" />
                <p className="px-4 text-center text-sm text-muted-foreground">
                  Selecione a câmara e clique em Pré-visualizar
                </p>
              </div>
            )}
            {isLive && (
              <Badge className="absolute left-4 top-4 border-0 bg-red-600 text-white">
                <Radio className="mr-1 h-3 w-3 animate-pulse" />
                AO VIVO
              </Badge>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-6 p-10">
            {isLive && localStream ? (
              <>
                <Badge className="border-0 bg-blue-600 text-white">
                  <Radio className="mr-1 h-3 w-3 animate-pulse" />
                  ÁUDIO AO VIVO
                </Badge>
                <AudioVisualizer stream={localStream} />
              </>
            ) : (
              <>
                <Mic className="h-12 w-12 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Transmissão apenas de áudio
                </p>
              </>
            )}
          </div>
        )}
      </div>

      {error && (
        <p className="rounded-lg border border-red-500/30 bg-red-950/30 px-4 py-3 text-sm text-red-300">
          {error}
        </p>
      )}

      {isLive && roomId && (
        <div className="rounded-xl border border-white/10 bg-white/5 p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Partilhar transmissão
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <code className="flex-1 rounded-lg bg-black/40 px-3 py-2 text-sm text-red-400">
              {roomId}
            </code>
            <Button variant="outline" size="sm" onClick={copyLink}>
              {copied ? (
                <Check className="mr-2 h-4 w-4 text-green-400" />
              ) : (
                <Copy className="mr-2 h-4 w-4" />
              )}
              {copied ? "Copiado!" : "Copiar link"}
            </Button>
          </div>
          <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Users className="h-3.5 w-3.5" />
            {viewers} espectador{viewers !== 1 ? "es" : ""} conectado
            {viewers !== 1 ? "s" : ""}
          </p>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        {!isLive ? (
          <Button
            onClick={startBroadcast}
            className="bg-gradient-to-r from-red-600 to-blue-600 hover:from-red-500 hover:to-blue-500"
          >
            <Radio className="mr-2 h-4 w-4" />
            Iniciar transmissão
          </Button>
        ) : (
          <Button variant="destructive" onClick={stopBroadcast}>
            <Square className="mr-2 h-4 w-4" />
            Terminar transmissão
          </Button>
        )}
        {isPreviewing && !isLive && (
          <Button variant="outline" onClick={stopPreview}>
            Parar pré-visualização
          </Button>
        )}
      </div>
    </div>
  );
}
