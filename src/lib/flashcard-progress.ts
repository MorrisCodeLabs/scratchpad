// Per-viewer, per-note flashcard progress. Deliberately client-only
// (localStorage) rather than a DB table — this is a lightweight personal
// study aid, not something that needs to sync across devices or members.
export type CardStatus = "known" | "learning";

function storageKey(noteId: string, front: string) {
  return `sp-flashcard:${noteId}:${front}`;
}

export function getCardStatus(noteId: string, front: string): CardStatus | null {
  try {
    return (localStorage.getItem(storageKey(noteId, front)) as CardStatus | null) ?? null;
  } catch {
    return null;
  }
}

export function setCardStatus(noteId: string, front: string, status: CardStatus) {
  try {
    localStorage.setItem(storageKey(noteId, front), status);
  } catch {
    // Private browsing or storage disabled — progress just won't persist.
  }
}
