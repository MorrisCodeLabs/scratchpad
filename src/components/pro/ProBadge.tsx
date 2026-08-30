import { Sparkles } from "lucide-react";
import { cn } from "@/lib/cn";

export function ProBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-accent-soft px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent-ink",
        className,
      )}
    >
      <Sparkles size={10} />
      Pro
    </span>
  );
}
