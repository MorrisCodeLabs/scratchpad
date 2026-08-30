import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { notifyError } from "@/lib/toast";
import type { Folder } from "@/lib/types";

export function useFolders(workspaceId: string | undefined) {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    if (!workspaceId) return;
    const { data, error } = await supabase
      .from("folders")
      .select("*")
      .eq("workspace_id", workspaceId)
      .order("sort_order", { ascending: true });
    if (error) {
      console.error(error);
      return;
    }
    setFolders((data as Folder[]) ?? []);
  }, [workspaceId]);

  useEffect(() => {
    if (!workspaceId) return;
    setLoading(true);
    reload().then(() => setLoading(false));

    const channel = supabase
      .channel(`folders:${workspaceId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "folders", filter: `workspace_id=eq.${workspaceId}` },
        () => reload(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [workspaceId, reload]);

  const createFolder = useCallback(
    async (name: string, parentId: string | null = null) => {
      if (!workspaceId) return null;
      const maxOrder = folders
        .filter((f) => f.parent_id === parentId)
        .reduce((max, f) => Math.max(max, f.sort_order), 0);
      const { data, error } = await supabase
        .from("folders")
        .insert({ workspace_id: workspaceId, parent_id: parentId, name, sort_order: maxOrder + 1 })
        .select()
        .single();
      if (error) {
        console.error(error);
        notifyError(`Couldn't create the folder: ${error.message}`);
        return null;
      }
      return data as Folder;
    },
    [workspaceId, folders],
  );

  const renameFolder = useCallback(async (id: string, name: string) => {
    const { error } = await supabase.from("folders").update({ name }).eq("id", id);
    if (error) {
      console.error(error);
      notifyError(`Couldn't rename the folder: ${error.message}`);
    }
  }, []);

  const toggleFavorite = useCallback(async (id: string, isFavorite: boolean) => {
    const { error } = await supabase.from("folders").update({ is_favorite: isFavorite }).eq("id", id);
    if (error) {
      console.error(error);
      notifyError(`Couldn't update favorites: ${error.message}`);
    }
  }, []);

  const moveFolder = useCallback(
    async (id: string, parentId: string | null, sortOrder: number) => {
      const { error } = await supabase
        .from("folders")
        .update({ parent_id: parentId, sort_order: sortOrder })
        .eq("id", id);
      if (error) {
        console.error(error);
        notifyError(`Couldn't move the folder: ${error.message}`);
      }
    },
    [],
  );

  const deleteFolder = useCallback(async (id: string) => {
    // ON DELETE CASCADE on folders.parent_id removes subfolders; notes in this
    // folder fall back to folder_id = null via ON DELETE SET NULL rather than
    // being deleted, so a folder delete never silently destroys notes.
    const { error } = await supabase.from("folders").delete().eq("id", id);
    if (error) {
      console.error(error);
      notifyError(`Couldn't delete the folder: ${error.message}`);
    }
  }, []);

  return { folders, loading, createFolder, renameFolder, toggleFavorite, moveFolder, deleteFolder, reload };
}
