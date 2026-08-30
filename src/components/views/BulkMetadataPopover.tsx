import { useState } from "react";
import { Pencil, Ban } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import type { NoteStatus } from "@/lib/types";

const STATUSES: NoteStatus[] = ["draft", "active", "completed", "archived"];

const COLORS = [
  { name: "None", value: null },
  { name: "Red", value: "#c0362c" },
  { name: "Orange", value: "#b3711c" },
  { name: "Green", value: "#2f7a4f" },
  { name: "Blue", value: "#2954a5" },
  { name: "Purple", value: "#7a4fae" },
];

export function BulkMetadataPopover({
  count,
  onSetStatus,
  onSetColor,
  onAddTag,
}: {
  count: number;
  onSetStatus: (status: NoteStatus) => void;
  onSetColor: (color: string | null) => void;
  onAddTag: (tag: string) => void;
}) {
  const [tagDraft, setTagDraft] = useState("");

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button type="button" className="flex items-center gap-1.5 hover:underline">
          <Pencil size={13} /> Edit
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64">
        <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-faint">
          Set status for {count} note{count === 1 ? "" : "s"}
        </p>
        <div className="mb-3 flex flex-wrap gap-1.5">
          {STATUSES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onSetStatus(s)}
              className="rounded-full border border-line px-2.5 py-1 text-xs capitalize text-muted transition-colors hover:bg-surface-2"
            >
              {s}
            </button>
          ))}
        </div>

        <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-faint">Set color</p>
        <div className="mb-3 flex items-center gap-1.5">
          {COLORS.map((c) => (
            <button
              key={c.name}
              type="button"
              title={c.name}
              onClick={() => onSetColor(c.value)}
              className={cn("flex h-6 w-6 items-center justify-center rounded-full border border-line")}
              style={{ background: c.value ?? "transparent" }}
            >
              {!c.value && <Ban size={12} className="text-faint" />}
            </button>
          ))}
        </div>

        <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-faint">Add tag</p>
        <div className="flex items-center gap-1.5">
          <Input
            value={tagDraft}
            onChange={(e) => setTagDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && tagDraft.trim()) {
                onAddTag(tagDraft.trim().toLowerCase());
                setTagDraft("");
              }
            }}
            placeholder="Tag name"
            className="h-8 text-xs"
          />
          <Button
            size="sm"
            onClick={() => {
              if (tagDraft.trim()) {
                onAddTag(tagDraft.trim().toLowerCase());
                setTagDraft("");
              }
            }}
          >
            Add
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
