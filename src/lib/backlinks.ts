import type { Note } from "@/lib/types";

function docLinksTo(doc: Record<string, unknown> | null | undefined, targetId: string): boolean {
  if (!doc) return false;
  let found = false;
  const walk = (node: any) => {
    if (!node || found) return;
    if (node.type === "noteLink" && node.attrs?.noteId === targetId) {
      found = true;
      return;
    }
    if (Array.isArray(node.content)) node.content.forEach(walk);
  };
  walk(doc);
  return found;
}

export function findBacklinks(notes: Note[], targetNoteId: string): Note[] {
  return notes.filter((n) => n.id !== targetNoteId && docLinksTo(n.content, targetNoteId));
}
