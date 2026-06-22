import { NewsTicker } from "@/components/news/news-ticker";
import { HeroSection } from "@/components/news/hero-section";
import { CategoryNav } from "@/components/news/category-nav";
import { NewsFeed } from "@/components/news/news-feed";
import { fetchWorldHeadlines, fetchTopHeadlines } from "@/lib/news-api";

export const revalidate = 300;

export default async function HomePage() {
  let worldNews;
  let tickerNews;

  try {
    [worldNews, tickerNews] = await Promise.all([
      fetchWorldHeadlines(),
      fetchTopHeadlines({ category: "general", pageSize: 15 }),
    ]);
  } catch {
    worldNews = { status: "ok", totalResults: 0, articles: [] };
    tickerNews = { status: "ok", totalResults: 0, articles: [] };
  }

  const featured = worldNews.articles[0];

  return (
    <>
      <NewsTicker articles={tickerNews.articles} />
      <HeroSection featured={featured} />

      <section id="noticias" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Últimas do Mundo
          </h2>
          <p className="mt-2 text-muted-foreground">
            Notícias agregadas de múltiplas regiões — filtre por país ou
            categoria.
          </p>
        </div>

        <div className="mb-8">
          <CategoryNav />
        </div>

        <NewsFeed initialArticles={worldNews.articles} />
      </section>
    </>
  );
}
