import { Globe2, MapPin, Compass, Earth } from "lucide-react";
import { cn } from "@/lib/utils";

type RegionIconType = "americas" | "europe" | "asia" | "africa";

const REGION_ICONS = {
  americas: Earth,
  europe: Globe2,
  asia: Compass,
  africa: MapPin,
} as const;

interface RegionIconProps {
  region: RegionIconType;
  className?: string;
}

export function RegionIcon({ region, className }: RegionIconProps) {
  const Icon = REGION_ICONS[region];
  return <Icon className={cn("h-4 w-4 shrink-0 text-muted-foreground", className)} aria-hidden />;
}
