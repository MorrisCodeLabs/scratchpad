import type { Editor } from "@tiptap/react";
import { Palette, Highlighter, Ban } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/cn";

const TEXT_COLORS = [
  { name: "Default", value: null },
  { name: "Slate", value: "#5b6570" },
  { name: "Red", value: "#c0362c" },
  { name: "Orange", value: "#b3711c" },
  { name: "Green", value: "#2f7a4f" },
  { name: "Blue", value: "#2954a5" },
  { name: "Purple", value: "#7a4fae" },
];

const HIGHLIGHT_COLORS = [
  { name: "None", value: null },
  { name: "Yellow", value: "#f9ecd9" },
  { name: "Green", value: "#e3f3e8" },
  { name: "Blue", value: "#e5eaf6" },
  { name: "Purple", value: "#efe6f8" },
  { name: "Red", value: "#fbe9e7" },
];

export function TextColorPicker({ editor }: { editor: Editor }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          title="Text color"
          className="flex h-8 w-8 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface hover:text-ink"
        >
          <Palette size={15} />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="flex w-40 flex-wrap gap-1.5">
        {TEXT_COLORS.map((c) => (
          <button
            key={c.name}
            type="button"
            title={c.name}
            onClick={() =>
              c.value ? editor.chain().focus().setColor(c.value).run() : editor.chain().focus().unsetColor().run()
            }
            className={cn(
              "flex h-6 w-6 items-center justify-center rounded-full border border-line",
              editor.isActive("textStyle", { color: c.value }) && "ring-2 ring-accent ring-offset-1",
            )}
            style={{ background: c.value ?? "transparent" }}
          >
            {!c.value && <Ban size={12} className="text-faint" />}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}

export function HighlightColorPicker({ editor }: { editor: Editor }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          title="Highlight color"
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface hover:text-ink",
            editor.isActive("highlight") && "bg-accent-soft text-accent-ink hover:bg-accent-soft hover:text-accent-ink",
          )}
        >
          <Highlighter size={15} />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="flex w-40 flex-wrap gap-1.5">
        {HIGHLIGHT_COLORS.map((c) => (
          <button
            key={c.name}
            type="button"
            title={c.name}
            onClick={() =>
              c.value
                ? editor.chain().focus().toggleHighlight({ color: c.value }).run()
                : editor.chain().focus().unsetHighlight().run()
            }
            className="flex h-6 w-6 items-center justify-center rounded-full border border-line"
            style={{ background: c.value ?? "transparent" }}
          >
            {!c.value && <Ban size={12} className="text-faint" />}
          </button>
        ))}
      </PopoverContent>
    </Popover>
  );
}
