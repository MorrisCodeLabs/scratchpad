import * as React from "react";
import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { Workspace } from "@/lib/types";
import { useFolders } from "@/lib/data/use-folders";
import { useNotes } from "@/lib/data/use-notes";
import { useRouter, type Route } from "@/lib/use-router";

interface WorkspaceContextValue {
  workspace: Workspace;
  userId: string;
  folders: ReturnType<typeof useFolders>;
  notes: ReturnType<typeof useNotes>;
  route: Route;
  navigate: (r: Route) => void;
  commandMenuOpen: boolean;
  setCommandMenuOpen: (open: boolean) => void;
  refreshWorkspace: () => Promise<void>;
  focusMode: boolean;
  setFocusMode: (on: boolean) => void;
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({
  workspace,
  userId,
  refreshWorkspace,
  children,
}: {
  workspace: Workspace;
  userId: string;
  refreshWorkspace: () => Promise<void>;
  children: React.ReactNode;
}) {
  const folders = useFolders(workspace.id);
  const notes = useNotes(workspace.id);
  const trashedNotes = useNotes(workspace.id, { includeDeleted: true });
  const { route, navigate } = useRouter();
  const [commandMenuOpen, setCommandMenuOpen] = useState(false);
  const [focusMode, setFocusMode] = useState(false);

  // Expiration (Pro): sweep for notes past their expires_at and archive them
  // client-side. Not a server cron — it only fires while someone has the app
  // open — which is a fair trade-off for a demo feature with no background
  // job infra, and it self-corrects the moment anyone next loads the list.
  const archivedRef = useRef(new Set<string>());
  useEffect(() => {
    const now = Date.now();
    for (const note of notes.notes) {
      if (
        note.expires_at &&
        new Date(note.expires_at).getTime() < now &&
        note.status !== "archived" &&
        !archivedRef.current.has(note.id)
      ) {
        archivedRef.current.add(note.id);
        notes.updateNote(note.id, { status: "archived" });
      }
    }
  }, [notes.notes]); // eslint-disable-line react-hooks/exhaustive-deps

  // Trash auto-empty: permanently delete notes that have sat in trash past
  // the workspace's retention window. Same client-side sweep trade-off as
  // the expiration sweep above — no background job, self-corrects on load.
  const purgedRef = useRef(new Set<string>());
  useEffect(() => {
    const cutoff = Date.now() - workspace.trash_retention_days * 24 * 60 * 60 * 1000;
    for (const note of trashedNotes.notes) {
      if (
        note.deleted_at &&
        new Date(note.deleted_at).getTime() < cutoff &&
        !purgedRef.current.has(note.id)
      ) {
        purgedRef.current.add(note.id);
        trashedNotes.deleteNotePermanently(note.id);
      }
    }
  }, [trashedNotes.notes, workspace.trash_retention_days]); // eslint-disable-line react-hooks/exhaustive-deps

  const value = useMemo(
    () => ({
      workspace,
      userId,
      folders,
      notes,
      route,
      navigate,
      commandMenuOpen,
      setCommandMenuOpen,
      refreshWorkspace,
      focusMode,
      setFocusMode,
    }),
    [workspace, userId, folders, notes, route, navigate, commandMenuOpen, refreshWorkspace, focusMode],
  );

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspaceContext() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error("useWorkspaceContext must be used within a WorkspaceProvider");
  return ctx;
}
