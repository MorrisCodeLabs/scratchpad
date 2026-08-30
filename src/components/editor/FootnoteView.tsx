import { useState } from "react";
import { NodeViewWrapper, type ReactNodeViewProps } from "@tiptap/react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export function FootnoteView({ node, updateAttributes, editor, getPos }: ReactNodeViewProps) {
  const [draft, setDraft] = useState(node.attrs.content);
  const [open, setOpen] = useState(false);

  const pos = getPos();
  let index = 0;
  let counter = 0;
  editor.state.doc.descendants((n, p) => {
    if (n.type.name === "footnote") {
      counter++;
      if (typeof pos === "number" && p === pos) index = counter;
    }
  });

  return (
    <NodeViewWrapper as="span" className="inline">
      <Popover
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          if (!v) updateAttributes({ content: draft });
        }}
      >
        <PopoverTrigger asChild>
          <button
            type="button"
            contentEditable={false}
            title={node.attrs.content || "Add footnote"}
            className="mx-0.5 align-super text-[0.7em] font-semibold text-accent hover:underline"
          >
            [{index || counter || 1}]
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-64">
          <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-faint">
            Footnote {index || counter || 1}
          </p>
          <textarea
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={() => updateAttributes({ content: draft })}
            rows={3}
            placeholder="Footnote text…"
            className="w-full resize-none rounded border border-line bg-surface-2 px-2 py-1.5 text-sm text-ink outline-none"
          />
        </PopoverContent>
      </Popover>
    </NodeViewWrapper>
  );
}
