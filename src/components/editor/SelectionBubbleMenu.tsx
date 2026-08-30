import type { ReactNode } from "react";
import type { Editor } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react";
import { Bold, Italic, Underline as UnderlineIcon, Strikethrough, Code, RemoveFormatting } from "lucide-react";
import { cn } from "@/lib/cn";
import { LinkPicker } from "@/components/editor/LinkPicker";
import { TextColorPicker, HighlightColorPicker } from "@/components/editor/ColorPicker";

function BubbleButton({
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

// A floating selection toolbar (Notion/Medium-style bubble menu): appears
// right above highlighted text with only the marks people reach for while
// selecting, so formatting never depends on scrolling to the side panel.
export function SelectionBubbleMenu({ editor }: { editor: Editor }) {
  return (
    <BubbleMenu
      editor={editor}
      tippyOptions={{ duration: 120, offset: [0, 10] }}
      shouldShow={({ state, from, to }) => from !== to && !state.selection.empty}
    >
      <div className="flex items-center gap-0.5 rounded-lg border border-line bg-surface p-1 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_10px_24px_rgba(0,0,0,0.14)]">
        <BubbleButton label="Bold" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
          <Bold size={14} />
        </BubbleButton>
        <BubbleButton label="Italic" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <Italic size={14} />
        </BubbleButton>
        <BubbleButton
          label="Underline"
          active={editor.isActive("underline")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <UnderlineIcon size={14} />
        </BubbleButton>
        <BubbleButton label="Strikethrough" active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}>
          <Strikethrough size={14} />
        </BubbleButton>
        <BubbleButton label="Inline code" active={editor.isActive("code")} onClick={() => editor.chain().focus().toggleCode().run()}>
          <Code size={14} />
        </BubbleButton>

        <div className="mx-0.5 h-4 w-px shrink-0 bg-line" />

        <LinkPicker editor={editor} />
        <TextColorPicker editor={editor} />
        <HighlightColorPicker editor={editor} />

        <div className="mx-0.5 h-4 w-px shrink-0 bg-line" />

        <BubbleButton label="Clear formatting" onClick={() => editor.chain().focus().unsetAllMarks().run()}>
          <RemoveFormatting size={14} />
        </BubbleButton>
      </div>
    </BubbleMenu>
  );
}
