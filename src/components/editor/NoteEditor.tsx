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
import { ProContext } from "@/lib/editor/pro-context";
import { DatabaseBlock } from "@/lib/editor/database-block";
import { Citation } from "@/lib/editor/citation";
import { BibliographyBlock } from "@/lib/editor/bibliography-block";
import { OutlineZoom } from "@/lib/editor/outline-zoom";
import { BlockDragHandle } from "@/lib/editor/block-drag-handle";
import { NoteLink } from "@/lib/editor/note-link";
import { NoteLinkCommand } from "@/lib/editor/note-link-command";
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
import { ExpirationControl } from "@/components/editor/ExpirationControl";
import { NoteDetailsPanel } from "@/components/editor/NoteDetailsPanel";
import { NoteOutline } from "@/components/editor/NoteOutline";
import { BacklinksPanel } from "@/components/editor/BacklinksPanel";
import { CommentsPanel } from "@/components/editor/CommentsPanel";
import { CitationsPanel } from "@/components/editor/CitationsPanel";
import { useNoteSources } from "@/lib/data/use-note-sources";
import { SaveTemplateDialog } from "@/components/editor/SaveTemplateDialog";
import { ShareDialog } from "@/components/editor/ShareDialog";
import { FindReplaceBar } from "@/components/editor/FindReplaceBar";
import { UpgradeDialog } from "@/components/pro/UpgradeDialog";
import { EncryptDialog } from "@/components/editor/EncryptDialog";
import { UnlockNoteView } from "@/components/editor/UnlockNoteView";
import { StudyModeDialog } from "@/components/editor/StudyModeDialog";
import { SplitNoteDialog } from "@/components/editor/SplitNoteDialog";
import { useIsPro } from "@/lib/use-plan";
import { createNoteVersion } from "@/lib/data/use-note-versions";
import { useCustomTemplates } from "@/lib/data/use-custom-templates";
import { tiptapToMarkdown } from "@/lib/markdown-export";
import { downloadTextFile, printNoteAsPdf } from "@/lib/download";
import { encryptContent } from "@/lib/note-encryption";
import { Lock, Maximize2, Minimize2, Search, AlertTriangle, ZoomIn, ZoomOut } from "lucide-react";
import type { NoteVersion } from "@/lib/types";

const EMPTY_DOC = { type: "doc", content: [{ type: "paragraph" }] };

