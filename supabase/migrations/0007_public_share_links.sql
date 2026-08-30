-- Pro feature: public "share to web" links. A note with share_token set is
-- readable by anyone (including anonymous/unauthenticated requests) via the
-- public /s/[token] page, independent of workspace membership.
alter table public.notes
  add column if not exists share_token uuid unique;

create index if not exists notes_share_token_idx on public.notes (share_token) where share_token is not null;

create policy "anyone can read shared notes"
  on public.notes for select
  using (share_token is not null and deleted_at is null);
