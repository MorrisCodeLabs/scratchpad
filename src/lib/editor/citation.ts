import { mergeAttributes, Node } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { CitationView } from "@/components/editor/CitationView";
import type { NoteSource } from "@/lib/types";

export interface CitationStorage {
  sources: NoteSource[];
}

export const Citation = Node.create<Record<string, never>, CitationStorage>({
  name: "citation",
  group: "inline",
  inline: true,
  atom: true,

  addAttributes() {
    return { sourceId: { default: null } };
  },

  addStorage() {
    return { sources: [] };
  },

  parseHTML() {
    return [{ tag: "span[data-citation]" }];
  },
  renderHTML({ node, HTMLAttributes }) {
    return ["span", mergeAttributes(HTMLAttributes, { "data-citation": "", "data-source-id": node.attrs.sourceId })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(CitationView);
  },
});
