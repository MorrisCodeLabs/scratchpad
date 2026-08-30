import type { CitationStyle, NoteSource } from "@/lib/types";

export const CITATION_STYLES: { value: CitationStyle; label: string }[] = [
  { value: "apa", label: "APA" },
  { value: "mla", label: "MLA" },
  { value: "chicago", label: "Chicago" },
];

export function formatInlineCitation(source: NoteSource, style: CitationStyle): string {
  const author = source.author || "n.a.";
  const year = source.year ? String(source.year) : "n.d.";
  switch (style) {
    case "mla":
      return `(${author})`;
    case "chicago":
      return `(${author} ${year})`;
    case "apa":
    default:
      return `(${author}, ${year})`;
  }
}

export function formatReference(source: NoteSource, style: CitationStyle): string {
  const author = source.author || "Unknown author";
  const year = source.year ? String(source.year) : "n.d.";
  const title = source.title || "Untitled";
  const url = source.url ? ` ${source.url}` : "";
  switch (style) {
    case "mla":
      return `${author}. "${title}." ${year}.${url}`;
    case "chicago":
      return `${author}. "${title}." ${year}.${url}`;
    case "apa":
    default:
      return `${author}. (${year}). ${title}.${url}`;
  }
}
