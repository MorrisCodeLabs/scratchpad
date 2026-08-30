import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Link from "@tiptap/extension-link";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableHeader from "@tiptap/extension-table-header";
import TableCell from "@tiptap/extension-table-cell";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import TextStyle from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import FontFamily from "@tiptap/extension-font-family";
import TextAlign from "@tiptap/extension-text-align";
import { Image } from "@/lib/editor/image";
import { Callout } from "@/lib/editor/callout";
import { FileBlock } from "@/lib/editor/file-block";
import { MathBlock } from "@/lib/editor/math-block";
import { Embed } from "@/lib/editor/embed";
import { Footnote } from "@/lib/editor/footnote";
import { SketchBlock } from "@/lib/editor/sketch-block";
import { NoteLink } from "@/lib/editor/note-link";
import { Globe } from "lucide-react";

export function SharedNoteView({
  title,
  content,
  updatedAt,
}: {
  title: string;
  content: Record<string, unknown>;
  updatedAt: string;
}) {
  const editor = useEditor({
    editable: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3, 4, 5, 6] } }),
      Underline,
      Highlight.configure({ multicolor: true }),
      Link.configure({ openOnClick: true }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Table.configure({ resizable: false }),
      TableRow,
      TableHeader,
      TableCell,
      Subscript,
      Superscript,
      TextStyle,
      Color,
      FontFamily,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Callout,
      FileBlock,
      MathBlock,
      Embed,
      Footnote,
      SketchBlock,
      Image.configure({ inline: false, allowBase64: false }),
      NoteLink,
    ],
    content,
  });

  return (
    <div className="min-h-screen bg-bg text-ink">
      <div className="mx-auto flex max-w-[720px] flex-col gap-1 px-8 pb-4 pt-10">
        <div className="flex items-center gap-1.5 text-xs font-medium text-faint">
          <Globe size={12} /> Shared from Scratchpad
        </div>
        <h1 className="text-[2.25rem] font-bold leading-tight tracking-tight text-ink">{title || "Untitled"}</h1>
        <p className="text-xs text-faint">Last updated {new Date(updatedAt).toLocaleString()}</p>
      </div>
      <div className="sp-editor mx-auto max-w-[720px] px-8 pb-16">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
