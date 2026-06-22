"use client";

import { motion } from "framer-motion";
import { Globe2 } from "lucide-react";
import { CountryBadge } from "@/components/icons/country-badge";
import { COUNTRIES } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface CountrySelectorProps {
  selected: string;
  onChange: (code: string) => void;
}

export function CountrySelector({ selected, onChange }: CountrySelectorProps) {
  return (
    <div className="scrollbar-hide flex gap-2 overflow-x-auto pb-1">
      <button
        type="button"
        onClick={() => onChange("")}
        className={cn(
          "shrink-0 rounded-lg border px-3 py-1.5 text-sm transition-all",
          selected === ""
            ? "border-blue-500/50 bg-blue-950/40 text-blue-300"
            : "border-white/10 text-muted-foreground hover:border-white/20 hover:text-foreground"
        )}
      >
        <span className="inline-flex items-center gap-1.5">
          <Globe2 className="h-3.5 w-3.5" />
          Mundo
        </span>
      </button>
      {COUNTRIES.map((country) => (
        <motion.button
          key={country.code}
          type="button"
          whileTap={{ scale: 0.95 }}
          onClick={() => onChange(country.code)}
          className={cn(
            "shrink-0 rounded-lg border px-3 py-1.5 text-sm transition-all",
            selected === country.code
              ? "border-blue-500/50 bg-blue-950/40 text-blue-300"
              : "border-white/10 text-muted-foreground hover:border-white/20 hover:text-foreground"
          )}
        >
          <span className="inline-flex items-center gap-1.5">
            <CountryBadge code={country.code} />
            {country.label}
          </span>
        </motion.button>
      ))}
    </div>
  );
}
