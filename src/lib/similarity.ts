// A same-workspace similarity check, not a web-scale plagiarism scanner —
// that needs a licensed third-party index (Turnitin/Copyscape) this app
// doesn't have access to. What this *can* honestly do: catch accidental
// near-duplicates and copy-pasted overlap between your own notes, using
// Jaccard similarity over word shingles (order-sensitive phrase overlap,
// not just shared vocabulary).
const SHINGLE_SIZE = 5;

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function shingles(words: string[], size: number): Set<string> {
  if (words.length < size) return new Set(words.length ? [words.join(" ")] : []);
  const set = new Set<string>();
  for (let i = 0; i <= words.length - size; i++) {
    set.add(words.slice(i, i + size).join(" "));
  }
  return set;
}

export function similarityScore(textA: string, textB: string): number {
  const a = shingles(tokenize(textA), SHINGLE_SIZE);
  const b = shingles(tokenize(textB), SHINGLE_SIZE);
  if (a.size === 0 || b.size === 0) return 0;
  let intersection = 0;
  for (const s of a) if (b.has(s)) intersection++;
  const union = a.size + b.size - intersection;
  return union === 0 ? 0 : intersection / union;
}
