import { useSession } from "@/lib/data/use-session";
import { useWorkspaceContext } from "@/lib/workspace-context";

// The app owner's account always has Team — set by email since it should
// hold even if their workspace's own Stripe subscription ever lapses.
export const OWNER_EMAIL = "calebd0716@icloud.com";

export type PlanTier = "free" | "pro" | "team";

export function useIsOwnerAccount() {
  const { session } = useSession();
  return (session?.user.email ?? "").toLowerCase() === OWNER_EMAIL.toLowerCase();
}

// The real plan now comes from the workspace's own `plan` column, kept in
// sync by the Stripe webhook (src/pages/api/stripe-webhook.ts) as
// subscriptions are created, changed, or canceled.
export function useEffectivePlan(): PlanTier {
  const isOwner = useIsOwnerAccount();
  const { workspace } = useWorkspaceContext();
  return isOwner ? "team" : workspace.plan;
}
