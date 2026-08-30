-- Second round of Pro features: note locking (read-only mode) and reminders.
alter table public.notes
  add column if not exists is_locked boolean not null default false;

alter table public.notes
  add column if not exists reminder_at timestamptz;

create index if not exists notes_reminder_at_idx on public.notes (reminder_at) where reminder_at is not null;
