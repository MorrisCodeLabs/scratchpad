import { Check, Loader2, AlertCircle } from "lucide-react";
import type { SaveState } from "@/lib/types";
import { cn } from "@/lib/cn";

export function SaveIndicator({ state, onSaveNow }: { state: SaveState; onSaveNow: () => void }) {
  const label = {
    idle: "Saved",
    saving: "Saving…",
    saved: "Saved",
    error: "Couldn't save",
  }[state];

  return (
    <button
      type="button"
      onClick={onSaveNow}
      title="Save now (⌘S)"
      className={cn(
        "flex items-center gap-1.5 rounded-md px-2 py-1 text-xs",
        state === "error" ? "text-danger" : "text-faint hover:text-muted",
      )}
    >
      {state === "saving" && <Loader2 size={13} className="animate-spin" />}
      {state === "saved" && <Check size={13} />}
      {state === "error" && <AlertCircle size={13} />}
      {label}
    </button>
  );
}
