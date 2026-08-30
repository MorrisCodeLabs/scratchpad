-- Third round of Pro features: note color/description/tags, expiration,
-- and custom (workspace-saved) templates.
alter table public.notes
  add column if not exists color text,
  add column if not exists description text,
  add column if not exists tags text[] not null default '{}',
  add column if not exists expires_at timestamptz;

create index if not exists notes_tags_idx on public.notes using gin (tags);
create index if not exists notes_expires_at_idx on public.notes (expires_at) where expires_at is not null;

create table if not exists public.note_templates (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  name text not null,
  content jsonb not null,
  created_by uuid not null default auth.uid() references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists note_templates_workspace_id_idx on public.note_templates (workspace_id);

alter table public.note_templates enable row level security;

create policy "members can read note templates"
  on public.note_templates for select
  using (public.is_workspace_member(workspace_id));

create policy "members can write note templates"
  on public.note_templates for insert
  with check (public.is_workspace_member(workspace_id));

create policy "members can delete note templates"
  on public.note_templates for delete
  using (public.is_workspace_member(workspace_id));
