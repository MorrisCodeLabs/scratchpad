// Extracts plain text from a Tiptap/ProseMirror JSON document.
export function docToText(doc: Record<string, unknown> | null | undefined): string {
  if (!doc) return "";
  let text = "";
  const walk = (node: any) => {
    if (!node) return;
    if (node.type === "text" && typeof node.text === "string") {
      text += node.text + " ";
    }
    if (Array.isArray(node.content)) {
      for (const child of node.content) walk(child);
    }
  };
  walk(doc);
  return text.trim();
}

// Same as docToText, but also folds in OCR'd text attached to file/image
// blocks (Pro: "search inside PDFs" / "search inside images"). Kept
// separate from docToText so word/char counts in the editor still reflect
// only what was actually typed, not scanned attachment text.
export function docToSearchText(doc: Record<string, unknown> | null | undefined): string {
  if (!doc) return "";
  let text = "";
  const walk = (node: any) => {
    if (!node) return;
    if (node.type === "text" && typeof node.text === "string") {
      text += node.text + " ";
    }
    if (typeof node.attrs?.ocrText === "string" && node.attrs.ocrText) {
      text += node.attrs.ocrText + " ";
    }
    if (Array.isArray(node.content)) {
      for (const child of node.content) walk(child);
    }
  };
  walk(doc);
  return text.trim();
}

export function computeStats(doc: Record<string, unknown> | null | undefined) {
  const text = docToText(doc);
  const words = text.length ? text.split(/\s+/).filter(Boolean) : [];
  const wordCount = words.length;
  const charCount = text.length;
  const readingTimeMinutes = Math.max(1, Math.round(wordCount / 200));
  return { wordCount, charCount, readingTimeMinutes };
}
