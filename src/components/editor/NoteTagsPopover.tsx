import { useState } from "react";
import { Tag as TagIcon, X, Plus } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export function NoteTagsPopover({ tags, onChange }: { tags: string[]; onChange: (tags: string[]) => void }) {
  const [draft, setDraft] = useState("");

  const addTag = () => {
    const trimmed = draft.trim();
    if (!trimmed || tags.includes(trimmed)) {
      setDraft("");
      return;
    }
    onChange([...tags, trimmed]);
    setDraft("");
  };

  const removeTag = (tag: string) => onChange(tags.filter((t) => t !== tag));

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          title={`Tags (${tags.length})`}
          className="relative flex h-7 w-7 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface-2 hover:text-ink"
        >
          <TagIcon size={15} />
          {tags.length > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-accent px-0.5 text-[9px] font-semibold leading-none text-white">
              {tags.length}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64">
        <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-faint">Tags</p>
        {tags.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-1">
            {tags.map((t) => (
              <span key={t} className="flex items-center gap-1 rounded-full bg-surface-2 px-2 py-0.5 text-[11px] text-muted">
                {t.replace(/\//g, " › ")}
                <button type="button" onClick={() => removeTag(t)} className="text-faint hover:text-danger">
                  <X size={10} />
                </button>
              </span>
            ))}
          </div>
        )}
        <div className="flex gap-1.5">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTag()}
            placeholder="Add tag, or Parent/Child…"
            className="w-full rounded border border-line bg-surface-2 px-2 py-1 text-xs text-ink outline-none"
          />
          <button type="button" onClick={addTag} className="shrink-0 rounded-md border border-line px-1.5 text-faint hover:text-ink">
            <Plus size={13} />
          </button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
