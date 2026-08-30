// A minimal offline write queue: when a save fails because the browser is
// offline, the pending payload is mirrored into localStorage keyed by note
// id. It survives a reload/crash while offline (unlike an in-memory retry),
// and gets replayed — by NoteEditor re-applying it to the editor, then
// autosave's own online-listener flushing it like any other edit — the
// moment the note is reopened or connectivity returns.
const PREFIX = "scratchpad:offline:";

export interface QueuedSave {
  data: unknown;
  queuedAt: string;
}

export function queueOfflineSave(key: string, data: unknown) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify({ data, queuedAt: new Date().toISOString() } satisfies QueuedSave));
  } catch {
    // Storage full or unavailable (private browsing) — the in-memory retry
    // on reconnect still covers the same-session case, just not a reload.
  }
}

export function readOfflineSave(key: string): QueuedSave | null {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw ? (JSON.parse(raw) as QueuedSave) : null;
  } catch {
    return null;
  }
}

export function clearOfflineSave(key: string) {
  try {
    localStorage.removeItem(PREFIX + key);
  } catch {
    // ignore
  }
}
