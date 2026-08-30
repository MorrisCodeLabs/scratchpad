import { Extension } from "@tiptap/core";
import { PluginKey } from "@tiptap/pm/state";
import Suggestion, { type SuggestionOptions } from "@tiptap/suggestion";
import { ReactRenderer } from "@tiptap/react";
import tippy, { type Instance as TippyInstance } from "tippy.js";
import {
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  List,
  ListOrdered,
  ListChecks,
  Quote,
  Code2,
  Minus,
  Table as TableIcon,
  Type,
  Image as ImageIcon,
  Paperclip,
} from "lucide-react";
import { SlashMenu, type SlashMenuHandle, type SlashMenuItem } from "@/components/editor/SlashMenu";
import { pickFile } from "@/lib/editor/pick-file";
import { uploadAttachment } from "@/lib/storage";
import { notifyError } from "@/lib/toast";

async function uploadFromEditor(editor: any, accept: string) {
  const file = await pickFile(accept);
  if (!file) return null;
  const { workspaceId, noteId } = editor.storage.noteContext ?? {};
  if (!workspaceId || !noteId) return null;
  try {
    return await uploadAttachment(workspaceId, noteId, file);
  } catch (err) {
    notifyError(err instanceof Error ? `Upload failed: ${err.message}` : "Upload failed.");
    return null;
  }
}

const ITEMS: SlashMenuItem[] = [
  {
    title: "Text",
    description: "Just start writing with plain text.",
    icon: Type,
    command: ({ editor, range }) => editor.chain().focus().deleteRange(range).setParagraph().run(),
  },
  {
    title: "Heading 1",
    description: "Big section heading.",
    icon: Heading1,
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).setNode("heading", { level: 1 }).run(),
  },
  {
    title: "Heading 2",
    description: "Medium section heading.",
    icon: Heading2,
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).setNode("heading", { level: 2 }).run(),
  },
  {
    title: "Heading 3",
    description: "Small section heading.",
    icon: Heading3,
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).setNode("heading", { level: 3 }).run(),
  },
  {
    title: "Heading 4",
    description: "Small section heading.",
    icon: Heading4,
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).setNode("heading", { level: 4 }).run(),
  },
  {
    title: "Heading 5",
    description: "Smaller section heading.",
    icon: Heading5,
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).setNode("heading", { level: 5 }).run(),
  },
  {
    title: "Heading 6",
    description: "Smallest section heading.",
    icon: Heading6,
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).setNode("heading", { level: 6 }).run(),
  },
  {
    title: "Bulleted list",
    description: "A simple unordered list.",
    icon: List,
    command: ({ editor, range }) => editor.chain().focus().deleteRange(range).toggleBulletList().run(),
  },
  {
    title: "Numbered list",
    description: "A list with numbering.",
    icon: ListOrdered,
    command: ({ editor, range }) => editor.chain().focus().deleteRange(range).toggleOrderedList().run(),
  },
  {
    title: "Checklist",
    description: "Track tasks with checkboxes.",
    icon: ListChecks,
    command: ({ editor, range }) => editor.chain().focus().deleteRange(range).toggleTaskList().run(),
  },
  {
    title: "Quote",
    description: "Capture a quotation.",
    icon: Quote,
    command: ({ editor, range }) => editor.chain().focus().deleteRange(range).toggleBlockquote().run(),
  },
  {
    title: "Code block",
    description: "Capture a code snippet.",
    icon: Code2,
    command: ({ editor, range }) => editor.chain().focus().deleteRange(range).toggleCodeBlock().run(),
  },
  {
    title: "Table",
    description: "Insert a 3x3 table.",
    icon: TableIcon,
    command: ({ editor, range }) =>
      editor.chain().focus().deleteRange(range).insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
  },
  {
    title: "Divider",
    description: "Visually divide sections.",
    icon: Minus,
    command: ({ editor, range }) => editor.chain().focus().deleteRange(range).setHorizontalRule().run(),
  },
  {
    title: "Image",
    description: "Upload and embed an image.",
    icon: ImageIcon,
    command: async ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).run();
      const uploaded = await uploadFromEditor(editor, "image/*");
      if (uploaded) editor.chain().focus().setImage({ src: uploaded.url, alt: uploaded.name }).run();
    },
  },
  {
    title: "File",
    description: "Attach any file for download.",
    icon: Paperclip,
    command: async ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).run();
      const uploaded = await uploadFromEditor(editor, "*/*");
      if (uploaded) editor.chain().focus().setFileBlock(uploaded).run();
    },
  },
];

const suggestion: Omit<SuggestionOptions, "editor"> = {
  pluginKey: new PluginKey("slashCommandSuggestion"),
  char: "/",
  startOfLine: false,
  items: ({ query }) => {
    return ITEMS.filter((item) => item.title.toLowerCase().includes(query.toLowerCase())).slice(0, 10);
  },
  command: ({ editor, range, props }: any) => {
    props.command({ editor, range });
  },
  render: () => {
    let component: ReactRenderer<SlashMenuHandle>;
    let popup: TippyInstance[];

    return {
      onStart: (props) => {
        component = new ReactRenderer(SlashMenu, { props, editor: props.editor });
        if (!props.clientRect) return;
        popup = tippy("body", {
          getReferenceClientRect: props.clientRect as () => DOMRect,
          appendTo: () => document.body,
          content: component.element,
          showOnCreate: true,
          interactive: true,
          trigger: "manual",
          placement: "bottom-start",
        });
      },
      onUpdate(props) {
        component.updateProps(props);
        if (!props.clientRect) return;
        popup[0]?.setProps({ getReferenceClientRect: props.clientRect as () => DOMRect });
      },
      onKeyDown(props) {
        if (props.event.key === "Escape") {
          popup[0]?.hide();
          return true;
        }
        return component.ref?.onKeyDown(props) ?? false;
      },
      onExit() {
        popup?.[0]?.destroy();
        component?.destroy();
      },
    };
  },
};

export const SlashCommand = Extension.create({
  name: "slashCommand",
  addOptions() {
    return { suggestion };
  },
  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ];
  },
});

export { ITEMS as slashCommandItems };
