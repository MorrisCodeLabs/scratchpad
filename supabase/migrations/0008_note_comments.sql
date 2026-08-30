-- Pro feature: per-note comments (a lightweight discussion panel on each
-- note, visible to workspace members).
create table if not exists public.note_comments (
  id uuid primary key default gen_random_uuid(),
  note_id uuid not null references public.notes (id) on delete cascade,
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  body text not null,
  created_by uuid not null default auth.uid() references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists note_comments_note_id_idx on public.note_comments (note_id);

alter table public.note_comments enable row level security;

create policy "members can read note comments"
  on public.note_comments for select
  using (public.is_workspace_member(workspace_id));

create policy "members can write note comments"
  on public.note_comments for insert
  with check (public.is_workspace_member(workspace_id));

create policy "authors can delete their own note comments"
  on public.note_comments for delete
  using (created_by = auth.uid());
