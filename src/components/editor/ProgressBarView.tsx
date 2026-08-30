import { NodeViewWrapper, type ReactNodeViewProps } from "@tiptap/react";

export function ProgressBarView({ node, updateAttributes }: ReactNodeViewProps) {
  const value = Math.max(0, Math.min(100, Number(node.attrs.value) || 0));

  return (
    <NodeViewWrapper data-type="progress-bar" className="my-2 rounded-md border border-line bg-surface p-3">
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <input
          contentEditable={false}
          value={node.attrs.label}
          onChange={(e) => updateAttributes({ label: e.target.value })}
          placeholder="Progress"
          className="min-w-0 flex-1 border-none bg-transparent text-sm font-medium text-ink outline-none placeholder:text-faint"
        />
        <span className="shrink-0 text-xs tabular-nums text-faint">{value}%</span>
      </div>
      <input
        contentEditable={false}
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => updateAttributes({ value: Number(e.target.value) })}
        className="w-full accent-accent"
      />
    </NodeViewWrapper>
  );
}
