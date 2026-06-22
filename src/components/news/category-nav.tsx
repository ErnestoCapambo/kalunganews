"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { LayoutGrid } from "lucide-react";
import { CategoryIcon } from "@/components/icons/category-icon";
import { CATEGORIES } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function CategoryNav() {
  const pathname = usePathname();

  return (
    <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-2">
      <Link
        href="/"
        className={cn(
          "relative shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors",
          pathname === "/"
            ? "text-white"
            : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
        )}
      >
        {pathname === "/" && (
          <motion.div
            layoutId="category-pill"
            className="absolute inset-0 rounded-full bg-gradient-to-r from-red-600 to-blue-600"
            transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
          />
        )}
        <span className="relative z-10 inline-flex items-center gap-1.5">
          <LayoutGrid className="h-3.5 w-3.5" />
          Todas
        </span>
      </Link>

      {CATEGORIES.map((cat) => {
        const href = `/categoria/${cat.id}`;
        const isActive = pathname === href;

        return (
          <Link
            key={cat.id}
            href={href}
            className={cn(
              "relative shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors",
              isActive
                ? "text-white"
                : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
            )}
          >
            {isActive && (
              <motion.div
                layoutId="category-pill"
                className={cn(
                  "absolute inset-0 rounded-full bg-gradient-to-r",
                  cat.color
                )}
                transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
              />
            )}
            <span className="relative z-10 inline-flex items-center gap-1.5">
              <CategoryIcon category={cat.id} className="h-3.5 w-3.5" />
              {cat.label}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
