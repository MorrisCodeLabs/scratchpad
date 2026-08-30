import { useWorkspaceContext } from "@/lib/workspace-context";
import { useSession } from "@/lib/data/use-session";

// Hardcoded owner override: this account is always Pro, independent of
// workspace.plan — set once here rather than a DB flag so it can't be lost
// to a billing reset, a downgrade, or (once this app is resold) inherited
// by a buyer's own database. Everyone else's Pro status still reads from
// workspace.plan as normal.
const OWNER_EMAIL = "calebd0716@icloud.com";

export function useIsPro() {
  const { workspace } = useWorkspaceContext();
  const isOwner = useIsOwnerAccount();
  if (isOwner) return true;
  return workspace.plan === "pro";
}

export function useIsOwnerAccount() {
  const { session } = useSession();
  return session?.user.email === OWNER_EMAIL;
}
