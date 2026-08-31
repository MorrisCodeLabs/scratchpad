import { useState } from "react";
import { AlertTriangle, X } from "lucide-react";
import { BugReportDialog } from "@/components/BugReportDialog";

export function BetaBanner() {
  const [dismissed, setDismissed] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  if (dismissed) return null;

  return (
    <>
      <div className="flex shrink-0 items-center justify-center gap-2.5 bg-warn-soft px-4 py-1.5 text-center text-[12.5px] font-medium text-warn">
        <AlertTriangle size={13} className="shrink-0" />
        <span>
          Scratchpad <strong>v1.1</strong> is unstable and in beta.
        </span>
        <button type="button" onClick={() => setReportOpen(true)} className="shrink-0 underline underline-offset-2 hover:opacity-80">
          Report a bug
        </button>
        <button
          type="button"
          title="Dismiss"
          onClick={() => setDismissed(true)}
          className="ml-1 flex h-4 w-4 shrink-0 items-center justify-center rounded text-warn/70 hover:bg-black/5 hover:text-warn"
        >
          <X size={12} />
        </button>
      </div>
      <BugReportDialog open={reportOpen} onOpenChange={setReportOpen} />
    </>
  );
}
