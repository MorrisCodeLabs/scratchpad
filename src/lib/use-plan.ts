import { useSession } from "@/lib/data/use-session";

// The app owner's account always has Team — set by email since there's no
// real billing/Stripe integration yet to grant it through. Every other
// account defaults to Free until that's wired up; nothing is gated behind
// Pro/Team today, so this only affects what's *displayed* as the current
// plan (Billing tab, sidebar), not feature access.
export const OWNER_EMAIL = "calebd0716@icloud.com";

export type PlanTier = "free" | "pro" | "team";

export function useIsOwnerAccount() {
  const { session } = useSession();
  return (session?.user.email ?? "").toLowerCase() === OWNER_EMAIL.toLowerCase();
}

export function useEffectivePlan(): PlanTier {
  const isOwner = useIsOwnerAccount();
  return isOwner ? "team" : "free";
}
