-- Pro feature: citation manager. Sources are saved per note and referenced
-- by citation/bibliography blocks in the note's content.
create table if not exists public.note_sources (
  id uuid primary key default gen_random_uuid(),
  note_id uuid not null references public.notes (id) on delete cascade,
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  title text not null,
  author text,
  year integer,
  url text,
  source_type text not null default 'website',
  created_by uuid not null default auth.uid() references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create index if not exists note_sources_note_id_idx on public.note_sources (note_id);

alter table public.note_sources enable row level security;

create policy "members can read note sources"
  on public.note_sources for select
  using (public.is_workspace_member(workspace_id));

create policy "members can write note sources"
  on public.note_sources for insert
  with check (public.is_workspace_member(workspace_id));

create policy "members can update note sources"
  on public.note_sources for update
  using (public.is_workspace_member(workspace_id));

create policy "members can delete note sources"
  on public.note_sources for delete
  using (public.is_workspace_member(workspace_id));
