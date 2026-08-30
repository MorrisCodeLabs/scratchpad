import { useMemo, useState } from "react";
import { FileText } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { Note } from "@/lib/types";

export function SplitNoteDialog({
  open,
  onOpenChange,
  notes,
  excludeNoteId,
  onSelect,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notes: Note[];
  excludeNoteId: string;
  onSelect: (noteId: string) => void;
}) {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return notes
      .filter((n) => n.id !== excludeNoteId)
      .filter((n) => !q || n.title.toLowerCase().includes(q))
      .slice(0, 30);
  }, [notes, excludeNoteId, query]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogTitle>Split right</DialogTitle>
        <DialogDescription>Open a second note side-by-side with this one.</DialogDescription>
        <div className="mt-3">
          <Input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search notes…"
            className="mb-2"
          />
          <div className="max-h-64 overflow-y-auto">
            {results.length === 0 ? (
              <p className="py-6 text-center text-xs text-faint">No notes found.</p>
            ) : (
              <div className="flex flex-col gap-0.5">
                {results.map((n) => (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => {
                      onSelect(n.id);
                      onOpenChange(false);
                    }}
                    className="flex items-center gap-2 truncate rounded-md px-2 py-1.5 text-left text-[13px] text-ink hover:bg-surface-2"
                  >
                    <FileText size={13} className="shrink-0 text-faint" />
                    <span className="truncate">{n.title || "Untitled"}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
