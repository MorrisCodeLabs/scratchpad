import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { NoteLinkView } from "@/components/editor/NoteLinkView";

export interface NoteLinkStorage {
  notes: { id: string; title: string }[];
  onNavigate: (id: string) => void;
}

export const NoteLink = Node.create<Record<string, never>, NoteLinkStorage>({
  name: "noteLink",
  group: "inline",
  inline: true,
  atom: true,
  selectable: true,

  addAttributes() {
    return {
      noteId: { default: null },
      label: { default: "" },
    };
  },

  addStorage() {
    return { notes: [], onNavigate: () => {} };
  },

  parseHTML() {
    return [{ tag: "span[data-note-link]" }];
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      "span",
      mergeAttributes(HTMLAttributes, { "data-note-link": "", "data-note-id": node.attrs.noteId }),
      node.attrs.label,
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(NoteLinkView);
  },
});
