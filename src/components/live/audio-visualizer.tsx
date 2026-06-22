"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface AudioVisualizerProps {
  stream: MediaStream | null;
  className?: string;
  barCount?: number;
}

export function AudioVisualizer({
  stream,
  className,
  barCount = 32,
}: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !stream) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const audioCtx = new AudioContext();
    const source = audioCtx.createMediaStreamSource(stream);
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 128;
    source.connect(analyser);

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      rafRef.current = requestAnimationFrame(draw);
      analyser.getByteFrequencyData(dataArray);

      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);

      const gap = 3;
      const barWidth = (width - gap * (barCount - 1)) / barCount;

      for (let i = 0; i < barCount; i++) {
        const index = Math.floor((i / barCount) * bufferLength);
        const value = dataArray[index] / 255;
        const barHeight = Math.max(4, value * height * 0.9);
        const x = i * (barWidth + gap);
        const y = (height - barHeight) / 2;

        const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight);
        gradient.addColorStop(0, "#ef4444");
        gradient.addColorStop(1, "#3b82f6");
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 2);
        ctx.fill();
      }
    };

    draw();

    return () => {
      cancelAnimationFrame(rafRef.current);
      source.disconnect();
      void audioCtx.close();
    };
  }, [stream, barCount]);

  return (
    <canvas
      ref={canvasRef}
      width={400}
      height={80}
      className={cn("w-full max-w-md rounded-lg bg-black/40", className)}
    />
  );
}
