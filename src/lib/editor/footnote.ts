import { mergeAttributes, Node } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { FootnoteView } from "@/components/editor/FootnoteView";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    footnote: {
      setFootnote: () => ReturnType;
    };
  }
}

// A footnote is stored inline as a small numbered marker carrying its own
// text as a node attribute — no separate "footnotes list" block to keep in
// sync. The number shown is computed from document order at render time.
export const Footnote = Node.create({
  name: "footnote",
  group: "inline",
  inline: true,
  atom: true,
  selectable: true,

  addAttributes() {
    return {
      content: { default: "" },
    };
  },

  parseHTML() {
    return [{ tag: "sup[data-footnote]" }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["sup", mergeAttributes(HTMLAttributes, { "data-footnote": "" })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(FootnoteView);
  },

  addCommands() {
    return {
      setFootnote:
        () =>
        ({ commands }) =>
          commands.insertContent({ type: this.name, attrs: { content: "" } }),
    };
  },
});
