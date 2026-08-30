export type NoteStatus = "draft" | "active" | "completed" | "archived";
export type WorkspacePlan = "free" | "pro";

export interface Workspace {
  id: string;
  name: string;
  icon: string | null;
  theme: Record<string, string>;
  plan: WorkspacePlan;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Folder {
  id: string;
  workspace_id: string;
  parent_id: string | null;
  name: string;
  sort_order: number;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

export interface Note {
  id: string;
  workspace_id: string;
  folder_id: string | null;
  title: string;
  content: Record<string, unknown>;
  status: NoteStatus;
  is_pinned: boolean;
  is_favorite: boolean;
  sort_order: number;
  word_count: number;
  char_count: number;
  word_goal: number | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  last_viewed_at: string | null;
  deleted_at: string | null;
}

export type SaveState = "idle" | "saving" | "saved" | "error";

export interface NoteVersion {
  id: string;
  note_id: string;
  workspace_id: string;
  title: string;
  content: Record<string, unknown>;
  word_count: number;
  created_at: string;
}
