-- Standalone code editor (Pro/Team) — a separate page from the notes block
-- editor, not a note content type. One row per saved file, scoped to a
-- workspace and RLS'd the same way as folders/notes. Plan gating happens
-- client-side (src/lib/use-plan.ts) the same as every other Pro/Team gate;
-- RLS here only enforces workspace membership, same as every other table.
create table if not exists public.code_files (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  name text not null default 'untitled',
  language text not null default 'javascript',
  content text not null default '',
  sort_order double precision not null default 0,
  created_by uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists code_files_workspace_id_idx on public.code_files (workspace_id);

alter table public.code_files enable row level security;

create policy "members can read code files"
  on public.code_files for select
  using (public.is_workspace_member(workspace_id));

create policy "members can write code files"
  on public.code_files for insert
  with check (public.is_workspace_member(workspace_id));

create policy "members can update code files"
  on public.code_files for update
  using (public.is_workspace_member(workspace_id));

create policy "members can delete code files"
  on public.code_files for delete
  using (public.is_workspace_member(workspace_id));

drop trigger if exists code_files_set_updated_at on public.code_files;
create trigger code_files_set_updated_at
  before update on public.code_files
  for each row execute function public.set_updated_at();
