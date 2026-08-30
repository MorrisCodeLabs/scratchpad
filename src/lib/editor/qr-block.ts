import { mergeAttributes, Node } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { QrBlockView } from "@/components/editor/QrBlockView";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    qrBlock: {
      setQrBlock: () => ReturnType;
    };
  }
}

export const QrBlock = Node.create({
  name: "qrBlock",
  group: "block",
  atom: true,

  addAttributes() {
    return {
      text: { default: "" },
      // Custom colors are a Pro-only customization — the view enforces
      // that, this just stores whatever was set so a downgrade doesn't
      // silently lose the value.
      fgColor: { default: "#000000" },
      bgColor: { default: "#ffffff" },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="qr-block"]' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-type": "qr-block" })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(QrBlockView);
  },

  addCommands() {
    return {
      setQrBlock:
        () =>
        ({ commands }) =>
          commands.insertContent({ type: this.name, attrs: { text: "", fgColor: "#000000", bgColor: "#ffffff" } }),
    };
  },
});
