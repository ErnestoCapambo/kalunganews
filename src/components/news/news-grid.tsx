import { Inbox } from "lucide-react";
import type { NewsArticle } from "@/types/news";
import { NewsCard } from "./news-card";

interface NewsGridProps {
  articles: NewsArticle[];
  categoryLabel?: string;
  featuredFirst?: boolean;
}

export function NewsGrid({
  articles,
  categoryLabel,
  featuredFirst = true,
}: NewsGridProps) {
  const filtered = articles.filter(
    (a) => a.title && a.title !== "[Removed]"
  );

  if (filtered.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted/50 ring-1 ring-white/10">
          <Inbox className="h-8 w-8 text-muted-foreground" strokeWidth={1.5} />
        </div>
        <h3 className="text-lg font-semibold">Nenhuma notícia encontrada</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Tente outra categoria ou região.
        </p>
      </div>
    );
  }

  const featured = featuredFirst ? filtered[0] : null;
  const rest = featuredFirst ? filtered.slice(1) : filtered;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {featured && (
        <NewsCard
          article={featured}
          featured
          categoryLabel={categoryLabel}
        />
      )}
      {rest.map((article, i) => (
        <NewsCard
          key={article.url}
          article={article}
          index={i + 1}
          categoryLabel={categoryLabel}
        />
      ))}
    </div>
  );
}
