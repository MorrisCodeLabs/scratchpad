import { useState } from "react";
import { Sparkles, History, Download } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useWorkspaceContext } from "@/lib/workspace-context";
import { setWorkspacePlan } from "@/lib/plan-actions";

interface UpgradeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feature?: string;
}

const BENEFITS = [
  { icon: History, text: "Automatic version history on every note, with one-click restore" },
  { icon: Download, text: "Export any note to Markdown or PDF" },
];

export function UpgradeDialog({ open, onOpenChange, feature }: UpgradeDialogProps) {
  const { workspace, refreshWorkspace } = useWorkspaceContext();
  const [loading, setLoading] = useState(false);

  const upgrade = async () => {
    setLoading(true);
    const ok = await setWorkspacePlan(workspace.id, "pro");
    if (ok) await refreshWorkspace();
    setLoading(false);
    if (ok) onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <div className="mb-1 flex h-9 w-9 items-center justify-center rounded-lg bg-accent-soft text-accent-ink">
          <Sparkles size={16} />
        </div>
        <DialogTitle>Upgrade to Pro</DialogTitle>
        <DialogDescription>
          {feature ? `${feature} is a Pro feature.` : "Unlock the rest of Scratchpad."}
        </DialogDescription>

        <ul className="mt-3 flex flex-col gap-2">
          {BENEFITS.map((b) => (
            <li key={b.text} className="flex items-start gap-2 text-sm text-ink">
              <b.icon size={15} className="mt-0.5 shrink-0 text-accent" />
              {b.text}
            </li>
          ))}
        </ul>

        <Button onClick={upgrade} disabled={loading} className="mt-4 w-full">
          {loading ? "Upgrading…" : "Upgrade to Pro"}
        </Button>
        <p className="mt-2 text-center text-[11px] text-faint">
          Demo build — this flips the plan flag directly, no payment involved.
        </p>
      </DialogContent>
    </Dialog>
  );
}
