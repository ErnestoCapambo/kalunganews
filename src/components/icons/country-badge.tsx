import { cn } from "@/lib/utils";

interface CountryBadgeProps {
  code: string;
  className?: string;
}

export function CountryBadge({ code, className }: CountryBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex h-5 min-w-[1.25rem] shrink-0 items-center justify-center rounded border border-white/15 bg-white/10 px-1 text-[10px] font-bold uppercase tracking-wide",
        className
      )}
    >
      {code}
    </span>
  );
}
