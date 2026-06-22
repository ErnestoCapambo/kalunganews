import { NextRequest, NextResponse } from "next/server";
import {
  fetchTopHeadlines,
  fetchWorldHeadlines,
  isValidCategory,
  searchEverything,
} from "@/lib/news-api";
import type { NewsCategory } from "@/types/news";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const category = searchParams.get("category");
  const country = searchParams.get("country");
  const q = searchParams.get("q");
  const world = searchParams.get("world") === "true";
  const pageSize = Number(searchParams.get("pageSize") ?? 20);

  try {
    if (q) {
      const data = await searchEverything(q, pageSize);
      return NextResponse.json(data);
    }

    if (world) {
      const cat = category && isValidCategory(category) ? category : undefined;
      const data = await fetchWorldHeadlines(cat);
      return NextResponse.json(data);
    }

    const data = await fetchTopHeadlines({
      category:
        category && isValidCategory(category)
          ? (category as NewsCategory)
          : undefined,
      country: country ?? undefined,
      pageSize,
    });

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro desconhecido" },
      { status: 500 }
    );
  }
}
