export type NoteStatus = "draft" | "active" | "completed" | "archived";
export type WorkspacePlan = "free" | "pro" | "team";

export interface Workspace {
  id: string;
  name: string;
  icon: string | null;
  theme: Record<string, string>;
  plan: WorkspacePlan;
  trash_retention_days: number;
  onboarded_at: string | null;
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
  color: string | null;
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
  is_locked: boolean;
  is_encrypted: boolean;
  reminder_at: string | null;
  color: string | null;
  description: string | null;
  tags: string[];
  expires_at: string | null;
  share_token: string | null;
  share_view_once: boolean;
  share_viewed_at: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  last_viewed_at: string | null;
  deleted_at: string | null;
}

export type SaveState = "idle" | "saving" | "saved" | "error" | "offline";

export interface NoteVersion {
  id: string;
  note_id: string;
  workspace_id: string;
  title: string;
  content: Record<string, unknown>;
  word_count: number;
  created_at: string;
}

export type CitationStyle = "apa" | "mla" | "chicago";

export interface NoteSource {
  id: string;
  note_id: string;
  workspace_id: string;
  title: string;
  author: string | null;
  year: number | null;
  url: string | null;
  source_type: string;
  created_by: string;
  created_at: string;
}

export interface NoteComment {
  id: string;
  note_id: string;
  workspace_id: string;
  body: string;
  created_by: string;
  created_at: string;
}

// Distinct from the built-in static templates in lib/note-templates.ts —
// this is a workspace-saved custom template (Pro), persisted in the DB.
export interface CustomNoteTemplate {
  id: string;
  workspace_id: string;
  name: string;
  content: Record<string, unknown>;
  created_by: string;
  created_at: string;
}
