import { useEffect } from "react";
import { X } from "lucide-react";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { CommandMenu } from "@/components/CommandMenu";
import { AllNotesView } from "@/components/views/AllNotesView";
import { NoteView } from "@/components/views/NoteView";
import { CalendarView } from "@/components/views/CalendarView";
import { TrashView } from "@/components/views/TrashView";
import { SettingsView } from "@/components/views/SettingsView";
import { Toaster } from "@/components/Toaster";
import { ShortcutsDialog } from "@/components/ShortcutsDialog";
import { WelcomeDialog } from "@/components/WelcomeDialog";
import { useWorkspaceContext } from "@/lib/workspace-context";
import { useTheme } from "@/lib/use-theme";
import { useShortcutsDialog } from "@/lib/use-shortcuts-dialog";
import { applyBrandAccent } from "@/lib/brand-color";

export function AppShell() {
  const { route, workspace, focusMode, splitNoteId, setSplitNoteId } = useWorkspaceContext();
  const { open: openShortcuts } = useShortcutsDialog();
  useTheme(); // applies the persisted theme preference to <html> on mount

  useEffect(() => {
    applyBrandAccent(workspace.theme?.accent ?? null);
  }, [workspace.theme?.accent]);

  useEffect(() => {
    document.title = route.name === "note" ? "Note · Scratchpad" : "Scratchpad";
  }, [route]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "?" || e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      const isTyping = tag === "INPUT" || tag === "TEXTAREA" || target?.isContentEditable;
      if (isTyping) return;
      e.preventDefault();
      openShortcuts();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [openShortcuts]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-bg text-ink">
      {!focusMode && <Sidebar />}
      <main className="min-w-0 flex-1">
        {route.name === "all-notes" && <AllNotesView />}
        {route.name === "note" && (
          <div className="flex h-full">
            <div className="min-w-0 flex-1">
              <NoteView noteId={route.id} />
            </div>
            {splitNoteId && splitNoteId !== route.id && (
              <>
                <div className="w-px shrink-0 bg-line" />
                <div className="relative min-w-0 flex-1">
                  <button
                    type="button"
                    title="Close split"
                    onClick={() => setSplitNoteId(null)}
                    className="absolute right-2 top-2.5 z-10 flex h-6 w-6 items-center justify-center rounded-md text-faint transition-colors hover:bg-surface-2 hover:text-ink"
                  >
                    <X size={14} />
                  </button>
                  <NoteView noteId={splitNoteId} />
                </div>
              </>
            )}
          </div>
        )}
        {route.name === "calendar" && <CalendarView />}
        {route.name === "trash" && <TrashView />}
        {route.name === "settings" && <SettingsView />}
      </main>
      <CommandMenu />
      <Toaster />
      <ShortcutsDialog />
      <WelcomeDialog />
    </div>
  );
}
