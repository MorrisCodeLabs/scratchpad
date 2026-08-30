import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { notifyError } from "@/lib/toast";
import type { NoteComment } from "@/lib/types";

export function useNoteComments(noteId: string | undefined) {
  const [comments, setComments] = useState<NoteComment[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    if (!noteId) return;
    const { data, error } = await supabase
      .from("note_comments")
      .select("*")
      .eq("note_id", noteId)
      .order("created_at", { ascending: true });
    if (error) {
      console.error(error);
      return;
    }
    setComments((data as NoteComment[]) ?? []);
  }, [noteId]);

  useEffect(() => {
    if (!noteId) return;
    setLoading(true);
    reload().then(() => setLoading(false));
  }, [noteId, reload]);

  const addComment = useCallback(
    async (workspaceId: string, body: string) => {
      if (!noteId || !body.trim()) return;
      const { error } = await supabase
        .from("note_comments")
        .insert({ note_id: noteId, workspace_id: workspaceId, body: body.trim() });
      if (error) {
        console.error(error);
        notifyError(`Couldn't post the comment: ${error.message}`);
        return;
      }
      await reload();
    },
    [noteId, reload],
  );

  const deleteComment = useCallback(
    async (id: string) => {
      const { error } = await supabase.from("note_comments").delete().eq("id", id);
      if (error) {
        console.error(error);
        notifyError(`Couldn't delete that comment: ${error.message}`);
        return;
      }
      await reload();
    },
    [reload],
  );

  return { comments, loading, reload, addComment, deleteComment };
}
