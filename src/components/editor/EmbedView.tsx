import { useState } from "react";
import { NodeViewWrapper, type ReactNodeViewProps } from "@tiptap/react";
import { Link2, ExternalLink } from "lucide-react";

function toEmbedSrc(url: string): string {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtube.com") || u.hostname === "youtu.be") {
      const id = u.hostname === "youtu.be" ? u.pathname.slice(1) : u.searchParams.get("v");
      if (id) return `https://www.youtube.com/embed/${id}`;
    }
    if (u.hostname.includes("vimeo.com")) {
      const id = u.pathname.split("/").filter(Boolean).pop();
      if (id) return `https://player.vimeo.com/video/${id}`;
    }
  } catch {
    // Not a valid absolute URL — fall through and embed the raw string.
  }
  return url;
}

export function EmbedView({ node, updateAttributes }: ReactNodeViewProps) {
  const [draft, setDraft] = useState(node.attrs.url ?? "");

  if (!node.attrs.url) {
    return (
      <NodeViewWrapper
        data-type="embed"
        contentEditable={false}
        className="my-2 rounded-md border border-line bg-surface p-3"
      >
        <div className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-faint">
          <Link2 size={13} /> Embed
        </div>
        <div className="flex gap-2">
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && draft.trim()) updateAttributes({ url: draft.trim() });
            }}
            placeholder="Paste a link (YouTube, Vimeo, or any URL)…"
            className="w-full rounded border border-line bg-surface-2 px-2 py-1.5 text-sm text-ink outline-none"
          />
          <button
            type="button"
            onClick={() => draft.trim() && updateAttributes({ url: draft.trim() })}
            className="shrink-0 rounded-md bg-accent px-3 py-1.5 text-xs font-medium text-white hover:opacity-90"
          >
            Embed
          </button>
        </div>
      </NodeViewWrapper>
    );
  }

  return (
    <NodeViewWrapper
      data-type="embed"
      contentEditable={false}
      className="my-2 overflow-hidden rounded-md border border-line bg-surface"
    >
      <div className="flex items-center justify-between gap-2 border-b border-line px-3 py-1.5">
        <a
          href={node.attrs.url}
          target="_blank"
          rel="noreferrer"
          className="flex min-w-0 items-center gap-1.5 truncate text-xs text-faint hover:text-ink"
        >
          <ExternalLink size={12} className="shrink-0" />
          <span className="truncate">{node.attrs.url}</span>
        </a>
        <button
          type="button"
          onClick={() => updateAttributes({ url: null })}
          className="shrink-0 text-xs text-faint hover:text-danger"
        >
          Change
        </button>
      </div>
      <iframe src={toEmbedSrc(node.attrs.url)} className="aspect-video w-full" allowFullScreen title="Embedded content" />
    </NodeViewWrapper>
  );
}
