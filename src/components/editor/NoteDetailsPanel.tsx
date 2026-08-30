import { useState } from "react";
import { Info, X, Ban } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/cn";

const COLORS = [
  { name: "None", value: null },
  { name: "Red", value: "#c0362c" },
  { name: "Orange", value: "#b3711c" },
  { name: "Green", value: "#2f7a4f" },
  { name: "Blue", value: "#2954a5" },
  { name: "Purple", value: "#7a4fae" },
];

export function NoteDetailsPanel({
  color,
  description,
  tags,
  onChange,
}: {
  color: string | null;
  description: string | null;
  tags: string[];
  onChange: (patch: { color?: string | null; description?: string | null; tags?: string[] }) => void;
}) {
  const [tagDraft, setTagDraft] = useState("");

  const addTag = () => {
    const t = tagDraft.trim().toLowerCase();
    if (!t || tags.includes(t)) {
      setTagDraft("");
      return;
    }
    onChange({ tags: [...tags, t] });
    setTagDraft("");
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left text-[13px] transition-colors hover:bg-surface-2"
        >
          <span className="flex items-center gap-1.5 text-xs text-faint">
            <Info size={13} /> Details
          </span>
          <span className="flex items-center gap-1.5 text-faint">
            {color && <span className="h-2 w-2 rounded-full" style={{ background: color }} />}
            {tags.length > 0 && <span className="tabular-nums text-xs">{tags.length} tag{tags.length === 1 ? "" : "s"}</span>}
            {!color && tags.length === 0 && !description && <span className="text-xs">Add</span>}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" side="left" sideOffset={10} className="w-72">
        <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-faint">Color</p>
        <div className="mb-3 flex items-center gap-1.5">
          {COLORS.map((c) => (
            <button
              key={c.name}
              type="button"
              title={c.name}
              onClick={() => onChange({ color: c.value })}
              className={cn(
                "flex h-6 w-6 items-center justify-center rounded-full border border-line",
                color === c.value && "ring-2 ring-accent ring-offset-1",
              )}
              style={{ background: c.value ?? "transparent" }}
            >
              {!c.value && <Ban size={12} className="text-faint" />}
            </button>
          ))}
        </div>

        <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-faint">Description</p>
        <textarea
          value={description ?? ""}
          onChange={(e) => onChange({ description: e.target.value || null })}
          placeholder="A short summary shown on this note's card…"
          rows={2}
          className="mb-3 w-full resize-none rounded-md border border-line bg-surface px-2 py-1.5 text-xs text-ink outline-none placeholder:text-faint"
        />

        <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-faint">Tags</p>
        <div className="mb-1.5 flex flex-wrap gap-1">
          {tags.map((t) => (
            <span key={t} className="flex items-center gap-1 rounded-full bg-surface-2 px-2 py-0.5 text-[11px] text-muted">
              {t}
              <button type="button" onClick={() => onChange({ tags: tags.filter((x) => x !== t) })}>
                <X size={10} />
              </button>
            </span>
          ))}
        </div>
        <input
          value={tagDraft}
          onChange={(e) => setTagDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              addTag();
            }
          }}
          placeholder="Add a tag, press Enter"
          className="w-full rounded-md border border-line bg-surface px-2 py-1 text-xs text-ink outline-none placeholder:text-faint"
        />
      </PopoverContent>
    </Popover>
  );
}
