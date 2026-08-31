import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { notifyError } from "@/lib/toast";
import type { BugReport } from "@/lib/types";

// Submitting a bug report needs no special access — RLS (migration 0019)
// lets any signed-in user insert. Reading them back is restricted to the
// app owner at the database level, so this hook's `reports` list is simply
// empty for everyone else rather than needing a client-side gate to be
// trustworthy.
export async function submitBugReport(params: {
  workspaceId: string | null;
  userId: string;
  email: string | null;
  title: string;
  description: string;
  pagePath: string;
}) {
  const { error } = await supabase.from("bug_reports").insert({
    workspace_id: params.workspaceId,
    reported_by: params.userId,
    reported_by_email: params.email,
    title: params.title,
    description: params.description,
    page_path: params.pagePath,
  });
  if (error) {
    console.error(error);
    throw new Error(error.message);
  }
}

export function useBugReports() {
  const [reports, setReports] = useState<BugReport[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    const { data, error } = await supabase.from("bug_reports").select("*").order("created_at", { ascending: false });
    if (error) {
      console.error(error);
      return;
    }
    setReports((data as BugReport[]) ?? []);
  }, []);

  useEffect(() => {
    setLoading(true);
    reload().then(() => setLoading(false));

    const channel = supabase
      .channel("bug_reports")
      .on("postgres_changes", { event: "*", schema: "public", table: "bug_reports" }, () => reload())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [reload]);

  const resolveReport = useCallback(
    async (id: string, status: "open" | "resolved") => {
      const { error } = await supabase.from("bug_reports").update({ status }).eq("id", id);
      if (error) {
        console.error(error);
        notifyError(`Couldn't update the report: ${error.message}`);
        return;
      }
      await reload();
    },
    [reload],
  );

  return { reports, loading, resolveReport, reload };
}
