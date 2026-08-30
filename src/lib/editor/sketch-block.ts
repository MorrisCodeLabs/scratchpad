import { mergeAttributes, Node } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { SketchBlockView } from "@/components/editor/SketchBlockView";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    sketchBlock: {
      setSketchBlock: () => ReturnType;
    };
  }
}

// Freehand drawing is stored as a flattened raster snapshot (a data URL)
// rather than a vector stroke history — far simpler to persist as a node
// attribute and re-render, at the cost of not being able to re-edit
// individual strokes after the fact (only draw more on top, or clear).
export const SketchBlock = Node.create({
  name: "sketchBlock",
  group: "block",
  atom: true,

  addAttributes() {
    return {
      imageData: { default: null as string | null },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="sketch-block"]' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-type": "sketch-block" })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(SketchBlockView);
  },

  addCommands() {
    return {
      setSketchBlock:
        () =>
        ({ commands }) =>
          commands.insertContent({ type: this.name, attrs: { imageData: null } }),
    };
  },
});
