import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Workspace } from "@/lib/types";

// Phase 1 ships one workspace per account (the one auto-created by the
// handle_new_user trigger). Multi-workspace switching is a Phase 3 feature —
// this hook is the seam it will plug into later.
export function useWorkspace(userId: string | undefined) {
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    if (!userId) return;
    const { data, error } = await supabase
      .from("workspaces")
      .select("*")
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (error) {
      console.error(error);
      return;
    }
    setWorkspace((data as Workspace) ?? null);
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    reload().then(() => setLoading(false));
  }, [userId, reload]);

  return { workspace, loading, reload };
}
