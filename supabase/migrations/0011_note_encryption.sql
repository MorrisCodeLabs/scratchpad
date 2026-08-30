-- Pro feature: client-side encrypted notes. When is_encrypted is true,
-- notes.content holds ciphertext (an { __encrypted, ciphertext, iv, salt }
-- payload) instead of a Tiptap document — the server never sees plaintext.
alter table public.notes
  add column if not exists is_encrypted boolean not null default false;
