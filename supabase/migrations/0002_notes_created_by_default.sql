-- Fixes note creation silently failing: notes.created_by is NOT NULL but no
-- insert path (createNote, duplicateNote) was setting it. Default it to the
-- authenticated user, the same pattern Supabase RLS code already relies on
-- elsewhere in this schema (auth.uid()).
alter table public.notes
  alter column created_by set default auth.uid();
