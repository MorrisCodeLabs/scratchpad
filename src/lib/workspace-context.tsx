import * as React from "react";
import { createContext, useContext, useMemo, useState } from "react";
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
  const { route, navigate } = useRouter();
  const [commandMenuOpen, setCommandMenuOpen] = useState(false);

  const value = useMemo(
    () => ({ workspace, userId, folders, notes, route, navigate, commandMenuOpen, setCommandMenuOpen, refreshWorkspace }),
    [workspace, userId, folders, notes, route, navigate, commandMenuOpen, refreshWorkspace],
  );

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspaceContext() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error("useWorkspaceContext must be used within a WorkspaceProvider");
  return ctx;
}
