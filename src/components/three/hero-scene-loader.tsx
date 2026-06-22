"use client";

import dynamic from "next/dynamic";

export const HeroScene = dynamic(
  () => import("./hero-scene").then((m) => m.HeroScene),
  {
    ssr: false,
    loading: () => (
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-red-950/20 via-transparent to-blue-950/20" />
    ),
  }
);
