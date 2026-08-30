export interface Flashcard {
  id: string;
  front: string;
  back: string;
}

function textOf(node: any): string {
  if (!node) return "";
  if (node.type === "text") return node.text ?? "";
  if (Array.isArray(node.content)) return node.content.map(textOf).join("");
  return "";
}

// Every definition-list entry (term + description) in the note is a
// flashcard — no separate "mark as flashcard" step needed.
export function extractFlashcards(doc: Record<string, unknown> | null | undefined): Flashcard[] {
  const cards: Flashcard[] = [];
  const walk = (node: any) => {
    if (!node) return;
    if (node.type === "definitionItem") {
      const [term, desc] = node.content ?? [];
      const front = textOf(term).trim();
      const back = textOf(desc).trim();
      if (front && back) cards.push({ id: `${cards.length}-${front}`, front, back });
      return;
    }
    if (Array.isArray(node.content)) node.content.forEach(walk);
  };
  walk(doc);
  return cards;
}
