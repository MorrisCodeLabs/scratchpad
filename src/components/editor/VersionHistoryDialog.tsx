import { formatDistanceToNow } from "date-fns";
import { History, RotateCcw, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useNoteVersions, createNoteVersion } from "@/lib/data/use-note-versions";
import type { Note, NoteVersion } from "@/lib/types";

export function VersionHistoryDialog({
  open,
  onOpenChange,
  note,
  currentTitle,
  currentContent,
  currentWordCount,
  onRestore,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  note: Note;
  currentTitle: string;
  currentContent: Record<string, unknown>;
  currentWordCount: number;
  onRestore: (version: NoteVersion) => void;
}) {
  const { versions, loading, deleteVersion, reload } = useNoteVersions(open ? note.id : undefined);

  const restore = async (version: NoteVersion) => {
    // Snapshot the current state first so restoring is itself undoable.
    await createNoteVersion(note.workspace_id, note.id, currentTitle, currentContent, currentWordCount);
    onRestore(version);
    onOpenChange(false);
    reload();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogTitle className="flex items-center gap-2">
          <History size={16} /> Version history
        </DialogTitle>
        <DialogDescription>Snapshots are saved automatically as you edit. Restoring saves the current version too.</DialogDescription>

        <div className="mt-3 max-h-80 overflow-y-auto">
          {loading ? (
            <p className="py-6 text-center text-sm text-faint">Loading…</p>
          ) : versions.length === 0 ? (
            <p className="py-6 text-center text-sm text-faint">
              No versions yet — one gets saved automatically after a few minutes of editing.
            </p>
          ) : (
            <ul className="flex flex-col gap-1">
              {versions.map((v) => (
                <li key={v.id} className="flex items-center gap-2 rounded-md px-2 py-2 hover:bg-surface-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">{v.title || "Untitled"}</p>
                    <p className="text-xs text-faint">
                      {formatDistanceToNow(new Date(v.created_at), { addSuffix: true })} · {v.word_count} words
                    </p>
                  </div>
                  <button
                    type="button"
                    title="Restore this version"
                    onClick={() => restore(v)}
                    className="flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted hover:bg-surface hover:text-ink"
                  >
                    <RotateCcw size={12} /> Restore
                  </button>
                  <button
                    type="button"
                    title="Delete this version"
                    onClick={() => deleteVersion(v.id)}
                    className="rounded-md p-1 text-faint hover:text-danger"
                  >
                    <Trash2 size={13} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
