import { useEffect, useMemo, useState } from "react";
import type { Editor } from "@tiptap/react";
import { ChevronDown, ChevronUp, X } from "lucide-react";
import { findMatchesInEditorDoc } from "@/lib/editor/find-in-doc";

export function FindReplaceBar({
  editor,
  contentTick,
  onClose,
}: {
  editor: Editor;
  contentTick: number;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [replacement, setReplacement] = useState("");
  const [index, setIndex] = useState(0);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const matches = useMemo(() => findMatchesInEditorDoc(editor.state.doc, query), [editor, query, contentTick]);

  useEffect(() => {
    setIndex(0);
  }, [query]);

  useEffect(() => {
    if (matches.length === 0) return;
    const m = matches[Math.min(index, matches.length - 1)];
    const docSize = editor.state.doc.content.size;
    if (m.from < 0 || m.to > docSize || m.from > m.to) return;
    try {
      editor.chain().setTextSelection({ from: m.from, to: m.to }).scrollIntoView().run();
    } catch (err) {
      // A match position can go stale for a moment between an edit and the
      // matches recomputing off contentTick — better to skip the scroll
      // than let a ProseMirror RangeError take down the whole page.
      console.warn("Find: skipped selecting a stale match", err);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matches, index]);

  const goNext = () => setIndex((i) => (matches.length ? (i + 1) % matches.length : 0));
  const goPrev = () => setIndex((i) => (matches.length ? (i - 1 + matches.length) % matches.length : 0));

  const replaceCurrent = () => {
    if (matches.length === 0) return;
    const m = matches[Math.min(index, matches.length - 1)];
    editor.chain().focus().insertContentAt({ from: m.from, to: m.to }, replacement).run();
  };

  const replaceAll = () => {
    [...matches].reverse().forEach((m) => {
      editor.chain().insertContentAt({ from: m.from, to: m.to }, replacement).run();
    });
    editor.commands.focus();
  };

  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-line bg-surface-2/60 px-8 py-2 text-xs">
      <input
        autoFocus
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Find"
        onKeyDown={(e) => {
          if (e.key === "Enter") e.shiftKey ? goPrev() : goNext();
          if (e.key === "Escape") onClose();
        }}
        className="h-7 w-40 rounded-md border border-line bg-surface px-2 text-xs text-ink outline-none"
      />
      <span className="tabular-nums text-faint">{matches.length ? `${Math.min(index + 1, matches.length)}/${matches.length}` : "0/0"}</span>
      <button type="button" onClick={goPrev} className="rounded p-1 text-muted hover:bg-surface hover:text-ink">
        <ChevronUp size={14} />
      </button>
      <button type="button" onClick={goNext} className="rounded p-1 text-muted hover:bg-surface hover:text-ink">
        <ChevronDown size={14} />
      </button>
      <input
        value={replacement}
        onChange={(e) => setReplacement(e.target.value)}
        placeholder="Replace"
        onKeyDown={(e) => e.key === "Escape" && onClose()}
        className="h-7 w-40 rounded-md border border-line bg-surface px-2 text-xs text-ink outline-none"
      />
      <button type="button" onClick={replaceCurrent} className="rounded-md border border-line px-2 py-1 text-ink hover:bg-surface">
        Replace
      </button>
      <button type="button" onClick={replaceAll} className="rounded-md border border-line px-2 py-1 text-ink hover:bg-surface">
        Replace all
      </button>
      <button type="button" onClick={onClose} className="ml-auto rounded p-1 text-faint hover:bg-surface hover:text-ink">
        <X size={14} />
      </button>
    </div>
  );
}
