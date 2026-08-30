import { FileText, RotateCcw, Trash2 } from "lucide-react";
import { useWorkspaceContext } from "@/lib/workspace-context";

export function TrashView() {
  const { trashedNotes: trashed } = useWorkspaceContext();

  return (
    <div className="mx-auto h-full max-w-4xl overflow-y-auto px-10 py-10">
      <h1 className="mb-1.5 text-[1.7rem] font-bold tracking-tight text-ink">Trash</h1>
      <p className="mb-8 text-[13px] text-muted">Deleted notes stay here until you remove them permanently.</p>

      {trashed.notes.length === 0 ? (
        <p className="py-16 text-center text-sm text-faint">Trash is empty.</p>
      ) : (
        <ul className="divide-y divide-line rounded-xl border border-line bg-surface">
          {trashed.notes.map((note) => (
            <li key={note.id} className="flex items-center gap-3 px-5 py-3.5">
              <FileText size={16} className="shrink-0 text-faint" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium text-ink">{note.title || "Untitled"}</p>
                <p className="truncate text-xs text-faint">
                  Deleted {note.deleted_at ? new Date(note.deleted_at).toLocaleString() : ""}
                </p>
              </div>
              <button
                type="button"
                title="Restore"
                onClick={() => trashed.restoreNote(note.id)}
                className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-muted transition-colors hover:bg-surface-2 hover:text-ink"
              >
                <RotateCcw size={13} /> Restore
              </button>
              <button
                type="button"
                title="Delete permanently"
                onClick={() => {
                  if (confirm(`Permanently delete "${note.title || "Untitled"}"? This can't be undone.`)) {
                    trashed.deleteNotePermanently(note.id);
                  }
                }}
                className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-danger transition-colors hover:bg-danger-soft"
              >
                <Trash2 size={13} /> Delete forever
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
