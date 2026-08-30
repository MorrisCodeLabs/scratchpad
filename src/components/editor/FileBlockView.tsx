import { NodeViewWrapper, type ReactNodeViewProps } from "@tiptap/react";
import { FileText, Music, Download } from "lucide-react";

function formatSize(bytes: number) {
  if (!bytes) return "";
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex++;
  }
  return `${value.toFixed(value < 10 && unitIndex > 0 ? 1 : 0)} ${units[unitIndex]}`;
}

export function FileBlockView({ node }: ReactNodeViewProps) {
  const { url, name, size, contentType } = node.attrs;
  const isAudio = typeof contentType === "string" && contentType.startsWith("audio/");

  return (
    <NodeViewWrapper data-type="file-block" className="my-2">
      {isAudio ? (
        <div className="rounded-md border border-line bg-surface p-3">
          <div className="mb-2 flex items-center gap-2 text-sm text-ink">
            <Music size={15} className="shrink-0 text-faint" />
            <span className="truncate font-medium">{name}</span>
          </div>
          <audio controls src={url} className="w-full" contentEditable={false} />
        </div>
      ) : (
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          contentEditable={false}
          className="flex items-center gap-3 rounded-md border border-line bg-surface p-3 hover:bg-surface-2"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-surface-2 text-faint">
            <FileText size={16} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium text-ink">{name}</span>
            <span className="block text-xs text-faint">{formatSize(size)}</span>
          </span>
          <Download size={15} className="shrink-0 text-faint" />
        </a>
      )}
    </NodeViewWrapper>
  );
}
