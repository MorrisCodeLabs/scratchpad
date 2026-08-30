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
import Image from "@tiptap/extension-image";
import { Callout } from "@/lib/editor/callout";
import { MathBlock } from "@/lib/editor/math-block";
import { Embed } from "@/lib/editor/embed";
import { Footnote } from "@/lib/editor/footnote";
import { SketchBlock } from "@/lib/editor/sketch-block";
import { FileBlock } from "@/lib/editor/file-block";
import { NoteContext } from "@/lib/editor/note-context";
import { BlockDragHandle } from "@/lib/editor/block-drag-handle";
import { NoteLink } from "@/lib/editor/note-link";
import { NoteLinkCommand } from "@/lib/editor/note-link-command";
import { SlashCommand } from "@/lib/editor/slash-command";
import { EditorToolbar } from "@/components/editor/EditorToolbar";
import { useAutosave } from "@/lib/data/use-autosave";
import { SelectionToolbar } from "@/components/editor/SelectionToolbar";
import { useWorkspaceContext } from "@/lib/workspace-context";
import { computeStats } from "@/lib/text-stats";
import type { Note } from "@/lib/types";
import { SaveIndicator } from "@/components/editor/SaveIndicator";
import { NoteMenu } from "@/components/editor/NoteMenu";
import { NoteOutline } from "@/components/editor/NoteOutline";
import { BacklinksPanel } from "@/components/editor/BacklinksPanel";
import { NoteTagsPopover } from "@/components/editor/NoteTagsPopover";
import { ShareDialog } from "@/components/editor/ShareDialog";
import { tiptapToMarkdown } from "@/lib/markdown-export";
import { docToText } from "@/lib/text-stats";
import { downloadTextFile } from "@/lib/download";
import { Lock, Maximize2, Minimize2, AlertTriangle } from "lucide-react";

