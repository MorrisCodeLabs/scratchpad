-- First-run onboarding: workspaces created before this migration are
-- backfilled as already-onboarded so existing users never see the welcome
-- flow; new signups get onboarded_at = null and see it once.
alter table public.workspaces
  add column if not exists onboarded_at timestamptz;

update public.workspaces set onboarded_at = now() where onboarded_at is null;
