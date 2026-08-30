import { useEffect, useMemo, useState } from "react";
import { RotateCw, Check, X as XIcon } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { extractFlashcards, type Flashcard } from "@/lib/flashcards";
import { getCardStatus, setCardStatus } from "@/lib/flashcard-progress";
import { cn } from "@/lib/cn";

export function StudyModeDialog({
  open,
  onOpenChange,
  noteId,
  content,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  noteId: string;
  content: Record<string, unknown> | null | undefined;
}) {
  const allCards = useMemo(() => extractFlashcards(content), [content]);
  const [queue, setQueue] = useState<Flashcard[]>([]);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState(0);

  useEffect(() => {
    if (open) {
      setQueue(allCards);
      setFlipped(false);
      setKnown(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const current = queue[0];
  const priorStatus = current ? getCardStatus(noteId, current.front) : null;

  const markKnown = () => {
    if (!current) return;
    setCardStatus(noteId, current.front, "known");
    setKnown((k) => k + 1);
    setQueue((q) => q.slice(1));
    setFlipped(false);
  };

  const markLearning = () => {
    if (!current) return;
    setCardStatus(noteId, current.front, "learning");
    setQueue((q) => [...q.slice(1), current]);
    setFlipped(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogTitle>Study flashcards</DialogTitle>
        <DialogDescription>
          {allCards.length === 0
            ? "This note has no definition-list entries to study yet. Add a definition list (term + description) from the slash menu — every entry becomes a flashcard."
            : "Click the card to reveal the answer, then mark how well you knew it."}
        </DialogDescription>

        {allCards.length > 0 && (
          <div className="mt-4">
            {current ? (
              <>
                <p className="mb-2 text-center text-xs tabular-nums text-faint">
                  {known} known this session · {queue.length} remaining
                </p>
                <button
                  type="button"
                  onClick={() => setFlipped((f) => !f)}
                  className="relative flex min-h-40 w-full flex-col items-center justify-center gap-2 rounded-xl border border-line bg-surface-2 p-6 text-center transition-colors hover:bg-surface-2/70"
                >
                  {priorStatus && (
                    <span
                      className={cn(
                        "absolute right-3 top-3 rounded-full px-2 py-0.5 text-[10px] font-medium",
                        priorStatus === "known" ? "bg-good-soft text-good" : "bg-warn-soft text-warn",
                      )}
                    >
                      {priorStatus === "known" ? "Previously known" : "Still learning"}
                    </span>
                  )}
                  <span className="text-[11px] font-medium uppercase tracking-wide text-faint">
                    {flipped ? "Answer" : "Term"}
                  </span>
                  <span className="text-lg font-semibold text-ink">{flipped ? current.back : current.front}</span>
                  <span className="mt-2 flex items-center gap-1 text-xs text-faint">
                    <RotateCw size={11} /> Click to flip
                  </span>
                </button>
                <div className="mt-3 flex justify-center gap-2">
                  <Button variant="outline" size="sm" onClick={markLearning} disabled={!flipped}>
                    <XIcon size={13} /> Still learning
                  </Button>
                  <Button size="sm" onClick={markKnown} disabled={!flipped}>
                    <Check size={13} /> Know it
                  </Button>
                </div>
              </>
            ) : (
              <p className="py-10 text-center text-sm text-ink">
                🎉 You know all {allCards.length} card{allCards.length === 1 ? "" : "s"} in this note.
              </p>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
