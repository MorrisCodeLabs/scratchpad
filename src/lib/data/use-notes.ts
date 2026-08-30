import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { notifyError } from "@/lib/toast";
import type { Note } from "@/lib/types";

interface UseNotesOptions {
  includeDeleted?: boolean;
}

export function useNotes(workspaceId: string | undefined, options: UseNotesOptions = {}) {
  const { includeDeleted = false } = options;
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    if (!workspaceId) return;
    let query = supabase.from("notes").select("*").eq("workspace_id", workspaceId);
    query = includeDeleted ? query.not("deleted_at", "is", null) : query.is("deleted_at", null);
    const { data, error } = await query
      .order("is_pinned", { ascending: false })
      .order("sort_order", { ascending: true })
      .order("updated_at", { ascending: false });
    if (error) {
      console.error(error);
      return;
    }
    setNotes((data as Note[]) ?? []);
  }, [workspaceId, includeDeleted]);

  useEffect(() => {
    if (!workspaceId) return;
    setLoading(true);
    reload().then(() => setLoading(false));

    const channel = supabase
      .channel(`notes:${workspaceId}:${includeDeleted ? "trash" : "active"}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notes", filter: `workspace_id=eq.${workspaceId}` },
        () => reload(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [workspaceId, includeDeleted, reload]);

  // Every mutation below reloads the list itself rather than relying only on
  // the postgres_changes subscription above — Realtime replication is an
  // opt-in setting per table in Supabase, off by default for new tables, so
  // a fresh project would otherwise save changes that never show up in the
  // sidebar until something else happens to trigger a refetch.
  const createNote = useCallback(
    async (workspace: string, folderId: string | null = null) => {
      const { data, error } = await supabase
        .from("notes")
        .insert({ workspace_id: workspace, folder_id: folderId, title: "Untitled" })
        .select()
        .single();
      if (error) {
        console.error(error);
        notifyError(`Couldn't create the note: ${error.message}`);
        return null;
      }
      await reload();
      return data as Note;
    },
    [reload],
  );

  const updateNote = useCallback(
    async (id: string, patch: Partial<Note>) => {
      const { error } = await supabase.from("notes").update(patch).eq("id", id);
      if (error) {
        console.error(error);
        notifyError(`Couldn't save the note: ${error.message}`);
        return;
      }
      await reload();
    },
    [reload],
  );

  const duplicateNote = useCallback(
    async (note: Note) => {
      const { data, error } = await supabase
        .from("notes")
        .insert({
          workspace_id: note.workspace_id,
          folder_id: note.folder_id,
          title: `${note.title} (copy)`,
          content: note.content,
          status: "draft",
        })
        .select()
        .single();
      if (error) {
        console.error(error);
        notifyError(`Couldn't duplicate the note: ${error.message}`);
        return null;
      }
      await reload();
      return data as Note;
    },
    [reload],
  );

  const archiveNote = useCallback(
    async (id: string) => {
      const { error } = await supabase.from("notes").update({ status: "archived" }).eq("id", id);
      if (error) {
        console.error(error);
        notifyError(`Couldn't archive the note: ${error.message}`);
        return;
      }
      await reload();
    },
    [reload],
  );

  const trashNote = useCallback(
    async (id: string) => {
      const { error } = await supabase.from("notes").update({ deleted_at: new Date().toISOString() }).eq("id", id);
      if (error) {
        console.error(error);
        notifyError(`Couldn't move the note to trash: ${error.message}`);
        return;
      }
      await reload();
    },
    [reload],
  );

  const restoreNote = useCallback(
    async (id: string) => {
      const { error } = await supabase.from("notes").update({ deleted_at: null }).eq("id", id);
      if (error) {
        console.error(error);
        notifyError(`Couldn't restore the note: ${error.message}`);
        return;
      }
      await reload();
    },
    [reload],
  );

  // Pro: manual drag-to-reorder within a folder (or the root list). Free
  // tier never calls this, so sort_order stays at its default 0 for every
  // note and the is_pinned/updated_at ordering above is untouched.
  const reorderNote = useCallback(
    async (activeId: string, overId: string) => {
      const active = notes.find((n) => n.id === activeId);
      const overNote = notes.find((n) => n.id === overId);
      if (!active || !overNote || active.folder_id !== overNote.folder_id) return;

      const siblingIds = notes.filter((n) => n.folder_id === active.folder_id).map((n) => n.id);
      const reordered = siblingIds.filter((id) => id !== activeId);
      const insertAt = reordered.indexOf(overId);
      reordered.splice(insertAt, 0, activeId);

      const results = await Promise.all(
        reordered.map((id, index) => supabase.from("notes").update({ sort_order: index }).eq("id", id)),
      );
      const failed = results.find((r) => r.error);
      if (failed?.error) {
        console.error(failed.error);
        notifyError(`Couldn't reorder notes: ${failed.error.message}`);
        return;
      }
      await reload();
    },
    [notes, reload],
  );

  const deleteNotePermanently = useCallback(
    async (id: string) => {
      const { error } = await supabase.from("notes").delete().eq("id", id);
      if (error) {
        console.error(error);
        notifyError(`Couldn't delete the note: ${error.message}`);
        return;
      }
      await reload();
    },
    [reload],
  );

  return {
    notes,
    loading,
    createNote,
    updateNote,
    reorderNote,
    duplicateNote,
    archiveNote,
    trashNote,
    restoreNote,
    deleteNotePermanently,
    reload,
  };
}

export function useNote(noteId: string | undefined) {
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!noteId) return;
    let cancelled = false;
    setLoading(true);
    supabase
      .from("notes")
      .select("*")
      .eq("id", noteId)
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) console.error(error);
        setNote((data as Note) ?? null);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [noteId]);

  return { note, setNote, loading };
}
