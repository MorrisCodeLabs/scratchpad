function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function countMatchesInDoc(doc: Record<string, unknown> | null | undefined, find: string, caseSensitive = false): number {
  if (!doc || !find) return 0;
  const re = new RegExp(escapeRegExp(find), caseSensitive ? "g" : "gi");
  let count = 0;
  const walk = (node: any) => {
    if (!node) return;
    if (node.type === "text" && typeof node.text === "string") {
      const m = node.text.match(re);
      if (m) count += m.length;
    }
    if (Array.isArray(node.content)) node.content.forEach(walk);
  };
  walk(doc);
  return count;
}

export function replaceTextInDoc(
  doc: Record<string, unknown>,
  find: string,
  replace: string,
  caseSensitive = false,
): { doc: Record<string, unknown>; count: number } {
  const re = new RegExp(escapeRegExp(find), caseSensitive ? "g" : "gi");
  let count = 0;
  const walk = (node: any): any => {
    if (!node) return node;
    if (node.type === "text" && typeof node.text === "string") {
      const matches = node.text.match(re);
      if (matches) count += matches.length;
      return { ...node, text: node.text.replace(re, replace) };
    }
    if (Array.isArray(node.content)) {
      return { ...node, content: node.content.map(walk) };
    }
    return node;
  };
  return { doc: walk(doc), count };
}
