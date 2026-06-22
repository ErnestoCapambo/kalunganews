"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, Search, Globe2 } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { CategoryIcon } from "@/components/icons/category-icon";
import { CATEGORIES, SITE_NAME } from "@/lib/constants";
import { SearchDialog } from "@/components/news/search-dialog";

export function Header() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-white/10 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="group flex items-center gap-2">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-red-500 to-blue-600"
            >
              <Globe2 className="h-5 w-5 text-white" />
            </motion.div>
            <div>
              <span className="text-lg font-bold tracking-tight">
                {SITE_NAME}
              </span>
              <span className="ml-2 hidden text-xs text-red-400 sm:inline">
                LIVE
              </span>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {CATEGORIES.slice(0, 5).map((cat) => (
              <Link
                key={cat.id}
                href={`/categoria/${cat.id}`}
                className="rounded-full px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
              >
                {cat.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSearchOpen(true)}
              aria-label="Pesquisar"
            >
              <Search className="h-5 w-5" />
            </Button>

            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger
                className="inline-flex size-8 items-center justify-center rounded-lg hover:bg-muted md:hidden"
                aria-label="Menu"
              >
                <Menu className="h-5 w-5" />
              </SheetTrigger>
              <SheetContent side="right" className="w-80 border-white/10 bg-background/95 backdrop-blur-xl">
                <div className="mt-8 flex flex-col gap-2">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Categorias
                  </p>
                  {CATEGORIES.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/categoria/${cat.id}`}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-white/5"
                    >
                      <CategoryIcon category={cat.id} className="h-4 w-4 text-muted-foreground" />
                      <span>{cat.label}</span>
                    </Link>
                  ))}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}
