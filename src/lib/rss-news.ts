import Parser from "rss-parser";
import type { NewsArticle, NewsCategory, NewsResponse } from "@/types/news";

const parser = new Parser({
  customFields: {
    item: [
      ["media:content", "mediaContent", { keepArray: false }],
      ["media:thumbnail", "mediaThumbnail", { keepArray: false }],
    ],
  },
});

const CATEGORY_FEEDS: Record<NewsCategory, string[]> = {
  general: [
    "https://feeds.bbci.co.uk/news/world/rss.xml",
    "https://www.aljazeera.com/xml/rss/all.xml",
  ],
  business: ["https://feeds.bbci.co.uk/news/business/rss.xml"],
  technology: ["https://feeds.bbci.co.uk/news/technology/rss.xml"],
  sports: ["https://feeds.bbci.co.uk/sport/rss.xml"],
  entertainment: ["https://feeds.bbci.co.uk/news/entertainment_and_arts/rss.xml"],
  health: ["https://feeds.bbci.co.uk/news/health/rss.xml"],
  science: ["https://feeds.bbci.co.uk/news/science_and_environment/rss.xml"],
};

const COUNTRY_FEEDS: Record<string, string> = {
  us: "https://news.google.com/rss?hl=en-US&gl=US&ceid=US:en",
  gb: "https://feeds.bbci.co.uk/news/rss.xml",
  br: "https://news.google.com/rss?hl=pt-BR&gl=BR&ceid=BR:pt-419",
  pt: "https://news.google.com/rss?hl=pt-PT&gl=PT&ceid=PT:pt-150",
  de: "https://news.google.com/rss?hl=de&gl=DE&ceid=DE:de",
  fr: "https://news.google.com/rss?hl=fr&gl=FR&ceid=FR:fr",
  jp: "https://news.google.com/rss?hl=ja&gl=JP&ceid=JP:ja",
  au: "https://news.google.com/rss?hl=en-AU&gl=AU&ceid=AU:en",
  ca: "https://news.google.com/rss?hl=en-CA&gl=CA&ceid=CA:en",
  in: "https://news.google.com/rss?hl=en-IN&gl=IN&ceid=IN:en",
  mx: "https://news.google.com/rss?hl=es-419&gl=MX&ceid=MX:es-419",
  za: "https://news.google.com/rss?hl=en-ZA&gl=ZA&ceid=ZA:en",
};

const WORLD_COUNTRIES = ["us", "gb", "br", "de", "fr", "jp"];

type RssItem = Parser.Item & {
  mediaContent?: { $?: { url?: string } };
  mediaThumbnail?: { $?: { url?: string } };
};

function extractImage(item: RssItem): string | null {
  const media = item.mediaContent?.$?.url ?? item.mediaThumbnail?.$?.url;
  if (media) return media;
  if (item.enclosure?.url && item.enclosure.type?.startsWith("image")) {
    return item.enclosure.url;
  }
  return null;
}

function mapRssItem(item: RssItem, sourceName: string): NewsArticle | null {
  if (!item.title || !item.link) return null;

  return {
    source: { id: null, name: sourceName },
    author: item.creator ?? null,
    title: item.title,
    description: item.contentSnippet ?? item.content ?? null,
    url: item.link,
    urlToImage: extractImage(item),
    publishedAt: item.isoDate ?? new Date().toISOString(),
    content: item.content ?? null,
  };
}

async function parseFeed(url: string): Promise<NewsArticle[]> {
  try {
    const feed = await parser.parseURL(url);
    const sourceName = feed.title ?? new URL(url).hostname;

    return (feed.items ?? [])
      .map((item) => mapRssItem(item as RssItem, sourceName))
      .filter((a): a is NewsArticle => a !== null);
  } catch {
    return [];
  }
}

function dedupeAndSort(articles: NewsArticle[], limit: number): NewsArticle[] {
  return Array.from(new Map(articles.map((a) => [a.url, a])).values())
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    )
    .slice(0, limit);
}

export async function fetchRssHeadlines(options: {
  category?: NewsCategory;
  country?: string;
  pageSize?: number;
}): Promise<NewsResponse> {
  const { category, country, pageSize = 20 } = options;
  let articles: NewsArticle[] = [];

  if (country && COUNTRY_FEEDS[country]) {
    articles = await parseFeed(COUNTRY_FEEDS[country]);
  } else if (category) {
    const feeds = CATEGORY_FEEDS[category];
    const results = await Promise.all(feeds.map(parseFeed));
    articles = results.flat();
  } else {
    const feeds = CATEGORY_FEEDS.general;
    const results = await Promise.all(feeds.map(parseFeed));
    articles = results.flat();
  }

  const unique = dedupeAndSort(articles, pageSize);

  return {
    status: "ok",
    totalResults: unique.length,
    articles: unique,
  };
}

export async function fetchRssWorldHeadlines(
  category?: NewsCategory,
  pageSize = 30
): Promise<NewsResponse> {
  if (category) {
    return fetchRssHeadlines({ category, pageSize });
  }

  const results = await Promise.all(
    WORLD_COUNTRIES.map((code) => parseFeed(COUNTRY_FEEDS[code]))
  );

  const unique = dedupeAndSort(results.flat(), pageSize);

  return {
    status: "ok",
    totalResults: unique.length,
    articles: unique,
  };
}

export async function fetchRssSearch(
  query: string,
  pageSize = 20
): Promise<NewsResponse> {
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`;
  const articles = await parseFeed(url);
  const unique = dedupeAndSort(articles, pageSize);

  return {
    status: "ok",
    totalResults: unique.length,
    articles: unique,
  };
}
