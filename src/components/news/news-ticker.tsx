"use client";

import type { NewsArticle } from "@/types/news";

interface NewsTickerProps {
  articles: NewsArticle[];
}

export function NewsTicker({ articles }: NewsTickerProps) {
  const headlines = articles
    .filter((a) => a.title && a.title !== "[Removed]")
    .slice(0, 12);

  if (headlines.length === 0) return null;

  const items = [...headlines, ...headlines];

  return (
    <div className="relative overflow-hidden border-b border-red-500/20 bg-red-950/30">
      <div className="flex items-center">
        <div className="z-10 flex shrink-0 items-center gap-2 bg-red-600 px-4 py-2 text-xs font-bold uppercase tracking-widest text-white">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
          </span>
          Breaking
        </div>
        <div className="flex overflow-hidden">
          <div className="animate-ticker flex whitespace-nowrap">
            {items.map((article, i) => (
              <a
                key={`${article.url}-${i}`}
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-6 py-2 text-sm text-foreground/90 transition-colors hover:text-red-400"
              >
                {article.title}
                <span className="mx-6 text-muted-foreground">•</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
