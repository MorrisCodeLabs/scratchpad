function doc(...content: Record<string, unknown>[]) {
  return { type: "doc", content };
}
function heading(level: number, text: string) {
  return { type: "heading", attrs: { level }, content: [{ type: "text", text }] };
}
function paragraph(content: Array<{ text: string; marks?: Record<string, unknown>[] }> | string = "") {
  if (typeof content === "string") {
    return content ? { type: "paragraph", content: [{ type: "text", text: content }] } : { type: "paragraph" };
  }
  return { type: "paragraph", content: content.map((c) => ({ type: "text", ...c })) };
}
function bulletList(items: string[]) {
  return {
    type: "bulletList",
    content: items.map((text) => ({ type: "listItem", content: [paragraph(text)] })),
  };
}
function taskList(items: { text: string; checked?: boolean }[]) {
  return {
    type: "taskList",
    content: items.map(({ text, checked }) => ({
      type: "taskItem",
      attrs: { checked: Boolean(checked) },
      content: [paragraph(text)],
    })),
  };
}
function callout(text: string) {
  return { type: "callout", content: [paragraph(text)] };
}

// The sample note created for a brand-new workspace — a short, skimmable
// tour that demonstrates the block editor rather than just describing it.
export function gettingStartedDoc(): Record<string, unknown> {
  return doc(
    heading(1, "Welcome to Scratchpad"),
    paragraph("This note is a quick tour — skim it, try a few things, then delete it whenever you're ready."),
    callout("Tip: press ⌘K (Ctrl+K) anywhere to search notes or jump to an action."),
    heading(2, "The basics"),
    bulletList([
      "Type / on a new line to insert headings, lists, tables, images, and more.",
      "Drag the grip that appears to the left of a block to reorder it.",
      "Type [[ to link to another note by title.",
      "Organize notes into folders in the sidebar — drag a note onto a folder to file it.",
    ]),
    heading(2, "Try it now"),
    taskList([
      { text: "Check off this task", checked: false },
      { text: "Create a new note from the sidebar", checked: false },
      { text: "Open the command menu with ⌘K", checked: false },
    ]),
    heading(2, "Where to go next"),
    bulletList([
      "Settings → Appearance to switch themes",
      "The Calendar view to see notes by day",
      "The note menu (⋯) on any note for export, templates, and more",
    ]),
  );
}
