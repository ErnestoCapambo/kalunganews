"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";
import { pt } from "date-fns/locale";
import { ExternalLink, Clock, Newspaper } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { NewsArticle } from "@/types/news";
import { cn } from "@/lib/utils";

interface NewsCardProps {
  article: NewsArticle;
  index?: number;
  featured?: boolean;
  categoryLabel?: string;
}

export function NewsCard({
  article,
  index = 0,
  featured = false,
  categoryLabel,
}: NewsCardProps) {
  const timeAgo = formatDistanceToNow(new Date(article.publishedAt), {
    addSuffix: true,
    locale: pt,
  });

  const imageUrl = article.urlToImage;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ y: -4 }}
    >
      <Card
        className={cn(
          "group overflow-hidden border-white/10 bg-card/50 backdrop-blur-sm transition-all hover:border-red-500/30 hover:shadow-lg hover:shadow-red-500/5",
          featured && "md:col-span-2 md:row-span-2"
        )}
      >
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="block"
        >
          <div
            className={cn(
              "relative overflow-hidden bg-muted",
              featured ? "aspect-[16/9]" : "aspect-video"
            )}
          >
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={article.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes={featured ? "(max-width:768px) 100vw, 50vw" : "(max-width:768px) 100vw, 33vw"}
                unoptimized
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-gradient-to-br from-red-950/40 to-blue-950/40">
                <Newspaper className="h-12 w-12 text-muted-foreground/40" strokeWidth={1.25} />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            {categoryLabel && (
              <Badge className="absolute left-3 top-3 border-0 bg-red-600/90 text-white">
                {categoryLabel}
              </Badge>
            )}
            <ExternalLink className="absolute right-3 top-3 h-4 w-4 text-white/0 transition-all group-hover:text-white/80" />
          </div>

          <CardContent className={cn("p-4", featured && "p-6")}>
            <div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
              <span className="font-medium text-red-400">
                {article.source.name}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {timeAgo}
              </span>
            </div>
            <h3
              className={cn(
                "line-clamp-2 font-semibold leading-snug transition-colors group-hover:text-red-400",
                featured ? "text-xl md:text-2xl" : "text-base"
              )}
            >
              {article.title}
            </h3>
            {article.description && (
              <p
                className={cn(
                  "mt-2 line-clamp-2 text-muted-foreground",
                  featured ? "text-sm md:text-base" : "text-sm"
                )}
              >
                {article.description}
              </p>
            )}
          </CardContent>
        </a>
      </Card>
    </motion.div>
  );
}
