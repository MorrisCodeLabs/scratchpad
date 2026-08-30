import { useDraggable } from "@dnd-kit/core";
import { FileText, Trash2 } from "lucide-react";
import { useWorkspaceContext } from "@/lib/workspace-context";
import type { Note } from "@/lib/types";
import { cn } from "@/lib/cn";

export function NoteRow({ note, active, indent }: { note: Note; active: boolean; indent: number }) {
  const { navigate, notes } = useWorkspaceContext();
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: `note:${note.id}` });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={{ paddingLeft: `${8 + indent * 14}px`, opacity: isDragging ? 0.4 : 1 }}
      className="group relative"
    >
      <button
        type="button"
        onClick={() => navigate({ name: "note", id: note.id })}
        className={cn(
          "flex w-full items-center gap-2 rounded-md py-1.5 pr-7 text-left text-sm",
          active ? "bg-accent-soft text-accent-ink" : "text-muted hover:bg-surface-2 hover:text-ink",
        )}
      >
        <FileText size={14} className="shrink-0" />
        <span className="truncate">{note.title || "Untitled"}</span>
      </button>
      <button
        type="button"
        title="Move to trash"
        onClick={(e) => {
          e.stopPropagation();
          notes.trashNote(note.id);
          if (active) navigate({ name: "all-notes" });
        }}
        className="absolute right-1.5 top-1/2 hidden -translate-y-1/2 text-faint hover:text-danger group-hover:block"
      >
        <Trash2 size={13} />
      </button>
    </div>
  );
}