export function NoteEditor({ note }: { note: Note }) {
  const { notes, workspace, focusMode, setFocusMode, navigate, userId, setSplitNoteId } = useWorkspaceContext();
  const isPro = useIsPro();
  const { saveTemplate } = useCustomTemplates(workspace.id);
  const { sources, addSource, deleteSource } = useNoteSources(note.id);
  const [title, setTitle] = useState(note.title);
  const [wordGoal, setWordGoal] = useState<number | null>(note.word_goal);
  const [isLocked, setIsLocked] = useState(note.is_locked);
  const [isEncrypted, setIsEncrypted] = useState(note.is_encrypted);
  const [unlocked, setUnlocked] = useState(!note.is_encrypted);
  const [encryptDialogOpen, setEncryptDialogOpen] = useState(false);
  const [encryptUpgradeOpen, setEncryptUpgradeOpen] = useState(false);
  const [studyModeOpen, setStudyModeOpen] = useState(false);
  const [zoomedHeading, setZoomedHeading] = useState<{ text: string; pos: number } | null>(null);
  const [splitDialogOpen, setSplitDialogOpen] = useState(false);
  const passphraseRef = useRef<string | null>(null);
  const [reminderAt, setReminderAt] = useState<string | null>(note.reminder_at);
  const [expiresAt, setExpiresAt] = useState<string | null>(note.expires_at);
  const [color, setColor] = useState<string | null>(note.color);
  const [description, setDescription] = useState<string | null>(note.description);
  const [tags, setTags] = useState<string[]>(note.tags);
  const [versionHistoryOpen, setVersionHistoryOpen] = useState(false);
  const [saveTemplateOpen, setSaveTemplateOpen] = useState(false);
  const [findOpen, setFindOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [proBlockUpgradeFeature, setProBlockUpgradeFeature] = useState<string | null>(null);
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
      DatabaseBlock,
      Citation,
      BibliographyBlock,
      OutlineZoom,
      BlockDragHandle,
      Image.configure({ inline: false, allowBase64: false }),
      NoteContext.configure({ workspaceId: note.workspace_id, noteId: note.id }),
      ProContext,
      NoteLink,
      NoteLinkCommand,
      Placeholder.configure({ placeholder: "Write, or press '/' for commands, '[[' to link a note…" }),
      SlashCommand,
      EmojiCommand,
    ],
    content: note.is_encrypted ? EMPTY_DOC : note.content,
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
    setExpiresAt(note.expires_at);
    setColor(note.color);
    setDescription(note.description);
    setTags(note.tags);
    setIsEncrypted(note.is_encrypted);
    setUnlocked(!note.is_encrypted);
    passphraseRef.current = null;
    lastSnapshotAt.current = 0;
    setFindOpen(false);
    setZoomedHeading(null);
    editor?.commands.setContent((note.is_encrypted ? EMPTY_DOC : note.content) as any, false);
  }, [note.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleUnlock = (passphrase: string, decrypted: Record<string, unknown>) => {
    passphraseRef.current = passphrase;
    setUnlocked(true);
    editor?.commands.setContent(decrypted as any, false);
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "f" && !isLocked) {
        e.preventDefault();
        setFindOpen(true);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isLocked]);

  useEffect(() => {
    editor?.setEditable(!isLocked && (!isEncrypted || unlocked));
  }, [editor, isLocked, isEncrypted, unlocked]);

  useEffect(() => {
    if (!editor) return;
    editor.storage.noteLink.notes = notes.notes.map((n) => ({ id: n.id, title: n.title }));
    editor.storage.noteLink.onNavigate = (id: string) => navigate({ name: "note", id });
  }, [editor, notes.notes, navigate]);

  useEffect(() => {
    if (!editor) return;
    editor.storage.proContext.isPro = isPro;
    editor.storage.proContext.requestUpgrade = (feature: string) => setProBlockUpgradeFeature(feature);
  }, [editor, isPro]);

  useEffect(() => {
    if (!editor) return;
    editor.storage.citation.sources = sources;
  }, [editor, sources]);

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
      if (isEncrypted) {
        // Never persist plaintext for an encrypted note, and never snapshot
        // it into note_versions either — that would defeat the point.
        if (!passphraseRef.current) return;
        const payload = await encryptContent(data.content as Record<string, unknown>, passphraseRef.current);
        await notes.updateNote(note.id, {
          title: data.title || "Untitled",
          content: payload as any,
          word_count: stats.wordCount,
          char_count: stats.charCount,
        });
        return;
      }

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
    printNoteAsPdf(title || "Untitled", editor?.getHTML() ?? "", { workspaceName: workspace.name });
  };

  const toggleLock = () => {
    const next = !isLocked;
    setIsLocked(next);
    notes.updateNote(note.id, { is_locked: next });
  };

  const requestEncrypt = () => {
    if (!isPro) {
      setEncryptUpgradeOpen(true);
      return;
    }
    setEncryptDialogOpen(true);
  };

  const handleEncrypt = async (passphrase: string) => {
    const payload = await encryptContent((editor?.getJSON() ?? note.content) as Record<string, unknown>, passphrase);
    passphraseRef.current = passphrase;
    setIsEncrypted(true);
    await notes.updateNote(note.id, { content: payload as any, is_encrypted: true });
  };

  const removeEncryption = async () => {
    const plain = (editor?.getJSON() ?? EMPTY_DOC) as Record<string, unknown>;
    passphraseRef.current = null;
    setIsEncrypted(false);
    await notes.updateNote(note.id, {
      content: plain as any,
      is_encrypted: false,
      word_count: stats.wordCount,
      char_count: stats.charCount,
    });
  };

  const toggleFocusMode = () => {
    setFocusMode(!focusMode);
  };

  const exitZoom = () => {
    editor?.commands.setOutlineZoom(null);
    setZoomedHeading(null);
  };

  const saveAsTemplate = async (name: string) => {
    return saveTemplate(workspace.id, name, (editor?.getJSON() ?? note.content) as Record<string, unknown>);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-3 border-b border-line px-8 py-3">
        <div className="flex flex-wrap items-center gap-0.5">
          <StatusPicker note={note} />
          <NoteDetailsPanel
            color={color}
            description={description}
            tags={tags}
            onChange={(patch) => {
              if (patch.color !== undefined) {
                setColor(patch.color);
                notes.updateNote(note.id, { color: patch.color });
              }
              if (patch.description !== undefined) {
                setDescription(patch.description);
                notes.updateNote(note.id, { description: patch.description });
              }
              if (patch.tags !== undefined) {
                setTags(patch.tags);
                notes.updateNote(note.id, { tags: patch.tags });
              }
            }}
          />
          <ReminderControl
            reminderAt={reminderAt}
            onSetReminder={(iso) => {
              setReminderAt(iso);
              notes.updateNote(note.id, { reminder_at: iso });
            }}
          />
          <ExpirationControl
            expiresAt={expiresAt}
            onSetExpiration={(iso) => {
              setExpiresAt(iso);
              notes.updateNote(note.id, { expires_at: iso });
            }}
          />
          <BacklinksPanel note={note} allNotes={notes.notes} onNavigate={(id) => navigate({ name: "note", id })} />
          <CommentsPanel noteId={note.id} workspaceId={workspace.id} currentUserId={userId} />
          <CitationsPanel
            editor={editor}
            sources={sources}
            onAddSource={(input) => addSource(workspace.id, input)}
            onDeleteSource={deleteSource}
          />
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            title={focusMode ? "Exit focus mode" : "Focus mode"}
            onClick={toggleFocusMode}
            className="flex h-7 w-7 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface-2 hover:text-ink"
          >
            {focusMode ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          </button>
          {editor && !isLocked && (
            <button
              type="button"
              title="Find and replace (⌘F)"
              onClick={() => setFindOpen((v) => !v)}
              className="flex h-7 w-7 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface-2 hover:text-ink"
            >
              <Search size={15} />
            </button>
          )}
          {editor && <NoteOutline editor={editor} contentTick={contentTick} onZoom={setZoomedHeading} />}
          <SaveIndicator state={saveState} onSaveNow={saveNow} />
          <NoteMenu
            note={note}
            onOpenVersionHistory={() => setVersionHistoryOpen(true)}
            onExportMarkdown={exportMarkdown}
            onExportPdf={exportPdf}
            onToggleLock={toggleLock}
            onSaveAsTemplate={() => setSaveTemplateOpen(true)}
            onOpenShare={() => setShareOpen(true)}
            isEncrypted={isEncrypted}
            unlocked={unlocked}
            onEncrypt={requestEncrypt}
            onRemoveEncryption={removeEncryption}
            onOpenStudyMode={() => setStudyModeOpen(true)}
            onSplitRight={() => setSplitDialogOpen(true)}
          />
        </div>
      </div>

      {isLocked && (
        <div className="flex items-center gap-2 bg-warn-soft px-8 py-2 text-[13px] font-medium text-warn">
          <Lock size={12} /> This note is locked — unlock it from the menu to edit.
        </div>
      )}

      {isEncrypted && !unlocked ? (
        <UnlockNoteView content={note.content} onUnlock={handleUnlock} />
      ) : (
        <>
          <div className="mx-auto w-full max-w-[720px] px-8 pb-4 pt-8">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Untitled"
              readOnly={isLocked}
              className="w-full border-none bg-transparent text-[2.25rem] font-bold leading-tight tracking-tight text-ink outline-none placeholder:text-faint"
            />
            {duplicateTitleNote && (
              <button
                type="button"
                onClick={() => navigate({ name: "note", id: duplicateTitleNote.id })}
                className="mt-1.5 flex items-center gap-1.5 text-xs text-warn hover:underline"
              >
                <AlertTriangle size={12} />
                Another note is already titled “{duplicateTitleNote.title}” — open it?
              </button>
            )}
          </div>

          {editor && !isLocked && <EditorToolbar editor={editor} />}
          {editor && findOpen && !isLocked && (
            <FindReplaceBar editor={editor} contentTick={contentTick} onClose={() => setFindOpen(false)} />
          )}
          {zoomedHeading && (
            <div className="flex items-center gap-2 border-b border-line bg-accent-soft px-8 py-2 text-[13px] text-accent-ink">
              <ZoomIn size={13} />
              <span className="truncate">
                Zoomed into <span className="font-medium">{zoomedHeading.text}</span>
              </span>
              <button type="button" onClick={exitZoom} className="ml-auto flex items-center gap-1 font-medium hover:underline">
                <ZoomOut size={13} /> Exit zoom
              </button>
            </div>
          )}

          <div className="min-h-0 flex-1 overflow-y-auto">
            <div className="sp-editor mx-auto max-w-[720px] px-8 py-8">
              <EditorContent editor={editor} />
            </div>
          </div>

          <div className="flex items-center gap-4 border-t border-line bg-surface px-8 py-2 text-xs text-faint">
            <WordGoalControl
              wordCount={stats.wordCount}
              goal={wordGoal}
              onSetGoal={(goal) => {
                setWordGoal(goal);
                notes.updateNote(note.id, { word_goal: goal });
              }}
            />
            {wordGoal && <WordGoalBar wordCount={stats.wordCount} goal={wordGoal} />}
            <span className="tabular-nums">{stats.charCount} characters</span>
            <span className="tabular-nums">{stats.readingTimeMinutes} min read</span>
            <span className="ml-auto tabular-nums">
              Updated {new Date(note.updated_at).toLocaleString()}
            </span>
          </div>
        </>
      )}

      <VersionHistoryDialog
        open={versionHistoryOpen}
        onOpenChange={setVersionHistoryOpen}
        note={note}
        currentTitle={title}
        currentContent={(editor?.getJSON() ?? note.content) as Record<string, unknown>}
        currentWordCount={stats.wordCount}
        onRestore={restoreVersion}
      />
      <SaveTemplateDialog
        open={saveTemplateOpen}
        onOpenChange={setSaveTemplateOpen}
        defaultName={title || "Untitled template"}
        onSave={saveAsTemplate}
      />
      <ShareDialog
        open={shareOpen}
        onOpenChange={setShareOpen}
        note={note}
        onUpdateShare={(patch) => notes.updateNote(note.id, patch)}
      />
      <UpgradeDialog
        open={proBlockUpgradeFeature !== null}
        onOpenChange={(open) => !open && setProBlockUpgradeFeature(null)}
        feature={proBlockUpgradeFeature ?? undefined}
      />
      <EncryptDialog open={encryptDialogOpen} onOpenChange={setEncryptDialogOpen} onConfirm={handleEncrypt} />
      <UpgradeDialog open={encryptUpgradeOpen} onOpenChange={setEncryptUpgradeOpen} feature="Encrypted notes" />
      <StudyModeDialog
        open={studyModeOpen}
        onOpenChange={setStudyModeOpen}
        noteId={note.id}
        content={(editor?.getJSON() ?? note.content) as Record<string, unknown>}
      />
      <SplitNoteDialog
        open={splitDialogOpen}
        onOpenChange={setSplitDialogOpen}
        notes={notes.notes}
        excludeNoteId={note.id}
        onSelect={setSplitNoteId}
      />
    </div>
  );
}