export function NoteEditor({ note }: { note: Note }) {
  const { notes, focusMode, setFocusMode, navigate } = useWorkspaceContext();
  const [title, setTitle] = useState(note.title);
  const [isLocked, setIsLocked] = useState(note.is_locked);
  const [tags, setTags] = useState<string[]>(note.tags);
  const [shareOpen, setShareOpen] = useState(false);

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
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Callout,
      MathBlock,
      Embed,
      Footnote,
      SketchBlock,
      FileBlock,
      Image.configure({ inline: false, allowBase64: false }),
      NoteContext.configure({ workspaceId: note.workspace_id, noteId: note.id }),
      BlockDragHandle,
      NoteLink,
      NoteLinkCommand,
      Placeholder.configure({ placeholder: "Write, or press '/' for commands, '[[' to link a note…" }),
      SlashCommand,
    ],
    content: note.content,
    editorProps: {
      attributes: { class: "sp-editor-content" },
    },
  });

  // Reset local state when navigating between notes.
  useEffect(() => {
    setTitle(note.title);
    setIsLocked(note.is_locked);
    setTags(note.tags);
    editor?.commands.setContent(note.content as any, false);
  }, [note.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    editor?.setEditable(!isLocked);
  }, [editor, isLocked]);

  useEffect(() => {
    if (!editor) return;
    editor.storage.noteLink.notes = notes.notes.map((n) => ({ id: n.id, title: n.title }));
    editor.storage.noteLink.onNavigate = (id: string) => navigate({ name: "note", id });
  }, [editor, notes.notes, navigate]);

  const [contentTick, setContentTick] = useState(0);
  useEffect(() => {
    if (!editor) return;
    const onUpdate = () => setContentTick((t) => t + 1);
    editor.on("update", onUpdate);
    return () => {
      editor.off("update", onUpdate);
    };
  }, [editor]);

  // The toolbar reads editor.isActive()/getAttributes() during render, which
  // only reflects the current selection — moving the cursor without editing
  // (arrow keys, clicking elsewhere) doesn't fire "update", so without this
  // the toolbar's active/disabled states go stale until the next edit.
  const [, forceToolbarRerender] = useState(0);
  useEffect(() => {
    if (!editor) return;
    const rerender = () => forceToolbarRerender((t) => t + 1);
    editor.on("transaction", rerender);
    return () => {
      editor.off("transaction", rerender);
    };
  }, [editor]);

  const stats = useMemo(() => computeStats(editor?.getJSON() as any), [editor, contentTick]);

  const duplicateTitleNote = useMemo(() => {
    const trimmed = title.trim().toLowerCase();
    if (!trimmed) return null;
    return notes.notes.find((n) => n.id !== note.id && n.title.trim().toLowerCase() === trimmed) ?? null;
  }, [notes.notes, note.id, title]);

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

  const toggleLock = () => {
    const next = !isLocked;
    setIsLocked(next);
    notes.updateNote(note.id, { is_locked: next });
  };

  const toggleFocusMode = () => {
    setFocusMode(!focusMode);
  };

  const updateTags = (next: string[]) => {
    setTags(next);
    notes.updateNote(note.id, { tags: next });
  };

  const exportMarkdown = () => {
    const markdown = tiptapToMarkdown(editor?.getJSON() ?? note.content, title || "Untitled");
    downloadTextFile(`${(title || "untitled").replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.md`, markdown, "text/markdown");
  };

  const exportText = () => {
    const text = docToText(editor?.getJSON() ?? note.content);
    downloadTextFile(`${(title || "untitled").replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.txt`, `${title || "Untitled"}\n\n${text}`, "text/plain");
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-3 border-b border-line px-8 py-3">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Untitled"
          readOnly={isLocked}
          className="min-w-0 flex-1 truncate border-none bg-transparent text-[17px] font-semibold text-ink outline-none placeholder:text-faint"
        />
        <div className="flex items-center gap-1">
          {!focusMode && (
            <>
              <NoteTagsPopover tags={tags} onChange={updateTags} />
              <BacklinksPanel note={note} allNotes={notes.notes} onNavigate={(id) => navigate({ name: "note", id })} />
              <div className="mx-0.5 h-4 w-px shrink-0 bg-line" />
            </>
          )}
          <button
            type="button"
            title={focusMode ? "Exit focus mode" : "Focus mode"}
            onClick={toggleFocusMode}
            className="flex h-7 w-7 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface-2 hover:text-ink"
          >
            {focusMode ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>
          {editor && <NoteOutline editor={editor} contentTick={contentTick} />}
          <SaveIndicator state={saveState} onSaveNow={saveNow} />
          <NoteMenu
            note={note}
            onToggleLock={toggleLock}
            onExportMarkdown={exportMarkdown}
            onExportText={exportText}
            onOpenShare={() => setShareOpen(true)}
          />
        </div>
      </div>

      {editor && (
        <div className={isLocked ? "pointer-events-none opacity-40" : undefined} aria-hidden={isLocked}>
          <EditorToolbar editor={editor} />
        </div>
      )}

      {isLocked && (
        <div className="flex items-center gap-2 bg-warn-soft px-8 py-2 text-[13px] font-medium text-warn">
          <Lock size={12} /> This note is locked — unlock it from the menu to edit.
        </div>
      )}

      {duplicateTitleNote && (
        <button
          type="button"
          onClick={() => navigate({ name: "note", id: duplicateTitleNote.id })}
          className="flex items-center gap-1.5 bg-warn-soft px-8 py-2 text-left text-[13px] font-medium text-warn hover:underline"
        >
          <AlertTriangle size={12} />
          Another note is already titled “{duplicateTitleNote.title}” — open it?
        </button>
      )}

      <div className="flex min-h-0 flex-1 flex-col">
        {editor && !isLocked && <SelectionToolbar editor={editor} />}

        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="sp-editor mx-auto max-w-[720px] px-8 py-8">
            <EditorContent editor={editor} />
          </div>
        </div>

        <div className="flex items-center gap-4 border-t border-line bg-surface px-8 py-2 text-xs text-faint">
          <span className="tabular-nums">{stats.wordCount} words</span>
          <span className="tabular-nums">{stats.charCount} characters</span>
          <span className="tabular-nums">{stats.readingTimeMinutes} min read</span>
          <span className="ml-auto tabular-nums">Updated {new Date(note.updated_at).toLocaleString()}</span>
        </div>
      </div>

      <ShareDialog
        open={shareOpen}
        onOpenChange={setShareOpen}
        note={note}
        onUpdateShare={(patch) => notes.updateNote(note.id, patch)}
      />
    </div>
  );
}
