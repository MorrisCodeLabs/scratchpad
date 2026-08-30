import TiptapImage from "@tiptap/extension-image";

// Wraps the stock Image extension to carry OCR'd text (Pro: "search inside
// images") as a node attribute — folded into search via docToText().
export const Image = TiptapImage.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      ocrText: { default: "" },
    };
  },
});
