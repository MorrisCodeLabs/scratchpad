import { useMemo, useState } from "react";
import { eachDayOfInterval, format, isSameDay, subDays } from "date-fns";
import { BarChart3, FileText, Type, Hash, Sparkles } from "lucide-react";
import { useWorkspaceContext } from "@/lib/workspace-context";
import { useIsPro } from "@/lib/use-plan";
import { UpgradeDialog } from "@/components/pro/UpgradeDialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

const STATUS_META: Record<string, { label: string; className: string }> = {
  draft: { label: "Draft", className: "bg-surface-2" },
  active: { label: "Active", className: "bg-accent" },
  completed: { label: "Completed", className: "bg-good" },
  archived: { label: "Archived", className: "bg-warn" },
};

export function InsightsView() {
  const { notes } = useWorkspaceContext();
  const isPro = useIsPro();
  const [upgradeOpen, setUpgradeOpen] = useState(true);

  const totalWords = useMemo(() => notes.notes.reduce((sum, n) => sum + n.word_count, 0), [notes.notes]);
  const avgWords = notes.notes.length ? Math.round(totalWords / notes.notes.length) : 0;

  const byStatus = useMemo(() => {
    const counts: Record<string, number> = { draft: 0, active: 0, completed: 0, archived: 0 };
    for (const n of notes.notes) counts[n.status] = (counts[n.status] ?? 0) + 1;
    return counts;
  }, [notes.notes]);
  const maxStatusCount = Math.max(1, ...Object.values(byStatus));

  const last14Days = useMemo(() => {
    const days = eachDayOfInterval({ start: subDays(new Date(), 13), end: new Date() });
    return days.map((day) => ({
      day,
      count: notes.notes.filter((n) => isSameDay(new Date(n.created_at), day)).length,
    }));
  }, [notes.notes]);
  const maxDayCount = Math.max(1, ...last14Days.map((d) => d.count));

  const topTags = useMemo(() => {
    const counts = new Map<string, number>();
    for (const n of notes.notes) for (const t of n.tags ?? []) counts.set(t, (counts.get(t) ?? 0) + 1);
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
  }, [notes.notes]);

  if (!isPro) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 px-8 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-soft text-accent-ink">
          <BarChart3 size={22} />
        </span>
        <h1 className="text-xl font-bold text-ink">Insights is a Pro feature</h1>
        <p className="max-w-sm text-sm text-muted">
          See word counts, activity over time, and how your notes break down by status and tag.
        </p>
        <Button size="sm" onClick={() => setUpgradeOpen(true)} className="mt-1">
          Upgrade to Pro
        </Button>
        <UpgradeDialog open={upgradeOpen} onOpenChange={setUpgradeOpen} feature="Insights" />
      </div>
    );
  }

  return (
    <div className="mx-auto h-full max-w-4xl overflow-y-auto px-8 py-8">
      <h1 className="mb-6 flex items-center gap-2 text-2xl font-bold text-ink">
        <BarChart3 size={22} /> Insights
      </h1>

      <div className="mb-6 grid grid-cols-3 gap-4">
        <StatTile icon={FileText} label="Notes" value={notes.notes.length} />
        <StatTile icon={Type} label="Total words" value={totalWords.toLocaleString()} />
        <StatTile icon={Hash} label="Avg. words / note" value={avgWords} />
      </div>

      <section className="mb-8">
        <h2 className="mb-3 text-sm font-semibold text-ink">Activity, last 14 days</h2>
        <div className="flex h-24 items-end gap-1 rounded-lg border border-line bg-surface p-3">
          {last14Days.map(({ day, count }) => (
            <div key={day.toISOString()} className="flex flex-1 flex-col items-center justify-end gap-1">
              <div
                className={cn("w-full rounded-t-sm bg-accent transition-all", count === 0 && "bg-surface-2")}
                style={{ height: `${Math.max(4, (count / maxDayCount) * 100)}%` }}
                title={`${count} note${count === 1 ? "" : "s"} on ${format(day, "MMM d")}`}
              />
              <span className="text-[9px] text-faint">{format(day, "d")}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-sm font-semibold text-ink">By status</h2>
        <div className="flex flex-col gap-2">
          {Object.entries(byStatus).map(([status, count]) => (
            <div key={status} className="flex items-center gap-3">
              <span className="w-20 shrink-0 text-xs text-muted">{STATUS_META[status]?.label ?? status}</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-2">
                <div
                  className={cn("h-full rounded-full", STATUS_META[status]?.className)}
                  style={{ width: `${(count / maxStatusCount) * 100}%` }}
                />
              </div>
              <span className="w-6 shrink-0 text-right text-xs tabular-nums text-faint">{count}</span>
            </div>
          ))}
        </div>
      </section>

      {topTags.length > 0 && (
        <section>
          <h2 className="mb-3 flex items-center gap-1.5 text-sm font-semibold text-ink">
            <Sparkles size={14} /> Top tags
          </h2>
          <div className="flex flex-wrap gap-1.5">
            {topTags.map(([tag, count]) => (
              <span key={tag} className="rounded-full bg-surface-2 px-2.5 py-1 text-xs text-muted">
                {tag} <span className="tabular-nums text-faint">· {count}</span>
              </span>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function StatTile({ icon: Icon, label, value }: { icon: typeof FileText; label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-line bg-surface p-4">
      <div className="mb-1 flex items-center gap-1.5 text-faint">
        <Icon size={14} />
        <span className="text-xs">{label}</span>
      </div>
      <p className="text-2xl font-bold tabular-nums text-ink">{value}</p>
    </div>
  );
}
