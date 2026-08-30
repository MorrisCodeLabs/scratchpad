import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import { Command } from "cmdk";
import { FileText, Plus, Trash2, Settings, Moon, Sun, Star, Pin, Keyboard, Replace, Upload } from "lucide-react";
import { useWorkspaceContext } from "@/lib/workspace-context";
import { useTheme } from "@/lib/use-theme";
import { useShortcutsDialog } from "@/lib/use-shortcuts-dialog";
import { useIsPro } from "@/lib/use-plan";
import { GlobalFindReplaceDialog } from "@/components/GlobalFindReplaceDialog";
import { pickFiles } from "@/lib/editor/pick-files";
import { importedFileToTiptapJSON, titleFromFilename } from "@/lib/import-markdown";
import { computeStats } from "@/lib/text-stats";

export function CommandMenu() {
  const { workspace, notes, commandMenuOpen, setCommandMenuOpen, navigate } = useWorkspaceContext();
  const { theme, toggleTheme } = useTheme();
  const { open: openShortcuts } = useShortcutsDialog();
  const isPro = useIsPro();
  const [globalFindOpen, setGlobalFindOpen] = useState(false);

  const importNotes = async () => {
    const files = await pickFiles(".md,.markdown,.txt,text/markdown,text/plain");
    if (files.length === 0) return;
    const toImport = isPro ? files : files.slice(0, 1);
    for (const file of toImport) {
      const text = await file.text();
      const content = importedFileToTiptapJSON(file.name, text);
      const stats = computeStats(content);
      const note = await notes.createNote(workspace.id, null);
      if (!note) continue;
      await notes.updateNote(note.id, {
        title: titleFromFilename(file.name),
        content: content as never,
        word_count: stats.wordCount,
        char_count: stats.charCount,
      });
    }
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setCommandMenuOpen(!commandMenuOpen);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [commandMenuOpen, setCommandMenuOpen]);

  const run = (fn: () => void) => {
    fn();
    setCommandMenuOpen(false);
  };

  const sortedNotes = useMemo(
    () => [...notes.notes].sort((a, b) => (a.is_pinned === b.is_pinned ? 0 : a.is_pinned ? -1 : 1)),
    [notes.notes],
  );

  return (
    <>
    <Command.Dialog
      open={commandMenuOpen}
      onOpenChange={setCommandMenuOpen}
      label="Command menu"
      className="fixed left-1/2 top-[15%] z-50 w-full max-w-xl -translate-x-1/2 overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_1px_2px_rgba(0,0,0,0.04),0_24px_48px_rgba(0,0,0,0.16)]"
    >
      <div className="flex items-center border-b border-line px-4">
        <Command.Input
          autoFocus
          placeholder="Search notes, or run a command…"
          className="h-12 w-full bg-transparent text-[14.5px] text-ink outline-none placeholder:text-faint"
        />
      </div>
      <Command.List className="max-h-96 overflow-y-auto p-2">
        <Command.Empty className="px-2 py-6 text-center text-sm text-faint">No results found.</Command.Empty>

        <Command.Group heading="Actions" className="mb-1 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:pb-1 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wide [&_[cmdk-group-heading]]:text-faint">
          <Item onSelect={() => run(async () => {
            const note = await notes.createNote(workspace.id, null);
            if (note) navigate({ name: "note", id: note.id });
          })}>
            <Plus size={14} /> New note
          </Item>
          <Item onSelect={() => run(() => navigate({ name: "trash" }))}>
            <Trash2 size={14} /> Open trash
          </Item>
          <Item onSelect={() => run(() => navigate({ name: "settings" }))}>
            <Settings size={14} /> Open settings
          </Item>
          <Item onSelect={() => run(toggleTheme)}>
            {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
            Toggle theme
          </Item>
          <Item onSelect={() => run(openShortcuts)}>
            <Keyboard size={14} /> Keyboard shortcuts
          </Item>
          {isPro && (
            <Item onSelect={() => run(() => setGlobalFindOpen(true))}>
              <Replace size={14} />
              <span className="flex-1">Find and replace across notes</span>
            </Item>
          )}
          <Item onSelect={() => run(importNotes)}>
            <Upload size={14} />
            <span className="flex-1">Import notes from Markdown/text</span>
          </Item>
        </Command.Group>

        <Command.Group heading="Notes" className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:pb-1 [&_[cmdk-group-heading]]:pt-2 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wide [&_[cmdk-group-heading]]:text-faint">
          {sortedNotes.map((n) => (
            <Item key={n.id} onSelect={() => run(() => navigate({ name: "note", id: n.id }))}>
              <FileText size={14} />
              <span className="flex-1 truncate">{n.title || "Untitled"}</span>
              {n.is_pinned && <Pin size={12} className="text-faint" />}
              {n.is_favorite && <Star size={12} className="text-faint" />}
            </Item>
          ))}
        </Command.Group>
      </Command.List>
    </Command.Dialog>
    <GlobalFindReplaceDialog open={globalFindOpen} onOpenChange={setGlobalFindOpen} />
    </>
  );
}

function Item({ children, onSelect }: { children: React.ReactNode; onSelect: () => void }) {
  return (
    <Command.Item
      onSelect={onSelect}
      className="flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-[13px] text-ink transition-colors data-[selected=true]:bg-accent-soft data-[selected=true]:text-accent-ink"
    >
      {children}
    </Command.Item>
  );
}
