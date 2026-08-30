import * as React from "react";
import { useSession } from "@/lib/data/use-session";
import { useWorkspace } from "@/lib/data/use-workspace";
import { WorkspaceProvider } from "@/lib/workspace-context";
import { AuthScreen } from "@/components/AuthScreen";
import { AppShell } from "@/components/AppShell";

function FullScreenMessage({ children }: { children: React.ReactNode }) {
  return <div className="flex h-screen w-screen items-center justify-center bg-bg text-sm text-faint">{children}</div>;
}

export default function Workspace() {
  const { session, loading: sessionLoading } = useSession();
  const { workspace, loading: workspaceLoading, reload: refreshWorkspace } = useWorkspace(session?.user.id);

  if (sessionLoading) return <FullScreenMessage>Loading Scratchpad…</FullScreenMessage>;
  if (!session) return <AuthScreen />;
  if (workspaceLoading) return <FullScreenMessage>Setting up your workspace…</FullScreenMessage>;
  if (!workspace) {
    return (
      <FullScreenMessage>
        We couldn't find a workspace for your account. Try refreshing, or contact support if this keeps happening.
      </FullScreenMessage>
    );
  }

  return (
    <WorkspaceProvider workspace={workspace} userId={session.user.id} refreshWorkspace={refreshWorkspace}>
      <AppShell />
    </WorkspaceProvider>
  );
}
