-- Adds the plan field that gates Pro features, plus the tables two of those
-- features need: automatic note version history, and per-note word-count
-- goals.
alter table public.workspaces
  add column if not exists plan text not null default 'free' check (plan in ('free', 'pro'));

alter table public.notes
  add column if not exists word_goal integer;

create table if not exists public.note_versions (
  id uuid primary key default gen_random_uuid(),
  note_id uuid not null references public.notes (id) on delete cascade,
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  title text not null,
  content jsonb not null,
  word_count integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists note_versions_note_id_idx on public.note_versions (note_id);
create index if not exists note_versions_workspace_id_idx on public.note_versions (workspace_id);

alter table public.note_versions enable row level security;

create policy "members can read note versions"
  on public.note_versions for select
  using (public.is_workspace_member(workspace_id));

create policy "members can write note versions"
  on public.note_versions for insert
  with check (public.is_workspace_member(workspace_id));

create policy "members can delete note versions"
  on public.note_versions for delete
  using (public.is_workspace_member(workspace_id));
