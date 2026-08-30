import { useMemo, useState } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { ChevronLeft, ChevronRight, FileText } from "lucide-react";
import { useWorkspaceContext } from "@/lib/workspace-context";
import { cn } from "@/lib/cn";

export function CalendarView() {
  const { notes, navigate } = useWorkspaceContext();
  const [month, setMonth] = useState(() => new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(new Date());

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(month));
    const end = endOfWeek(endOfMonth(month));
    return eachDayOfInterval({ start, end });
  }, [month]);

  const notesByDay = useMemo(() => {
    const map = new Map<string, typeof notes.notes>();
    for (const note of notes.notes) {
      const key = format(new Date(note.updated_at), "yyyy-MM-dd");
      map.set(key, [...(map.get(key) ?? []), note]);
    }
    return map;
  }, [notes.notes]);

  const selectedNotes = selectedDay ? notesByDay.get(format(selectedDay, "yyyy-MM-dd")) ?? [] : [];

  return (
    <div className="mx-auto flex h-full max-w-5xl gap-10 overflow-y-auto px-10 py-10">
      <div className="flex-1">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-[1.7rem] font-bold tracking-tight text-ink">{format(month, "MMMM yyyy")}</h1>
          <div className="flex items-center gap-1">
            <button onClick={() => setMonth((m) => subMonths(m, 1))} className="rounded-lg p-1.5 text-muted transition-colors hover:bg-surface-2">
              <ChevronLeft size={16} />
            </button>
            <button onClick={() => setMonth(new Date())} className="rounded-lg px-2.5 py-1 text-xs font-medium text-muted transition-colors hover:bg-surface-2">
              Today
            </button>
            <button onClick={() => setMonth((m) => addMonths(m, 1))} className="rounded-lg p-1.5 text-muted transition-colors hover:bg-surface-2">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-medium uppercase tracking-wide text-faint">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d} className="py-1">
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {days.map((day) => {
            const key = format(day, "yyyy-MM-dd");
            const dayNotes = notesByDay.get(key) ?? [];
            const inMonth = isSameMonth(day, month);
            const selected = selectedDay && isSameDay(day, selectedDay);
            return (
              <button
                key={key}
                onClick={() => setSelectedDay(day)}
                className={cn(
                  "flex h-20 flex-col items-start gap-1 rounded-lg border border-transparent p-2 text-left transition-colors",
                  inMonth ? "text-ink" : "text-faint",
                  selected && "border-accent bg-accent-soft",
                  !selected && "hover:bg-surface-2",
                )}
              >
                <span className={cn("text-xs", isSameDay(day, new Date()) && "font-bold text-accent")}>
                  {format(day, "d")}
                </span>
                {dayNotes.length > 0 && (
                  <span className="rounded-full bg-accent px-1.5 text-[10px] font-medium text-white">
                    {dayNotes.length}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="w-72 shrink-0 border-l border-line pl-8">
        <h2 className="mb-3 text-[15px] font-semibold tracking-tight text-ink">
          {selectedDay ? format(selectedDay, "EEEE, MMM d") : "Select a date"}
        </h2>
        {selectedNotes.length === 0 ? (
          <p className="text-sm text-faint">No notes updated on this day.</p>
        ) : (
          <ul className="flex flex-col gap-1">
            {selectedNotes.map((note) => (
              <li key={note.id}>
                <button
                  onClick={() => navigate({ name: "note", id: note.id })}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-[13px] text-muted transition-colors hover:bg-surface-2 hover:text-ink"
                >
                  <FileText size={14} className="shrink-0" />
                  <span className="truncate">{note.title || "Untitled"}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
