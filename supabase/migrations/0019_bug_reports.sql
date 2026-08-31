-- Bug reports: submitted from the beta banner's "Report a bug" form. Every
-- signed-in user can submit one; only the app owner (src/lib/use-plan.ts's
-- OWNER_EMAIL — keep this in sync if that ever changes) can read them, since
-- reports should land in the owner's account regardless of which workspace
-- filed them, not be scoped per-workspace like everything else in this app.
create table if not exists public.bug_reports (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid references public.workspaces (id) on delete set null,
  reported_by uuid references auth.users (id) on delete set null,
  reported_by_email text,
  title text not null,
  description text not null,
  page_path text,
  status text not null default 'open' check (status in ('open', 'resolved')),
  created_at timestamptz not null default now()
);

create index if not exists bug_reports_created_at_idx on public.bug_reports (created_at desc);

alter table public.bug_reports enable row level security;

create policy "signed-in users can report bugs"
  on public.bug_reports for insert
  with check (auth.uid() is not null);

create policy "only the app owner can read bug reports"
  on public.bug_reports for select
  using (lower(coalesce(auth.jwt() ->> 'email', '')) = lower('calebd0716@icloud.com'));

create policy "only the app owner can update bug reports"
  on public.bug_reports for update
  using (lower(coalesce(auth.jwt() ->> 'email', '')) = lower('calebd0716@icloud.com'));
