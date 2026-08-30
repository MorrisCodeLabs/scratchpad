import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useWorkspaceContext } from "@/lib/workspace-context";
import { countMatchesInDoc, replaceTextInDoc } from "@/lib/replace-in-doc";
import { computeStats } from "@/lib/text-stats";

export function GlobalFindReplaceDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { notes } = useWorkspaceContext();
  const [find, setFind] = useState("");
  const [replace, setReplace] = useState("");
  const [working, setWorking] = useState(false);
  const [done, setDone] = useState<{ notes: number; occurrences: number } | null>(null);

  const results = useMemo(() => {
    if (!find) return [];
    return notes.notes
      .map((n) => ({ note: n, count: countMatchesInDoc(n.content, find) }))
      .filter((r) => r.count > 0);
  }, [notes.notes, find]);

  const totalOccurrences = results.reduce((sum, r) => sum + r.count, 0);

  const runReplace = async () => {
    setWorking(true);
    let occurrences = 0;
    for (const { note } of results) {
      const { doc, count } = replaceTextInDoc(note.content, find, replace);
      occurrences += count;
      const stats = computeStats(doc);
      await notes.updateNote(note.id, { content: doc as never, word_count: stats.wordCount, char_count: stats.charCount });
    }
    setDone({ notes: results.length, occurrences });
    setWorking(false);
    setFind("");
    setReplace("");
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) setDone(null);
      }}
    >
      <DialogContent className="max-w-md">
        <DialogTitle>Find and replace across notes</DialogTitle>
        <DialogDescription>Search every note in this workspace and replace matching text in one pass.</DialogDescription>
        <div className="mt-4 flex flex-col gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Find</label>
            <Input
              value={find}
              onChange={(e) => {
                setFind(e.target.value);
                setDone(null);
              }}
              placeholder="Text to find"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Replace with</label>
            <Input value={replace} onChange={(e) => setReplace(e.target.value)} placeholder="Replacement text" />
          </div>
          {find && (
            <p className="text-xs text-faint">
              {totalOccurrences > 0
                ? `${totalOccurrences} match${totalOccurrences === 1 ? "" : "es"} across ${results.length} note${results.length === 1 ? "" : "s"}.`
                : "No matches found."}
            </p>
          )}
          {done && (
            <p className="text-xs text-good">
              Replaced {done.occurrences} occurrence{done.occurrences === 1 ? "" : "s"} across {done.notes} note{done.notes === 1 ? "" : "s"}.
            </p>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <Button size="sm" disabled={!find || totalOccurrences === 0 || working} onClick={runReplace}>
              {working ? "Replacing…" : "Replace all"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
