import { notFound } from "next/navigation";
import { NewsTicker } from "@/components/news/news-ticker";
import { CategoryNav } from "@/components/news/category-nav";
import { NewsFeed } from "@/components/news/news-feed";
import { CategoryIcon } from "@/components/icons/category-icon";
import { CATEGORIES } from "@/lib/constants";
import {
  fetchTopHeadlines,
  fetchWorldHeadlines,
  isValidCategory,
} from "@/lib/news-api";
import type { NewsCategory } from "@/types/news";

export const revalidate = 300;

interface CategoryPageProps {
  params: Promise<{ category: string }>;
}

export async function generateStaticParams() {
  return CATEGORIES.map((cat) => ({ category: cat.id }));
}

export async function generateMetadata({ params }: CategoryPageProps) {
  const { category } = await params;
  const cat = CATEGORIES.find((c) => c.id === category);
  return {
    title: cat ? cat.label : "Categoria",
    description: `Notícias de ${cat?.label ?? category} em tempo real.`,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await params;

  if (!isValidCategory(category)) {
    notFound();
  }

  const catInfo = CATEGORIES.find((c) => c.id === category)!;

  let news;
  let tickerNews;

  try {
    [news, tickerNews] = await Promise.all([
      fetchWorldHeadlines(category as NewsCategory),
      fetchTopHeadlines({ category: category as NewsCategory, pageSize: 12 }),
    ]);
  } catch {
    news = { status: "ok", totalResults: 0, articles: [] };
    tickerNews = { status: "ok", totalResults: 0, articles: [] };
  }

  return (
    <>
      <NewsTicker articles={tickerNews.articles} />

      <section className="border-b border-white/10 bg-gradient-to-r from-red-950/20 via-transparent to-blue-950/20">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-red-500/20 to-blue-500/20 ring-1 ring-white/10">
              <CategoryIcon category={catInfo.id} className="h-7 w-7 text-red-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                {catInfo.label}
              </h1>
              <p className="mt-1 text-muted-foreground">
                Notícias de {catInfo.label.toLowerCase()} de todo o mundo
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <CategoryNav />
        </div>

        <NewsFeed
          initialArticles={news.articles}
          category={category}
          categoryLabel={catInfo.label}
        />
      </section>
    </>
  );
}
