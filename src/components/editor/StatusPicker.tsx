import { Circle, CircleDot, CircleCheck, Archive, type LucideIcon } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useWorkspaceContext } from "@/lib/workspace-context";
import type { Note, NoteStatus } from "@/lib/types";
import { cn } from "@/lib/cn";

const STATUSES: { value: NoteStatus; label: string; icon: LucideIcon; className: string }[] = [
  { value: "draft", label: "Draft", icon: Circle, className: "text-faint" },
  { value: "active", label: "Active", icon: CircleDot, className: "text-accent" },
  { value: "completed", label: "Completed", icon: CircleCheck, className: "text-good" },
  { value: "archived", label: "Archived", icon: Archive, className: "text-warn" },
];

export function StatusPicker({ note }: { note: Note }) {
  const { notes } = useWorkspaceContext();
  const current = STATUSES.find((s) => s.value === note.status) ?? STATUSES[0];
  const Icon = current.icon;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left text-[13px] transition-colors hover:bg-surface-2"
        >
          <span className="text-xs text-faint">Status</span>
          <span className={cn("flex items-center gap-1.5 font-medium", current.className)}>
            <Icon size={13} />
            {current.label}
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" side="left" sideOffset={10}>
        {STATUSES.map((s) => (
          <DropdownMenuItem key={s.value} onSelect={() => notes.updateNote(note.id, { status: s.value })}>
            <s.icon size={14} />
            <span className={s.className}>{s.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
