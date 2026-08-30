import { useWorkspaceContext } from "@/lib/workspace-context";

export function useIsPro() {
  const { workspace } = useWorkspaceContext();
  return workspace.plan === "pro";
}
