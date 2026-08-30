import { supabase } from "@/lib/supabase";
import { notifyError } from "@/lib/toast";
import type { WorkspacePlan } from "@/lib/types";

// No payment processor is wired up here — this flips the plan flag
// directly, standing in for what would normally be a Stripe checkout
// webhook (or similar) landing on this same column. Swapping in real
// billing later doesn't touch anything downstream: every Pro gate in the
// app reads workspace.plan, not this function.
export async function setWorkspacePlan(workspaceId: string, plan: WorkspacePlan) {
  const { error } = await supabase.from("workspaces").update({ plan }).eq("id", workspaceId);
  if (error) {
    console.error(error);
    notifyError(`Couldn't update your plan: ${error.message}`);
    return false;
  }
  return true;
}
