-- Pro feature: one-time-view ("burn after reading") share links. Consuming
-- a view-once link is done through a SECURITY DEFINER function rather than
-- a public UPDATE policy, so anonymous viewers can only ever flip the one
-- narrow "viewed" flag on the row their token points to — nothing else.
alter table public.notes
  add column if not exists share_view_once boolean not null default false,
  add column if not exists share_viewed_at timestamptz;

create or replace function public.consume_share_view(p_token uuid)
returns table (
  out_title text,
  out_content jsonb,
  out_updated_at timestamptz,
  out_view_once boolean,
  out_already_viewed boolean
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_note record;
begin
  select n.title, n.content, n.updated_at, n.share_view_once, n.share_viewed_at
  into v_note
  from public.notes n
  where n.share_token = p_token and n.deleted_at is null;

  if not found then
    return;
  end if;

  if v_note.share_view_once and v_note.share_viewed_at is not null then
    return query select v_note.title, null::jsonb, v_note.updated_at, true, true;
    return;
  end if;

  if v_note.share_view_once then
    update public.notes set share_viewed_at = now() where share_token = p_token;
  end if;

  return query select v_note.title, v_note.content, v_note.updated_at, v_note.share_view_once, false;
end;
$$;

grant execute on function public.consume_share_view(uuid) to anon, authenticated;
