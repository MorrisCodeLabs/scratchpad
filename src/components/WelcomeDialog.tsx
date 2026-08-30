import { useState } from "react";
import { Sparkles, Slash, FolderTree, Command } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { gettingStartedDoc } from "@/lib/onboarding-content";
import { useWorkspaceContext } from "@/lib/workspace-context";

export function WelcomeDialog() {
  const { workspace, refreshWorkspace, notes, navigate } = useWorkspaceContext();
  const [open, setOpen] = useState(!workspace.onboarded_at);
  const [working, setWorking] = useState(false);

  const markOnboarded = async () => {
    await supabase.from("workspaces").update({ onboarded_at: new Date().toISOString() }).eq("id", workspace.id);
    await refreshWorkspace();
  };

  const startWithSample = async () => {
    setWorking(true);
    const note = await notes.createNote(workspace.id, null);
    if (note) {
      await notes.updateNote(note.id, { title: "Welcome to Scratchpad", content: gettingStartedDoc() as never });
      navigate({ name: "note", id: note.id });
    }
    await markOnboarded();
    setWorking(false);
    setOpen(false);
  };

  const skip = async () => {
    await markOnboarded();
    setOpen(false);
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && skip()}>
      <DialogContent className="max-w-md" showClose={false}>
        <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-accent-soft text-accent-ink">
          <Sparkles size={20} />
        </div>
        <DialogTitle>Welcome to Scratchpad</DialogTitle>
        <DialogDescription>A fast, block-based note-taking workspace. Here's the ten-second version.</DialogDescription>

        <div className="my-4 flex flex-col gap-3">
          <Feature icon={Slash} title="Slash commands" desc="Type / for headings, lists, tables, images, and more." />
          <Feature icon={FolderTree} title="Folders & drag-and-drop" desc="Organize notes into nested folders." />
          <Feature icon={Command} title="Command menu" desc="⌘K to search notes or jump to any action." />
        </div>

        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" size="sm" onClick={skip} disabled={working}>
            Skip
          </Button>
          <Button size="sm" onClick={startWithSample} disabled={working}>
            {working ? "Creating…" : "Show me a sample note"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Feature({ icon: Icon, title, desc }: { icon: LucideIcon; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-surface-2 text-muted">
        <Icon size={14} />
      </span>
      <div>
        <p className="text-[13px] font-medium text-ink">{title}</p>
        <p className="text-xs text-faint">{desc}</p>
      </div>
    </div>
  );
}
