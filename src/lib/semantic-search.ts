// A lightweight, fully local approximation of semantic search — there's no
// embeddings/vector backend here, so this can't do true meaning-based
// matching. What it adds over a plain substring search: word-order doesn't
// matter, near-matches count (typos, singular/plural, -ing/-ed endings),
// and results are ranked by relevance instead of just included/excluded.
function stem(word: string): string {
  return word
    .toLowerCase()
    .replace(/'(s|d|ll|re|ve)$/, "")
    .replace(/(ing|edly|ed|es|s)$/, "");
}

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9']+/i)
    .map((t) => t.trim())
    .filter(Boolean);
}

// Levenshtein distance, capped early — used only to catch small typos
// between otherwise-similar-length tokens, not full fuzzy search.
function closeEnough(a: string, b: string): boolean {
  if (a === b) return true;
  if (Math.abs(a.length - b.length) > 2) return false;
  const maxDist = a.length <= 4 ? 1 : 2;
  const dp: number[] = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let prev = dp[0];
    dp[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const tmp = dp[j];
      dp[j] = a[i - 1] === b[j - 1] ? prev : 1 + Math.min(prev, dp[j], dp[j - 1]);
      prev = tmp;
    }
  }
  return dp[b.length] <= maxDist;
}

/** Returns a relevance score (0 = no match); higher is more relevant. */
export function semanticScore(query: string, text: string): number {
  const queryTokens = [...new Set(tokenize(query).map(stem))];
  if (queryTokens.length === 0) return 0;
  const textTokens = [...new Set(tokenize(text).map(stem))];
  if (textTokens.length === 0) return 0;

  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase().trim();
  let score = lowerQuery && lowerText.includes(lowerQuery) ? 5 : 0;

  for (const qt of queryTokens) {
    if (textTokens.includes(qt)) {
      score += 2;
      continue;
    }
    const partial = textTokens.some((tt) => tt.length >= 3 && (tt.includes(qt) || qt.includes(tt)));
    if (partial) {
      score += 1;
      continue;
    }
    if (textTokens.some((tt) => closeEnough(qt, tt))) score += 0.75;
  }

  return score;
}
