"use client";

import { useState, useTransition } from "react";
import { Search, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { NewsCard } from "@/components/news/news-card";
import type { NewsArticle } from "@/types/news";

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<NewsArticle[]>([]);
  const [isPending, startTransition] = useTransition();

  function handleSearch(value: string) {
    setQuery(value);
    if (value.trim().length < 2) {
      setResults([]);
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch(
          `/api/news?q=${encodeURIComponent(value)}&pageSize=12`
        );
        const data = await res.json();
        setResults(data.articles ?? []);
      } catch {
        setResults([]);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto border-white/10 bg-background/95 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="h-5 w-5 text-red-400" />
            Pesquisar notícias
          </DialogTitle>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Digite palavras-chave..."
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            className="border-white/10 bg-white/5 pl-10"
            autoFocus
          />
          {isPending && (
            <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
          )}
        </div>

        {results.length > 0 && (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {results.map((article, i) => (
              <NewsCard key={article.url} article={article} index={i} />
            ))}
          </div>
        )}

        {query.length >= 2 && !isPending && results.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Nenhum resultado para &quot;{query}&quot;
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
