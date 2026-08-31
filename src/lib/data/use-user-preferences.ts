import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useSession } from "@/lib/data/use-session";
import type { UserPreferences } from "@/lib/types";

const AVATAR_BUCKET = "avatars";

export function useUserPreferences() {
  const { session } = useSession();
  const userId = session?.user.id ?? null;
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!userId) {
      setPreferences(null);
      setLoading(false);
      return;
    }
    const { data } = await supabase.from("user_preferences").select("*").eq("user_id", userId).maybeSingle();
    setPreferences(data as UserPreferences | null);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const updatePreferences = useCallback(
    async (partial: Partial<Omit<UserPreferences, "user_id" | "created_at" | "updated_at">>) => {
      if (!userId) return;
      await supabase.from("user_preferences").update(partial).eq("user_id", userId);
      await refresh();
    },
    [userId, refresh],
  );

  const uploadAvatar = useCallback(
    async (file: File) => {
      if (!userId) return;
      const ext = file.name.split(".").pop() || "png";
      const path = `${userId}/avatar-${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from(AVATAR_BUCKET).upload(path, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type || undefined,
      });
      if (error) throw error;
      const { data } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path);
      await updatePreferences({ avatar_url: data.publicUrl });
    },
    [userId, updatePreferences],
  );

  return { preferences, loading, updatePreferences, uploadAvatar };
}
