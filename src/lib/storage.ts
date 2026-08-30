import { supabase } from "@/lib/supabase";

const BUCKET = "attachments";

export interface UploadedFile {
  url: string;
  name: string;
  size: number;
  contentType: string;
}

export async function uploadAttachment(workspaceId: string, noteId: string, file: File): Promise<UploadedFile> {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${workspaceId}/${noteId}/${Date.now()}-${safeName}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type || undefined,
  });
  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return { url: data.publicUrl, name: file.name, size: file.size, contentType: file.type };
}
