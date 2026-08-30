import type { NodeViewProps } from "@tiptap/react";
import { NodeViewWrapper } from "@tiptap/react";
import { BookOpen } from "lucide-react";
import type { CitationStorage } from "@/lib/editor/citation";
import { CITATION_STYLES, formatReference } from "@/lib/citation-format";
import type { CitationStyle } from "@/lib/types";

export function BibliographyBlockView({ node, updateAttributes, editor }: NodeViewProps) {
  const storage = editor.storage.citation as CitationStorage | undefined;
  const sources = storage?.sources ?? [];
  const style = (node.attrs.style ?? "apa") as CitationStyle;

  return (
    <NodeViewWrapper data-type="bibliography-block" className="my-2 rounded-lg border border-line bg-surface p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-faint">
          <BookOpen size={12} /> Bibliography
        </span>
        <select
          contentEditable={false}
          value={style}
          onChange={(e) => updateAttributes({ style: e.target.value })}
          className="rounded border border-line bg-surface px-1.5 py-0.5 text-[11px] text-ink"
        >
          {CITATION_STYLES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>
      {sources.length === 0 ? (
        <p className="text-xs text-faint">No sources saved for this note yet.</p>
      ) : (
        <ol className="flex flex-col gap-1.5 text-xs text-ink">
          {sources.map((s) => (
            <li key={s.id} className="pl-4 -indent-4">
              {formatReference(s, style)}
            </li>
          ))}
        </ol>
      )}
    </NodeViewWrapper>
  );
}
