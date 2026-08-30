import { useMemo } from "react";
import { Link2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useIsPro } from "@/lib/use-plan";
import { findBacklinks } from "@/lib/backlinks";
import type { Note } from "@/lib/types";

export function BacklinksPanel({
  note,
  allNotes,
  onNavigate,
}: {
  note: Note;
  allNotes: Note[];
  onNavigate: (id: string) => void;
}) {
  const isPro = useIsPro();
  const backlinks = useMemo(() => findBacklinks(allNotes, note.id), [allNotes, note.id]);

  if (!isPro) return null;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          title="Linked mentions"
          className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-faint hover:bg-surface-2"
        >
          <Link2 size={13} />
          Linked mentions
          {backlinks.length > 0 && <span className="tabular-nums">({backlinks.length})</span>}
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64">
        <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-faint">Linked mentions</p>
        {backlinks.length === 0 ? (
          <p className="text-xs text-faint">No other notes link here yet.</p>
        ) : (
          <div className="flex flex-col gap-0.5">
            {backlinks.map((n) => (
              <button
                key={n.id}
                type="button"
                onClick={() => onNavigate(n.id)}
                className="truncate rounded px-1.5 py-1 text-left text-xs text-muted hover:bg-surface-2 hover:text-ink"
              >
                {n.title || "Untitled"}
              </button>
            ))}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
