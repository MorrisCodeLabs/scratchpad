import { useEffect, useRef, useState } from "react";
import { NodeViewWrapper, type ReactNodeViewProps } from "@tiptap/react";
import katex from "katex";
import { Sigma } from "lucide-react";

export function MathBlockView({ node, updateAttributes }: ReactNodeViewProps) {
  const [editing, setEditing] = useState(node.attrs.latex === "");
  const [draft, setDraft] = useState(node.attrs.latex);
  const previewRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editing || !previewRef.current) return;
    try {
      katex.render(node.attrs.latex || "\\text{empty}", previewRef.current, {
        throwOnError: false,
        displayMode: true,
      });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid LaTeX");
    }
  }, [editing, node.attrs.latex]);

  const commit = () => {
    updateAttributes({ latex: draft });
    setEditing(false);
  };

  return (
    <NodeViewWrapper data-type="math-block" className="my-2 rounded-md border border-line bg-surface p-3">
      {editing ? (
        <div contentEditable={false}>
          <div className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-faint">
            <Sigma size={13} /> LaTeX
          </div>
          <textarea
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) commit();
            }}
            placeholder="e.g. E = mc^2"
            rows={2}
            className="w-full resize-none rounded border border-line bg-surface-2 px-2 py-1.5 font-mono text-sm text-ink outline-none"
          />
          <p className="mt-1 text-[11px] text-faint">⌘+Enter or click away to render</p>
        </div>
      ) : (
        <div
          contentEditable={false}
          onClick={() => {
            setDraft(node.attrs.latex);
            setEditing(true);
          }}
          className="cursor-text overflow-x-auto"
        >
          <div ref={previewRef} />
          {error && <p className="text-xs text-danger">{error}</p>}
        </div>
      )}
    </NodeViewWrapper>
  );
}
