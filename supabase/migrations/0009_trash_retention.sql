-- Trash auto-empty: trashed notes are permanently deleted after
-- trash_retention_days (default 30, editable by Pro workspaces).
alter table public.workspaces
  add column if not exists trash_retention_days integer not null default 30;
