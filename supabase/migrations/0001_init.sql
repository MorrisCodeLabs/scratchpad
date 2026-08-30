-- Scratchpad — Phase 1 schema
-- Workspaces, membership, folders, and notes, all isolated by Row-Level Security
-- so the same schema is safe for a single-tenant deploy or a resold multi-tenant one.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- workspaces
-- ---------------------------------------------------------------------------
create table if not exists public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'My Workspace',
  icon text, -- emoji or lucide icon name
  -- white-label / theme tokens, overridable per workspace for resale
  theme jsonb not null default '{}'::jsonb,
  created_by uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workspace_members (
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null default 'owner' check (role in ('owner', 'editor', 'viewer')),
  created_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);

create index if not exists workspace_members_user_id_idx on public.workspace_members (user_id);

-- ---------------------------------------------------------------------------
-- folders (unlimited nesting via parent_id)
-- ---------------------------------------------------------------------------
create table if not exists public.folders (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  parent_id uuid references public.folders (id) on delete cascade,
  name text not null default 'New Folder',
  sort_order double precision not null default 0,
  is_favorite boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists folders_workspace_id_idx on public.folders (workspace_id);
create index if not exists folders_parent_id_idx on public.folders (parent_id);

-- ---------------------------------------------------------------------------
-- notes
-- ---------------------------------------------------------------------------
create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces (id) on delete cascade,
  folder_id uuid references public.folders (id) on delete set null,
  title text not null default 'Untitled',
  -- Tiptap/ProseMirror JSON document
  content jsonb not null default '{"type":"doc","content":[{"type":"paragraph"}]}'::jsonb,
  status text not null default 'draft' check (status in ('draft', 'active', 'completed', 'archived')),
  is_pinned boolean not null default false,
  is_favorite boolean not null default false,
  sort_order double precision not null default 0,
  word_count integer not null default 0,
  char_count integer not null default 0,
  created_by uuid not null references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_viewed_at timestamptz,
  deleted_at timestamptz -- soft delete / trash
);

create index if not exists notes_workspace_id_idx on public.notes (workspace_id);
create index if not exists notes_folder_id_idx on public.notes (folder_id);
create index if not exists notes_deleted_at_idx on public.notes (deleted_at);
create index if not exists notes_title_trgm_idx on public.notes using gin (to_tsvector('english', title));
create index if not exists notes_content_trgm_idx on public.notes using gin (to_tsvector('english', content::text));

-- ---------------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists workspaces_set_updated_at on public.workspaces;
create trigger workspaces_set_updated_at
  before update on public.workspaces
  for each row execute function public.set_updated_at();

drop trigger if exists folders_set_updated_at on public.folders;
create trigger folders_set_updated_at
  before update on public.folders
  for each row execute function public.set_updated_at();

drop trigger if exists notes_set_updated_at on public.notes;
create trigger notes_set_updated_at
  before update on public.notes
  for each row execute function public.set_updated_at();

-- Auto-create a personal workspace (and membership) for every new user.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  new_workspace_id uuid;
begin
  insert into public.workspaces (name, created_by)
  values ('My Workspace', new.id)
  returning id into new_workspace_id;

  insert into public.workspace_members (workspace_id, user_id, role)
  values (new_workspace_id, new.id, 'owner');

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Row Level Security — every table is scoped to workspace membership.
-- ---------------------------------------------------------------------------
alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.folders enable row level security;
alter table public.notes enable row level security;

create or replace function public.is_workspace_member(target_workspace_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.workspace_members
    where workspace_id = target_workspace_id
      and user_id = auth.uid()
  );
$$;

create policy "members can read their workspaces"
  on public.workspaces for select
  using (public.is_workspace_member(id));

create policy "owners can update their workspaces"
  on public.workspaces for update
  using (public.is_workspace_member(id));

create policy "authenticated users can create workspaces"
  on public.workspaces for insert
  with check (auth.uid() = created_by);

create policy "members can read workspace membership"
  on public.workspace_members for select
  using (public.is_workspace_member(workspace_id));

create policy "members can read folders"
  on public.folders for select
  using (public.is_workspace_member(workspace_id));

create policy "members can write folders"
  on public.folders for insert
  with check (public.is_workspace_member(workspace_id));

create policy "members can update folders"
  on public.folders for update
  using (public.is_workspace_member(workspace_id));

create policy "members can delete folders"
  on public.folders for delete
  using (public.is_workspace_member(workspace_id));

create policy "members can read notes"
  on public.notes for select
  using (public.is_workspace_member(workspace_id));

create policy "members can write notes"
  on public.notes for insert
  with check (public.is_workspace_member(workspace_id));

create policy "members can update notes"
  on public.notes for update
  using (public.is_workspace_member(workspace_id));

create policy "members can delete notes"
  on public.notes for delete
  using (public.is_workspace_member(workspace_id));
