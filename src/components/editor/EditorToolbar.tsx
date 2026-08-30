import * as React from "react";
import type { Editor } from "@tiptap/react";
import type { Level } from "@tiptap/extension-heading";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Code,
  List,
  ListOrdered,
  ListChecks,
  Quote,
  Superscript as SuperscriptIcon,
  Subscript as SubscriptIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Undo2,
  Redo2,
  RemoveFormatting,
  Code2,
  Minus,
  IndentIncrease,
  IndentDecrease,
  MoreHorizontal,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { TextColorPicker, HighlightColorPicker } from "@/components/editor/ColorPicker";
import { LinkPicker } from "@/components/editor/LinkPicker";

const FONT_FAMILIES = [
  { label: "Default", value: "" },
  { label: "Serif", value: "Georgia, serif" },
  { label: "Monospace", value: "ui-monospace, monospace" },
  { label: "Rounded", value: "system-ui, sans-serif" },
];

const FONT_SIZES = [
  { label: "Default", value: "" },
  { label: "Small", value: "13px" },
  { label: "Normal", value: "16px" },
  { label: "Large", value: "20px" },
  { label: "X-Large", value: "26px" },
];

function ToolbarButton({
  active,
  onClick,
  label,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className={cn(
        "flex h-7 w-7 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface hover:text-ink",
        active && "bg-accent-soft text-accent-ink",
      )}
    >
      {children}
    </button>
  );
}

function ToolbarDivider() {
  return <div className="mx-1.5 h-4 w-px shrink-0 bg-line" />;
}

function ToolbarSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-faint">{label}</p>
      <div className="flex flex-wrap items-center gap-0.5">{children}</div>
    </div>
  );
}

function currentHeadingValue(editor: Editor) {
  for (const level of [1, 2, 3, 4, 5, 6] as Level[]) {
    if (editor.isActive("heading", { level })) return String(level);
  }
  return "0";
}

