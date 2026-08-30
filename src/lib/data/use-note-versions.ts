import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { notifyError } from "@/lib/toast";
import type { NoteVersion } from "@/lib/types";

export async function createNoteVersion(
  workspaceId: string,
  noteId: string,
  title: string,
  content: Record<string, unknown>,
  wordCount: number,
) {
  const { error } = await supabase
    .from("note_versions")
    .insert({ workspace_id: workspaceId, note_id: noteId, title, content, word_count: wordCount });
  if (error) console.error(error);
}

export function useNoteVersions(noteId: string | undefined) {
  const [versions, setVersions] = useState<NoteVersion[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    if (!noteId) return;
    const { data, error } = await supabase
      .from("note_versions")
      .select("*")
      .eq("note_id", noteId)
      .order("created_at", { ascending: false });
    if (error) {
      console.error(error);
      return;
    }
    setVersions((data as NoteVersion[]) ?? []);
  }, [noteId]);

  useEffect(() => {
    if (!noteId) return;
    setLoading(true);
    reload().then(() => setLoading(false));
  }, [noteId, reload]);

  const deleteVersion = useCallback(
    async (id: string) => {
      const { error } = await supabase.from("note_versions").delete().eq("id", id);
      if (error) {
        console.error(error);
        notifyError(`Couldn't delete that version: ${error.message}`);
        return;
      }
      await reload();
    },
    [reload],
  );

  return { versions, loading, reload, deleteVersion };
}
