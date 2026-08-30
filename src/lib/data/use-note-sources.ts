import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { notifyError } from "@/lib/toast";
import type { NoteSource } from "@/lib/types";

export interface NoteSourceInput {
  title: string;
  author: string | null;
  year: number | null;
  url: string | null;
  source_type: string;
}

export function useNoteSources(noteId: string | undefined) {
  const [sources, setSources] = useState<NoteSource[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    if (!noteId) return;
    const { data, error } = await supabase
      .from("note_sources")
      .select("*")
      .eq("note_id", noteId)
      .order("created_at", { ascending: true });
    if (error) {
      console.error(error);
      return;
    }
    setSources((data as NoteSource[]) ?? []);
  }, [noteId]);

  useEffect(() => {
    if (!noteId) return;
    setLoading(true);
    reload().then(() => setLoading(false));
  }, [noteId, reload]);

  const addSource = useCallback(
    async (workspaceId: string, input: NoteSourceInput) => {
      if (!noteId) return null;
      const { data, error } = await supabase
        .from("note_sources")
        .insert({ note_id: noteId, workspace_id: workspaceId, ...input })
        .select()
        .single();
      if (error) {
        console.error(error);
        notifyError(`Couldn't save the source: ${error.message}`);
        return null;
      }
      await reload();
      return data as NoteSource;
    },
    [noteId, reload],
  );

  const updateSource = useCallback(
    async (id: string, patch: Partial<NoteSourceInput>) => {
      const { error } = await supabase.from("note_sources").update(patch).eq("id", id);
      if (error) {
        console.error(error);
        notifyError(`Couldn't update the source: ${error.message}`);
        return;
      }
      await reload();
    },
    [reload],
  );

  const deleteSource = useCallback(
    async (id: string) => {
      const { error } = await supabase.from("note_sources").delete().eq("id", id);
      if (error) {
        console.error(error);
        notifyError(`Couldn't delete the source: ${error.message}`);
        return;
      }
      await reload();
    },
    [reload],
  );

  return { sources, loading, reload, addSource, updateSource, deleteSource };
}
