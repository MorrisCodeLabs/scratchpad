import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  ImageRun,
  WidthType,
  AlignmentType,
} from "docx";

type JSONNode = {
  type?: string;
  text?: string;
  attrs?: Record<string, any>;
  content?: JSONNode[];
  marks?: { type: string; attrs?: Record<string, any> }[];
};

const HEADING_LEVELS = [
  HeadingLevel.HEADING_1,
  HeadingLevel.HEADING_2,
  HeadingLevel.HEADING_3,
  HeadingLevel.HEADING_4,
  HeadingLevel.HEADING_5,
  HeadingLevel.HEADING_6,
];

function textRuns(nodes: JSONNode[] = []): TextRun[] {
  return nodes
    .filter((n) => n.type === "text" && typeof n.text === "string")
    .map((n) => {
      const marks = n.marks ?? [];
      return new TextRun({
        text: n.text ?? "",
        bold: marks.some((m) => m.type === "bold"),
        italics: marks.some((m) => m.type === "italic"),
        strike: marks.some((m) => m.type === "strike"),
        font: marks.some((m) => m.type === "code") ? "IBM Plex Mono" : undefined,
      });
    });
}

async function imageParagraph(node: JSONNode): Promise<Paragraph> {
  try {
    const res = await fetch(node.attrs?.src);
    const buffer = await res.arrayBuffer();
    return new Paragraph({
      children: [new ImageRun({ data: buffer, transformation: { width: 420, height: 280 }, type: "png" })],
      alignment: AlignmentType.CENTER,
    });
  } catch {
    return new Paragraph({ children: [new TextRun({ text: `[Image: ${node.attrs?.alt || "untitled"}]`, italics: true })] });
  }
}

async function tableToDocx(node: JSONNode): Promise<Table | null> {
  const rows = node.content ?? [];
  if (rows.length === 0) return null;
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: rows.map(
      (row) =>
        new TableRow({
          children: (row.content ?? []).map(
            (cell) =>
              new TableCell({
                children: (cell.content ?? []).map((c) => new Paragraph({ children: textRuns(c.content) })),
              }),
          ),
        }),
    ),
  });
}

// Used by blockquote and callout: indented, left-bordered paragraphs.
// Nested paragraph children get the framing directly; anything else (a
// list, a nested quote) falls back to its normal rendering, unframed.
async function quotedParagraphs(nodes: JSONNode[], indentLeft: number): Promise<(Paragraph | Table)[]> {
  const out: (Paragraph | Table)[] = [];
  for (const child of nodes) {
    if (child.type === "paragraph") {
      out.push(
        new Paragraph({
          indent: { left: indentLeft },
          border: { left: { color: "999999", space: 8, style: "single", size: 12 } },
          children: textRuns(child.content),
        }),
      );
    } else {
      out.push(...(await blockToDocx(child)));
    }
  }
  return out;
}

async function blockToDocx(node: JSONNode): Promise<(Paragraph | Table)[]> {
  switch (node.type) {
    case "paragraph":
      return [new Paragraph({ children: textRuns(node.content) })];
    case "heading": {
      const level = Math.min(6, Math.max(1, Number(node.attrs?.level) || 1));
      return [new Paragraph({ heading: HEADING_LEVELS[level - 1], children: textRuns(node.content) })];
    }
    case "bulletList":
    case "orderedList": {
      const out: Paragraph[] = [];
      for (const item of node.content ?? []) {
        for (const child of item.content ?? []) {
          if (child.type !== "paragraph") continue;
          out.push(
            new Paragraph({
              bullet: node.type === "bulletList" ? { level: 0 } : undefined,
              numbering: node.type === "orderedList" ? { reference: "default-numbering", level: 0 } : undefined,
              children: textRuns(child.content),
            }),
          );
        }
      }
      return out;
    }
    case "taskList": {
      const out: Paragraph[] = [];
      for (const item of node.content ?? []) {
        const box = item.attrs?.checked ? "☑" : "☐";
        const paragraph = item.content?.[0];
        out.push(new Paragraph({ children: [new TextRun({ text: `${box} ` }), ...textRuns(paragraph?.content)] }));
      }
      return out;
    }
    case "blockquote":
    case "callout":
      return quotedParagraphs(node.content ?? [], 480);
    case "codeBlock": {
      const code = (node.content ?? []).map((c) => c.text ?? "").join("");
      return code.split("\n").map((line) => new Paragraph({ children: [new TextRun({ text: line, font: "IBM Plex Mono" })] }));
    }
    case "horizontalRule":
      return [new Paragraph({ border: { bottom: { color: "999999", space: 1, style: "single", size: 6 } } })];
    case "image":
      return [await imageParagraph(node)];
    case "table": {
      const table = await tableToDocx(node);
      return table ? [table] : [];
    }
    default:
      return [];
  }
}

export async function tiptapToDocx(doc: Record<string, unknown>, title: string): Promise<Blob> {
  const content = ((doc as JSONNode).content ?? []) as JSONNode[];
  const bodyParagraphs: (Paragraph | Table)[] = [];
  for (const node of content) {
    bodyParagraphs.push(...(await blockToDocx(node)));
  }

  const document = new Document({
    numbering: {
      config: [
        {
          reference: "default-numbering",
          levels: [{ level: 0, format: "decimal", text: "%1.", alignment: AlignmentType.START }],
        },
      ],
    },
    sections: [
      {
        children: [new Paragraph({ heading: HeadingLevel.TITLE, children: [new TextRun({ text: title })] }), ...bodyParagraphs],
      },
    ],
  });

  return Packer.toBlob(document);
}
