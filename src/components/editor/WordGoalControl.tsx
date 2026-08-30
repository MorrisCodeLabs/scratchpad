import { useState } from "react";
import { Target, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

export function WordGoalControl({
  wordCount,
  goal,
  onSetGoal,
}: {
  wordCount: number;
  goal: number | null;
  onSetGoal: (goal: number | null) => void;
}) {
  const [draft, setDraft] = useState(goal ? String(goal) : "");
  const pct = goal ? Math.min(100, Math.round((wordCount / goal) * 100)) : null;

  const apply = () => {
    const n = parseInt(draft, 10);
    onSetGoal(Number.isFinite(n) && n > 0 ? n : null);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button type="button" className="flex items-center gap-1.5 rounded px-1 py-0.5 hover:bg-surface-2 hover:text-ink">
          <Target size={12} />
          {goal ? (
            <span className="tabular-nums">
              {wordCount} / {goal} words · {pct}%
            </span>
          ) : (
            <span>Set a word goal</span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-56">
        <p className="mb-2 text-xs font-medium text-ink">Word count goal</p>
        <div className="flex items-center gap-1.5">
          <Input
            type="number"
            min={1}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && apply()}
            placeholder="e.g. 1000"
            className="h-8 text-xs"
          />
          <Button size="sm" onClick={apply}>
            Set
          </Button>
        </div>
        {goal && (
          <button
            type="button"
            onClick={() => {
              setDraft("");
              onSetGoal(null);
            }}
            className="mt-2 flex items-center gap-1 text-xs text-danger hover:underline"
          >
            <X size={11} /> Remove goal
          </button>
        )}
      </PopoverContent>
    </Popover>
  );
}

export function WordGoalBar({ wordCount, goal }: { wordCount: number; goal: number }) {
  const pct = Math.min(100, Math.round((wordCount / goal) * 100));
  return (
    <div className="h-1 w-16 overflow-hidden rounded-full bg-surface-2">
      <div
        className={cn("h-full rounded-full bg-accent transition-all", pct >= 100 && "bg-good")}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
