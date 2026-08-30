import { NodeViewContent, NodeViewWrapper, type ReactNodeViewProps } from "@tiptap/react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/cn";

export function ToggleView({ node, updateAttributes }: ReactNodeViewProps) {
  const open = node.attrs.open !== false;

  return (
    <NodeViewWrapper data-type="toggle" className="my-1 rounded-md">
      <div className="flex items-start gap-1.5">
        <button
          type="button"
          contentEditable={false}
          onClick={() => updateAttributes({ open: !open })}
          className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded text-muted hover:bg-surface-2"
        >
          <ChevronRight size={14} className={cn("transition-transform", open && "rotate-90")} />
        </button>
        <input
          contentEditable={false}
          value={node.attrs.summary}
          onChange={(e) => updateAttributes({ summary: e.target.value })}
          placeholder="Toggle"
          className="mt-1 flex-1 border-none bg-transparent py-0.5 text-sm font-medium text-ink outline-none placeholder:text-faint"
        />
      </div>
      <NodeViewContent className={cn("ml-6 border-l border-line pl-3", !open && "hidden")} />
    </NodeViewWrapper>
  );
}
