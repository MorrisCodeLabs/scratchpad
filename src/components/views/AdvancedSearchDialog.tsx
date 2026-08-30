import { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useIsPro } from "@/lib/use-plan";
import { UpgradeDialog } from "@/components/pro/UpgradeDialog";
import { ProBadge } from "@/components/pro/ProBadge";
import type { NoteStatus } from "@/lib/types";
import { cn } from "@/lib/cn";

export interface AdvancedFilters {
  statuses: NoteStatus[];
  pinnedOnly: boolean;
  favoriteOnly: boolean;
  dateFrom: string;
  dateTo: string;
}

export const EMPTY_FILTERS: AdvancedFilters = {
  statuses: [],
  pinnedOnly: false,
  favoriteOnly: false,
  dateFrom: "",
  dateTo: "",
};

const ALL_STATUSES: NoteStatus[] = ["draft", "active", "completed", "archived"];

export function AdvancedSearchDialog({
  open,
  onOpenChange,
  filters,
  onChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: AdvancedFilters;
  onChange: (filters: AdvancedFilters) => void;
}) {
  const isPro = useIsPro();
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  const toggleStatus = (status: NoteStatus) => {
    onChange({
      ...filters,
      statuses: filters.statuses.includes(status)
        ? filters.statuses.filter((s) => s !== status)
        : [...filters.statuses, status],
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogTitle>Advanced search</DialogTitle>
        <DialogDescription>Narrow the note list by status, pins, favorites, or date created.</DialogDescription>

        <div className="mt-4 flex flex-col gap-4">
          <div>
            <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-faint">Status</p>
            <div className="flex flex-wrap gap-1.5">
              {ALL_STATUSES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleStatus(s)}
                  className={cn(
                    "rounded-full border px-2.5 py-1 text-xs capitalize",
                    filters.statuses.includes(s)
                      ? "border-accent bg-accent-soft text-accent-ink"
                      : "border-line text-muted hover:bg-surface-2",
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-4">
            <label className="flex items-center gap-1.5 text-xs text-ink">
              <input
                type="checkbox"
                checked={filters.pinnedOnly}
                onChange={(e) => onChange({ ...filters, pinnedOnly: e.target.checked })}
              />
              Pinned only
            </label>
            <label className="flex items-center gap-1.5 text-xs text-ink">
              <input
                type="checkbox"
                checked={filters.favoriteOnly}
                onChange={(e) => onChange({ ...filters, favoriteOnly: e.target.checked })}
              />
              Favorites only
            </label>
          </div>

          <div>
            <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-faint">
              Created between
              {!isPro && (
                <button type="button" onClick={() => setUpgradeOpen(true)}>
                  <ProBadge />
                </button>
              )}
            </p>
            <div className={cn("flex items-center gap-2", !isPro && "pointer-events-none opacity-50")}>
              <input
                type="date"
                value={filters.dateFrom}
                disabled={!isPro}
                onChange={(e) => onChange({ ...filters, dateFrom: e.target.value })}
                className="h-8 flex-1 rounded-md border border-line bg-surface px-2 text-xs text-ink outline-none"
              />
              <span className="text-xs text-faint">to</span>
              <input
                type="date"
                value={filters.dateTo}
                disabled={!isPro}
                onChange={(e) => onChange({ ...filters, dateTo: e.target.value })}
                className="h-8 flex-1 rounded-md border border-line bg-surface px-2 text-xs text-ink outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <button type="button" onClick={() => onChange(EMPTY_FILTERS)} className="text-xs text-faint hover:text-ink">
              Clear all
            </button>
            <Button size="sm" onClick={() => onOpenChange(false)}>
              Apply
            </Button>
          </div>
        </div>
      </DialogContent>
      <UpgradeDialog open={upgradeOpen} onOpenChange={setUpgradeOpen} feature="Filtering by date range" />
    </Dialog>
  );
}
