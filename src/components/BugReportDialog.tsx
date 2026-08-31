import { useState } from "react";
import { Bug } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { submitBugReport } from "@/lib/data/use-bug-reports";
import { useSession } from "@/lib/data/use-session";
import { useWorkspaceContext } from "@/lib/workspace-context";
import { notifyError } from "@/lib/toast";

export function BugReportDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { session } = useSession();
  const { workspace } = useWorkspaceContext();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const reset = () => {
    setTitle("");
    setDescription("");
    setSubmitted(false);
  };

  const submit = async () => {
    if (!session?.user.id || !title.trim() || !description.trim()) return;
    setSubmitting(true);
    try {
      await submitBugReport({
        workspaceId: workspace?.id ?? null,
        userId: session.user.id,
        email: session.user.email ?? null,
        title: title.trim(),
        description: description.trim(),
        pagePath: typeof window !== "undefined" ? window.location.pathname : "",
      });
      setSubmitted(true);
    } catch (err) {
      notifyError(err instanceof Error ? err.message : "Couldn't submit the report.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) setTimeout(reset, 200);
      }}
    >
      <DialogContent className="max-w-sm">
        <DialogTitle className="flex items-center gap-2">
          <Bug size={16} /> Report a bug
        </DialogTitle>

        {submitted ? (
          <>
            <DialogDescription>Thanks — this has been sent in. We'll take a look.</DialogDescription>
            <Button className="mt-4 w-full" variant="secondary" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </>
        ) : (
          <>
            <DialogDescription>Scratchpad is in beta — tell us what went wrong.</DialogDescription>
            <div className="mt-4 flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="bug-title">What happened</Label>
                <Input
                  id="bug-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Short summary, e.g. Highlight color picker closes on click"
                  autoFocus
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="bug-description">Details</Label>
                <Textarea
                  id="bug-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What were you doing, what did you expect, what happened instead?"
                  rows={4}
                />
              </div>
              <Button
                className="mt-1 w-full"
                onClick={submit}
                disabled={submitting || !title.trim() || !description.trim()}
              >
                {submitting ? "Sending…" : "Send report"}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
