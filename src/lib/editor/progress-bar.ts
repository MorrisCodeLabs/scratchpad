import { mergeAttributes, Node } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { ProgressBarView } from "@/components/editor/ProgressBarView";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    progressBar: {
      setProgressBar: () => ReturnType;
    };
  }
}

export const ProgressBar = Node.create({
  name: "progressBar",
  group: "block",
  atom: true,

  addAttributes() {
    return {
      label: { default: "Progress" },
      value: {
        default: 0,
        parseHTML: (element) => Number(element.getAttribute("data-value") ?? 0),
        renderHTML: (attributes) => ({ "data-value": attributes.value }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="progress-bar"]' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-type": "progress-bar" })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ProgressBarView);
  },

  addCommands() {
    return {
      setProgressBar:
        () =>
        ({ commands }) =>
          commands.insertContent({ type: this.name, attrs: { label: "Progress", value: 0 } }),
    };
  },
});
