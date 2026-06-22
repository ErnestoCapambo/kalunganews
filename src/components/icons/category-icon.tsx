import {
  Globe2,
  Briefcase,
  Cpu,
  Trophy,
  Clapperboard,
  HeartPulse,
  FlaskConical,
  type LucideIcon,
} from "lucide-react";
import type { NewsCategory } from "@/types/news";
import { cn } from "@/lib/utils";

const CATEGORY_ICONS: Record<NewsCategory, LucideIcon> = {
  general: Globe2,
  business: Briefcase,
  technology: Cpu,
  sports: Trophy,
  entertainment: Clapperboard,
  health: HeartPulse,
  science: FlaskConical,
};

interface CategoryIconProps {
  category: NewsCategory;
  className?: string;
}

export function CategoryIcon({ category, className }: CategoryIconProps) {
  const Icon = CATEGORY_ICONS[category];
  return <Icon className={cn("shrink-0", className)} aria-hidden />;
}
