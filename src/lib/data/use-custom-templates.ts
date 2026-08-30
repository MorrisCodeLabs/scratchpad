import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { notifyError } from "@/lib/toast";
import type { CustomNoteTemplate } from "@/lib/types";

export function useCustomTemplates(workspaceId: string | undefined) {
  const [templates, setTemplates] = useState<CustomNoteTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    if (!workspaceId) return;
    const { data, error } = await supabase
      .from("note_templates")
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false });
    if (error) {
      console.error(error);
      return;
    }
    setTemplates((data as CustomNoteTemplate[]) ?? []);
  }, [workspaceId]);

  useEffect(() => {
    if (!workspaceId) return;
    setLoading(true);
    reload().then(() => setLoading(false));
  }, [workspaceId, reload]);

  const saveTemplate = useCallback(
    async (workspaceIdArg: string, name: string, content: Record<string, unknown>) => {
      const { error } = await supabase.from("note_templates").insert({ workspace_id: workspaceIdArg, name, content });
      if (error) {
        console.error(error);
        notifyError(`Couldn't save the template: ${error.message}`);
        return false;
      }
      await reload();
      return true;
    },
    [reload],
  );

  const deleteTemplate = useCallback(
    async (id: string) => {
      const { error } = await supabase.from("note_templates").delete().eq("id", id);
      if (error) {
        console.error(error);
        notifyError(`Couldn't delete the template: ${error.message}`);
        return;
      }
      await reload();
    },
    [reload],
  );

  return { templates, loading, saveTemplate, deleteTemplate, reload };
}
