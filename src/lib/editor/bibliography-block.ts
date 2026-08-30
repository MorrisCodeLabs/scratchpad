import { mergeAttributes, Node } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { BibliographyBlockView } from "@/components/editor/BibliographyBlockView";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    bibliographyBlock: {
      setBibliographyBlock: () => ReturnType;
    };
  }
}

export const BibliographyBlock = Node.create({
  name: "bibliographyBlock",
  group: "block",
  atom: true,

  addAttributes() {
    return { style: { default: "apa" } };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="bibliography-block"]' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-type": "bibliography-block" })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(BibliographyBlockView);
  },

  addCommands() {
    return {
      setBibliographyBlock:
        () =>
        ({ commands }) =>
          commands.insertContent({ type: this.name, attrs: { style: "apa" } }),
    };
  },
});
