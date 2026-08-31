-- Per-user preferences: profile fields, notification toggles, and the
-- account-deletion request flag. One row per auth user, RLS-scoped so a
-- user can only ever see/write their own row.
create table if not exists public.user_preferences (
  user_id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  avatar_url text,
  notify_email_digest boolean not null default true,
  notify_comments boolean not null default true,
  notify_mentions boolean not null default true,
  deletion_requested_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists user_preferences_set_updated_at on public.user_preferences;
create trigger user_preferences_set_updated_at
  before update on public.user_preferences
  for each row execute function public.set_updated_at();

alter table public.user_preferences enable row level security;

create policy "users can read own preferences"
  on public.user_preferences for select
  using (auth.uid() = user_id);

create policy "users can insert own preferences"
  on public.user_preferences for insert
  with check (auth.uid() = user_id);

create policy "users can update own preferences"
  on public.user_preferences for update
  using (auth.uid() = user_id);

-- Additive trigger (separate from 0001_init.sql's handle_new_user(), which
-- bootstraps the personal workspace) so existing migrations stay untouched.
create or replace function public.handle_new_user_preferences()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.user_preferences (user_id) values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_preferences on auth.users;
create trigger on_auth_user_created_preferences
  after insert on auth.users
  for each row execute function public.handle_new_user_preferences();

-- Backfill preference rows for any users created before this migration.
insert into public.user_preferences (user_id)
select id from auth.users
on conflict (user_id) do nothing;

-- ---------------------------------------------------------------------------
-- avatars storage bucket — user-scoped (not workspace-scoped like
-- `attachments`), so RLS keys off the top-level {user_id} path segment.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "anyone can view avatars"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "users can upload own avatar"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "users can update own avatar"
  on storage.objects for update
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "users can delete own avatar"
  on storage.objects for delete
  using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
