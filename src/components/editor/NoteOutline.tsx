import { useMemo } from "react";
import type { Editor } from "@tiptap/react";
import { ListTree } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface HeadingEntry {
  level: number;
  text: string;
  index: number;
}

function collectHeadings(doc: Record<string, any> | undefined): HeadingEntry[] {
  const headings: HeadingEntry[] = [];
  let index = 0;
  const walk = (node: any) => {
    if (!node) return;
    if (node.type === "heading") {
      const text = (node.content ?? []).map((c: any) => c.text ?? "").join("");
      headings.push({ level: node.attrs?.level ?? 1, text: text || "Untitled", index: index++ });
    }
    if (Array.isArray(node.content)) node.content.forEach(walk);
  };
  (doc?.content ?? []).forEach(walk);
  return headings;
}

export function NoteOutline({ editor, contentTick }: { editor: Editor | null; contentTick: number }) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const headings = useMemo(() => collectHeadings(editor?.getJSON() as any), [editor, contentTick]);

  const jumpTo = (index: number) => {
    const el = editor?.view.dom.querySelectorAll("h1, h2, h3, h4, h5, h6")[index] as HTMLElement | undefined;
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          title="Outline"
          className="flex h-7 w-7 items-center justify-center rounded-md text-muted hover:bg-surface-2 hover:text-ink"
        >
          <ListTree size={15} />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="max-h-72 w-64 overflow-y-auto">
        <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-faint">
          <ListTree size={11} /> Outline
        </p>
        {headings.length === 0 ? (
          <p className="text-xs text-faint">No headings in this note yet.</p>
        ) : (
          <div className="flex flex-col gap-0.5">
            {headings.map((h) => (
              <button
                key={h.index}
                type="button"
                onClick={() => jumpTo(h.index)}
                style={{ paddingLeft: `${(h.level - 1) * 10}px` }}
                className="truncate rounded px-1.5 py-1 text-left text-xs text-muted hover:bg-surface-2 hover:text-ink"
              >
                {h.text}
              </button>
            ))}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
