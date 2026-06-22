"use client";

import { useState, useTransition } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NewsGrid } from "@/components/news/news-grid";
import { CountrySelector } from "@/components/news/country-selector";
import type { NewsArticle } from "@/types/news";

interface NewsFeedProps {
  initialArticles: NewsArticle[];
  category?: string;
  categoryLabel?: string;
}

export function NewsFeed({
  initialArticles,
  category,
  categoryLabel,
}: NewsFeedProps) {
  const [articles, setArticles] = useState(initialArticles);
  const [country, setCountry] = useState("");
  const [isPending, startTransition] = useTransition();

  function loadNews(selectedCountry: string) {
    setCountry(selectedCountry);
    startTransition(async () => {
      const params = new URLSearchParams({ pageSize: "24" });
      if (category) params.set("category", category);
      if (selectedCountry) {
        params.set("country", selectedCountry);
      } else {
        params.set("world", "true");
      }

      try {
        const res = await fetch(`/api/news?${params.toString()}`);
        const data = await res.json();
        setArticles(data.articles ?? []);
      } catch {
        /* keep current */
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <CountrySelector selected={country} onChange={loadNews} />
        <Button
          variant="outline"
          size="sm"
          disabled={isPending}
          onClick={() => loadNews(country)}
          className="shrink-0 border-white/10"
        >
          <RefreshCw
            className={`mr-2 h-4 w-4 ${isPending ? "animate-spin" : ""}`}
          />
          Atualizar
        </Button>
      </div>

      <div className={isPending ? "opacity-50 transition-opacity" : ""}>
        <NewsGrid articles={articles} categoryLabel={categoryLabel} />
      </div>
    </div>
  );
}
