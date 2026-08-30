-- Custom folder colors (Free & Pro), shown as an accent on the folder icon.
alter table public.folders
  add column if not exists color text;
