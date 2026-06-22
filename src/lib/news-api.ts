import type { NewsCategory, NewsQueryParams, NewsResponse } from "@/types/news";

const BASE_URL = "https://newsapi.org/v2";

function getApiKey(): string {
  const key = process.env.NEWS_API_KEY;
  if (!key) {
    throw new Error("NEWS_API_KEY não configurada");
  }
  return key;
}

export async function fetchTopHeadlines(
  params: NewsQueryParams = {}
): Promise<NewsResponse> {
  const searchParams = new URLSearchParams({
    apiKey: getApiKey(),
    pageSize: String(params.pageSize ?? 20),
    page: String(params.page ?? 1),
  });

  if (params.category) searchParams.set("category", params.category);
  if (params.country) searchParams.set("country", params.country);
  if (params.q) searchParams.set("q", params.q);

  const response = await fetch(
    `${BASE_URL}/top-headlines?${searchParams.toString()}`,
    { next: { revalidate: 300 } }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      (error as { message?: string }).message ?? "Erro ao buscar notícias"
    );
  }

  return response.json();
}

export async function searchEverything(
  query: string,
  pageSize = 20
): Promise<NewsResponse> {
  const searchParams = new URLSearchParams({
    apiKey: getApiKey(),
    q: query,
    sortBy: "publishedAt",
    language: "en",
    pageSize: String(pageSize),
  });

  const response = await fetch(
    `${BASE_URL}/everything?${searchParams.toString()}`,
    { next: { revalidate: 300 } }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(
      (error as { message?: string }).message ?? "Erro na pesquisa"
    );
  }

  return response.json();
}

export async function fetchWorldHeadlines(
  category?: NewsCategory
): Promise<NewsResponse> {
  const countries = ["us", "gb", "br", "de", "fr", "jp"];

  const results = await Promise.allSettled(
    countries.map((country) =>
      fetchTopHeadlines({ country, category, pageSize: 5 })
    )
  );

  const articles = results
    .filter(
      (r): r is PromiseFulfilledResult<NewsResponse> => r.status === "fulfilled"
    )
    .flatMap((r) => r.value.articles)
    .filter((a) => a.title && a.title !== "[Removed]")
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );

  const unique = Array.from(
    new Map(articles.map((a) => [a.url, a])).values()
  ).slice(0, 30);

  return {
    status: "ok",
    totalResults: unique.length,
    articles: unique,
  };
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
