import { useState } from "react";
import { Check, Copy, Globe } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import type { Note } from "@/lib/types";

export function ShareDialog({
  open,
  onOpenChange,
  note,
  onSetShareToken,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  note: Note;
  onSetShareToken: (token: string | null) => void;
}) {
  const [copied, setCopied] = useState(false);
  const shared = Boolean(note.share_token);
  const url = shared && typeof window !== "undefined" ? `${window.location.origin}/s/${note.share_token}` : "";

  const toggle = (next: boolean) => {
    onSetShareToken(next ? crypto.randomUUID() : null);
    setCopied(false);
  };

  const copy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogTitle className="flex items-center gap-2">
          <Globe size={16} /> Share to web
        </DialogTitle>
        <DialogDescription>
          Publish a read-only copy of this note at a public URL. Anyone with the link can view it — no account needed.
        </DialogDescription>
        <div className="mt-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium text-ink">{shared ? "Published" : "Not published"}</span>
            <Switch checked={shared} onCheckedChange={toggle} />
          </div>
          {shared && (
            <div className="flex items-center gap-1.5">
              <input
                readOnly
                value={url}
                onFocus={(e) => e.target.select()}
                className="h-9 flex-1 rounded-md border border-line bg-surface-2 px-2.5 text-xs text-ink outline-none"
              />
              <Button variant="outline" size="sm" onClick={copy}>
                {copied ? <Check size={13} /> : <Copy size={13} />}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
