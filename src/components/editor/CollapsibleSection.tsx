import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/cn";

// Mirrors the "Favorites"/"Notes" collapsible section header used in the
// left sidebar (Sidebar.tsx) — same uppercase caption + rotating chevron —
// so the note-properties/format rail on the right reads as one family.
export function CollapsibleSection({
  label,
  defaultOpen = true,
  children,
}: {
  label: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-line/60 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-1.5 px-3 py-2 text-left text-[10.5px] font-semibold uppercase tracking-wider text-faint transition-colors hover:text-ink"
      >
        {label}
        <ChevronDown size={12} className={cn("ml-auto shrink-0 transition-transform", open ? "" : "-rotate-90")} />
      </button>
      {open && <div className="pb-1.5">{children}</div>}
    </div>
  );
}
