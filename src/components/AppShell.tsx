import { useEffect } from "react";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { CommandMenu } from "@/components/CommandMenu";
import { AllNotesView } from "@/components/views/AllNotesView";
import { NoteView } from "@/components/views/NoteView";
import { CalendarView } from "@/components/views/CalendarView";
import { TrashView } from "@/components/views/TrashView";
import { SettingsView } from "@/components/views/SettingsView";
import { useWorkspaceContext } from "@/lib/workspace-context";
import { useTheme } from "@/lib/use-theme";

export function AppShell() {
  const { route } = useWorkspaceContext();
  useTheme(); // applies the persisted theme preference to <html> on mount

  useEffect(() => {
    document.title = route.name === "note" ? "Note · Scratchpad" : "Scratchpad";
  }, [route]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-bg text-ink">
      <Sidebar />
      <main className="min-w-0 flex-1">
        {route.name === "all-notes" && <AllNotesView />}
        {route.name === "note" && <NoteView noteId={route.id} />}
        {route.name === "calendar" && <CalendarView />}
        {route.name === "trash" && <TrashView />}
        {route.name === "settings" && <SettingsView />}
      </main>
      <CommandMenu />
    </div>
  );
}
