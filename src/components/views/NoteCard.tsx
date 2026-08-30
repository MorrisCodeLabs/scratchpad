import { format } from "date-fns";
import { FileText, Pin, Star, Circle, CircleDot, CircleCheck, Archive } from "lucide-react";
import type { Note, NoteStatus } from "@/lib/types";
import { cn } from "@/lib/cn";

const STATUS: Record<NoteStatus, { label: string; icon: typeof Circle; className: string }> = {
  draft: { label: "Draft", icon: Circle, className: "text-faint bg-surface-2" },
  active: { label: "Active", icon: CircleDot, className: "text-accent-ink bg-accent-soft" },
  completed: { label: "Completed", icon: CircleCheck, className: "text-good bg-good-soft" },
  archived: { label: "Archived", icon: Archive, className: "text-warn bg-warn-soft" },
};

export function NoteCard({ note, onOpen }: { note: Note; onOpen: () => void }) {
  const status = STATUS[note.status];
  const StatusIcon = status.icon;

  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        "group flex flex-col gap-3 rounded-2xl bg-surface p-4 text-left shadow-[0_1px_2px_rgba(0,0,0,0.04)]",
        "outline-none transition-[transform,box-shadow,background-color] duration-150",
        "hover:-translate-y-0.5 hover:bg-surface-2 hover:shadow-[0_8px_20px_rgba(0,0,0,0.08)]",
        "focus-visible:outline-none focus-visible:shadow-[0_0_0_4px_var(--sp-accent-soft)]",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent-soft text-accent-ink">
          <FileText size={16} />
        </span>
        <span className="shrink-0 rounded-full bg-surface-2 px-2 py-0.5 text-[10px] font-medium tabular-nums text-faint">
          {format(new Date(note.created_at), "MMMM do, yyyy")}
        </span>
      </div>

      <div className="min-w-0">
        <p className="line-clamp-2 text-sm font-semibold leading-snug text-ink">{note.title || "Untitled"}</p>
        <p className="mt-1 text-xs text-faint">{note.word_count} words</p>
      </div>

      <div className="mt-auto flex items-center gap-1.5 pt-1">
        <span
          className={cn(
            "flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
            status.className,
          )}
        >
          <StatusIcon size={11} />
          {status.label}
        </span>
        {note.is_pinned && (
          <span className="flex h-5 w-5 items-center justify-center rounded-full text-faint">
            <Pin size={12} />
          </span>
        )}
        {note.is_favorite && (
          <span className="flex h-5 w-5 items-center justify-center rounded-full text-warn">
            <Star size={12} className="fill-current" />
          </span>
        )}
      </div>
    </button>
  );
}
