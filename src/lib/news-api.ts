import type { NewsCategory, NewsQueryParams, NewsResponse } from "@/types/news";
import {
  fetchRssHeadlines,
  fetchRssSearch,
  fetchRssWorldHeadlines,
} from "@/lib/rss-news";

const BASE_URL = "https://newsapi.org/v2";

function getApiKey(): string | undefined {
  return process.env.NEWS_API_KEY;
}

async function fetchFromNewsApi(
  endpoint: "top-headlines" | "everything",
  params: Record<string, string>
): Promise<NewsResponse | null> {
  const apiKey = getApiKey();
  if (!apiKey) return null;

  const searchParams = new URLSearchParams(params);

  try {
    const response = await fetch(`${BASE_URL}/${endpoint}?${searchParams}`, {
      headers: { "X-Api-Key": apiKey },
      next: { revalidate: 300 },
    });

    if (!response.ok) return null;

    const data: NewsResponse = await response.json();
    if (data.status !== "ok" || !data.articles?.length) return null;

    return data;
  } catch {
    return null;
  }
}

export async function fetchTopHeadlines(
  params: NewsQueryParams = {}
): Promise<NewsResponse> {
  const queryParams: Record<string, string> = {
    pageSize: String(params.pageSize ?? 20),
    page: String(params.page ?? 1),
  };

  if (params.category) queryParams.category = params.category;
  if (params.country) queryParams.country = params.country;
  if (params.q) queryParams.q = params.q;

  const newsApi = await fetchFromNewsApi("top-headlines", queryParams);
  if (newsApi) return newsApi;

  return fetchRssHeadlines({
    category: params.category,
    country: params.country,
    pageSize: params.pageSize ?? 20,
  });
}

export async function searchEverything(
  query: string,
  pageSize = 20
): Promise<NewsResponse> {
  const newsApi = await fetchFromNewsApi("everything", {
    q: query,
    sortBy: "publishedAt",
    language: "en",
    pageSize: String(pageSize),
  });

  if (newsApi) return newsApi;

  return fetchRssSearch(query, pageSize);
}

export async function fetchWorldHeadlines(
  category?: NewsCategory
): Promise<NewsResponse> {
  const countries = ["us", "gb", "br", "de", "fr", "jp"];

  const newsApiResults = await Promise.allSettled(
    countries.map((country) =>
      fetchFromNewsApi("top-headlines", {
        country,
        ...(category ? { category } : {}),
        pageSize: "5",
      })
    )
  );

  const newsApiArticles = newsApiResults
    .filter(
      (r): r is PromiseFulfilledResult<NewsResponse | null> =>
        r.status === "fulfilled" && r.value !== null
    )
    .flatMap((r) => r.value!.articles)
    .filter((a) => a.title && a.title !== "[Removed]");

  if (newsApiArticles.length > 0) {
    const unique = Array.from(
      new Map(newsApiArticles.map((a) => [a.url, a])).values()
    )
      .sort(
        (a, b) =>
          new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      )
      .slice(0, 30);

    return {
      status: "ok",
      totalResults: unique.length,
      articles: unique,
    };
  }

  return fetchRssWorldHeadlines(category, 30);
}

export function isValidCategory(value: string): value is NewsCategory {
  return [
    "general",
    "business",
    "technology",
    "sports",
    "entertainment",
    "health",
    "science",
  ].includes(value);
}
