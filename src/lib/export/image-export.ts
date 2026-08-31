import { toJpeg } from "html-to-image";

// Renders a DOM node (the note's content area) to a JPG — a visual
// snapshot of the note, not a re-typeset document like the other export
// formats.
export async function exportElementAsJpg(element: HTMLElement, filename: string) {
  const dataUrl = await toJpeg(element, { quality: 0.92, backgroundColor: "#ffffff", pixelRatio: 2 });
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}
