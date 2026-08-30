import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Workspace } from "@/lib/types";

// Phase 1 ships one workspace per account (the one auto-created by the
// handle_new_user trigger). Multi-workspace switching is a Phase 3 feature —
// this hook is the seam it will plug into later.
export function useWorkspace(userId: string | undefined) {
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;

    supabase
      .from("workspaces")
      .select("*")
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) console.error(error);
        setWorkspace((data as Workspace) ?? null);
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [userId]);

  return { workspace, loading };
}
