import type { NodeViewProps } from "@tiptap/react";
import { NodeViewWrapper } from "@tiptap/react";
import type { CitationStorage } from "@/lib/editor/citation";
import { formatInlineCitation } from "@/lib/citation-format";

export function CitationView({ node, editor }: NodeViewProps) {
  const storage = editor.storage.citation as CitationStorage | undefined;
  const source = storage?.sources.find((s) => s.id === node.attrs.sourceId);
  const label = source ? formatInlineCitation(source, "apa") : "(citation)";

  return (
    <NodeViewWrapper as="span" className="inline">
      <span contentEditable={false} className="rounded bg-accent-soft px-1 text-[0.9em] text-accent-ink">
        {label}
      </span>
    </NodeViewWrapper>
  );
}
