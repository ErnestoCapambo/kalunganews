import Link from "next/link";
import { Globe2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { CategoryIcon } from "@/components/icons/category-icon";
import { RegionIcon } from "@/components/icons/region-icon";
import { CATEGORIES, REGIONS, SITE_NAME } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-white/10 bg-black/40">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-red-500 to-blue-600">
                <Globe2 className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold">{SITE_NAME}</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Notícias globais em tempo real. Cobertura internacional com
              categorias e atualizações contínuas.
            </p>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider">
              Categorias
            </h3>
            <ul className="space-y-2">
              {CATEGORIES.map((cat) => (
                <li key={cat.id}>
                  <Link
                    href={`/categoria/${cat.id}`}
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <CategoryIcon category={cat.id} className="h-3.5 w-3.5" />
                    {cat.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider">
              Regiões
            </h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {REGIONS.map((region) => (
                <li key={region.label} className="flex items-center gap-2">
                  <RegionIcon region={region.icon} />
                  {region.label}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider">
              Dados
            </h3>
            <p className="text-sm text-muted-foreground">
              Notícias fornecidas via{" "}
              <a
                href="https://newsapi.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-red-400 hover:underline"
              >
                NewsAPI
              </a>
              . Atualizado a cada 5 minutos.
            </p>
          </div>
        </div>

        <Separator className="my-8 bg-white/10" />

        <p className="text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} {SITE_NAME}. Todos os direitos reservados.
        </p>
        <a
          href="https://www.effectivecpmnetwork.com/fybr8v6rkj?key=31f2f112d9c23fad70d214dbed6aeba5"
          className="sr-only"
        >
          effectivecpmnetwork
        </a>
      </div>
    </footer>
  );
}
