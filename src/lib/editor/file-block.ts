import { mergeAttributes, Node } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { FileBlockView } from "@/components/editor/FileBlockView";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    fileBlock: {
      setFileBlock: (attrs: { url: string; name: string; size: number; contentType: string; ocrText?: string }) => ReturnType;
    };
  }
}

// A generic file attachment — anything that isn't rendered inline as an
// image (PDFs, zips, docs, audio). Audio gets a native <audio> control in
// its NodeView; everything else is a download card.
export const FileBlock = Node.create({
  name: "fileBlock",
  group: "block",
  atom: true,

  addAttributes() {
    return {
      url: { default: "" },
      name: { default: "file" },
      size: { default: 0 },
      contentType: { default: "" },
      // Pro: OCR'd text from the file (PDFs, images), extracted at upload
      // time — folded into search via docToText() so "search inside PDFs"
      // just falls out of the normal note search.
      ocrText: { default: "" },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="file-block"]' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["div", mergeAttributes(HTMLAttributes, { "data-type": "file-block" })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(FileBlockView);
  },

  addCommands() {
    return {
      setFileBlock:
        (attrs) =>
        ({ commands }) =>
          commands.insertContent({ type: this.name, attrs }),
    };
  },
});
