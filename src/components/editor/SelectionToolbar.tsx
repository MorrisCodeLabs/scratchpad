import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import type { Editor } from "@tiptap/react";
import { Bold, Italic, Underline as UnderlineIcon, Strikethrough, Code, RemoveFormatting } from "lucide-react";
import { cn } from "@/lib/cn";
import { LinkPicker } from "@/components/editor/LinkPicker";
import { TextColorPicker, HighlightColorPicker } from "@/components/editor/ColorPicker";

function ToolbarButton({
  active,
  onClick,
  label,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  label: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted transition-colors",
        "hover:bg-surface-2 hover:text-ink",
        active && "bg-accent-soft text-accent-ink hover:bg-accent-soft hover:text-accent-ink",
      )}
    >
      {children}
    </button>
  );
}

// The bubble/tooltip toolbar that appears above highlighted text. This was
// previously built on Tiptap's `BubbleMenu` (tippy.js under the hood),
// which manages its own DOM node imperatively, outside React's tree — a
// documented source of "removeChild"/"insertBefore" DOM races when React
// re-renders nearby at the same moment. Rebuilt here on React's own
// `createPortal` plus ProseMirror's `coordsAtPos` instead, so the same
// floating toolbar exists but its DOM node is one React actually owns and
// reconciles, not one a separate library is mutating behind React's back.
export function SelectionToolbar({ editor }: { editor: Editor }) {
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    // Radix's Popover (used by the link/color pickers below) moves real DOM
    // focus into its portalled content when it opens — a genuine JS focus
    // change, not a browser mousedown default, so it can't be stopped with
    // preventDefault. Left unhandled, that blur would unconditionally hide
    // this whole toolbar (unmounting the open popover along with it) the
    // instant someone clicked a swatch or the link field. Radix wraps all
    // its portalled popper content in a `[data-radix-popper-content-wrapper]`
    // element, so skip the hide when focus is moving there instead of away
    // from the toolbar entirely.
    const hide = (props?: { event: FocusEvent }) => {
      const related = props?.event.relatedTarget as HTMLElement | null;
      if (related?.closest?.("[data-radix-popper-content-wrapper]")) return;
      setPos(null);
    };

    const update = () => {
      if (!editor.isEditable) {
        hide();
        return;
      }
      const { state, view } = editor;
      const { selection } = state;
      if (selection.empty || !view.hasFocus()) {
        hide();
        return;
      }
      const start = view.coordsAtPos(selection.from);
      const end = view.coordsAtPos(selection.to);
      const top = Math.max(8, Math.min(start.top, end.top) - 46);
      const left = (start.left + end.left) / 2;
      setPos({ top, left });
    };

    editor.on("selectionUpdate", update);
    editor.on("transaction", update);
    editor.on("blur", hide);
    return () => {
      editor.off("selectionUpdate", update);
      editor.off("transaction", update);
      editor.off("blur", hide);
    };
  }, [editor]);

  if (!pos || typeof document === "undefined") return null;

  return createPortal(
    <div
      style={{ position: "fixed", top: pos.top, left: pos.left, transform: "translateX(-50%)" }}
      className="z-50 flex items-center gap-0.5 rounded-lg border border-line bg-surface p-1 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_10px_24px_rgba(0,0,0,0.14)]"
      onMouseDown={(e) => e.preventDefault()}
    >
      <ToolbarButton label="Bold" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
        <Bold size={14} />
      </ToolbarButton>
      <ToolbarButton label="Italic" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
        <Italic size={14} />
      </ToolbarButton>
      <ToolbarButton
        label="Underline"
        active={editor.isActive("underline")}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      >
        <UnderlineIcon size={14} />
      </ToolbarButton>
      <ToolbarButton label="Strikethrough" active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}>
        <Strikethrough size={14} />
      </ToolbarButton>
      <ToolbarButton label="Inline code" active={editor.isActive("code")} onClick={() => editor.chain().focus().toggleCode().run()}>
        <Code size={14} />
      </ToolbarButton>

      <div className="mx-0.5 h-4 w-px shrink-0 bg-line" />

      <LinkPicker editor={editor} />
      <TextColorPicker editor={editor} />
      <HighlightColorPicker editor={editor} />

      <div className="mx-0.5 h-4 w-px shrink-0 bg-line" />

      <ToolbarButton label="Clear formatting" onClick={() => editor.chain().focus().unsetAllMarks().run()}>
        <RemoveFormatting size={14} />
      </ToolbarButton>
    </div>,
    document.body,
  );
}
