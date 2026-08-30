import { useWorkspaceContext } from "@/lib/workspace-context";
import { useSession } from "@/lib/data/use-session";

// Hardcoded owner override: this account is always Pro, independent of
// workspace.plan — set once here rather than a DB flag so it can't be lost
// to a billing reset, a downgrade, or (once this app is resold) inherited
// by a buyer's own database. Everyone else's Pro status still reads from
// workspace.plan as normal.
const OWNER_EMAIL = "calebd0716@icloud.com";

// Team includes everything Pro does, plus (eventually) multiple seats —
// so anywhere in the app that gates on "is this a paying workspace" reads
// this rather than checking `plan === "pro"` directly.
export function useIsPro() {
  const { workspace } = useWorkspaceContext();
  const isOwner = useIsOwnerAccount();
  if (isOwner) return true;
  return workspace.plan === "pro" || workspace.plan === "team";
}

export function useIsTeam() {
  const { workspace } = useWorkspaceContext();
  return workspace.plan === "team";
}

export function useIsOwnerAccount() {
  const { session } = useSession();
  return session?.user.email === OWNER_EMAIL;
}
