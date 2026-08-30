import { useDraggable } from "@dnd-kit/core";
import { FileText, Trash2, Lock, Bell } from "lucide-react";
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
      style={{ paddingLeft: `${10 + indent * 14}px`, opacity: isDragging ? 0.4 : 1 }}
      className="group relative"
    >
      <button
        type="button"
        onClick={() => navigate({ name: "note", id: note.id })}
        className={cn(
          "flex w-full items-center gap-2 rounded-lg py-2 pr-8 text-left text-[13px] transition-colors",
          active ? "bg-accent-soft font-medium text-accent-ink" : "text-muted hover:bg-surface-2 hover:text-ink",
        )}
      >
        <FileText size={14} className="mr-1 shrink-0" />
        <span className="truncate">{note.title || "Untitled"}</span>
        {note.is_locked && <Lock size={11} className="ml-auto shrink-0 text-faint" />}
        {note.reminder_at && <Bell size={11} className="shrink-0 text-faint" />}
      </button>
      <button
        type="button"
        title="Move to trash"
        onClick={(e) => {
          e.stopPropagation();
          notes.trashNote(note.id);
          if (active) navigate({ name: "all-notes" });
        }}
        className="absolute right-2 top-1/2 hidden -translate-y-1/2 text-faint transition-colors hover:text-danger group-hover:block"
      >
        <Trash2 size={13} />
      </button>
    </div>
  );
}
