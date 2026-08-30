import type { NodeViewProps } from "@tiptap/react";
import { NodeViewWrapper } from "@tiptap/react";
import { FileText } from "lucide-react";
import type { NoteLinkStorage } from "@/lib/editor/note-link";

export function NoteLinkView({ node, editor }: NodeViewProps) {
  const storage = editor.storage.noteLink as NoteLinkStorage | undefined;
  const found = storage?.notes.find((n) => n.id === node.attrs.noteId);
  const label = found?.title || node.attrs.label || "Untitled";

  return (
    <NodeViewWrapper as="span" className="inline">
      <button
        type="button"
        contentEditable={false}
        onClick={() => storage?.onNavigate(node.attrs.noteId)}
        className="inline-flex items-center gap-1 rounded-md bg-accent-soft px-1.5 py-0.5 align-baseline text-[0.9em] font-medium text-accent-ink hover:opacity-80"
      >
        <FileText size={12} />
        {label}
      </button>
    </NodeViewWrapper>
  );
}
