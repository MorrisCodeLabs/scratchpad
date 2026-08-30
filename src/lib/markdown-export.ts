// A pragmatic Tiptap-JSON → Markdown serializer covering every block/mark
// this editor produces. Falls back to plain text for anything it doesn't
// recognize rather than throwing, since export should never hard-fail on
// an exotic node.
type JSONNode = { type?: string; text?: string; attrs?: Record<string, any>; content?: JSONNode[]; marks?: { type: string; attrs?: Record<string, any> }[] };

function marksToMarkdown(text: string, marks: JSONNode["marks"] = []): string {
  let out = text;
  for (const mark of marks ?? []) {
    switch (mark.type) {
      case "bold":
        out = `**${out}**`;
        break;
      case "italic":
        out = `_${out}_`;
        break;
      case "strike":
        out = `~~${out}~~`;
        break;
      case "code":
        out = `\`${out}\``;
        break;
      case "link":
        out = `[${out}](${mark.attrs?.href ?? ""})`;
        break;
      default:
        break;
    }
  }
  return out;
}

function inlineToMarkdown(nodes: JSONNode[] = []): string {
  return nodes.map((n) => (n.type === "text" ? marksToMarkdown(n.text ?? "", n.marks) : "")).join("");
}

function listToMarkdown(node: JSONNode, ordered: boolean, depth: number): string {
  const indent = "  ".repeat(depth);
  return (node.content ?? [])
    .map((item, i) => {
      const marker = ordered ? `${i + 1}.` : "-";
      const body = (item.content ?? [])
        .map((child) => blockToMarkdown(child, depth + 1))
        .join("\n")
        .trim();
      return `${indent}${marker} ${body}`;
    })
    .join("\n");
}

function taskListToMarkdown(node: JSONNode, depth: number): string {
  const indent = "  ".repeat(depth);
  return (node.content ?? [])
    .map((item) => {
      const box = item.attrs?.checked ? "[x]" : "[ ]";
      const body = (item.content ?? []).map((child) => blockToMarkdown(child, depth + 1)).join("\n").trim();
      return `${indent}- ${box} ${body}`;
    })
    .join("\n");
}

function blockToMarkdown(node: JSONNode, depth = 0): string {
  switch (node.type) {
    case "paragraph":
      return inlineToMarkdown(node.content) || "";
    case "heading": {
      const level = Number(node.attrs?.level) || 1;
      return `${"#".repeat(level)} ${inlineToMarkdown(node.content)}`;
    }
    case "bulletList":
      return listToMarkdown(node, false, depth);
    case "orderedList":
      return listToMarkdown(node, true, depth);
    case "taskList":
      return taskListToMarkdown(node, depth);
    case "listItem":
      return (node.content ?? []).map((c) => blockToMarkdown(c, depth)).join("\n");
    case "blockquote":
      return (node.content ?? [])
        .map((c) => blockToMarkdown(c, depth))
        .join("\n")
        .split("\n")
        .map((line) => `> ${line}`)
        .join("\n");
    case "codeBlock": {
      const lang = node.attrs?.language ?? "";
      const code = (node.content ?? []).map((c) => c.text ?? "").join("");
      return `\`\`\`${lang}\n${code}\n\`\`\``;
    }
    case "horizontalRule":
      return "---";
    case "image":
      return `![${node.attrs?.alt ?? ""}](${node.attrs?.src ?? ""})`;
    case "table":
      return tableToMarkdown(node);
    case "callout":
      return `> ${(node.content ?? []).map((c) => blockToMarkdown(c, depth)).join(" ")}`;
    case "toggle": {
      const summary = node.attrs?.summary ?? "Toggle";
      const body = (node.content ?? []).map((c) => blockToMarkdown(c, depth)).join("\n");
      return `<details>\n<summary>${summary}</summary>\n\n${body}\n\n</details>`;
    }
    case "progressBar":
      return `**${node.attrs?.label ?? "Progress"}:** ${node.attrs?.value ?? 0}%`;
    case "mathBlock":
      return `$$\n${node.attrs?.latex ?? ""}\n$$`;
    case "fileBlock":
      return `[${node.attrs?.name ?? "file"}](${node.attrs?.url ?? ""})`;
    case "definitionList":
      return (node.content ?? [])
        .map((item) => {
          const [term, desc] = item.content ?? [];
          return `**${inlineToMarkdown(term?.content)}**\n: ${inlineToMarkdown(desc?.content)}`;
        })
        .join("\n\n");
    default:
      return node.content ? (node.content as JSONNode[]).map((c) => blockToMarkdown(c, depth)).join("\n") : "";
  }
}

function tableToMarkdown(node: JSONNode): string {
  const rows = (node.content ?? []).map((row) =>
    (row.content ?? []).map((cell) => inlineToMarkdown(cell.content?.[0]?.content ?? cell.content).replace(/\n/g, " ")),
  );
  if (rows.length === 0) return "";
  const header = rows[0];
  const body = rows.slice(1);
  const lines = [
    `| ${header.join(" | ")} |`,
    `| ${header.map(() => "---").join(" | ")} |`,
    ...body.map((r) => `| ${r.join(" | ")} |`),
  ];
  return lines.join("\n");
}

export function tiptapToMarkdown(doc: Record<string, unknown>, title: string): string {
  const content = ((doc as JSONNode).content ?? []) as JSONNode[];
  const body = content.map((node) => blockToMarkdown(node)).join("\n\n");
  return `# ${title}\n\n${body}\n`;
}