export function EditorToolbar({ editor }: { editor: Editor }) {
  return (
    <div className="flex items-center gap-0.5 overflow-x-auto border-b border-line bg-surface-2/40 px-8 py-2">
      <ToolbarButton label="Undo" onClick={() => editor.chain().focus().undo().run()}>
        <Undo2 size={15} />
      </ToolbarButton>
      <ToolbarButton label="Redo" onClick={() => editor.chain().focus().redo().run()}>
        <Redo2 size={15} />
      </ToolbarButton>

      <ToolbarDivider />

      <select
        title="Text style"
        value={currentHeadingValue(editor)}
        onChange={(e) => {
          const level = Number(e.target.value);
          if (level === 0) editor.chain().focus().setParagraph().run();
          else editor.chain().focus().toggleHeading({ level: level as Level }).run();
        }}
        className="h-7 shrink-0 rounded-md border border-line bg-surface px-1.5 text-xs text-ink"
      >
        <option value="0">Paragraph</option>
        <option value="1">Heading 1</option>
        <option value="2">Heading 2</option>
        <option value="3">Heading 3</option>
        <option value="4">Heading 4</option>
        <option value="5">Heading 5</option>
        <option value="6">Heading 6</option>
      </select>

      <ToolbarDivider />

      <ToolbarButton label="Bold" active={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
        <Bold size={15} />
      </ToolbarButton>
      <ToolbarButton label="Italic" active={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
        <Italic size={15} />
      </ToolbarButton>
      <ToolbarButton label="Underline" active={editor.isActive("underline")} onClick={() => editor.chain().focus().toggleUnderline().run()}>
        <UnderlineIcon size={15} />
      </ToolbarButton>
      <ToolbarButton label="Strikethrough" active={editor.isActive("strike")} onClick={() => editor.chain().focus().toggleStrike().run()}>
        <Strikethrough size={15} />
      </ToolbarButton>
      <LinkPicker editor={editor} />

      <ToolbarDivider />

      <ToolbarButton label="Bulleted list" active={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>
        <List size={15} />
      </ToolbarButton>
      <ToolbarButton label="Numbered list" active={editor.isActive("orderedList")} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
        <ListOrdered size={15} />
      </ToolbarButton>
      <ToolbarButton label="Checklist" active={editor.isActive("taskList")} onClick={() => editor.chain().focus().toggleTaskList().run()}>
        <ListChecks size={15} />
      </ToolbarButton>

      <ToolbarDivider />

      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            title="More formatting"
            aria-label="More formatting"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface hover:text-ink"
          >
            <MoreHorizontal size={15} />
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" className="flex w-72 flex-col gap-3.5">
          <ToolbarSection label="Font">
            <select
              title="Font family"
              onChange={(e) =>
                e.target.value
                  ? editor.chain().focus().setFontFamily(e.target.value).run()
                  : editor.chain().focus().unsetFontFamily().run()
              }
              className="h-7 flex-1 rounded-md border border-line bg-surface px-1.5 text-xs text-ink"
              defaultValue=""
            >
              {FONT_FAMILIES.map((f) => (
                <option key={f.label} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
            <select
              title="Font size"
              onChange={(e) =>
                e.target.value ? editor.chain().focus().setFontSize(e.target.value).run() : editor.chain().focus().unsetFontSize().run()
              }
              className="h-7 flex-1 rounded-md border border-line bg-surface px-1.5 text-xs text-ink"
              defaultValue=""
            >
              {FONT_SIZES.map((f) => (
                <option key={f.label} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </ToolbarSection>

          <ToolbarSection label="Marks">
            <ToolbarButton label="Inline code" active={editor.isActive("code")} onClick={() => editor.chain().focus().toggleCode().run()}>
              <Code size={15} />
            </ToolbarButton>
            <ToolbarButton
              label="Superscript"
              active={editor.isActive("superscript")}
              onClick={() => editor.chain().focus().toggleSuperscript().run()}
            >
              <SuperscriptIcon size={15} />
            </ToolbarButton>
            <ToolbarButton
              label="Subscript"
              active={editor.isActive("subscript")}
              onClick={() => editor.chain().focus().toggleSubscript().run()}
            >
              <SubscriptIcon size={15} />
            </ToolbarButton>
            <TextColorPicker editor={editor} />
            <HighlightColorPicker editor={editor} />
            <ToolbarButton label="Clear formatting" onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}>
              <RemoveFormatting size={15} />
            </ToolbarButton>
          </ToolbarSection>

          <ToolbarSection label="Alignment">
            <ToolbarButton
              label="Align left"
              active={editor.isActive({ textAlign: "left" })}
              onClick={() => editor.chain().focus().setTextAlign("left").run()}
            >
              <AlignLeft size={15} />
            </ToolbarButton>
            <ToolbarButton
              label="Align center"
              active={editor.isActive({ textAlign: "center" })}
              onClick={() => editor.chain().focus().setTextAlign("center").run()}
            >
              <AlignCenter size={15} />
            </ToolbarButton>
            <ToolbarButton
              label="Align right"
              active={editor.isActive({ textAlign: "right" })}
              onClick={() => editor.chain().focus().setTextAlign("right").run()}
            >
              <AlignRight size={15} />
            </ToolbarButton>
            <ToolbarButton
              label="Justify"
              active={editor.isActive({ textAlign: "justify" })}
              onClick={() => editor.chain().focus().setTextAlign("justify").run()}
            >
              <AlignJustify size={15} />
            </ToolbarButton>
          </ToolbarSection>

          <ToolbarSection label="Blocks">
            <ToolbarButton label="Quote" active={editor.isActive("blockquote")} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
              <Quote size={15} />
            </ToolbarButton>
            <ToolbarButton label="Code block" active={editor.isActive("codeBlock")} onClick={() => editor.chain().focus().toggleCodeBlock().run()}>
              <Code2 size={15} />
            </ToolbarButton>
            <ToolbarButton label="Divider" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
              <Minus size={15} />
            </ToolbarButton>
            <ToolbarButton label="Decrease indent" onClick={() => editor.chain().focus().liftListItem("listItem").run()}>
              <IndentDecrease size={15} />
            </ToolbarButton>
            <ToolbarButton label="Increase indent" onClick={() => editor.chain().focus().sinkListItem("listItem").run()}>
              <IndentIncrease size={15} />
            </ToolbarButton>
          </ToolbarSection>
        </PopoverContent>
      </Popover>
    </div>
  );
}
