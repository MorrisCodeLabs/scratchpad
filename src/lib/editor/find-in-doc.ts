import type { Node as ProseMirrorNode } from "@tiptap/pm/model";

export interface DocMatch {
  from: number;
  to: number;
}

export function findMatchesInEditorDoc(doc: ProseMirrorNode, query: string, caseSensitive = false): DocMatch[] {
  if (!query) return [];
  const needle = caseSensitive ? query : query.toLowerCase();
  const matches: DocMatch[] = [];
  doc.descendants((node, pos) => {
    if (!node.isText || !node.text) return;
    const haystack = caseSensitive ? node.text : node.text.toLowerCase();
    let searchFrom = 0;
    while (true) {
      const found = haystack.indexOf(needle, searchFrom);
      if (found === -1) break;
      matches.push({ from: pos + found, to: pos + found + query.length });
      searchFrom = found + 1;
    }
  });
  return matches;
}
