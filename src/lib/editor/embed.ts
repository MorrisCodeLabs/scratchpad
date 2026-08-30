import { mergeAttributes, Node } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { EmbedView } from "@/components/editor/EmbedView";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    embed: {
      setEmbed: () => ReturnType;
    };
  }
}

export const Embed = Node.create({
  name: "embed",
  group: "block",
  atom: true,

  addAttributes() {
    return {
      url: { default: null as string | null },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="embed"]' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-type": "embed" })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(EmbedView);
  },

  addCommands() {
    return {
      setEmbed:
        () =>
        ({ commands }) =>
          commands.insertContent({ type: this.name, attrs: { url: null } }),
    };
  },
});
