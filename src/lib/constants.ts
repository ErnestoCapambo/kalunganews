import type { NewsCategory } from "@/types/news";

export const CATEGORIES: {
  id: NewsCategory;
  label: string;
  color: string;
}[] = [
  { id: "general", label: "Geral", color: "from-blue-500 to-cyan-500" },
  { id: "business", label: "Negócios", color: "from-emerald-500 to-teal-500" },
  { id: "technology", label: "Tecnologia", color: "from-violet-500 to-purple-500" },
  { id: "sports", label: "Desporto", color: "from-orange-500 to-amber-500" },
  { id: "entertainment", label: "Entretenimento", color: "from-pink-500 to-rose-500" },
  { id: "health", label: "Saúde", color: "from-red-500 to-rose-500" },
  { id: "science", label: "Ciência", color: "from-indigo-500 to-blue-500" },
];

export const COUNTRIES: { code: string; label: string }[] = [
  { code: "us", label: "Estados Unidos" },
  { code: "gb", label: "Reino Unido" },
  { code: "br", label: "Brasil" },
  { code: "pt", label: "Portugal" },
  { code: "de", label: "Alemanha" },
  { code: "fr", label: "França" },
  { code: "jp", label: "Japão" },
  { code: "au", label: "Austrália" },
  { code: "ca", label: "Canadá" },
  { code: "in", label: "Índia" },
  { code: "mx", label: "México" },
  { code: "za", label: "África do Sul" },
];

export const REGIONS: { label: string; icon: "americas" | "europe" | "asia" | "africa" }[] = [
  { label: "Américas", icon: "americas" },
  { label: "Europa", icon: "europe" },
  { label: "Ásia-Pacífico", icon: "asia" },
  { label: "África", icon: "africa" },
];

export const SITE_NAME = "Kalunga News";
export const SITE_DESCRIPTION =
  "Notícias do mundo inteiro em tempo real — categorias, análises e breaking news.";
export const DEVELOPER_NAME = "Ernesto Sikilita Capambo";
