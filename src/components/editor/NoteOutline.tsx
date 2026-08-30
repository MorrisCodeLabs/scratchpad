import { useMemo, useState } from "react";
import type { Editor } from "@tiptap/react";
import { ListTree, ZoomIn } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { computeZoomRange } from "@/lib/editor/outline-zoom";

interface HeadingEntry {
  level: number;
  text: string;
  index: number;
  pos: number;
}

function collectHeadings(editor: Editor): HeadingEntry[] {
  const headings: HeadingEntry[] = [];
  let index = 0;
  editor.state.doc.descendants((node, pos) => {
    if (node.type.name === "heading") {
      headings.push({ level: node.attrs.level ?? 1, text: node.textContent || "Untitled", index: index++, pos });
    }
  });
  return headings;
}

export function NoteOutline({
  editor,
  contentTick,
  onZoom,
}: {
  editor: Editor | null;
  contentTick: number;
  onZoom: (heading: { text: string; pos: number }) => void;
}) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const headings = useMemo(() => (editor ? collectHeadings(editor) : []), [editor, contentTick]);
  const [open, setOpen] = useState(false);

  const jumpTo = (index: number) => {
    const el = editor?.view.dom.querySelectorAll("h1, h2, h3, h4, h5, h6")[index] as HTMLElement | undefined;
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const zoomTo = (h: HeadingEntry) => {
    if (!editor) return;
    const range = computeZoomRange(editor.state.doc, h.pos);
    if (!range) return;
    editor.commands.setOutlineZoom(range);
    onZoom({ text: h.text, pos: h.pos });
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          title="Outline"
          className="flex h-7 w-7 items-center justify-center rounded-md text-muted hover:bg-surface-2 hover:text-ink"
        >
          <ListTree size={15} />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="max-h-72 w-72 overflow-y-auto">
        <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wide text-faint">
          <ListTree size={11} /> Outline
        </p>
        {headings.length === 0 ? (
          <p className="text-xs text-faint">No headings in this note yet.</p>
        ) : (
          <div className="flex flex-col gap-0.5">
            {headings.map((h) => (
              <div
                key={h.index}
                className="group flex items-center gap-1 rounded px-1.5 py-1 hover:bg-surface-2"
                style={{ paddingLeft: `${(h.level - 1) * 10 + 6}px` }}
              >
                <button
                  type="button"
                  onClick={() => jumpTo(h.index)}
                  className="min-w-0 flex-1 truncate text-left text-xs text-muted hover:text-ink"
                >
                  {h.text}
                </button>
                <button
                  type="button"
                  title="Zoom into this section"
                  onClick={() => zoomTo(h)}
                  className="hidden shrink-0 text-faint hover:text-ink group-hover:block"
                >
                  <ZoomIn size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
