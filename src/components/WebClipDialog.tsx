import { useState } from "react";
import { Globe2 } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useWorkspaceContext } from "@/lib/workspace-context";
import { useWebClipDialog } from "@/lib/use-web-clip-dialog";

function titleFromUrl(url: string) {
  try {
    const u = new URL(url);
    return u.hostname.replace(/^www\./, "");
  } catch {
    return "Clipped page";
  }
}

// A "basic" web clip: save a link as a new note with the page embedded and
// a spot to jot down notes about it. There's no server-side fetch/scrape
// here — that would need a backend crawler this app doesn't have — so the
// note is seeded with the link itself (rendered as an embed) rather than
// the page's actual content.
export function WebClipDialog() {
  const { isOpen, close } = useWebClipDialog();
  const { workspace, notes, navigate } = useWorkspaceContext();
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");

  const reset = () => {
    setUrl("");
    setTitle("");
  };

  const clip = async () => {
    const trimmed = url.trim();
    if (!trimmed) return;
    const href = /^https?:\/\//.test(trimmed) ? trimmed : `https://${trimmed}`;
    const note = await notes.createNote(workspace.id, null);
    if (!note) return;
    await notes.updateNote(note.id, {
      title: title.trim() || titleFromUrl(href),
      content: {
        type: "doc",
        content: [
          { type: "embed", attrs: { url: href } },
          { type: "paragraph" },
        ],
      } as never,
    });
    close();
    reset();
    navigate({ name: "note", id: note.id });
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          close();
          reset();
        }
      }}
    >
      <DialogContent className="max-w-sm">
        <DialogTitle className="flex items-center gap-2">
          <Globe2 size={16} /> Clip a web page
        </DialogTitle>
        <DialogDescription>Save a link as a new note, with the page embedded so you can refer back to it.</DialogDescription>
        <div className="mt-4 flex flex-col gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">URL</label>
            <Input
              autoFocus
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && clip()}
              placeholder="https://example.com/article"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Note title (optional)</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && clip()}
              placeholder="Defaults to the page's domain"
            />
          </div>
          <Button onClick={clip} disabled={!url.trim()} className="mt-1 w-full">
            Clip page
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
