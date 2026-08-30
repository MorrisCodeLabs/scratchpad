import { mergeAttributes, Node } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { ToggleView } from "@/components/editor/ToggleView";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    toggleBlock: {
      setToggle: () => ReturnType;
    };
  }
}

// A collapsible disclosure block: a one-line summary the reader can type
// into, with arbitrary block content nested underneath. `open` is a node
// attribute (not just a DOM detail) so it round-trips through the saved
// Tiptap JSON document.
export const Toggle = Node.create({
  name: "toggle",
  group: "block",
  content: "block+",
  defining: true,

  addAttributes() {
    return {
      summary: { default: "Toggle" },
      open: {
        default: true,
        parseHTML: (element) => element.getAttribute("data-open") !== "false",
        renderHTML: (attributes) => ({ "data-open": String(attributes.open) }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="toggle"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-type": "toggle" }), 0];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ToggleView);
  },

  addCommands() {
    return {
      setToggle:
        () =>
        ({ commands }) =>
          commands.wrapIn(this.name),
    };
  },
});
