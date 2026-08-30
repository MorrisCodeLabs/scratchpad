import { useState } from "react";
import { format } from "date-fns";
import { Hourglass, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { useIsPro } from "@/lib/use-plan";
import { UpgradeDialog } from "@/components/pro/UpgradeDialog";
import { ProBadge } from "@/components/pro/ProBadge";

function toLocalDateValue(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function ExpirationControl({
  expiresAt,
  onSetExpiration,
}: {
  expiresAt: string | null;
  onSetExpiration: (iso: string | null) => void;
}) {
  const isPro = useIsPro();
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [draft, setDraft] = useState(toLocalDateValue(expiresAt));

  const apply = () => {
    onSetExpiration(draft ? new Date(`${draft}T23:59:59`).toISOString() : null);
  };

  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            onClick={(e) => {
              if (!isPro) {
                e.preventDefault();
                setUpgradeOpen(true);
              }
            }}
            className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-faint hover:bg-surface-2"
          >
            <Hourglass size={13} />
            {expiresAt ? `Expires ${format(new Date(expiresAt), "MMM d, yyyy")}` : "Set expiration"}
            {!isPro && <ProBadge />}
          </button>
        </PopoverTrigger>
        {isPro && (
          <PopoverContent align="start" className="w-64">
            <p className="mb-2 text-xs font-medium text-ink">Auto-archive on</p>
            <div className="flex items-center gap-1.5">
              <input
                type="date"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                className="h-8 flex-1 rounded-md border border-line bg-surface px-2 text-xs text-ink outline-none"
              />
              <Button size="sm" onClick={apply}>
                Set
              </Button>
            </div>
            <p className="mt-1.5 text-[11px] text-faint">The note archives itself once this date passes.</p>
            {expiresAt && (
              <button
                type="button"
                onClick={() => {
                  setDraft("");
                  onSetExpiration(null);
                }}
                className="mt-2 flex items-center gap-1 text-xs text-danger hover:underline"
              >
                <X size={11} /> Clear expiration
              </button>
            )}
          </PopoverContent>
        )}
      </Popover>
      <UpgradeDialog open={upgradeOpen} onOpenChange={setUpgradeOpen} feature="Note expiration" />
    </>
  );
}
