import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { notifyError } from "@/lib/toast";
import type { CodeFile } from "@/lib/types";

export function useCodeFiles(workspaceId: string | undefined) {
  const [files, setFiles] = useState<CodeFile[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    if (!workspaceId) return;
    const { data, error } = await supabase
      .from("code_files")
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("sort_order", { ascending: true });
    if (error) {
      console.error(error);
      return;
    }
    setFiles((data as CodeFile[]) ?? []);
  }, [workspaceId]);

  useEffect(() => {
    if (!workspaceId) return;
    setLoading(true);
    reload().then(() => setLoading(false));

    const channel = supabase
      .channel(`code_files:${workspaceId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "code_files", filter: `workspace_id=eq.${workspaceId}` },
        () => reload(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [workspaceId, reload]);

  const createFile = useCallback(
    async (name: string, language: string, userId: string) => {
      if (!workspaceId) return null;
      const maxOrder = files.reduce((max, f) => Math.max(max, f.sort_order), 0);
      const { data, error } = await supabase
        .from("code_files")
        .insert({ workspace_id: workspaceId, name, language, sort_order: maxOrder + 1, created_by: userId })
        .select()
        .single();
      if (error) {
        console.error(error);
        notifyError(`Couldn't create the file: ${error.message}`);
        return null;
      }
      await reload();
      return data as CodeFile;
    },
    [workspaceId, files, reload],
  );

  const updateFile = useCallback(
    async (id: string, patch: Partial<Pick<CodeFile, "name" | "language" | "content">>) => {
      const { error } = await supabase.from("code_files").update(patch).eq("id", id);
      if (error) {
        console.error(error);
        notifyError(`Couldn't save the file: ${error.message}`);
        throw error;
      }
      await reload();
    },
    [reload],
  );

  const deleteFile = useCallback(
    async (id: string) => {
      const { error } = await supabase.from("code_files").delete().eq("id", id);
      if (error) {
        console.error(error);
        notifyError(`Couldn't delete the file: ${error.message}`);
        return;
      }
      await reload();
    },
    [reload],
  );

  return { files, loading, createFile, updateFile, deleteFile, reload };
}
