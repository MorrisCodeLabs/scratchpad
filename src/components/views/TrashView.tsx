import { FileText, RotateCcw, Trash2 } from "lucide-react";
import { useNotes } from "@/lib/data/use-notes";
import { useWorkspaceContext } from "@/lib/workspace-context";

export function TrashView() {
  const { workspace } = useWorkspaceContext();
  const trashed = useNotes(workspace.id, { includeDeleted: true });

  return (
    <div className="mx-auto h-full max-w-4xl overflow-y-auto px-8 py-8">
      <h1 className="mb-1 text-2xl font-bold text-ink">Trash</h1>
      <p className="mb-6 text-sm text-muted">Deleted notes stay here until you remove them permanently.</p>

      {trashed.notes.length === 0 ? (
        <p className="py-16 text-center text-sm text-faint">Trash is empty.</p>
      ) : (
        <ul className="divide-y divide-line rounded-lg border border-line bg-surface">
          {trashed.notes.map((note) => (
            <li key={note.id} className="flex items-center gap-3 px-4 py-3">
              <FileText size={16} className="shrink-0 text-faint" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink">{note.title || "Untitled"}</p>
                <p className="truncate text-xs text-faint">
                  Deleted {note.deleted_at ? new Date(note.deleted_at).toLocaleString() : ""}
                </p>
              </div>
              <button
                type="button"
                title="Restore"
                onClick={() => trashed.restoreNote(note.id)}
                className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted hover:bg-surface-2 hover:text-ink"
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
                className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-danger hover:bg-danger-soft"
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
