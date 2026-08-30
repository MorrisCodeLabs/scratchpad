import { useEffect, useMemo, useRef, useState } from "react";
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
import { FontSize } from "@/lib/editor/font-size";
import { Toggle } from "@/lib/editor/toggle";
import { DefinitionList, DefinitionItem, DefinitionTerm, DefinitionDescription } from "@/lib/editor/definition-list";
import { ProgressBar } from "@/lib/editor/progress-bar";
import { FileBlock } from "@/lib/editor/file-block";
import { MathBlock } from "@/lib/editor/math-block";
import { NoteContext } from "@/lib/editor/note-context";
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
import { WordGoalControl, WordGoalBar } from "@/components/editor/WordGoalControl";
import { VersionHistoryDialog } from "@/components/editor/VersionHistoryDialog";
import { ReminderControl } from "@/components/editor/ReminderControl";
import { useIsPro } from "@/lib/use-plan";
import { createNoteVersion } from "@/lib/data/use-note-versions";
import { tiptapToMarkdown } from "@/lib/markdown-export";
import { downloadTextFile, printNoteAsPdf } from "@/lib/download";
import { Lock } from "lucide-react";
import type { NoteVersion } from "@/lib/types";

export function NoteEditor({ note }: { note: Note }) {
  const { notes, workspace } = useWorkspaceContext();
  const isPro = useIsPro();
  const [title, setTitle] = useState(note.title);
  const [wordGoal, setWordGoal] = useState<number | null>(note.word_goal);
  const [isLocked, setIsLocked] = useState(note.is_locked);
  const [reminderAt, setReminderAt] = useState<string | null>(note.reminder_at);
  const [versionHistoryOpen, setVersionHistoryOpen] = useState(false);
  const lastSnapshotAt = useRef(0);

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
      FileBlock,
      MathBlock,
      Image.configure({ inline: false, allowBase64: false }),
      NoteContext.configure({ workspaceId: note.workspace_id, noteId: note.id }),
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
    setWordGoal(note.word_goal);
    setIsLocked(note.is_locked);
    setReminderAt(note.reminder_at);
    lastSnapshotAt.current = 0;
    editor?.commands.setContent(note.content as any, false);
  }, [note.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    editor?.setEditable(!isLocked);
  }, [editor, isLocked]);

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

      // Pro: snapshot a version, throttled so every autosave tick doesn't
      // spam the table — one snapshot per 3 minutes of active editing is
      // enough to give restore points without flooding note_versions.
      if (isPro) {
        const now = Date.now();
        if (now - lastSnapshotAt.current > 3 * 60 * 1000) {
          lastSnapshotAt.current = now;
          createNoteVersion(workspace.id, note.id, data.title || "Untitled", data.content as any, stats.wordCount);
        }
      }
    },
  });

  useEffect(() => {
    notes.updateNote(note.id, { last_viewed_at: new Date().toISOString() });
    // eslint-disable-line react-hooks/exhaustive-deps
  }, [note.id]);

  const restoreVersion = (version: NoteVersion) => {
    setTitle(version.title);
    editor?.commands.setContent(version.content as any, false);
  };

  const exportMarkdown = () => {
    const markdown = tiptapToMarkdown(editor?.getJSON() ?? note.content, title || "Untitled");
    downloadTextFile(`${(title || "untitled").replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.md`, markdown, "text/markdown");
  };

  const exportPdf = () => {
    printNoteAsPdf(title || "Untitled", editor?.getHTML() ?? "");
  };

  const toggleLock = () => {
    const next = !isLocked;
    setIsLocked(next);
    notes.updateNote(note.id, { is_locked: next });
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-3 border-b border-line px-6 py-2.5">
        <div className="flex items-center gap-1">
          <StatusPicker note={note} />
          <ReminderControl
            reminderAt={reminderAt}
            onSetReminder={(iso) => {
              setReminderAt(iso);
              notes.updateNote(note.id, { reminder_at: iso });
            }}
          />
        </div>
        <div className="flex items-center gap-3">
          <SaveIndicator state={saveState} onSaveNow={saveNow} />
          <NoteMenu
            note={note}
            onOpenVersionHistory={() => setVersionHistoryOpen(true)}
            onExportMarkdown={exportMarkdown}
            onExportPdf={exportPdf}
            onToggleLock={toggleLock}
          />
        </div>
      </div>

      {isLocked && (
        <div className="flex items-center gap-2 bg-warn-soft px-6 py-1.5 text-xs font-medium text-warn">
          <Lock size={12} /> This note is locked — unlock it from the menu to edit.
        </div>
      )}

      <div className="mx-auto w-full max-w-3xl px-6 pb-5 pt-6">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Untitled"
          readOnly={isLocked}
          className="w-full border-none bg-transparent text-3xl font-bold text-ink outline-none placeholder:text-faint"
        />
      </div>

      {editor && !isLocked && <EditorToolbar editor={editor} />}

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="sp-editor mx-auto max-w-3xl px-6 py-6">
          <EditorContent editor={editor} />
        </div>
      </div>

      <div className="flex items-center gap-4 border-t border-line px-6 py-1.5 text-xs text-faint">
        <WordGoalControl
          wordCount={stats.wordCount}
          goal={wordGoal}
          onSetGoal={(goal) => {
            setWordGoal(goal);
            notes.updateNote(note.id, { word_goal: goal });
          }}
        />
        {wordGoal && <WordGoalBar wordCount={stats.wordCount} goal={wordGoal} />}
        <span>{stats.charCount} characters</span>
        <span>{stats.readingTimeMinutes} min read</span>
        <span className="ml-auto">
          Updated {new Date(note.updated_at).toLocaleString()}
        </span>
      </div>

      <VersionHistoryDialog
        open={versionHistoryOpen}
        onOpenChange={setVersionHistoryOpen}
        note={note}
        currentTitle={title}
        currentContent={(editor?.getJSON() ?? note.content) as Record<string, unknown>}
        currentWordCount={stats.wordCount}
        onRestore={restoreVersion}
      />
    </div>
  );
}
