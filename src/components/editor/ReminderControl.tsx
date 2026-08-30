import { useState } from "react";
import { format, isPast } from "date-fns";
import { Bell, BellOff, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

function toLocalInputValue(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function ReminderControl({
  reminderAt,
  onSetReminder,
}: {
  reminderAt: string | null;
  onSetReminder: (iso: string | null) => void;
}) {
  const [draft, setDraft] = useState(toLocalInputValue(reminderAt));
  const overdue = reminderAt ? isPast(new Date(reminderAt)) : false;

  const apply = () => {
    onSetReminder(draft ? new Date(draft).toISOString() : null);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium hover:bg-surface-2",
            reminderAt ? (overdue ? "text-danger" : "text-accent") : "text-faint",
          )}
        >
          {reminderAt ? <Bell size={13} /> : <BellOff size={13} />}
          {reminderAt ? format(new Date(reminderAt), "MMM d, h:mm a") : "Remind me"}
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64">
        <p className="mb-2 text-xs font-medium text-ink">Note reminder</p>
        <div className="flex items-center gap-1.5">
          <input
            type="datetime-local"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="h-8 flex-1 rounded-md border border-line bg-surface px-2 text-xs text-ink outline-none"
          />
          <Button size="sm" onClick={apply}>
            Set
          </Button>
        </div>
        {reminderAt && (
          <button
            type="button"
            onClick={() => {
              setDraft("");
              onSetReminder(null);
            }}
            className="mt-2 flex items-center gap-1 text-xs text-danger hover:underline"
          >
            <X size={11} /> Clear reminder
          </button>
        )}
      </PopoverContent>
    </Popover>
  );
}
