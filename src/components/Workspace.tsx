import * as React from "react";
import { useSession } from "@/lib/data/use-session";
import { useWorkspace } from "@/lib/data/use-workspace";
import { WorkspaceProvider } from "@/lib/workspace-context";
import { AuthScreen } from "@/components/AuthScreen";
import { AppShell } from "@/components/AppShell";
import { WorkspaceOnboarding } from "@/components/WorkspaceOnboarding";
import { MaintenanceScreen } from "@/components/MaintenanceScreen";
import { useIsOwnerAccount } from "@/lib/use-plan";
import { MAINTENANCE_MODE } from "@/lib/maintenance-mode";

function FullScreenMessage({ children }: { children: React.ReactNode }) {
  return <div className="flex h-dvh w-full items-center justify-center bg-bg text-sm text-faint">{children}</div>;
}

export default function Workspace() {
  const { session, loading: sessionLoading } = useSession();
  const { workspace, loading: workspaceLoading, reload: refreshWorkspace } = useWorkspace(session?.user.id);
  const isOwner = useIsOwnerAccount();

  if (sessionLoading) return <FullScreenMessage>Loading Scratchpad…</FullScreenMessage>;
  if (!session) return <AuthScreen />;
  if (MAINTENANCE_MODE && !isOwner) return <MaintenanceScreen />;
  if (workspaceLoading) return <FullScreenMessage>Setting up your workspace…</FullScreenMessage>;
  if (!workspace) {
    return (
      <FullScreenMessage>
        We couldn't find a workspace for your account. Try refreshing, or contact support if this keeps happening.
      </FullScreenMessage>
    );
  }

  if (!workspace.onboarded_at) {
    return <WorkspaceOnboarding workspace={workspace} onComplete={refreshWorkspace} />;
  }

  return (
    <WorkspaceProvider workspace={workspace} userId={session.user.id} refreshWorkspace={refreshWorkspace}>
      <AppShell />
    </WorkspaceProvider>
  );
}
