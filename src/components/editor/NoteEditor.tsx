import { useEffect, useMemo, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Highlight from "@tiptap/extension-highlight";
import Placeholder from "@tiptap/extension-placeholder";
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
import { Callout } from "@/lib/editor/callout";
import { FontSize } from "@/lib/editor/font-size";
import { Toggle } from "@/lib/editor/toggle";
import { DefinitionList, DefinitionItem, DefinitionTerm, DefinitionDescription } from "@/lib/editor/definition-list";
import { ProgressBar } from "@/lib/editor/progress-bar";
import { EmojiCommand } from "@/lib/editor/emoji-command";
import { SlashCommand } from "@/lib/editor/slash-command";
import { EditorToolbar } from "@/components/editor/EditorToolbar";
import { useAutosave } from "@/lib/data/use-autosave";
import { useWorkspaceContext } from "@/lib/workspace-context";
import { computeStats } from "@/lib/text-stats";
import type { Note } from "@/lib/types";
import { SaveIndicator } from "@/components/editor/SaveIndicator";
import { NoteMenu } from "@/components/editor/NoteMenu";
import { StatusPicker } from "@/components/editor/StatusPicker";

export function NoteEditor({ note }: { note: Note }) {
  const { notes } = useWorkspaceContext();
  const [title, setTitle] = useState(note.title);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3, 4, 5, 6] } }),
      Underline,
      Highlight.configure({ multicolor: true }),
      Link.configure({ openOnClick: false }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      Subscript,
      Superscript,
      TextStyle,
      Color,
      FontFamily,
      FontSize,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Callout,
      Toggle,
      DefinitionList,
      DefinitionItem,
      DefinitionTerm,
      DefinitionDescription,
      ProgressBar,
      Placeholder.configure({ placeholder: "Write, or press '/' for commands…" }),
      SlashCommand,
      EmojiCommand,
    ],
    content: note.content,
    editorProps: {
      attributes: { class: "sp-editor-content" },
    },
  });

  // Reset local state when navigating between notes.
  useEffect(() => {
    setTitle(note.title);
    editor?.commands.setContent(note.content as any, false);
  }, [note.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const [contentTick, setContentTick] = useState(0);
  useEffect(() => {
    if (!editor) return;
    const onUpdate = () => setContentTick((t) => t + 1);
    editor.on("update", onUpdate);
    return () => {
      editor.off("update", onUpdate);
    };
  }, [editor]);

  const stats = useMemo(() => computeStats(editor?.getJSON() as any), [editor, contentTick]);

  const saveData = useMemo(
    () => ({ title, content: editor?.getJSON() ?? note.content }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [title, contentTick],
  );

  const { saveState, saveNow } = useAutosave({
    data: saveData,
    onSave: async (data) => {
      await notes.updateNote(note.id, {
        title: data.title || "Untitled",
        content: data.content as any,
        word_count: stats.wordCount,
        char_count: stats.charCount,
      });
    },
  });

  useEffect(() => {
    notes.updateNote(note.id, { last_viewed_at: new Date().toISOString() });
    // eslint-disable-line react-hooks/exhaustive-deps
  }, [note.id]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-3 border-b border-line px-6 py-2.5">
        <StatusPicker note={note} />
        <div className="flex items-center gap-3">
          <SaveIndicator state={saveState} onSaveNow={saveNow} />
          <NoteMenu note={note} />
        </div>
      </div>

      <div className="mx-auto w-full max-w-3xl px-6 pt-6">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Untitled"
          className="w-full border-none bg-transparent text-3xl font-bold text-ink outline-none placeholder:text-faint"
        />
      </div>

      {editor && <EditorToolbar editor={editor} />}

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="sp-editor mx-auto max-w-3xl px-6 py-6">
          <EditorContent editor={editor} />
        </div>
      </div>

      <div className="flex items-center gap-4 border-t border-line px-6 py-1.5 text-xs text-faint">
        <span>{stats.wordCount} words</span>
        <span>{stats.charCount} characters</span>
        <span>{stats.readingTimeMinutes} min read</span>
        <span className="ml-auto">
          Updated {new Date(note.updated_at).toLocaleString()}
        </span>
      </div>
    </div>
  );
}
