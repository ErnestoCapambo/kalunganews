"use client";

import { motion } from "framer-motion";
import { ArrowRight, Radio } from "lucide-react";
import { HeroScene } from "@/components/three/hero-scene-loader";
import type { NewsArticle } from "@/types/news";

interface HeroSectionProps {
  featured?: NewsArticle;
}

export function HeroSection({ featured }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden border-b border-white/10">
      <HeroScene />

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background/30 via-background/60 to-background" />

      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="max-w-3xl"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-950/40 px-4 py-1.5 text-xs font-medium text-red-300">
            <Radio className="h-3 w-3 animate-pulse" />
            Notícias globais em tempo real
          </div>

          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            <span className="bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-transparent">
              O mundo,
            </span>
            <br />
            <span className="bg-gradient-to-r from-red-400 to-blue-500 bg-clip-text text-transparent">
              em tempo real.
            </span>
          </h1>

          <p className="mt-6 max-w-xl text-lg text-muted-foreground">
            Cobertura internacional com categorias, regiões e breaking news de
            mais de 50 países. Atualizado continuamente.
          </p>

          {featured && (
            <motion.a
              href={featured.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-8 block max-w-2xl rounded-xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm transition-colors hover:border-red-500/30 hover:bg-white/10"
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-red-400">
                Destaque • {featured.source.name}
              </p>
              <p className="mt-2 text-lg font-semibold leading-snug">
                {featured.title}
              </p>
              {featured.description && (
                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                  {featured.description}
                </p>
              )}
            </motion.a>
          )}

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#noticias"
              className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-red-600 to-red-500 px-4 text-sm font-medium text-white transition-all hover:from-red-500 hover:to-red-400"
            >
              Ver notícias
              <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="/categoria/technology"
              className="inline-flex h-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 px-4 text-sm font-medium transition-all hover:bg-white/10"
            >
              Tecnologia
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
