import { useMemo } from "react";
import { ShieldAlert } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { docToText } from "@/lib/text-stats";
import { similarityScore } from "@/lib/similarity";
import type { Note } from "@/lib/types";

const FLAG_THRESHOLD = 0.25;

export function SimilarityCheckDialog({
  open,
  onOpenChange,
  note,
  allNotes,
  onOpenNote,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  note: Note;
  allNotes: Note[];
  onOpenNote: (id: string) => void;
}) {
  const results = useMemo(() => {
    if (!open) return [];
    const thisText = docToText(note.content);
    if (!thisText.trim()) return [];
    return allNotes
      .filter((n) => n.id !== note.id)
      .map((n) => ({ note: n, score: similarityScore(thisText, docToText(n.content)) }))
      .filter((r) => r.score > 0.02)
      .sort((a, b) => b.score - a.score)
      .slice(0, 15);
  }, [open, note, allNotes]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogTitle className="flex items-center gap-2">
          <ShieldAlert size={16} /> Similarity check
        </DialogTitle>
        <DialogDescription>
          Compares this note's wording against every other note in this workspace — a same-workspace overlap check,
          not a web-wide plagiarism scan.
        </DialogDescription>

        <div className="mt-4 flex max-h-80 flex-col gap-1.5 overflow-y-auto">
          {results.length === 0 ? (
            <p className="py-6 text-center text-xs text-faint">No meaningful overlap with any other note.</p>
          ) : (
            results.map(({ note: n, score }) => {
              const pct = Math.round(score * 100);
              const flagged = score >= FLAG_THRESHOLD;
              return (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => {
                    onOpenNote(n.id);
                    onOpenChange(false);
                  }}
                  className="flex items-center justify-between gap-3 rounded-md px-2.5 py-2 text-left text-[13px] hover:bg-surface-2"
                >
                  <span className="min-w-0 flex-1 truncate text-ink">{n.title || "Untitled"}</span>
                  <span
                    className={
                      flagged
                        ? "shrink-0 rounded-full bg-warn-soft px-2 py-0.5 text-[11px] font-semibold text-warn"
                        : "shrink-0 text-[11px] text-faint"
                    }
                  >
                    {pct}% overlap
                  </span>
                </button>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
