-- Storage bucket for image/file blocks. Objects are stored under
-- {workspace_id}/{note_id}/{filename} so RLS can key off the workspace_id
-- path segment the same way every other table does.
--
-- The bucket is public for read (object URLs are inserted straight into
-- note content and rendered as <img src> / download links — signed URLs
-- would mean re-signing on every render), but writes and deletes are
-- still gated to workspace members, matching every other write path in
-- this schema.
insert into storage.buckets (id, name, public)
values ('attachments', 'attachments', true)
on conflict (id) do nothing;

create policy "anyone can view attachments"
  on storage.objects for select
  using (bucket_id = 'attachments');

create policy "members can upload attachments"
  on storage.objects for insert
  with check (
    bucket_id = 'attachments'
    and public.is_workspace_member((storage.foldername(name))[1]::uuid)
  );

create policy "members can delete attachments"
  on storage.objects for delete
  using (
    bucket_id = 'attachments'
    and public.is_workspace_member((storage.foldername(name))[1]::uuid)
  );
